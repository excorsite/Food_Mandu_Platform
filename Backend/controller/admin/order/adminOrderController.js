const Order = require("../../../models/orderModel");

exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate({
    path: "items.product",
    model: "Product",
    select: "-productStock -reviews",
  });
  if (!orders.length)
    return res.status(404).json({ message: "no orders", data: [] });
  return res
    .status(200)
    .json({ message: "orders fetched successfully", data: orders });
};

exports.getSingleOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "items.product",
    model: "Product",
  });
  if (!order)
    return res.status(404).json({ message: "order not found", data: null });
  return res
    .status(200)
    .json({ message: "order details fetched successfully", data: order });
};

exports.updateOrderStatus = async (req, res) => {
  const { newOrderStatus } = req.body;
  const allowed = [
    "pending",
    "delivered",
    "cancelled",
    "ontheway",
    "preparation",
  ];
  const normalizedStatus =
    typeof newOrderStatus === "string" ? newOrderStatus.toLowerCase() : "";
  if (!allowed.includes(normalizedStatus))
    return res.status(400).json({ message: "invalid status", data: null });
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: normalizedStatus },
    { new: true, runValidators: true },
  );
  if (!order)
    return res.status(404).json({ message: "order not found", data: null });
  return res
    .status(200)
    .json({ message: "order status updated successfully", data: order });
};

exports.deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order)
    return res.status(404).json({ message: "order not found", data: null });
  return res
    .status(200)
    .json({ message: "order deleted successfully", data: order });
};
