const _ = require('lodash');
const natural = require('natural');
const { getDayOfWeek } = require('../../utils/common');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { getOrderSessionJsonWithLimit } = require('../../order-management/services/orderUtils.service');
const redisClient = require('../../utils/redis');

const tokenizer = new natural.WordTokenizer();
const stopwords = new Set(['the', 'and', 'or', 'is', 'a']);

const getOrderSessionsForRecommendation = async ({ shopId, limit = 10000, timeWindowDays = 30 }) => {
  const cutoffDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);
  const sessions = await getOrderSessionJsonWithLimit({ shopId, limit });
  return sessions.filter((session) => new Date(session.createdAt) > cutoffDate);
};

const getPopularDishes = (orderSessions) => {
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
    .reduce((acc, [dishId, count]) => {
      acc[dishId] = count;
      return acc;
    }, {});
};

const computeTFIDF = (docs) => {
  const preprocessedDocs = docs.map((doc) =>
    tokenizer
      .tokenize(doc.toLowerCase())
      .filter((word) => !stopwords.has(word))
      .join(' ')
  );
  const words = new Set(preprocessedDocs.flatMap((doc) => doc.split(' ')));
  const wordList = Array.from(words);
  const termFrequencies = preprocessedDocs.map((doc) => {
    const wordsInDoc = doc.split(' ');
    return wordList.map((word) => wordsInDoc.filter((w) => w === word).length / wordsInDoc.length);
  });

  const documentFrequencies = wordList.map(
    (word) => preprocessedDocs.filter((doc) => doc.includes(word)).length / preprocessedDocs.length
  );

  return termFrequencies.map((tf) => tf.map((tfValue, i) => tfValue * Math.log(1 / (documentFrequencies[i] + 1e-10))));
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
    tfidfScores = computeTFIDF(allDishes.map((dish) => dish.description || ''));
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

const getCustomerPreferences = ({ orderSessions, customerId }) => {
  const preferredDishes = {};

  _(orderSessions)
    .filter((session) => _.get(session, 'customerInfo.customerId') === customerId)
    .forEach((session) => {
      _.forEach(session.orders, (order) => {
        _.forEach(order.dishOrders, (dishOrder) => {
          preferredDishes[dishOrder.dishId] = (preferredDishes[dishOrder.dishId] || 0) + dishOrder.quantity;
        });
      });
    });

  return Object.entries(preferredDishes).sort((a, b) => b[1] - a[1]);
};

// Helper function to track customer orders by day of the week
const getCustomerOrderPatterns = ({ orderSessions, customerId }) => {
  const orderPatterns = {};

  _(orderSessions)
    .filter((session) => _.get(session, 'customerInfo.customerId') === customerId)
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
    const userId = _.get(session, 'customerInfo.customerId');
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
    // Assume we have a 'season' tag or keyword in the dish description for simplicity
    if (_.includes(dish.description, 'winter') && (currentMonth >= 11 || currentMonth <= 1)) {
      seasonalDishes.push(dish);
    }
    if (_.includes(dish.description, 'summer') && currentMonth >= 5 && currentMonth <= 7) {
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
      if (_.includes(dish.description, 'breakfast')) {
        contextualDishes.push(dish);
      }
    });
  } else if (currentHour >= 11 && currentHour < 14) {
    // Recommend lunch items around lunch time
    _.forEach(allDishes, (dish) => {
      if (_.includes(dish.description, 'lunch')) {
        contextualDishes.push(dish);
      }
    });
  } else if (currentHour >= 18 && currentHour < 22) {
    // Recommend dinner items in the evening
    _.forEach(allDishes, (dish) => {
      if (_.includes(dish.description, 'dinner')) {
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
    if (similarUsers.includes(_.get(session, 'customerInfo.customerId'))) {
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
    const category = dish.category || 'default';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    if (categoryCount[category] <= maxPerCategory) {
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

const recommendDishes = async ({ customerId, shopId, limit }) => {
  const allDishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(allDishes, 'id');
  const orderSessions = await getOrderSessionsForRecommendation({ shopId, limit });
  const preferredDishes = getCustomerPreferences({ orderSessions, customerId });

  // Then, find similar dishes based on the TF-IDF scores of their descriptions
  const allSimilarDishes = preferredDishes.flatMap((dish) => {
    const similarDishes = getSimilarDishesTFIDF({ dishId: dish.id, allDishes });
    return [dish, ...similarDishes]; // Include the current dish and its similar dishes
  });

  // Add recommendations based on user patterns (orders on the same day of the week)
  const patternRecommendations = recommendByDayPattern({ orderSessions, customerId, dishById });

  // Add seasonal recommendations (e.g., soups in winter, salads in summer)
  const seasonalRecommendations = getSeasonalRecommendations({ allDishes });

  // Add contextual recommendations based on the time of day
  const contextualRecommendations = getContextualRecommendations({ allDishes });

  // Add collaborative recommendations
  const collaborativeRecommendations = getCollaborativeRecommendations({ orderSessions, dishById, customerId });

  // If there are fewer than 5 recommendations, add popular dishes
  const popularDishes = getPopularDishes(orderSessions);

  const combineRecommendationDishes = combineRecommendations({
    preferredDishes,
    patternDishes: patternRecommendations,
    similarDishes: allSimilarDishes,
    seasonalDishes: seasonalRecommendations,
    contextualDishes: contextualRecommendations,
    collaborativeDishes: collaborativeRecommendations,
    popularDishes,
  });

  const diversifiedRecommendationDishes = diversifyRecommendations({
    recommendations: combineRecommendationDishes,
  });
  const trendingDishes = getTrendingDishes({ orderSessions, dishById });

  return { diversifiedRecommendationDishes, trendingDishes };
};

module.exports = { recommendDishes };
