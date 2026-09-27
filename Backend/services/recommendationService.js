const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const SUCCESSFUL_ORDER_STATUSES = new Set(["delivered"]);

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value && value._id) return String(value._id);
  return String(value);
};

const isSuccessfulPurchase = (order) => {
  if (!order) return false;
  if (order.orderStatus === "cancelled") return false;
  if (order.orderStatus === "pending") return false;
  if (order.orderStatus === "ontheway") return false;
  if (order.orderStatus === "preparation") return false;

  if (order.paymentDetails?.status === "paid") return true;
  if (order.paymentDetails?.status === "unpaid") return false;
  if (order.paymentDetails?.status === "pending") return false;

  if (order.orderStatus && SUCCESSFUL_ORDER_STATUSES.has(order.orderStatus)) {
    return true;
  }

  return false;
};

const buildUserItemMatrix = (orders) => {
  const userMatrix = new Map();

  (orders || []).forEach((order) => {
    if (!isSuccessfulPurchase(order)) return;

    const userId = normalizeObjectId(order.user);
    if (!userId) return;

    const productSet = userMatrix.get(userId) || new Map();

    (order.items || []).forEach((entry) => {
      const productId = normalizeObjectId(entry.product);
      if (!productId) return;
      productSet.set(productId, 1);
    });

    userMatrix.set(userId, productSet);
  });

  return userMatrix;
};

const buildProductSimilarityMap = (orders) => {
  const userMatrix = buildUserItemMatrix(orders);
  const productUsers = new Map();

  userMatrix.forEach((productSet, userId) => {
    productSet.forEach((_, productId) => {
      const userSet = productUsers.get(productId) || new Set();
      userSet.add(userId);
      productUsers.set(productId, userSet);
    });
  });

  const productIds = [...productUsers.keys()];
  const similarityMap = new Map();

  for (let i = 0; i < productIds.length; i += 1) {
    const productA = productIds[i];
    similarityMap.set(productA, new Map());

    for (let j = i + 1; j < productIds.length; j += 1) {
      const productB = productIds[j];
      const buyersOfA = productUsers.get(productA) || new Set();
      const buyersOfB = productUsers.get(productB) || new Set();

      if (!buyersOfA.size || !buyersOfB.size) continue;

      // Cosine similarity on a binary user-item matrix:
      // similarity = shared buyers / sqrt(total buyers of A * total buyers of B)
      const intersection = [...buyersOfA].filter((userId) =>
        buyersOfB.has(userId),
      );
      const cosineSimilarity =
        intersection.length / Math.sqrt(buyersOfA.size * buyersOfB.size || 1);

      if (cosineSimilarity > 0) {
        similarityMap.get(productA).set(productB, cosineSimilarity);
        const nextMap = similarityMap.get(productB) || new Map();
        nextMap.set(productA, cosineSimilarity);
        similarityMap.set(productB, nextMap);
      }
    }
  }

  return similarityMap;
};

const buildPopularityMap = (orders) => {
  const popularityMap = new Map();

  (orders || []).forEach((order) => {
    if (!isSuccessfulPurchase(order)) return;

    (order.items || []).forEach((entry) => {
      const productId = normalizeObjectId(entry.product);
      if (!productId) return;
      popularityMap.set(productId, (popularityMap.get(productId) || 0) + 1);
    });
  });

  return popularityMap;
};

const generateRecommendationCandidates = ({
  userId,
  userPurchasedProducts,
  similarityMap,
  popularityMap,
  limit = 8,
}) => {
  const purchasedArray = Array.isArray(userPurchasedProducts)
    ? userPurchasedProducts
    : userPurchasedProducts instanceof Set
      ? Array.from(userPurchasedProducts)
      : [];

  const purchasedSet = new Set(
    purchasedArray.map((productId) => String(productId)),
  );

  if (!purchasedSet.size) {
    return Array.from((popularityMap || new Map()).entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Number(score) || 0,
        source: "popular",
      }));
  }

  const candidateScores = new Map();

  for (const [candidateProductId, relatedProducts] of similarityMap || []) {
    if (purchasedSet.has(candidateProductId)) continue;

    let score = 0;

    // Recommendation score = similarity × interaction weight + popularity boost
    for (const purchasedProductId of purchasedSet) {
      const similarity = relatedProducts.get(purchasedProductId) || 0;
      if (similarity > 0) {
        score += similarity * 1.5;
      }
    }

    const popularityBoost = (popularityMap.get(candidateProductId) || 0) * 0.05;
    const totalScore = score + popularityBoost;

    if (totalScore > 0) {
      candidateScores.set(candidateProductId, totalScore);
    }
  }

  if (!candidateScores.size) {
    return Array.from((popularityMap || new Map()).entries())
      .filter(([productId]) => !purchasedSet.has(productId))
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Number(score) || 0,
        source: "popular",
      }));
  }

  return Array.from(candidateScores.entries())
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, limit)
    .map(([productId, score]) => ({
      productId,
      score: Number(score.toFixed(6)) || 0,
      source: userId ? "personalized" : "popular",
    }));
};

const fetchRecommendationData = async (userId) => {
  const orders = await Order.find({}).lean();

  const successfulOrders = orders.filter((order) =>
    isSuccessfulPurchase(order),
  );
  const similarityMap = buildProductSimilarityMap(successfulOrders);
  const popularityMap = buildPopularityMap(successfulOrders);

  let purchasedProducts = [];
  if (userId) {
    const userOrders = successfulOrders.filter(
      (order) => normalizeObjectId(order.user) === String(userId),
    );

    purchasedProducts = userOrders.flatMap((order) =>
      (order.items || [])
        .map((entry) => normalizeObjectId(entry.product))
        .filter(Boolean),
    );
  }

  return { successfulOrders, similarityMap, popularityMap, purchasedProducts };
};

const getRecommendationsForUser = async (userId, limit = 8) => {
  const { similarityMap, popularityMap, purchasedProducts } =
    await fetchRecommendationData(userId);
  const userPurchasedProducts = Array.from(new Set(purchasedProducts));

  const candidates = generateRecommendationCandidates({
    userId,
    userPurchasedProducts,
    similarityMap,
    popularityMap,
    limit,
  });

  const uniqueCandidates = Array.from(
    new Map(
      candidates.map((candidate) => [candidate.productId, candidate]),
    ).values(),
  );

  if (!userId || !userPurchasedProducts.length) {
    return uniqueCandidates.slice(0, limit).map((candidate) => ({
      ...candidate,
      source: "popular",
    }));
  }

  return uniqueCandidates.slice(0, limit);
};

module.exports = {
  buildUserItemMatrix,
  buildProductSimilarityMap,
  buildPopularityMap,
  generateRecommendationCandidates,
  getRecommendationsForUser,
  isSuccessfulPurchase,
};
