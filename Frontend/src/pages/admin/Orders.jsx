import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../../api/client";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import useOrderRealtime from "../../hooks/useOrderRealtime";
import toast from "react-hot-toast";

export default function AdminOrders() {
  useOrderRealtime("admin-orders");
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => client.get("/getOrdersAsAnAdmin").then((r) => r.data),
  });
  const updateOrder = useMutation({
    mutationFn: ({ id, status }) =>
      client.patch(`/ordersAsAnAdmin/${id}`, { newOrderStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to update order"),
  });
  if (isLoading) return <SkeletonTableLoader />;
  const orders = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders.</p>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="bg-white p-4 rounded border mb-2">
            <p>Order #{o._id}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">{o.orderStatus}</p>
              <select
                aria-label={`Update order ${o._id} status`}
                value={o.orderStatus}
                disabled={updateOrder.isPending}
                onChange={(event) =>
                  updateOrder.mutate({ id: o._id, status: event.target.value })
                }
                className="rounded border px-2 py-1 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="preparation">Preparation</option>
                <option value="ontheway">On the way</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
