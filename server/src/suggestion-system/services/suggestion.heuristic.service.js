const _ = require('lodash');
const { getDayOfWeek } = require('../../utils/common');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { getOrderSessionJsonWithLimit } = require('../../order-management/services/orderUtils.service');
const redisClient = require('../../utils/redis');

const getOrderSessionsForRecommendation = async ({ shopId, limit = 10000, timeWindowDays = 30 }) => {
  const cutoffDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);
  const sessions = await getOrderSessionJsonWithLimit({ shopId, limit });
  return sessions.filter((session) => new Date(session.createdAt) > cutoffDate);
};

const getPopularDishes = ({ orderSessions, dishById }) => {
  const dishCount = {};

  _.forEach(orderSessions, (session) => {
    _.forEach(session.orders, (order) => {
      _.forEach(order.dishOrders, (dishOrder) => {
        dishCount[dishOrder.dishId] = (dishCount[dishOrder.dishId] || 0) + dishOrder.quantity;
      });
    });
  });

  return Object.entries(dishCount)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => dishById[id]);
};

const computeTFIDF = (tagDocs) => {
  // Get the unique set of all tags
  const tagSet = new Set(tagDocs.flat());
  const tagList = Array.from(tagSet);

  // Compute term frequency (TF)
  const termFrequencies = tagDocs.map((tags) => {
    return tagList.map((tag) => {
      const count = tags.filter((t) => t === tag).length;
      return count / tags.length;
    });
  });

  // Compute document frequency (DF) and inverse document frequency (IDF)
  const documentFrequencies = tagList.map((tag) => {
    const docCount = tagDocs.filter((tags) => tags.includes(tag)).length;
    return docCount / tagDocs.length;
  });

  // Compute TF-IDF
  const tfidfMatrix = termFrequencies.map((tf) =>
    tf.map((tfValue, i) => tfValue * Math.log(1 / (documentFrequencies[i] + 1e-10)))
  );

  return tfidfMatrix;
};

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

const getSimilarDishesTFIDF = ({ dishId, allDishes }) => {
  const cacheKey = `tfidf_${allDishes.map((d) => d.id).join('_')}`;
  let tfidfScores = redisClient.getJson(cacheKey);

  if (!tfidfScores) {
    tfidfScores = computeTFIDF(allDishes.map((dish) => dish.tags || []));
    redisClient.putJson(cacheKey, tfidfScores);
  }

  const baseDish = _.find(allDishes, (dish) => dish.id === dishId);
  const baseTags = new Set(baseDish.tags || []);

  const similarities = _.map(allDishes, (dish, index) => {
    const tagOverlap = _.intersection(baseTags, dish.tags || []).length / baseTags.size || 1;
    const tfidfSimilarity = cosineSimilarity(tfidfScores[_.findIndex(allDishes, { id: dishId })], tfidfScores[index]);
    return {
      dish,
      similarity: 0.7 * tfidfSimilarity + 0.3 * tagOverlap,
    };
  });

  return _(similarities).sortBy('similarity').reverse().slice(1, 4).map('dish').value();
};

const getCustomerPreferences = ({ orderSessions, customerId, dishById }) => {
  const preferredDishes = {};

  _(orderSessions)
    .filter((session) => _.get(session, 'customerId') === customerId)
    .forEach((session) => {
      _.forEach(session.orders, (order) => {
        _.forEach(order.dishOrders, (dishOrder) => {
          preferredDishes[dishOrder.dishId] = (preferredDishes[dishOrder.dishId] || 0) + dishOrder.quantity;
        });
      });
    });

  return Object.entries(preferredDishes)
    .sort((a, b) => b[1] - a[1])
    .map(([dishId]) => dishById[dishId]);
};

// Helper function to track customer orders by day of the week
const getCustomerOrderPatterns = ({ orderSessions, customerId }) => {
  const orderPatterns = {};

  _(orderSessions)
    .filter((session) => _.get(session, 'customerId') === customerId)
    .forEach((session) => {
      _.forEach(session.orders, (order) => {
        const orderDay = getDayOfWeek(order.createdAt);

        _.forEach(order.dishOrders, (dishOrder) => {
          if (!orderPatterns[orderDay]) {
            orderPatterns[orderDay] = {};
          }
          orderPatterns[orderDay][dishOrder.dishId] = (orderPatterns[orderDay][dishOrder.dishId] || 0) + dishOrder.quantity;
        });
      });
    });

  return orderPatterns;
};

const getSimilarUsers = ({ orderSessions, customerId }) => {
  const userVectors = {};
  _.forEach(orderSessions, (session) => {
    const userId = _.get(session, 'customerId');
    if (!userVectors[userId]) userVectors[userId] = {};
    _.forEach(session.orders, (order) => {
      _.forEach(order.dishOrders, (dishOrder) => {
        userVectors[userId][dishOrder.dishId] = (userVectors[userId][dishOrder.dishId] || 0) + dishOrder.quantity;
      });
    });
  });

  const targetVector = userVectors[customerId] || {};
  const similarities = _.map(userVectors, (vector, otherUserId) => {
    if (otherUserId === customerId) return null;
    const vecA = Object.keys({ ...targetVector, ...vector }).map((dishId) => targetVector[dishId] || 0);
    const vecB = Object.keys({ ...targetVector, ...vector }).map((dishId) => vector[dishId] || 0);
    return { userId: otherUserId, similarity: cosineSimilarity(vecA, vecB) };
  });

  return _(similarities).filter(Boolean).sortBy('similarity').reverse().slice(0, 10).map('userId').value();
};

// Detect seasonal patterns (e.g., recommending soups in winter, ice cream in summer)
const getSeasonalRecommendations = ({ allDishes }) => {
  const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
  const seasonalDishes = [];

  _.forEach(allDishes, (dish) => {
    const tags = dish.tags || [];
    if (tags.includes('mua dong') && (currentMonth >= 11 || currentMonth <= 1)) {
      seasonalDishes.push(dish);
    }
    if (tags.includes('mua he') && currentMonth >= 5 && currentMonth <= 7) {
      seasonalDishes.push(dish);
    }
  });

  return seasonalDishes;
};

// Detect contextual recommendations (e.g., recommending breakfast in the morning)
const getContextualRecommendations = ({ allDishes }) => {
  const currentHour = new Date().getHours();
  const contextualDishes = [];

  if (currentHour >= 6 && currentHour < 10) {
    // Recommend breakfast items in the morning
    _.forEach(allDishes, (dish) => {
      const tags = dish.tags || [];
      if (tags.includes('bua sang')) {
        contextualDishes.push(dish);
      }
    });
  } else if (currentHour >= 11 && currentHour < 14) {
    // Recommend lunch items around lunch time
    _.forEach(allDishes, (dish) => {
      const tags = dish.tags || [];
      if (tags.includes('bua trua')) {
        contextualDishes.push(dish);
      }
    });
  } else if (currentHour >= 18 && currentHour < 22) {
    // Recommend dinner items in the evening
    _.forEach(allDishes, (dish) => {
      const tags = dish.tags || [];
      if (tags.includes('bua toi')) {
        contextualDishes.push(dish);
      }
    });
  }

  return contextualDishes;
};

// Find dishes commonly ordered on a specific day of the week
const recommendByDayPattern = ({ orderSessions, customerId, dishById }) => {
  const patterns = getCustomerOrderPatterns({ orderSessions, customerId });
  const today = getDayOfWeek(new Date()); // Get today's day of the week
  const recommendedDishes = [];

  if (patterns[today]) {
    // Recommend the dishes most ordered by the user on this day of the week
    const sortedDishes = Object.entries(patterns[today])
      .sort((a, b) => b[1] - a[1]) // Sort by quantity
      .slice(0, 3); // Top 3 most ordered dishes for today

    // Add these dishes to the recommendations
    _.forEach(sortedDishes, ([dishId]) => {
      recommendedDishes.push(dishById[dishId]);
    });
  }

  return recommendedDishes;
};

const getCollaborativeRecommendations = ({ orderSessions, customerId, dishById }) => {
  const similarUsers = getSimilarUsers({ orderSessions, customerId });
  const dishScores = {};

  _.forEach(orderSessions, (session) => {
    if (similarUsers.includes(_.get(session, 'customerId'))) {
      _.forEach(session.orders, (order) => {
        _.forEach(order.dishOrders, (dishOrder) => {
          dishScores[dishOrder.dishId] = (dishScores[dishOrder.dishId] || 0) + dishOrder.quantity;
        });
      });
    }
  });

  return Object.keys(dishScores)
    .sort((a, b) => dishScores[b] - dishScores[a])
    .slice(0, 3)
    .map((id) => dishById[id]);
};

const getTrendingDishes = ({ orderSessions, dishById, timeWindowHours = 24 * 7 }) => {
  const recentOrders = _.filter(
    orderSessions,
    (session) => new Date(session.createdAt) > new Date(Date.now() - timeWindowHours * 60 * 60 * 1000)
  );
  const dishCount = {};
  _.forEach(recentOrders, (session) => {
    _.forEach(session.orders, (order) => {
      _.forEach(order.dishOrders, (dishOrder) => {
        dishCount[dishOrder.dishId] = (dishCount[dishOrder.dishId] || 0) + dishOrder.quantity;
      });
    });
  });

  return Object.keys(dishCount)
    .sort((a, b) => dishCount[b] - dishCount[a])
    .slice(0, 5)
    .map((id) => dishById[id]);
};

const diversifyRecommendations = ({ recommendations, maxPerCategory = 2 }) => {
  const categoryCount = {};
  const diversified = [];

  _.forEach(recommendations, (dish) => {
    const categoryName = _.get(dish, 'category.name');
    categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    if (categoryCount[categoryName] <= maxPerCategory) {
      diversified.push(dish);
    }
  });

  return diversified.slice(0, 5);
};

const combineRecommendations = ({
  preferredDishes,
  patternDishes,
  similarDishes,
  seasonalDishes,
  contextualDishes,
  collaborativeDishes,
  popularDishes,
  weights = {
    preferred: 0.35,
    pattern: 0.15,
    similar: 0.15,
    seasonal: 0.1,
    contextual: 0.1,
    collaborative: 0.1,
    popular: 0.05,
  },
}) => {
  const scoredDishes = {};

  const addScore = (dish, score, sourceWeight) => {
    if (!scoredDishes[dish.id]) {
      scoredDishes[dish.id] = { dish, score: 0 };
    }
    scoredDishes[dish.id].score += score * sourceWeight;
  };

  preferredDishes.forEach((dish, index) => addScore(dish, 1 - index / preferredDishes.length, weights.preferred));
  patternDishes.forEach((dish, index) => addScore(dish, 1 - index / patternDishes.length, weights.pattern));
  similarDishes.forEach((dish, index) => addScore(dish, 1 - index, weights.similar));
  seasonalDishes.forEach((dish) => addScore(dish, 1, weights.seasonal));
  contextualDishes.forEach((dish) => addScore(dish, 1, weights.contextual));
  collaborativeDishes.forEach((dish) => addScore(dish, 1, weights.collaborative));
  popularDishes.forEach((dish, index) => addScore(dish, 1 - index / popularDishes.length, weights.popular));

  return Object.values(scoredDishes)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.dish)
    .slice(0, 20);
};

const recommendDishes = async ({ customerId, shopId, limit = 1000 }) => {
  const allDishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(allDishes, 'id');
  const key = `recommendations_${customerId}`;
  if (redisClient.isRedisConnected()) {
    const cachedRecommendations = redisClient.getJson(key);
    if (!_.isEmpty(cachedRecommendations)) {
      const { validTimestamp, dishIds } = cachedRecommendations;
      if (validTimestamp <= Date.now()) {
        const dishes = dishIds.map((dishId) => dishById[dishId]);
        return dishes;
      }
    }
  }

  const orderSessions = await getOrderSessionsForRecommendation({ shopId, limit, timeWindowDays: 30 });

  // Get recommendations from various sources
  const preferredDishes = getCustomerPreferences({ orderSessions, customerId, dishById });
  const similarDishes = preferredDishes.flatMap((dish) => getSimilarDishesTFIDF({ dishId: dish.id, allDishes }));
  const patternDishes = recommendByDayPattern({ orderSessions, customerId, dishById });
  const seasonalDishes = getSeasonalRecommendations({ allDishes });
  const contextualDishes = getContextualRecommendations({ allDishes });
  const collaborativeDishes = getCollaborativeRecommendations({ orderSessions, customerId, dishById });
  const popularDishes = getPopularDishes({ orderSessions, dishById });
  const trendingDishes = getTrendingDishes({ orderSessions, dishById });

  // Combine recommendations with weights
  let recommendations = combineRecommendations({
    preferredDishes,
    patternDishes,
    similarDishes,
    seasonalDishes,
    contextualDishes,
    popularDishes,
    collaborativeDishes,
  });

  // Ensure diversity
  recommendations = diversifyRecommendations(recommendations);

  // Add trending dishes as fallback
  if (recommendations.length < 5) {
    const currentDishIdSet = new Set(recommendations.map((dish) => dish.id));
    recommendations = [...recommendations, ..._.filter(trendingDishes, (dish) => !currentDishIdSet.has(dish.id))].slice(
      0,
      5
    );
  }

  if (redisClient.isRedisConnected()) {
    await redisClient.putJson({
      key,
      jsonVal: {
        validTimestamp: Date.now() + 30 * 60000, // Should newly recommend every 30m
        dishIds: recommendations.map((dish) => dish.id),
      },
    });
  }

  return recommendations;
};

module.exports = { recommendDishes };
