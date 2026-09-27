import { useProducts, useRecommendations } from "../../api/hooks";
import { SkeletonTableLoader } from "../../components/common/SkletonLoader";
import { useNavigate } from "react-router-dom";
import { assets, menu_list } from "../../assets/assets";
import { getProductImage, handleImgError } from "../../utils/productImage";
import { BasketIcon, SearchIcon } from "../../assets/data/icons";

export default function Home() {
  const { data, isLoading, error } = useProducts({ page: 1, limit: 20 });
  const { data: recommendationsData, isLoading: recommendationsLoading } =
    useRecommendations();
  const navigate = useNavigate();
  if (isLoading) return <SkeletonTableLoader />;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  const products = data?.data || data?.products || [];
  const recommendations = recommendationsData?.recommendations || [];
  return (
    <div className="space-y-10">
      {/* Hero — uses assets/header_img.png */}
      <section
        className="relative bg-primary rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
        style={{ background: "hsl(var(--theme-primary))" }}
      >
        <div className="flex-1 text-white">
          <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
            Order your favourite food here
          </h1>
          <p className="mt-4 text-white/90 max-w-xl">
            Choose from a diverse menu featuring a delectable array of dishes
            crafted with the finest ingredients and culinary expertise.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-6 bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-green-footer transition"
          >
            View Menu
          </button>
        </div>
        <img
          src={assets.header_img}
          alt="Delicious food"
          className="w-full md:w-[520px] h-[300px] object-cover rounded-xl shadow-lg"
        />
      </section>

      {/* Menu — uses assets/menu_*.png via menu_list */}
      <section id="menu">
        <h2 className="text-2xl font-bold font-serif text-primary mb-2">
          Explore our menu
        </h2>
        <p className="text-gray-600 text-sm max-w-2xl mb-6">
          Choose from a diverse menu featuring a delectable array of dishes. Our
          mission is to satisfy your cravings.
        </p>
        <div className="flex gap-6 overflow-x-auto scrollbar-hidden pb-4">
          {menu_list.map((m) => (
            <div
              key={m.menu_name}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer hover:opacity-80 transition"
            >
              <img
                src={m.menu_image}
                alt={m.menu_name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-green-footer"
              />
              <span className="text-sm font-medium text-gray-700">
                {m.menu_name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold font-serif text-gray-900">
            Recommended for you
          </h2>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {recommendationsData?.source === "personalized"
              ? "Personalized"
              : "Popular"}
          </span>
        </div>
        {recommendationsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse h-72 rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((product, idx) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
              >
                <div className="relative h-48 overflow-hidden bg-green-footer">
                  <img
                    src={getProductImage(product, idx)}
                    alt={product.productName || product.name}
                    onError={(e) => handleImgError(e, idx)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <img src={assets.rating_starts} alt="" className="h-3" />{" "}
                    {product.recommendationScore
                      ? Number(product.recommendationScore).toFixed(2)
                      : "New"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product.productName || product.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                    {product.productDescription || product.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-primary font-bold">
                      Rs {product.productPrice || product.price}
                    </p>
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="bg-primary text-white p-2 rounded-full hover:bg-green-700 transition"
                      aria-label="View recommended item"
                    >
                      <BasketIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-600">
            No recommendations yet. Add a few completed orders to unlock
            personalized suggestions.
          </div>
        )}
      </section>

      {/* Products — uses local food images as fallback */}
      <section>
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6">
          Top dishes near you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <div
              key={product._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="relative h-48 overflow-hidden bg-green-footer">
                <img
                  src={getProductImage(product, idx)}
                  alt={product.productName || product.name}
                  onError={(e) => handleImgError(e, idx)}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-white/90 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <img src={assets.rating_starts} alt="" className="h-3" /> 4.5
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.productName || product.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 h-10 mt-1">
                  {product.productDescription || product.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-primary font-bold">
                    Rs {product.productPrice || product.price}
                  </p>
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="bg-primary text-white p-2 rounded-full hover:bg-green-700 transition"
                    aria-label="View"
                  >
                    <BasketIcon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <img
                src={assets.basket_icon}
                alt=""
                className="mx-auto h-16 opacity-40 mb-3"
              />
              <p className="text-gray-600">
                No products found. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
