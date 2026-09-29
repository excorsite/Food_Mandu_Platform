import { useDeleteProduct, useProducts } from "../../api/hooks";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";

export default function AdminProducts() {
  const { data, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  if (isLoading) return <SkeletonTableLoader />;
  const products = data?.data || data?.products || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product Moderation</h1>
      {products.map((p) => (
        <div
          key={p._id}
          className="bg-white p-4 rounded border mb-2 flex items-center justify-between gap-3"
        >
          <span>{p.productName || p.name}</span>
          <span>Rs {p.productPrice || p.price}</span>
          <button
            type="button"
            disabled={deleteProduct.isPending}
            onClick={() => {
              if (window.confirm("Delete this product?")) {
                deleteProduct.mutate(p._id);
              }
            }}
            className="rounded border border-red-200 px-3 py-1 text-sm text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
