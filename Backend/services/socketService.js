let socketIo;

const setSocketIo = (instance) => {
  socketIo = instance;
};

const emitOrderStatusUpdated = (order) => {
  if (!socketIo || !order) return;

  const event = {
    orderId: order.id || order._id?.toString(),
    orderStatus: order.orderStatus,
  };

  if (order.user) {
    socketIo
      .to(`user:${order.user.toString()}`)
      .emit("order:status-updated", event);
  }
  socketIo.to("staff:orders").emit("order:status-updated", event);
};

module.exports = { setSocketIo, emitOrderStatusUpdated };
