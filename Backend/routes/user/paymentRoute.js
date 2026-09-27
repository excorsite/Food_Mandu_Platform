const {
  initiateKhaltiPayment,
  verifyPidx,
} = require("../../controller/user/payment/paymentController");
const isUserAuthenticated = require("../../middlewares/isAuthenticated");
const catchAsync = require("../../services/catchAsync");

const rtr = require("express").Router();

rtr
  .route("/payment/initiate")
  .post(isUserAuthenticated, catchAsync(initiateKhaltiPayment));

rtr.route("/payment/verify").post(isUserAuthenticated, catchAsync(verifyPidx));

module.exports = rtr;
