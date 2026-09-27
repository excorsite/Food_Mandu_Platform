const Product = require("../../models/productModel");
const Review = require("../../models/reviewModel");

exports.getProducts = async (req, res) => {
  // Changed this code first it used to fetch only id
  // but now as we changed the reviewModel to nextWayReviewModel
  // we are changing to fetch data and more data nested inside
  // the nested path as reviews database selecting name and email of user
  // const products = await Product.find().populate({
  // populate after getting into the reviews collection and display name and email of the user from reviews collections
  // path: "reviews",
  // populate: {
  //     path: "userId",
  //     select: "name email"
  // }
  // above method will populate the user id based way retrieving name email of that user

  // });

  // We will be using another method for this just finding not populating
  const products = await Product.find({ productStatus: "public" });

  return res.status(200).json({
    message: products.length
      ? "Products fetched successfully"
      : "No products available",
    data: products,
  });
};

exports.getEachProducts = async (req, res) => {
  try {
    // Taking get request destructuring id from URL
    const { id } = req.params;

    // If id is not provided, return an error
    if (!id) {
      return res.status(404).json({
        message: `Oops the item you searched is not here`,
        data: [],
      });
    }

    const products = await Product.findOne({
      _id: id,
      productStatus: "public",
    });
    // Showing review to the product simultaneously
    const reviews = await Review.find({ productId: id })
      .populate("userId")
      .populate("productId");

    // If products are not available give message of no products available
    if (!products) {
      return res.status(404).json({
        message: `Oops the item you searched is not here`,
        data: [],
      });
    } else {
      return res.status(200).json({
        message: "Product fetched successfully",
        data: products,
        reviews: reviews,
      });
    }
  } catch (error) {
    const { id } = req.params;
    console.log(error.message);
    return res.status(400).json({
      message: `Product with id ${id} not found`,
    });
  }
};
