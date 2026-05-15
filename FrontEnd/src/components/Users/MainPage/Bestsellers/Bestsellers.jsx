import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { getBestsellerProducts } from "../../../../Services/api";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "../../../common/OptimizedImage";
const Bestsellers = ({ offerData }) => {
  const [bestsellers, setBestsellers] = useState([]);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await getBestsellerProducts();
        setBestsellers(response.data || []);
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      }
    };
    fetchBestsellers();
  }, []);

  return (
    <section className="bg-white py-24 border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left mb-16">
          <div className="max-w-xl">
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              {offerData?.OfferName || "Our Bestsellers"}
            </h3>
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              {offerData?.OfferDescription || "Most Loved"}
            </h2>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 md:mt-0 flex items-center text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors group"
          >
            Shop All
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {bestsellers.length > 0 && (
          <div className="flex gap-2 mb-6 md:hidden justify-end">
            {/* Optional visual indicator that it's scrollable on mobile */}
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              Swipe to explore
            </span>
          </div>
        )}

        {bestsellers.length > 4 && (
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none z-10 w-full max-w-[90rem] mx-auto px-2">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors pointer-events-auto"
              aria-label="Scroll left"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors pointer-events-auto"
              aria-label="Scroll right"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        <style>
          {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}
        </style>

        {bestsellers.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar"
          >
            {bestsellers.map((product) => (
              <div
                key={product.id || product.id}
                className="group relative flex flex-col flex-none w-[45vw] sm:w-[45vw] md:w-[35vw] lg:w-[23vw] snap-center sm:snap-start"
              >
                <div
                  className="relative aspect-[3/4] mb-6 bg-gray-50 overflow-hidden cursor-pointer rounded-sm"
                  onClick={() =>
                    navigate(`/Product/${product.id || product.id}`)
                  }
                >
                  <OptimizedImage
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : "https://images.unsplash.com/photo-1512496015851-a1dc8aeddf0b?q=80&w=1974&auto=format&fit=crop"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Quick Add Button Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      className="w-full bg-white/95 backdrop-blur-sm text-gray-900 font-medium tracking-wide uppercase text-xs py-4 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/Product/${product.id || product.id}`);
                      }}
                    >
                      <ShoppingBag size={16} />
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="flex flex-col flex-grow text-center">
                  <h4 className="text-lg font-serif font-medium text-gray-900 mb-2 truncate px-2">
                    {product.name}
                  </h4>

                  {/* Sizes display */}
                  {product.ProductVariants &&
                    product.ProductVariants.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 px-2">
                        {[
                          ...new Set(
                            product.ProductVariants.map((v) => v.size).filter(
                              (s) => s && s !== "NoSize",
                            ),
                          ),
                        ].map((size, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] sm:text-xs font-medium text-gray-500 border border-gray-200 px-2 py-0.5 whitespace-nowrap"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  <div className="flex items-center justify-center gap-3">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          EGP {parseFloat(product.basePrice).toFixed(2)}
                        </span>
                        <span className="text-base font-medium text-primary">
                          EGP{" "}
                          {(
                            parseFloat(product.basePrice) *
                            (1 - product.discount / 100)
                          ).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-medium text-gray-900">
                        EGP {parseFloat(product.basePrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Bestsellers;
