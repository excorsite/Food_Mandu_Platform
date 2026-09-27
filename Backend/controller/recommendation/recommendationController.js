const Product = require("../../models/productModel");
const {
  getRecommendationsForUser,
} = require("../../services/recommendationService");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || null;
    const limit = Number(req.query.limit) || 8;

    const candidates = await getRecommendationsForUser(userId, limit);

    if (!candidates.length) {
      const fallbackProducts = await Product.find({ productStatus: "public" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return res.status(200).json({
        success: true,
        recommendations: fallbackProducts.map((product) => ({
          ...product,
          recommendationScore: 0,
        })),
        source: "fallback",
      });
    }

    const selectedProductIds = candidates.map(
      (candidate) => candidate.productId,
    );
    const products = await Product.find({
      _id: { $in: selectedProductIds },
      productStatus: "public",
    }).lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const recommendations = candidates
      .map((candidate) => {
        const fullProduct = productMap.get(candidate.productId);
        if (!fullProduct) return null;

        return {
          ...fullProduct,
          recommendationScore: Number(candidate.score) || 0,
          recommendationSource: candidate.source || "personalized",
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      recommendations,
      source: userId ? "personalized" : "popular",
    });
  } catch (error) {
    console.error("Recommendation generation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate recommendations right now.",
    });
  }
};
