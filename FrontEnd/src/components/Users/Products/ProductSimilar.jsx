import { useEffect, useState } from "react";
import { getProductsByCategory } from "../../../Services/api";
import ProductsGrid from "./ProductsGrid";
import { Sparkles } from "lucide-react";

const ProductSimilar = ({ categoryId, currentProductId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!categoryId) return;
      setLoading(true);

      try {
        const response = await getProductsByCategory(categoryId);
        const products = response.data.products || response.data || [];

        // Filter out the current product
        const filtered = products.filter((p) => p.id !== currentProductId);

        // Shuffle and take 4 random products
        const randomSelection = filtered
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        setSimilarProducts(randomSelection);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [categoryId, currentProductId]);

  if (!loading && similarProducts.length === 0) return null;

  return (
    <div className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-gray-900 mb-4">
            You May Also Like
          </h2>
          <div className="w-12 h-px bg-gray-900 mb-4"></div>
          <p className="text-gray-500 text-sm tracking-wide font-light max-w-xl">
            Explore curated pieces that perfectly complement your style, handpicked just for you from our wider collection.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ProductsGrid products={similarProducts} />
        )}
      </div>
    </div>
  );
};

export default ProductSimilar;
