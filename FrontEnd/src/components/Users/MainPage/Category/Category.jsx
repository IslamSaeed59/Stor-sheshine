import React, { useEffect, useState } from "react";
import { getCategories } from "../../../../Services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SubCategoryModal from "./SubCategoryModal";

import { optimizeCloudinaryUrl } from "../../../../utils/cloudinaryParams";

const Category = ({ collectionsData }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const allCategories = response.data || [];
        const mainCategories = allCategories.filter((cat) => !cat.parentId);
        const categoriesWithSubs = mainCategories.map((cat) => ({
          ...cat,
          subCategories: allCategories.filter(
            (sub) => sub.parentId === (cat.id || cat.id),
          ),
        }));
        setCategories(categoriesWithSubs); // Show all categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left mb-16">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              {collectionsData?.CollectionsName || "Collections"}
            </h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
               {collectionsData?.CollectionsDescription ? (
                  <span className="whitespace-pre-line">{collectionsData.CollectionsDescription}</span>
               ) : (
                  <>Curated for the<br/>Modern Lifestyle</>
               )}
            </h3>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="mt-6 md:mt-0 flex items-center text-sm font-medium tracking-widest uppercase hover:text-primary transition-colors group"
          >
            View All Categories
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {categories.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-8 md:gap-12 lg:gap-16">
            {categories.map((category, index) => (
              <motion.div
                key={category.id || category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group cursor-pointer flex flex-col items-center text-center"
                onClick={() => {
                  if (category.subCategories && category.subCategories.length > 0) {
                    setSelectedCategory(category);
                    setIsModalOpen(true);
                  } else {
                    navigate(`/products?categoryId=${category.id || category.id}`);
                  }
                }}
              >
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-3 md:mb-5 bg-gray-50 shadow-sm group-hover:shadow-xl border border-gray-100 group-hover:border-primary/20 transition-all duration-500">
                  <img
                    src={optimizeCloudinaryUrl(category.image) || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1976&auto=format&fit=crop"}
                    alt={category.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h4 className="text-[10px] sm:text-sm md:text-base lg:text-lg font-serif font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 px-1">
                  {category.name}
                </h4>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <SubCategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        parentCategory={selectedCategory} 
      />
    </section>
  );
};

export default Category;
