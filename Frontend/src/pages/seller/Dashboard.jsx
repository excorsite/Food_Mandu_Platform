export default function SellerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
      <p className="text-gray-600 mb-4">Coming Soon — seller analytics will appear when backend adds seller controllers.</p>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Total Products</p><p className="text-3xl font-bold">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Total Orders</p><p className="text-3xl font-bold">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Revenue</p><p className="text-3xl font-bold text-green-600">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Avg Rating</p><p className="text-3xl font-bold">—</p></div>
      </div>
    </div>
  );
}
