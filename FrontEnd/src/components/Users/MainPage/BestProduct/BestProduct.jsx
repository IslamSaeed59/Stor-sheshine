import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "../../../../Services/api";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "../../../../components/common/OptimizedImage";

const BestProduct = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getFeaturedProducts();
        // The API returns an array. We'll pick the first one for the main banner.
        if (response.data && response.data.length > 0) {
          setProduct(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching featured product:", error);
      }
    };
    fetchFeatured();
  }, []);

  if (!product) return null;

  return (
    <section className="bg-background py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 rounded-sm border border-gray-100"
        >
          {/* Image Side */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-gray-50 overflow-hidden flex items-center justify-center p-12">
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-primary text-white text-xs font-bold tracking-widest uppercase py-2 px-4">
                Deal of the Day
              </span>
            </div>
            <OptimizedImage
              src={
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop"
              }
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Content Side */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Limited Edition
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-4 mb-6">
              {product.discount > 0 ? (
                <>
                  <span className="text-2xl lg:text-3xl font-light text-primary">
                    EGP{" "}
                    {(
                      parseFloat(product.basePrice) *
                      (1 - product.discount / 100)
                    ).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through">
                    EGP {parseFloat(product.basePrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl lg:text-3xl font-light text-gray-900">
                  EGP {parseFloat(product.basePrice).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 font-light leading-relaxed mb-10">
              {product.description ||
                "Experience the perfect blend of style and comfort. Handcrafted from premium materials for the ultimate luxurious feel. Make it yours today."}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
              <div className="flex items-center border border-gray-200 w-full sm:w-auto h-14">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-5 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-5 h-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() =>
                  navigate(`/Product/${product.id || product.id}`)
                }
                className="w-full sm:flex-1 h-14 bg-gray-900 text-white font-medium tracking-wide uppercase text-sm hover:bg-primary transition-colors flex items-center justify-center gap-2 group"
              >
                Discover More
                <ArrowRight
                  size={18}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BestProduct;
