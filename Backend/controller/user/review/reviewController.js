const Product = require("../../../models/productModel");
const Review = require("../../../models/reviewModel");

// Create a review

//separate way of creating review without nesting
// exports.createReview = async (req, res) => {
//     const userId = req.user.id;
//     const { userRating, userMessage } = req.body;
//     const productId = req.params.id;

//     if (!userRating || !userMessage || !productId) {
//         return res.status(400).json({
//             message: "Please provide rating, message, and productId",
//         });
//     }

//     const productExist = await Product.findById(productId);
//     if (!productExist) {
//         return res.status(404).json({
//             message: "Product with that productId does not exist",
//         });
//     }

//     await Review.create({
//         userId,
//         productId,
//         rating: userRating,
//         message: userMessage,
//     });

//     res.status(200).json({
//         message: "Review added successfully",
//     });
// };

// Get all reviews for a product
exports.getProductReview = async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({
      message: "Please provide productId",
    });
  }

  const productExist = await Product.findById(productId);
  if (!productExist) {
    return res.status(404).json({
      message: "Product with that id doesn't exist",
    });
  }

  const reviews = await Review.find({ productId }).populate("userId");
  res.status(200).json({
    message: "Reviews fetched successfully",
    data: reviews,
  });
};

// Delete a review
exports.deleteReview = async (req, res) => {
  //checking if the user is trying to delete only his review not review of others

  const reviewId = req.params.id;
  if (!reviewId)
    return res.status(400).json({ message: "Please provide reviewId" });
  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });
  if (review.userId.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      message: "You can't delete other user's review",
    });
  }

  await Review.findByIdAndDelete(reviewId);
  res.status(200).json({
    message: "Review deleted successfully",
  });
};

//getting review done by specific (user that is actively browsing) user(me) for all the review in my lifetime not specific to productr
exports.getReviewsByAUser = async (req, res) => {
  const userId = req.user.id;
  const reviews = await Review.find({ userId }).populate("productId");
  res.status(200).json({
    message: "Reviews fetched successfully",
    data: reviews,
  });
};
//getting review done for specific product by all user not only actively browsing user
exports.getReviewsByProduct = async (req, res) => {
  const productId = req.params.productId;
  const reviews = await Review.find({ productId }).populate("userId");
  res.status(200).json({
    message: "Reviews fetched successfully",
    data: reviews,
  });
};
//getting review done by specific product and user actively browsing user with specific product
//my review(single) or reviews(timely) for product x
exports.getReviewsByProductAndUser = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;
  // $and operator making sure both id given matches
  const reviews = await Review.find({
    $and: [{ productId }, { userId }],
  }).populate("userId");
  res.status(200).json({
    message: "Reviews fetched successfully",
    data: reviews,
  });
};

//nesting process of creating the review halting this for now

// Add a product review
exports.addProductReview = async (req, res) => {
  const productId = req.params.id;
  const { userRating, userMessage } = req.body;
  const userId = req.user.id;

  if (!userRating || !userMessage || !productId) {
    return res.status(400).json({
      message: "Please provide rating, message, and productId",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Product with that id does not exist",
    });
  }

  await Review.create({
    userId,
    productId,
    rating: userRating,
    message: userMessage,
  });

  res.status(200).json({
    message: "Review added successfully",
  });
};
