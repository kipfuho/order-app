const _ = require('lodash');
const { getDayOfWeek } = require('../../utils/common');
const { getDishesFromCache } = require('../../metadata/dishMetadata.service');
const { getOrderSessionJsonWithLimit } = require('../../order-management/services/orderUtils.service');

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
  const words = new Set(docs.flatMap((doc) => doc.split(' ')));
  const wordList = Array.from(words);
  const termFrequencies = docs.map((doc) => {
    const wordsInDoc = doc.split(' ');
    return wordList.map((word) => wordsInDoc.filter((w) => w === word).length / wordsInDoc.length);
  });

  const documentFrequencies = wordList.map((word) => docs.filter((doc) => doc.includes(word)).length / docs.length);

  return termFrequencies.map((tf) => tf.map((tfValue, i) => tfValue * Math.log(1 / documentFrequencies[i])));
};

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

const getSimilarDishesTFIDF = ({ dishId, allDishes }) => {
  const tfidfScores = computeTFIDF(allDishes.map((dish) => dish.description || ''));
  const baseDishIndex = _.findIndex(allDishes, (dish) => dish.id === dishId);

  const similarities = _.map(allDishes, (dish, index) => ({
    dish,
    similarity: cosineSimilarity(tfidfScores[baseDishIndex], tfidfScores[index]),
  }));

  return _(similarities)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(1, 4)
    .map((entry) => entry.dish)
    .value();
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

  return preferredDishes;
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

const getOrderSessionsForRecommendation = async ({ shopId, limit = 10000 }) => {
  return getOrderSessionJsonWithLimit({ shopId, limit });
};

const recommendDishes = async ({ customerId, shopId, limit }) => {
  const allDishes = await getDishesFromCache({ shopId });
  const dishById = _.keyBy(allDishes, 'id');
  const orderSessions = await getOrderSessionsForRecommendation({ shopId, limit });
  const preferredDishes = getCustomerPreferences({ orderSessions, customerId });
  const sortedPreferredDishes = Object.entries(preferredDishes).sort((a, b) => b[1] - a[1]); // Sort dishes by quantity ordered

  let recommendations = sortedPreferredDishes.map(([dishId]) => dishById[dishId]);

  // Then, find similar dishes based on the TF-IDF scores of their descriptions
  recommendations = recommendations.flatMap((dish) => {
    const similarDishes = getSimilarDishesTFIDF({ dishId: dish.id, allDishes });
    return [dish, ...similarDishes]; // Include the current dish and its similar dishes
  });

  // Ensure that the recommendations are unique (no duplicates)
  const uniqueRecommendations = Array.from(new Set(recommendations.map((dish) => dish.id))).map((id) =>
    recommendations.find((dish) => dish.id === id)
  );

  // Add recommendations based on user patterns (orders on the same day of the week)
  const patternRecommendations = recommendByDayPattern({ orderSessions, customerId, dishById });
  recommendations = [...uniqueRecommendations, ...patternRecommendations];

  // Add seasonal recommendations (e.g., soups in winter, salads in summer)
  const seasonalRecommendations = getSeasonalRecommendations({ allDishes });
  recommendations = [...recommendations, ...seasonalRecommendations];

  // Add contextual recommendations based on the time of day
  const contextualRecommendations = getContextualRecommendations({ allDishes });
  recommendations = [...recommendations, ...contextualRecommendations];

  // If there are fewer than 5 recommendations, add popular dishes
  const popularDishes = getPopularDishes(orderSessions);
  if (recommendations.length < 5) {
    recommendations.push(
      ...Object.keys(popularDishes)
        .slice(0, 5 - recommendations.length)
        .map((id) => dishById[id])
    );
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

module.exports = { recommendDishes };
