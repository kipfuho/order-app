const fetchOrderById = () => {};
const fetchDishById = () => {};
const getAllDishes = () => {};

class DishRecommendationSystem {
  constructor(orderSessions) {
    this.orderSessions = orderSessions || [];
  }

  getPopularDishes() {
    const dishCount = {};

    this.orderSessions.forEach((session) => {
      session.orders.forEach((orderId) => {
        const order = this.getOrderById(orderId);
        order.dishOrders.forEach((dishOrder) => {
          dishCount[dishOrder.dish.id] = (dishCount[dishOrder.dish.id] || 0) + dishOrder.quantity;
        });
      });
    });

    return Object.entries(dishCount)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [dishId, count]) => {
        acc[dishId] = count;
        return acc;
      }, {});
  }

  static getOrderById(orderId) {
    return fetchOrderById(orderId);
  }

  static getDishById(dishId) {
    return fetchDishById(dishId);
  }

  // Helper function to get the day of the week from a date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  static getDayOfWeek(date) {
    const day = new Date(date).getDay();
    return day;
  }

  static computeTFIDF(docs) {
    const words = new Set(docs.flatMap((doc) => doc.split(' ')));
    const wordList = Array.from(words);
    const termFrequencies = docs.map((doc) => {
      const wordsInDoc = doc.split(' ');
      return wordList.map((word) => wordsInDoc.filter((w) => w === word).length / wordsInDoc.length);
    });

    const documentFrequencies = wordList.map((word) => docs.filter((doc) => doc.includes(word)).length / docs.length);

    return termFrequencies.map((tf) => tf.map((tfValue, i) => tfValue * Math.log(1 / documentFrequencies[i])));
  }

  static cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  getSimilarDishesTFIDF(dishId) {
    const allDishes = getAllDishes();

    const tfidfScores = this.computeTFIDF(allDishes.map((dish) => dish.description));
    const baseDishIndex = allDishes.findIndex((dish) => dish.id === dishId);

    const similarities = allDishes.map((dish, index) => ({
      dish,
      similarity: this.cosineSimilarity(tfidfScores[baseDishIndex], tfidfScores[index]),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(1, 4)
      .map((entry) => entry.dish);
  }

  getCustomerPreferences(customerId) {
    const preferredDishes = {};

    this.orderSessions
      .filter((session) => session.customerInfo.customerId === customerId)
      .forEach((session) => {
        session.orders.forEach((orderId) => {
          const order = this.getOrderById(orderId);
          order.dishOrders.forEach((dishOrder) => {
            preferredDishes[dishOrder.dish.id] = (preferredDishes[dishOrder.dish.id] || 0) + dishOrder.quantity;
          });
        });
      });

    return preferredDishes;
  }

  // Helper function to track customer orders by day of the week
  getCustomerOrderPatterns(customerId) {
    const orderPatterns = {};

    this.orderSessions
      .filter((session) => session.customerInfo.customerId === customerId)
      .forEach((session) => {
        session.orders.forEach((orderId) => {
          const order = this.getOrderById(orderId);
          const orderDay = this.getDayOfWeek(order.createdAt);

          order.dishOrders.forEach((dishOrder) => {
            if (!orderPatterns[orderDay]) {
              orderPatterns[orderDay] = {};
            }
            orderPatterns[orderDay][dishOrder.dish.id] =
              (orderPatterns[orderDay][dishOrder.dish.id] || 0) + dishOrder.quantity;
          });
        });
      });

    return orderPatterns;
  }

  // Detect seasonal patterns (e.g., recommending soups in winter, ice cream in summer)
  static getSeasonalRecommendations() {
    const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
    const seasonalDishes = [];

    const allDishes = getAllDishes();
    allDishes.forEach((dish) => {
      // Assume we have a 'season' tag or keyword in the dish description for simplicity
      if (dish.description.includes('winter') && (currentMonth >= 11 || currentMonth <= 1)) {
        seasonalDishes.push(dish);
      }
      if (dish.description.includes('summer') && currentMonth >= 5 && currentMonth <= 7) {
        seasonalDishes.push(dish);
      }
    });

    return seasonalDishes;
  }

  // Detect contextual recommendations (e.g., recommending breakfast in the morning)
  static getContextualRecommendations() {
    const currentHour = new Date().getHours();
    const contextualDishes = [];

    const allDishes = getAllDishes();
    if (currentHour >= 6 && currentHour < 10) {
      // Recommend breakfast items in the morning
      allDishes.forEach((dish) => {
        if (dish.description.includes('breakfast')) {
          contextualDishes.push(dish);
        }
      });
    } else if (currentHour >= 11 && currentHour < 14) {
      // Recommend lunch items around lunch time
      allDishes.forEach((dish) => {
        if (dish.description.includes('lunch')) {
          contextualDishes.push(dish);
        }
      });
    } else if (currentHour >= 18 && currentHour < 22) {
      // Recommend dinner items in the evening
      allDishes.forEach((dish) => {
        if (dish.description.includes('dinner')) {
          contextualDishes.push(dish);
        }
      });
    }

    return contextualDishes;
  }

  // Find dishes commonly ordered on a specific day of the week
  recommendByDayPattern(customerId) {
    const patterns = this.getCustomerOrderPatterns(customerId);
    const today = this.getDayOfWeek(new Date()); // Get today's day of the week
    const recommendedDishes = [];

    if (patterns[today]) {
      // Recommend the dishes most ordered by the user on this day of the week
      const sortedDishes = Object.entries(patterns[today])
        .sort((a, b) => b[1] - a[1]) // Sort by quantity
        .slice(0, 3); // Top 3 most ordered dishes for today

      // Add these dishes to the recommendations
      sortedDishes.forEach(([dishId]) => {
        recommendedDishes.push(this.getDishById(dishId));
      });
    }

    return recommendedDishes;
  }

  recommendDishes(customerId) {
    const preferredDishes = this.getCustomerPreferences(customerId);
    const sortedPreferredDishes = Object.entries(preferredDishes).sort((a, b) => b[1] - a[1]); // Sort dishes by quantity ordered

    let recommendations = sortedPreferredDishes.map(([dishId]) => this.getDishById(dishId));

    // Then, find similar dishes based on the TF-IDF scores of their descriptions
    recommendations = recommendations.flatMap((dish) => {
      const similarDishes = this.getSimilarDishesTFIDF(dish.id);
      return [dish, ...similarDishes]; // Include the current dish and its similar dishes
    });

    // Ensure that the recommendations are unique (no duplicates)
    const uniqueRecommendations = Array.from(new Set(recommendations.map((dish) => dish.id))).map((id) =>
      recommendations.find((dish) => dish.id === id)
    );

    // Add recommendations based on user patterns (orders on the same day of the week)
    const patternRecommendations = this.recommendByDayPattern(customerId);
    recommendations = [...uniqueRecommendations, ...patternRecommendations];

    // Add seasonal recommendations (e.g., soups in winter, salads in summer)
    const seasonalRecommendations = this.getSeasonalRecommendations();
    recommendations = [...recommendations, ...seasonalRecommendations];

    // Add contextual recommendations based on the time of day
    const contextualRecommendations = this.getContextualRecommendations();
    recommendations = [...recommendations, ...contextualRecommendations];

    // If there are fewer than 5 recommendations, add popular dishes
    const popularDishes = this.getPopularDishes();
    if (recommendations.length < 5) {
      recommendations.push(
        ...Object.keys(popularDishes)
          .slice(0, 5 - recommendations.length)
          .map((id) => this.getDishById(id))
      );
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
}

module.exports = DishRecommendationSystem;
