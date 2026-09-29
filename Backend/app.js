const express = require("express");
const path = require("path");
require("dotenv").config();
const { connectDatabase } = require("./database/database");
const User = require("./models/userModel");
const app = express();

// requiring the registeruser and login user from auth controller from controller file
const { registerUser, loginUser } = require("./controller/auth/authController");

// We need this to parse JSON format data and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// code for making client access the folder named uploads only by defalt node doesnnot allow us access the folder
//directly by lcient
app.use(express.static(path.join(__dirname, "uploads")));

// Make database connection - supports both MONGO_URI and legacy Mongo_URI
const mongoUri = process.env.MONGO_URI || process.env.Mongo_URI;
connectDatabase(mongoUri).catch((error) =>
  console.error("Database startup failed:", error.message),
);

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
//requirieng cors for fixing cors related error
const cors = require("cors");
const { setSocketIo } = require("./services/socketService");

//importing the authRoute.js in this file to work with routes
const admin_user_route = require("./routes/admin/adminUserRoute");
const admin_order_route = require("./routes/admin/adminOrderRoute");
const product_routes = require("./routes/admin/productRoute");
const auth_routes = require("./routes/auth/authRoute");
const user_review_route = require("./routes/user/userReviewRoute");
const user_profile_route = require("./routes/user/profileRoute");
const user_order_route = require("./routes/user/orderRoute");
const user_payment_route = require("./routes/user/paymentRoute");
const recommendation_route = require("./routes/recommendation/recommendationRoute");

//step:5 create the requirement of the route path here
const user_cart_route = require("./routes/user/cartRoute");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// using the routes we added for the auth routes
// the "/" denotes that there are no subfolders for the route
// we can leave it "" only it will work
app.use("/api", auth_routes);
app.use("/api", product_routes);
app.use("/api", admin_user_route);
app.use("/api", user_review_route);
app.use("/api", user_order_route);
app.use("/api", admin_order_route);
app.use("/api", user_payment_route);
app.use("/api", recommendation_route);

// another way of using route either add everything on main route file like top
//or explicitly mention path here like i did  tin this boottm part mentioning profile route explicitly
app.use("/api/profile", user_profile_route);

// step 6: make use of the included route
//notice how id did /api and did /profile
//it is basically same as i worte whole path here for profile
//and for cart i have written it in their own route file cartRoute
app.use("/api", user_cart_route);

// Test API
app.get("/", (req, res) => {
  res.status(404).json({
    message: "I am alive",
  });
});

const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not set
// setting server variable
const server = app.listen(PORT, () => {
  console.log("Server is running at: http://localhost:" + PORT);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});
setSocketIo(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) return next(new Error("Unauthorized"));

    socket.data.userId = user.id;
    socket.data.role = user.role;
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.data.userId}`);
  if (["admin", "seller"].includes(socket.data.role)) {
    socket.join("staff:orders");
  }
});
