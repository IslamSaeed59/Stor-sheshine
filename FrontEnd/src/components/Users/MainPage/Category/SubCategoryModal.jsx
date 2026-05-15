import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryParams';

const SubCategoryModal = ({ isOpen, onClose, parentCategory }) => {
  const navigate = useNavigate();

  if (!isOpen || !parentCategory) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
            <div>
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-primary mb-1">
                Explore Collection
              </h3>
              <h2 className="text-3xl font-serif font-medium text-gray-900">
                {parentCategory.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Body - Grid of Subcategories */}
          <div className="overflow-y-auto p-8 custom-scrollbar">
            {parentCategory.subCategories && parentCategory.subCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Visual Option to view all from parent */}
                <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="group cursor-pointer flex flex-col items-center text-center"
                   onClick={() => {
                     const subCatIds = (parentCategory.subCategories || []).map(s => s.id || s.id).join(',');
                     const url = `/products?categoryId=${parentCategory.id || parentCategory.id}${subCatIds ? `&subCategories=${subCatIds}` : ''}`;
                     navigate(url);
                     onClose();
                   }}
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                    <span className="text-sm font-medium tracking-widest uppercase text-gray-600 group-hover:text-primary transition-colors flex flex-col items-center gap-2">
                       View All <ArrowRight size={16} />
                    </span>
                  </div>
                  <h4 className="text-sm border-b border-transparent group-hover:border-primary text-gray-900 font-medium transition-all">
                    Shop Entire Collection
                  </h4>
                </motion.div>

                {/* Subcategories Mapping */}
                {parentCategory.subCategories.map((sub, index) => (
                  <motion.div
                    key={sub.id || sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 2) }} // Staggered animation
                    className="group cursor-pointer flex flex-col items-center text-center"
                    onClick={() => {
                      navigate(`/products?categoryId=${sub.id || sub.id}`);
                      onClose();
                    }}
                  >
                    <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-gray-50 shadow-sm group-hover:shadow-xl ring-1 ring-gray-100 group-hover:ring-primary/20 transition-all duration-500">
                      <img
                        src={optimizeCloudinaryUrl(sub.image || parentCategory.image) || "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1976&auto=format&fit=crop"}
                        alt={sub.name}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white text-xs tracking-widest uppercase opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                          Shop Now
                        </span>
                      </div>
                    </div>
                    <h4 className="text-[10px] sm:text-sm md:text-base font-serif font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 px-1">
                      {sub.name}
                    </h4>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-light max-w-md mx-auto">
                  There are no subcategories available for this collection at the moment.
                </p>
                <button
                  onClick={() => {
                    const subCatIds = (parentCategory.subCategories || []).map(s => s.id || s.id).join(',');
                    const url = `/products?categoryId=${parentCategory.id || parentCategory.id}${subCatIds ? `&subCategories=${subCatIds}` : ''}`;
                    navigate(url);
                    onClose();
                  }}
                  className="mt-6 px-8 py-3 bg-gray-900 text-white text-xs font-semibold tracking-widest uppercase hover:bg-primary transition-colors"
                >
                  Shop Parent Category
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubCategoryModal;
