import { useOrders } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';

export default function MyOrders() {
  const { data, isLoading, error } = useOrders();
  if (isLoading) return <SkeletonTableLoader />;
  if (error) return <p className="text-red-600">{error.message}</p>;
  const orders = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length===0 ? <p className="text-gray-600">No orders yet.</p> : orders.map((o)=>(
        <div key={o._id} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
          <p className="font-semibold">Order #{o._id}</p>
          <p className="text-sm text-gray-500">Status: {o.orderStatus || o.status}</p>
        </div>
      ))}
    </div>
  );
}
