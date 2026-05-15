import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  createVariant,
  deleteVariant,
  uploadVariantImage,
  uploadsizeChartImage,
} from "../../../Services/api";
import Header from "../../../Layout/Admin/Header";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Save,
  X,
  ArrowLeft,
  Tag,
  Layers,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { FiUpload, FiX } from "react-icons/fi";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const ProductCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sizeChartFile, setSizeChartFile] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState(null);
  const [uploadingSizeChart, setUploadingSizeChart] = useState(false);
  const [selectedMainImage, setSelectedMainImage] = useState(null);

  const size = ["Xs", "S", "M", "L", "XL", "XXL", "NoSize"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ✅ Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ✅ Handle size chart selection
  const handleSizeChartChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSizeChartFile(file);
    setSizeChartPreview(URL.createObjectURL(file));
  };

  // ✅ Remove selected size chart
  const handleRemoveSizeChart = () => {
    setSizeChartFile(null);
    setSizeChartPreview(null);
  };

  // ✅ Upload image with category name
  const handleImageUpload = async () => {
    if (!imageFile) return null;

    const formData = new FormData();

    formData.append("imageVariant", imageFile);

    try {
      setUploading(true);
      const response = await uploadVariantImage(formData);
      return response.data.imageUrl;
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ✅ Upload size chart image
  const handleSizeChartUpload = async () => {
    if (!sizeChartFile) return null;

    const formData = new FormData();
    formData.append("sizeChart", sizeChartFile);

    try {
      setUploadingSizeChart(true);
      const response = await uploadsizeChartImage(formData);
      return response.data.imageUrl;
    } catch (error) {
      console.error("❌ Size chart upload error:", error);
      toast.error("Size chart upload failed");
      return null;
    } finally {
      setUploadingSizeChart(false);
    }
  };

  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    price: "",
    stock: "",
    imageVariant: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id);
      console.log("Product Response:", response.data);
      setProduct(response.data);
      setNewVariant((prev) => ({
        ...prev,
        price: prev.price !== "" ? prev.price : (response.data.basePrice || ""),
      }));
      // Set initial main image
      if (response.data.images) {
        setSelectedMainImage(
          Array.isArray(response.data.images)
            ? response.data.images[0]
            : response.data.images,
        );
      }
      setImageError(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setSubmitting(false);
          return;
        }
      }

      let sizeChartUrl = "";
      if (sizeChartFile) {
        sizeChartUrl = await handleSizeChartUpload();
      }

      const payload = {
        ...newVariant,
        productId: id,
        color: newVariant.color.split(",").map((c) => c.trim()),
        price: parseFloat(newVariant.price),
        stock: parseInt(newVariant.stock),
        imageVariant: imageUrl,
        sizeChart: sizeChartUrl,
      };

      await createVariant(payload);
      toast.success("Variant added successfully");
      setShowVariantForm(false);
      setNewVariant({ size: "", color: "", price: "", stock: "" });
      setImageFile(null);
      setImagePreview(null);
      setSizeChartFile(null);
      setSizeChartPreview(null);
      fetchProduct();
    } catch (error) {
      console.error("Error creating variant:", error);
      toast.error(error.response?.data?.message || "Failed to add variant");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      try {
        await deleteVariant(variantId);
        toast.success("Variant deleted successfully");
        fetchProduct();
      } catch (error) {
        console.error("Error deleting variant:", error);
        toast.error("Failed to delete variant");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-gray-900 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 animate-pulse">
          Loading product details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-50 rounded-full p-6 mb-4">
          <Package size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Product not found
        </h2>
        <p className="text-gray-500 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 text-gray-900 hover:text-[#a91853] transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Header
        title={product.name}
        buttonText="Back to Products"
        navigation="/admin/products"
      />

      {/* Product Details Card with Image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-gray-900" />
              Product Details
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={16} className="text-gray-400" />
              <span>
                Created{" "}
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Image Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 shadow-sm">
                  {selectedMainImage && !imageError ? (
                    <img
                      src={optimizeCloudinaryUrl(selectedMainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                      <ImageIcon size={64} className="text-gray-300 mb-3" />
                      <p className="text-sm text-gray-400 font-medium">
                        No image available
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {imageError
                          ? "Failed to load image"
                          : "Image not uploaded"}
                      </p>
                    </div>
                  )}
                </div>
                {/* Thumbnail Gallery */}
                {Array.isArray(product.images) && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMainImage(img)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedMainImage === img ? "border-gray-900 ring-2 ring-[#111827]/20" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <img
                          src={optimizeCloudinaryUrl(img)}
                          alt={`Thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Tag size={16} className="text-gray-400" />
                  Description
                </div>
                <p className="text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-100 leading-relaxed">
                  {product.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-gradient-to-br from-zinc-50 to-white p-4 rounded-lg border border-zinc-100">
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <div className="inline-flex items-center px-3 py-1.5 bg-zinc-100 text-black rounded-full text-sm border border-zinc-200 font-medium">
                    {product.Category?.name || "Uncategorized"}
                  </div>
                </div>

                <div className="space-y-1 bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-gray-500">Brand</p>
                  <p className="text-gray-800 font-semibold text-lg">
                    {product.brand || "—"}
                  </p>
                </div>

                <div className="space-y-1 bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-gray-500">
                    Base Price
                  </p>
                  <p className="text-gray-800 font-semibold text-lg flex items-center gap-1">
                    <DollarSign size={18} className="text-green-600" />
                    {parseFloat(product.basePrice).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-1 bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-100">
                  <p className="text-sm font-medium text-gray-500">
                    Total Variants
                  </p>
                  <p className="text-gray-800 font-semibold text-lg">
                    {product.ProductVariants?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-gray-900" />
              Product Variants
            </h3>
            <button
              onClick={() => setShowVariantForm(!showVariantForm)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto ${
                showVariantForm
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-[#a91853] shadow-sm hover:shadow"
              }`}
            >
              {showVariantForm ? <X size={18} /> : <Plus size={18} />}
              <span className="text-sm font-medium">
                {showVariantForm ? "Cancel" : "Add Variant"}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Add Variant Form */}
          {showVariantForm && (
            <div className="mb-8 bg-gray-50/50 p-4 md:p-6 rounded-xl border border-gray-200/60 shadow-inner">
              <form onSubmit={handleCreateVariant}>
                <h4 className="text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Plus size={14} className="text-green-600" />
                  </div>
                  New Variant Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="size"
                      value={newVariant.size}
                      onChange={handleVariantChange}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-gray-900 transition-all text-sm"
                    >
                      <option value="">Select Size</option>
                      {size.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Colors{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (comma separated)
                      </span>{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={newVariant.color}
                      onChange={handleVariantChange}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-gray-900 transition-all text-sm"
                      placeholder="e.g., Red, Blue, Green"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        min="0"
                        value={newVariant.price}
                        onChange={handleVariantChange}
                        required
                        className="w-full pl-7 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-gray-900 transition-all text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={newVariant.stock}
                      onChange={handleVariantChange}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-gray-900 transition-all text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Variant Image{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (Optional)
                      </span>
                    </label>

                    {!imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-900/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-gray-900/10 transition-colors">
                            <FiUpload className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    ) : (
                      <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="bg-white/90 text-red-500 p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-white text-xs font-medium">
                                Uploading...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Size Chart Image Upload */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Size Chart{" "}
                      <span className="text-gray-400 font-normal normal-case">
                        (Optional)
                      </span>
                    </label>

                    {!sizeChartPreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-900/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-gray-900/10 transition-colors">
                            <FiUpload className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSizeChartChange}
                        />
                      </label>
                    ) : (
                      <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                        <img
                          src={sizeChartPreview}
                          alt="Size Chart Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemoveSizeChart}
                            className="bg-white/90 text-red-500 p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                        {uploadingSizeChart && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-white text-xs font-medium">
                                Uploading...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end pt-4 border-t border-gray-200/60">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-[#a91853] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium text-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Variant</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Variants Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Size
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Color
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Price
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Stock
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Image
                      </span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.ProductVariants &&
                  product.ProductVariants.length > 0 ? (
                    product.ProductVariants.map((variant, index) => (
                      <tr
                        key={variant.id}
                        className="hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center min-w-[3rem] h-8 px-2 bg-gray-100 rounded-md text-sm font-medium text-gray-700">
                              {variant.size}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(variant.color)
                              ? variant.color
                              : [variant.color]
                            ).map((color, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-200"
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full ring-1 ring-gray-200"
                                  style={{
                                    backgroundColor: color.toLowerCase(),
                                  }}
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  {color}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${parseFloat(variant.price).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                              variant.stock > 10
                                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                : variant.stock > 0
                                  ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                variant.stock > 10
                                  ? "bg-green-500"
                                  : variant.stock > 0
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                            />
                            {variant.stock > 0
                              ? `${variant.stock} in stock`
                              : "Out of stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              src={optimizeCloudinaryUrl(variant.imageVariant)}
                              alt={`${variant.size} ${Array.isArray(variant.color) ? variant.color.join(", ") : variant.color}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Variant"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Layers size={28} className="text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            No variants found
                          </h3>
                          <p className="text-sm text-gray-500 max-w-sm">
                            Add a variant to manage stock levels, pricing, and
                            product images.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
