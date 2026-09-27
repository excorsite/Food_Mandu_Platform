import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyPayment } from "../../api/hooks";

export default function KhaltiSuccess() {
  const [searchParams] = useSearchParams();
  const {
    mutate: verifyPayment,
    isPending,
    isError,
    isSuccess,
  } = useVerifyPayment();
  const navigate = useNavigate();
  const verificationStarted = useRef(false);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    if (!pidx) {
      navigate("/payment/failed", { replace: true });
      return;
    }
    if (verificationStarted.current) return;
    verificationStarted.current = true;
    verifyPayment(
      { pidx },
      {
        onError: () => navigate("/payment/failed", { replace: true }),
      },
    );
  }, [searchParams, verifyPayment, navigate]);

  return (
    <div className="text-center py-12">
      {isPending && <p>Verifying your Khalti payment...</p>}
      {isError && <p>Payment verification failed.</p>}
      {isSuccess && (
        <>
          <h1 className="text-2xl font-bold text-green-700">
            Payment successful
          </h1>
          <p className="mt-2 text-gray-600">
            Your order has been paid and your cart is clear.
          </p>
          <button
            className="mt-5 underline"
            onClick={() => navigate("/orders")}
          >
            View your orders
          </button>
        </>
      )}
    </div>
  );
}
