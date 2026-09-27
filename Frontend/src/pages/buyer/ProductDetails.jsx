import { useParams } from 'react-router-dom';
import { useProductDetail, useAddToCart, useProductReviews } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';
import { PrimaryButton } from '../../components/common/Button';
import { assets } from '../../assets/assets';
import { getProductImage, handleImgError } from '../../utils/productImage';
import { BasketIcon } from '../../assets/data/icons';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const { data, isLoading } = useProductDetail(id);
  const { data: reviews } = useProductReviews(id);
  const { mutate: addToCart, isPending } = useAddToCart();
  if (isLoading) return <SkeletonTableLoader />;
  const product = data?.data || data;
  if (!product) return <div className="text-center py-12"><img src={assets.basket_icon} alt="" className="mx-auto h-16 opacity-40 mb-3" /><p>Product not found</p></div>;
  const reviewsList = reviews?.data || reviews || [];
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-green-footer rounded-xl p-4 border border-green-border">
        <img src={getProductImage(product, 0)} alt={product.productName || product.name} onError={(e)=>handleImgError(e, 0)} className="w-full h-[380px] object-cover rounded-lg" />
      </div>
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">{product.productName || product.name}</h1>
        <div className="flex items-center gap-2 mb-3"><img src={assets.rating_starts} alt="rating" className="h-4" /><span className="text-sm text-gray-600">(122 reviews)</span></div>
        <p className="text-gray-600 mb-4 leading-relaxed">{product.productDescription || product.description}</p>
        <p className="text-primary font-bold text-2xl mb-6">Rs {product.productPrice || product.price}</p>
        <div className="flex gap-3">
          <PrimaryButton label={isPending ? 'Adding...' : 'Add to Cart'} loading={isPending} onClick={()=>addToCart({ productID: id }, { onSuccess: ()=>toast.success('Added to cart'), onError: (e)=>toast.error(e.response?.data?.message || 'Failed') })} />
          <span className="inline-flex items-center gap-2 text-sm text-gray-600 border border-green-border rounded-lg px-4 bg-green-footer"><BasketIcon className="size-4 text-primary" /> Free delivery</span>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="font-semibold font-serif mb-3">Reviews</h3>
          {Array.isArray(reviewsList) && reviewsList.length > 0 ? (
            <ul className="space-y-3">
              {reviewsList.map((r, i)=>(
                <li key={i} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                  <p className="font-medium">{r.userName || r.user || 'Anonymous'}</p>
                  <p className="text-gray-600">{r.comment || r.review || r.text || JSON.stringify(r)}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed">No reviews yet. Be the first to review!</p>}
        </div>
      </div>
    </div>
  );
}
