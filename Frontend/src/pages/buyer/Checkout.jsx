import { useState } from "react";
import { useCart, useCreateOrder, useInitiatePayment } from "../../api/hooks";
import { PrimaryButton } from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Checkout() {
  const { data, isLoading } = useCart(true);
  const { mutate: createOrder, isPending: creating } = useCreateOrder();
  const { mutate: initiatePayment, isPending: paying } = useInitiatePayment();
  const [shippingAddress, setShippingAddress] = useState("");
  const navigate = useNavigate();
  const items = data?.data || [];

  const createPendingOrder = (method, onCreated) => {
    if (!shippingAddress.trim())
      return toast.error("Please enter a delivery address");
    if (!items.length) return toast.error("Your cart is empty");
    createOrder(
      {
        shippingAddress: shippingAddress.trim(),
        items: items.map((item) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
        })),
        paymentDetails: { method },
      },
      { onSuccess: onCreated },
    );
  };

  const handleOrder = () =>
    createPendingOrder("COD", () => {
      toast.success("Order placed");
      navigate("/orders");
    });

  const handleKhalti = () =>
    createPendingOrder("khalti", (response) => {
      const order = response.data?.data;
      if (!order) return toast.error("Order was not created");
      initiatePayment(
        { orderId: order._id },
        {
          onSuccess: (paymentResponse) => {
            const url = paymentResponse.data?.paymentUrl;
            if (url) window.location.href = url;
            else toast.error("No payment URL returned");
          },
        },
      );
    });

  if (isLoading)
    return <div className="p-8 text-center">Loading checkout...</div>;
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-primary mb-6">
        Checkout
      </h1>
      <div className="bg-white p-6 rounded-xl border border-green-border shadow-sm space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Delivery address
          <textarea
            className="mt-2 w-full rounded-lg border border-gray-300 p-3"
            rows="3"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your delivery address"
          />
        </label>
        <p className="text-sm text-gray-600">
          Items:{" "}
          {items.reduce((total, item) => total + Number(item.quantity || 0), 0)}
        </p>
        <div className="grid gap-3">
          <PrimaryButton
            label="Place Order (Cash on Delivery)"
            loading={creating}
            onClick={handleOrder}
          />
          <PrimaryButton
            label="Pay with Khalti"
            variant="secondary"
            loading={creating || paying}
            onClick={handleKhalti}
          />
        </div>
      </div>
    </div>
  );
}
