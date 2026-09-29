const assert = require("node:assert/strict");
const {
  setSocketIo,
  emitOrderStatusUpdated,
} = require("../services/socketService");

const emitted = [];
setSocketIo({
  to: (room) => ({
    emit: (eventName, payload) => emitted.push({ room, eventName, payload }),
  }),
});

emitOrderStatusUpdated({
  _id: "order-1",
  user: "user-1",
  orderStatus: "preparation",
});

assert.deepEqual(
  emitted.map(({ room, eventName, payload }) => ({
    room,
    eventName,
    payload,
  })),
  [
    {
      room: "user:user-1",
      eventName: "order:status-updated",
      payload: { orderId: "order-1", orderStatus: "preparation" },
    },
    {
      room: "staff:orders",
      eventName: "order:status-updated",
      payload: { orderId: "order-1", orderStatus: "preparation" },
    },
  ],
);

setSocketIo(null);
assert.doesNotThrow(() => emitOrderStatusUpdated({}));
