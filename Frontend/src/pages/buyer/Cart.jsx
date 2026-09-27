import { useCart, useRemoveFromCart } from "../../api/hooks";
import { PrimaryButton } from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import { assets } from "../../assets/assets";
import { getProductImage, handleImgError } from "../../utils/productImage";
import { TrashIcon } from "../../assets/data/icons";
import toast from "react-hot-toast";

export default function Cart() {
  const { data, isLoading } = useCart();
  const { mutate: remove } = useRemoveFromCart();
  const navigate = useNavigate();
  if (isLoading) return <SkeletonTableLoader />;
  const items = data?.data || data?.items || data?.cart || [];
  if (!items.length)
    return (
      <div className="text-center py-16 border border-dashed border-green-border rounded-xl bg-green-footer/40">
        <img
          src={assets.basket_icon}
          alt="Empty cart"
          className="mx-auto h-24 mb-4 opacity-60"
        />
        <p className="text-gray-700 font-medium mb-2">Your cart is empty</p>
        <p className="text-sm text-gray-500 mb-6">
          Looks like you haven't added anything yet.
        </p>
        <PrimaryButton
          label="Continue Shopping"
          onClick={() => navigate("/")}
        />
      </div>
    );
  const subtotal = items.reduce(
    (s, it) =>
      s +
      Number(it.product?.productPrice || it.productPrice || it.price || 0) *
        (it.quantity || 1),
    0,
  );
  return (
    <div>
      <h1 className="text-3xl font-bold font-serif text-primary mb-6 flex items-center gap-3">
        <img src={assets.basket_icon} alt="" className="h-8" /> Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={item._id || item.productId || idx}
              className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 hover:shadow-sm transition"
            >
              <img
                src={getProductImage(item.product || item, idx)}
                alt={item.product?.productName || item.productName || item.name}
                onError={(e) => handleImgError(e, idx)}
                className="w-20 h-20 rounded-lg object-cover border border-green-footer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {item.product?.productName || item.productName || item.name}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity || 1} · Rs{" "}
                  {item.product?.productPrice ||
                    item.productPrice ||
                    item.price}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={assets.add_icon_green}
                    alt="add"
                    className="h-6 w-6 cursor-pointer hover:scale-110 transition"
                    onClick={() => toast("Use product page to adjust quantity")}
                  />
                  <img
                    src={assets.remove_icon_red}
                    alt="remove"
                    className="h-6 w-6 cursor-pointer hover:scale-110 transition"
                    onClick={() =>
                      remove(item._id || item.productId, {
                        onSuccess: () => toast.success("Removed"),
                      })
                    }
                  />
                </div>
              </div>
              <button
                onClick={() =>
                  remove(item._id || item.productId, {
                    onSuccess: () => toast.success("Removed"),
                  })
                }
                className="self-start p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition"
                aria-label="Remove"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl border border-green-border h-fit shadow-sm">
          <h3 className="font-semibold font-serif text-gray-900 mb-4 flex items-center gap-2">
            <img src={assets.bag_icon} alt="" className="h-5" /> Order Summary
          </h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rs {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-semibold text-primary">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">Rs {subtotal}</span>
            </div>
          </div>
          <PrimaryButton
            label="Proceed to Checkout"
            className="w-full justify-center"
            onClick={() => navigate("/checkout")}
          />
          <img src={assets.cross_icon} alt="" className="hidden" />
        </div>
      </div>
    </div>
  );
}
