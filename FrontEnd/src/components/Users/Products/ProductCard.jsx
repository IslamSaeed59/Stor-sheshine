import React, { useState, useEffect } from "react";
import { Info, Minus, Plus, X, Ruler, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../../../context/CartContext";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [selectedSizeChart, setSelectedSizeChart] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'shipping' | 'returns'
  const { addToCart, setIsCartOpen } = useCart();

  // Reset selected image when variant changes
  useEffect(() => {
    if (selectedVariant?.imageVariant) {
      setSelectedImage(selectedVariant.imageVariant);
    } else {
      setSelectedImage(null);
    }
  }, [selectedVariant, selectedColor]);

  // Collect all images (main product images + variant images)
  useEffect(() => {
    if (product) {
      const images = [];

      // Add main product images
      if (Array.isArray(product.images)) {
        images.push(...product.images);
      } else if (product.images) {
        images.push(product.images);
      }

      // Add variant images
      if (product.ProductVariants && Array.isArray(product.ProductVariants)) {
        product.ProductVariants.forEach((variant) => {
          if (variant.imageVariant && !images.includes(variant.imageVariant)) {
            images.push(variant.imageVariant);
          }
        });
      }

      setAllImages(images);
      if (images.length > 0 && !selectedImage) {
        setSelectedImage(images[0]);
      }
    }
  }, [product, selectedImage]);

  // Update selected size chart when variant changes
  useEffect(() => {
    if (selectedVariant?.sizeChart) {
      setSelectedSizeChart(selectedVariant.sizeChart);
    } else {
      setSelectedSizeChart(null);
    }
  }, [selectedVariant]);

  // Auto-select first color and variant
  useEffect(() => {
    if (product?.ProductVariants) {
      const uniqueColors = [
        ...new Set(
          product.ProductVariants.flatMap((v) =>
            Array.isArray(v.color) ? v.color : [v.color],
          ),
        ),
      ];

      if (uniqueColors.length > 0) {
        const firstColor = uniqueColors[0];
        setSelectedColor(firstColor);

        const variantsWithColor = product.ProductVariants.filter((v) =>
          Array.isArray(v.color)
            ? v.color.includes(firstColor)
            : v.color === firstColor,
        );

        const defaultVariant =
          variantsWithColor.find((v) => v.stock > 0) || variantsWithColor[0];

        if (defaultVariant) {
          setSelectedVariant(defaultVariant);
        }
      }
    }
  }, [product]);

  if (!product) return null;

  const {
    name,
    brand,
    description,
    basePrice,
    discount,
    Category,
    ProductVariants,
    isBestseller,
  } = product;

  // Calculate prices based on selected variant or base price
  const currentPrice = selectedVariant ? selectedVariant.price : basePrice;
  const discountValue = parseFloat(discount) || 0;
  const priceValue = parseFloat(currentPrice) || 0;

  const discountedPrice =
    discountValue > 0
      ? (priceValue * (1 - discountValue / 100)).toFixed(2)
      : priceValue.toFixed(2);

  const originalPrice = priceValue.toFixed(2);

  // Size display order and label mapping
  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

  const getSizeLabel = (size) => {
    const sizeUpper = String(size).toUpperCase().trim();
    const match = SIZE_ORDER.find((s) => s === sizeUpper);
    return match || size; // fallback to original value if not in the list
  };

  // Extract unique sizes/memories from variants
  const memoryOptions = ProductVariants
    ? [
        ...new Set(
          ProductVariants.map((v) => v.size).filter(
            (s) => s != null && s !== "" && s !== "NoSize",
          ),
        ),
      ].sort((a, b) => {
        const idxA = SIZE_ORDER.indexOf(String(a).toUpperCase().trim());
        const idxB = SIZE_ORDER.indexOf(String(b).toUpperCase().trim());
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      })
    : [];

  const uniqueColors = ProductVariants
    ? [
        ...new Set(
          ProductVariants.flatMap((v) =>
            Array.isArray(v.color) ? v.color : [v.color],
          ),
        ),
      ]
    : [];

  const handleIncrement = () => {
    if (selectedVariant && quantity >= selectedVariant.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: currentPrice,
      image: displayImage,
      quantity: quantity,
      size: selectedVariant?.size || null,
      color: selectedColor || null,
    });

    // Reset quantity after adding
    setQuantity(1);
    setIsCartOpen(true); // optionally open the cart immediately
  };

  const displayImage =
    selectedImage ||
    (Array.isArray(allImages) ? allImages[0] : allImages[0]) ||
    "/api/placeholder/400/400";

  return (
    <div className="bg-white pb-20">
      {/* Breadcrumbs - Minimalist */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
            <span className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer" onClick={() => navigate("/")}>
              Home
            </span>
            <span className="text-gray-300">/</span>
            {Category && (
              <>
                <span className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer" onClick={() => navigate(`/categories/${Category.id}`)}>
                  {Category.name || "Category"}
                </span>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs block">
              {name}
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column - Image Gallery (Sticky on Desktop) */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-6 lg:sticky lg:top-32 self-start">
            {/* Thumbnails (Vertical on Desktop/Tablet, Horizontal on Mobile) */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 w-full md:w-20 lg:w-24 shrink-0 custom-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 md:w-full aspect-[3/4] shrink-0 bg-gray-50 overflow-hidden transition-all duration-300 ${
                      displayImage === img
                        ? "ring-1 ring-gray-900 ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizeCloudinaryUrl(img, { width: 150 })}
                      alt={`${name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div
              className="relative w-full bg-gray-50 aspect-[3/4] overflow-hidden group cursor-zoom-in"
              onClick={() => {
                setModalImage(displayImage);
                setIsImageModalOpen(true);
              }}
            >
              {/* Badges */}
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                {discountValue > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                    Sale -{discountValue}%
                  </span>
                )}
                {isBestseller && (
                  <span className="bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                    Best Seller
                  </span>
                )}
              </div>

              <motion.img
                key={displayImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={optimizeCloudinaryUrl(displayImage, { width: 800 })}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="w-full lg:w-1/2 lg:py-8 lg:pr-8">
            <div className="max-w-md">
              {/* Brand & Share */}
              <div className="flex items-center justify-between mb-4">
                {brand && (
                  <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    {brand}
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <h1 className="text-3xl sm:text-4xl font-serif font-medium text-gray-900 leading-tight mb-6">
                {name}
              </h1>

              <div className="flex items-end gap-4 mb-10">
                <span className="text-2xl font-medium text-gray-900">
                  EGP {discountedPrice}
                </span>
                {discountValue > 0 && (
                  <span className="text-lg text-gray-400 line-through pb-0.5">
                    EGP {originalPrice}
                  </span>
                )}
              </div>

              <div className="h-px bg-gray-100 w-full mb-10"></div>

              {/* Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-widest uppercase text-gray-900">
                      Color:{" "}
                      <span className="text-gray-500 ml-1">
                        {selectedColor}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {uniqueColors.map((color, idx) => {
                      const variantsWithColor = ProductVariants.filter((v) =>
                        Array.isArray(v.color)
                          ? v.color.includes(color)
                          : v.color === color,
                      );
                      const isOutOfStock = !variantsWithColor.some(
                        (v) => v.stock > 0,
                      );
                      const isSelected = selectedColor === color;

                      return (
                        <button
                          key={idx}
                          disabled={isOutOfStock}
                          title={`${color}${isOutOfStock ? " (Out of Stock)" : ""}`}
                          onClick={() => {
                            let variant = variantsWithColor.find(
                              (v) => v.size === selectedVariant?.size,
                            );
                            if (!variant || variant.stock <= 0) {
                              variant =
                                variantsWithColor.find((v) => v.stock > 0) ||
                                variantsWithColor[0];
                            }
                            if (variant) {
                              setSelectedVariant(variant);
                              setSelectedColor(color);
                            }
                          }}
                          className={`
                            px-6 py-3 border text-xs font-medium tracking-wide transition-all duration-300
                            ${isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-900"}
                            ${isOutOfStock ? "opacity-30 cursor-not-allowed line-through" : ""}
                          `}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {memoryOptions.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-widest uppercase text-gray-900">
                      Size:{" "}
                      <span className="text-gray-500 ml-1">
                        {selectedVariant?.size ? getSizeLabel(selectedVariant.size) : ''}
                      </span>
                    </span>
                    {selectedSizeChart && (
                      <button
                        onClick={() => setIsSizeChartOpen(true)}
                        className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-all flex items-center gap-2"
                      >
                        <Ruler size={14} /> Size Guide
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {memoryOptions.map((memory, idx) => {
                      const variant = ProductVariants.find(
                        (v) =>
                          v.size === memory &&
                          (Array.isArray(v.color)
                            ? v.color.includes(selectedColor)
                            : v.color === selectedColor),
                      );
                      const isOutOfStock = !variant || variant.stock <= 0;
                      const isSelected = selectedVariant?.size === memory;

                      return (
                        <button
                          key={idx}
                          disabled={isOutOfStock}
                          title={isOutOfStock ? "Out of Stock" : ""}
                          onClick={() => {
                            if (variant) {
                              setSelectedVariant(variant);
                            } else {
                              const anyVariant =
                                ProductVariants.find(
                                  (v) => v.size === memory && v.stock > 0,
                                ) ||
                                ProductVariants.find((v) => v.size === memory);
                              if (anyVariant) {
                                setSelectedVariant(anyVariant);
                                setSelectedColor(
                                  Array.isArray(anyVariant.color)
                                    ? anyVariant.color[0]
                                    : anyVariant.color,
                                );
                              }
                            }
                          }}
                          className={`
                            h-12 min-w-[3rem] px-4 border text-xs font-medium tracking-wide transition-all duration-300 flex items-center justify-center
                            ${isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-900"}
                            ${isOutOfStock ? "opacity-30 cursor-not-allowed line-through relative after:absolute after:w-full after:h-px after:bg-gray-400 after:-rotate-45" : ""}
                          `}
                        >
                          {getSizeLabel(memory)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 h-14 w-max">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={16} strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={
                      selectedVariant && quantity >= selectedVariant.stock
                    }
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 h-14 bg-gray-900 hover:bg-primary text-white text-xs font-semibold tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedVariant && selectedVariant.stock <= 0}
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {selectedVariant && selectedVariant.stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>

              <div className="text-sm text-gray-600 font-light leading-relaxed min-h-[100px]">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="whitespace-pre-line">
                        {description || "No description provided."}
                      </p>
                    </motion.div>
                  )}
                  {activeTab === "shipping" && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <p>
                        <strong>Standard Shipping:</strong> 3-5 business days.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 sm:p-12 transition-opacity duration-300"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <img
            src={optimizeCloudinaryUrl(modalImage, { width: 1200, quality: "auto:best" })}
            alt="Product Preview"
            className="max-w-full max-h-[90vh] object-contain animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Size Chart Modal */}
      {isSizeChartOpen && selectedSizeChart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => setIsSizeChartOpen(false)}
        >
          <div
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-6 flex items-center justify-between">
              <h3 className="text-lg font-serif font-medium text-gray-900">
                Size Guide
              </h3>
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-8">
              <img
                src={optimizeCloudinaryUrl(selectedSizeChart, { width: 800 })}
                alt="Size Chart"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.target.src = "/api/placeholder/600/800";
                  e.target.onerror = null;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
