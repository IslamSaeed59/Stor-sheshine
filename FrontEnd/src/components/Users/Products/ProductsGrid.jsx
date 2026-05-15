import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OptimizedImage from "../../common/OptimizedImage";

// Precise sizes value: prevents the browser from requesting a 1200px image
// for a card that only occupies ~25vw of the viewport.
const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Smart crop params applied to every product card image.
// c_fill + g_auto + ar_3:4 → Cloudinary sends exactly the pixels needed,
// no wasted bandwidth on uncropped whitespace.
const CARD_CROP = "c_fill,g_auto,ar_3:4";

const ProductsGrid = ({ products }) => {
  const navigate = useNavigate();

  console.log("products", products);

  const handleViewDetails = (productId) => {
    navigate(`/Product/${productId}`);
  };

  const calculateDiscountedPrice = (basePrice, discount) => {
    return (parseFloat(basePrice) * (1 - discount / 100)).toFixed(2);
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
          No matches found
        </h3>
        <p className="text-gray-500 font-light max-w-md mb-8">
          We couldn't find any products matching your current filters. Try
          adjusting your search criteria or browse our wider collection.
        </p>
        <button
          className="px-8 py-3 bg-gray-900 text-white text-xs font-semibold tracking-[0.2em] uppercase hover:bg-primary transition-colors"
          onClick={() => window.location.reload()}
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onViewDetails={handleViewDetails}
          calculateDiscountedPrice={calculateDiscountedPrice}
        />
      ))}
    </div>
  );
};

// ─── Extracted ProductCard ────────────────────────────────────────────────────
// Extracted into its own component so each card manages its own hover state
// independently without causing the whole grid to re-render.
const ProductCard = ({
  product,
  index,
  onViewDetails,
  calculateDiscountedPrice,
}) => {
  const primaryImage =
    (Array.isArray(product.images) ? product.images[0] : product.images) ||
    "https://images.unsplash.com/photo-1512496015851-a1dc8aeddf0b?q=80&w=1974&auto=format&fit=crop";

  // Check if product is entirely out of stock
  const isOutOfStock = product.ProductVariants && 
    product.ProductVariants.length > 0 && 
    product.ProductVariants.every(v => v.stock <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group flex flex-col cursor-pointer ${isOutOfStock ? 'opacity-80' : ''}`}
      onClick={() => onViewDetails(product.id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] mb-6 bg-gray-50 overflow-hidden">
        {/* Primary image */}
        <OptimizedImage
          src={primaryImage}
          alt={product.name}
          sizes={CARD_SIZES}
          crop={CARD_CROP}
          className={`absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale-[0.3]' : ''}`}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isOutOfStock ? (
            <span className="bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
              Out of Stock
            </span>
          ) : (
            <>
              {product.discount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                  Sale -{product.discount}%
                </span>
              )}
              {product.isNew && (
                <span className="bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                  New
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button
            className="w-full bg-white/95 backdrop-blur-sm text-gray-900 font-medium tracking-wide uppercase text-xs py-4 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product.id);
            }}
          >
            <ShoppingBag size={16} />
            Quick View
          </button>
        </div>

        {/* Wishlist Icon */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Product Info */}
      <div className="text-center flex flex-col flex-grow">
        {product.brand && (
          <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2">
            {product.brand}
          </span>
        )}

        <h3 className="text-lg font-serif font-medium text-gray-900 mb-2 px-2 hover:text-primary transition-colors truncate">
          {product.name}
        </h3>

        {/* Sizes display */}
        {product.ProductVariants && product.ProductVariants.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 px-2">
            {[
              ...new Set(
                product.ProductVariants.map((v) => v.size).filter(
                  (s) => s && s !== "NoSize",
                ),
              ),
            ].map((size, idx) => {
              const isSizeOutOfStock = product.ProductVariants.filter(v => v.size === size).every(v => v.stock <= 0);
              return (
                <span
                  key={idx}
                  className={`text-[10px] sm:text-xs font-medium border px-2 py-0.5 whitespace-nowrap ${
                    isSizeOutOfStock ? 'text-gray-300 border-gray-100 line-through' : 'text-gray-500 border-gray-200'
                  }`}
                >
                  {size}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-center justify-center gap-3">
          {product.discount > 0 ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                EGP {parseFloat(product.basePrice).toFixed(2)}
              </span>
              <span className="text-base font-medium text-primary">
                EGP{" "}
                {calculateDiscountedPrice(product.basePrice, product.discount)}
              </span>
            </>
          ) : (
            <span className="text-base font-medium text-gray-900">
              EGP {parseFloat(product.basePrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductsGrid;
