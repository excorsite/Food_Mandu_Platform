const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");

// Promisify the verify function
const verifyToken = promisify(jwt.verify);

const isUserAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userToken =
    req.headers.user_auth_token ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  if (!userToken) {
    return res.status(401).json({ message: "Please provide a valid token" });
  }

  try {
    const decodedToken = await verifyToken(userToken, process.env.SECRET_KEY);
    // Check if the token is valid
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the user by the decoded token's id
    const authorizedUser = await User.findOne({ _id: decodedToken.id });
    // If user is not found, return an error
    if (!authorizedUser) {
      return res
        .status(401)
        .json({ message: "You are not authorized to access this route" });
    }

    // Attach the user to the request object
    req.user = authorizedUser;
    next();
  } catch (error) {
    // Handle errors
    console.error("Authentication error:", error.message);
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = isUserAuthenticated;
