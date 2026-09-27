const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../../../models/orderModel");
const User = require("../../../models/userModel");

const KHALTI_MIN_AMOUNT_PAISA = 1000;
const KHALTI_BASE_URL = (
  process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2"
).replace(/\/$/, "");

const khaltiHeaders = () => ({
  Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
});

const khaltiErrorResponse = (res, error) => {
  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return res.status(503).json({
      success: false,
      message: "Khalti rejected the configured secret key.",
    });
  }
  if (status === 400 || status === 404) {
    return res.status(400).json({
      success: false,
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Khalti could not validate this payment reference.",
    });
  }

  return res.status(502).json({
    success: false,
    message:
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Unable to communicate with Khalti.",
  });
};

exports.initiateKhaltiPayment = async (req, res) => {
  const { orderId } = req.body;
  if (!mongoose.isValidObjectId(orderId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order ID." });
  }
  if (!process.env.KHALTI_SECRET_KEY) {
    return res
      .status(503)
      .json({ success: false, message: "Payment service is not configured." });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "You cannot pay for this order." });
  }
  if (order.paymentDetails.method !== "khalti") {
    return res.status(400).json({
      success: false,
      message: "This order is not payable with Khalti.",
    });
  }
  if (order.paymentDetails.status === "paid") {
    return res
      .status(409)
      .json({ success: false, message: "This order is already paid." });
  }

  const amountInPaisa = Math.round(Number(order.totalAmount) * 100);
  if (
    !Number.isSafeInteger(amountInPaisa) ||
    amountInPaisa < KHALTI_MIN_AMOUNT_PAISA
  ) {
    return res.status(400).json({
      success: false,
      message: "Order amount is below Khalti's minimum or invalid.",
    });
  }

  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/$/, "");
  let response;
  try {
    response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      {
        return_url: `${frontendUrl}/payment/success`,
        website_url: frontendUrl,
        amount: amountInPaisa,
        purchase_order_id: order._id.toString(),
        purchase_order_name: "Food Order",
        customer_info: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
        },
      },
      { headers: khaltiHeaders() },
    );
  } catch (error) {
    return khaltiErrorResponse(res, error);
  }

  if (!response.data?.pidx || !response.data?.payment_url) {
    return res.status(502).json({
      success: false,
      message: "Khalti returned an invalid initiation response.",
    });
  }

  order.paymentDetails.pidx = response.data.pidx;
  order.paymentDetails.status = "pending";
  await order.save();
  return res.status(200).json({
    success: true,
    message: "Payment initiated.",
    pidx: response.data.pidx,
    paymentUrl: response.data.payment_url,
  });
};

exports.verifyPidx = async (req, res) => {
  const { pidx } = req.body;
  if (typeof pidx !== "string" || !pidx.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "A valid pidx is required." });
  }
  if (!process.env.KHALTI_SECRET_KEY) {
    return res
      .status(503)
      .json({ success: false, message: "Payment service is not configured." });
  }

  const order = await Order.findOne({
    "paymentDetails.pidx": pidx,
    user: req.user._id,
  });
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Payment order not found." });
  }
  if (order.paymentDetails.status === "paid") {
    return res
      .status(409)
      .json({ success: false, message: "This order is already paid." });
  }

  let response;
  try {
    response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      { headers: khaltiHeaders() },
    );
  } catch (error) {
    return khaltiErrorResponse(res, error);
  }

  const payment = response.data;
  if (payment?.pidx !== order.paymentDetails.pidx) {
    return res
      .status(400)
      .json({ success: false, message: "Khalti returned a mismatched pidx." });
  }
  if (payment.status !== "Completed" || payment.refunded === true) {
    return res.status(400).json({
      success: false,
      message: "Khalti has not confirmed a completed payment.",
      status: payment.status,
    });
  }

  const expectedAmountInPaisa = Math.round(Number(order.totalAmount) * 100);
  if (payment.total_amount !== expectedAmountInPaisa) {
    return res.status(400).json({
      success: false,
      message: "Khalti payment amount does not match the order.",
    });
  }
  if (
    payment.purchase_order_id &&
    payment.purchase_order_id !== order._id.toString()
  ) {
    return res.status(400).json({
      success: false,
      message: "Khalti payment does not match this order.",
    });
  }

  order.paymentDetails.method = "khalti";
  order.paymentDetails.status = "paid";
  order.paymentDetails.transactionId = payment.transaction_id || undefined;
  order.paymentDetails.amount = payment.total_amount;
  await order.save();
  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
  return res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: order,
  });
};
