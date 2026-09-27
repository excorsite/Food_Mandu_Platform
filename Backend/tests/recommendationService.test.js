const assert = require("node:assert/strict");
const {
  buildUserItemMatrix,
  buildProductSimilarityMap,
  generateRecommendationCandidates,
} = require("../services/recommendationService");

const sampleOrders = [
  {
    user: "user-1",
    orderStatus: "delivered",
    paymentDetails: { status: "paid" },
    items: [{ product: "product-a" }, { product: "product-b" }],
  },
  {
    user: "user-2",
    orderStatus: "delivered",
    paymentDetails: { status: "paid" },
    items: [{ product: "product-a" }],
  },
  {
    user: "user-3",
    orderStatus: "delivered",
    paymentDetails: { status: "paid" },
    items: [{ product: "product-b" }, { product: "product-c" }],
  },
];

const userMatrix = buildUserItemMatrix(sampleOrders);
assert.equal(userMatrix.get("user-1").get("product-a"), 1);
assert.equal(userMatrix.get("user-2").get("product-a"), 1);
assert.equal(userMatrix.get("user-3").get("product-c"), 1);

const similarityMap = buildProductSimilarityMap(sampleOrders);
assert.ok(similarityMap.get("product-a").get("product-b") > 0.4);

const recommendations = generateRecommendationCandidates({
  userId: "user-2",
  userPurchasedProducts: new Set(["product-a"]),
  similarityMap,
  popularityMap: new Map([
    ["product-b", 2],
    ["product-c", 1],
  ]),
});

assert.ok(recommendations.some((item) => item.productId === "product-b"));
assert.ok(!recommendations.some((item) => item.productId === "product-a"));

console.log("recommendationService test passed");
