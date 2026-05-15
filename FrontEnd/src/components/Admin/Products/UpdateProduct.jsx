import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getProductById,
  updateProduct,
  getCategories,
  updateVariant,
  uploadsizeChartImage,
  uploadImage,
  uploadVariantImage,
} from "../../../Services/api";
import { Save, ArrowLeft, Package, DollarSign, Layers, Edit3, ImagePlus, X, Loader2 } from "lucide-react";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingVariant, setSavingVariant] = useState(null);
  const [editedVariantIndices, setEditedVariantIndices] = useState({});
  const [sizeChartFiles, setSizeChartFiles] = useState({});
  const [variantImageFiles, setVariantImageFiles] = useState({});
  
  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const sizeOptions = ["Xs", "S", "M", "L", "XL", "XXL", "NoSize"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        setCategories(categoriesResponse.data || []);

        const product = productResponse.data;
        if (product) {
          setValue("name", product.name);
          setValue("description", product.description);
          setValue("categoryId", product.categoryId?.id || product.categoryId);
          setValue("basePrice", product.basePrice);
          setValue("brand", product.brand);
          setValue("isBestseller", product.isBestseller);
          setValue("isFeatured", product.isFeatured);
          setValue("discount", product.discount);

          setVariants(
            (product.ProductVariants || []).map((v) => ({
              ...v,
              color: Array.isArray(v.color) ? v.color.join(", ") : v.color,
            })),
          );

          if (product.images && product.images.length > 0) {
            setExistingImages(product.images);
          }
        }
      } catch (error) {
        toast.error("Failed to load product details");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (existingImages.length + newImageFiles.length + files.length > 4) {
      toast.error("You can only have a maximum of 4 product images.");
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`Skipped ${file.name}: Not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Skipped ${file.name}: Exceeds 5MB`);
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setNewImageFiles((prev) => [...prev, ...newFiles]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleImageUpload = async (categoryNameStr) => {
    if (newImageFiles.length === 0) return [];
    try {
      setUploadingImages(true);
      const uploadPromises = newImageFiles.map((file) => {
        const formData = new FormData();
        formData.append("categoryName", categoryNameStr);
        formData.append("productImage", file);
        return uploadImage(formData).then((res) => res.data.imageUrl);
      });
      return await Promise.all(uploadPromises);
    } catch (error) {
      toast.error("Failed to upload new images");
      return null;
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error("Please provide at least one product image.");
      return;
    }

    try {
      // Find category name for Cloudinary folder structure
      let catName = "uncategorized";
      const selectedCat = categories.find(c => c.id === data.categoryId);
      if (selectedCat) {
         const parent = categories.find(c => c.id === selectedCat.parentId);
         catName = parent ? parent.name : selectedCat.name;
      }

      const uploadedUrls = await handleImageUpload(catName);
      if (uploadedUrls === null) return; // Upload failed

      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        ...data,
        basePrice: parseFloat(data.basePrice),
        categoryId: data.categoryId,
        discount: parseFloat(data.discount || 0),
        images: allImages,
      };

      await updateProduct(id, payload);
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);

    if (field === "price") {
      setEditedVariantIndices((prev) => ({ ...prev, [index]: true }));
    }
  };

  const handleSizeChartFileChange = (index, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
         toast.error("Image size must be less than 5MB");
         return;
      }
      setSizeChartFiles((prev) => ({ ...prev, [index]: file }));
    }
  };

  const handleVariantImageFileChange = (index, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
         toast.error("Image size must be less than 5MB");
         return;
      }
      setVariantImageFiles((prev) => ({ ...prev, [index]: file }));
    }
  };

  const onUpdateVariant = async (index) => {
    const variant = variants[index];
    setSavingVariant(variant.id);
    try {
      let sizeChartUrl = variant.sizeChart;
      let imageVariantUrl = variant.imageVariant;

      if (sizeChartFiles[index]) {
        const formData = new FormData();
        formData.append("sizeChart", sizeChartFiles[index]);
        const uploadRes = await uploadsizeChartImage(formData);
        sizeChartUrl = uploadRes.data.imageUrl;
      }

      if (variantImageFiles[index]) {
        const formData = new FormData();
        formData.append("imageVariant", variantImageFiles[index]);
        const uploadRes = await uploadVariantImage(formData);
        imageVariantUrl = uploadRes.data.imageUrl;
      }

      await updateVariant(variant.id, {
        size: variant.size,
        color: variant.color.split(",").map((c) => c.trim()),
        price: parseFloat(variant.price),
        stock: parseInt(variant.stock),
        sizeChart: sizeChartUrl,
        imageVariant: imageVariantUrl,
      });

      const newVariants = [...variants];
      newVariants[index].sizeChart = sizeChartUrl;
      newVariants[index].imageVariant = imageVariantUrl;
      setVariants(newVariants);
      
      setSizeChartFiles((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setVariantImageFiles((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      toast.success("Variant updated successfully");
    } catch (error) {
      toast.error("Failed to update variant");
    } finally {
      setSavingVariant(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
         <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
         <p className="text-sm font-medium text-gray-500 animate-pulse">Loading product data...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";
  const errorClass = "text-red-500 text-[11px] font-medium mt-1";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-colors shadow-sm bg-gray-50 border border-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-serif font-medium text-gray-900">
            Update Product
          </h2>
          <p className="text-sm text-gray-500 mt-1">Modify product details and manage variants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <form id="updateProductForm" onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Package size={18} className="text-gray-400" /> Basic Information
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className={`${inputClass} ${errors.name ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20" : ""}`}
                />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 mb-1.5 flex justify-between">
                  <span>Description</span>
                  <span className="text-gray-400 font-normal text-xs">Optional</span>
                </label>
                <textarea
                  rows="4"
                  {...register("description")}
                  className={`${inputClass} resize-none custom-scrollbar ${errors.description ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20" : ""}`}
                />
                {errors.description && <p className={errorClass}>{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                      {...register("categoryId", { required: "Category is required" })}
                      className={`${inputClass} appearance-none cursor-pointer ${errors.categoryId ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => {
                        const parent = categories.find((c) => c.id === cat.parentId);
                        return (
                          <option key={cat.id} value={cat.id}>
                            {parent ? `${parent.name} → ${cat.name}` : cat.name}
                          </option>
                        );
                      })}
                    </select>
                    {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
                </div>
                
                <div>
                   <label className="text-[13px] font-medium text-gray-700 mb-1.5 flex justify-between">
                     <span>Brand</span>
                     <span className="text-gray-400 font-normal text-xs">Optional</span>
                   </label>
                   <input
                     type="text"
                     {...register("brand")}
                     className={`${inputClass} ${errors.brand ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20" : ""}`}
                   />
                   {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
                </div>
              </div>

              {/* Status Flags */}
              <div className="pt-2 flex flex-col sm:flex-row gap-6">
                 <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      {...register("isBestseller")}
                      className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Is Bestseller</span>
                 </label>

                 <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      {...register("isFeatured")}
                      className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    Is Featured
                  </span>
                </label>
              </div>
            </div>
          </form>

          {/* Product Images Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ImagePlus size={18} className="text-gray-400" /> Product
                Images
              </h3>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                {existingImages.length + newImageFiles.length} / 4 total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Existing Images */}
              {existingImages.map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 group shadow-sm"
                >
                  <img
                    src={optimizeCloudinaryUrl(src)}
                    alt="Existing Product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
                    Existing
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {/* New Images */}
              {newImagePreviews.map((src, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 group shadow-sm bg-gray-50"
                >
                  <img
                    src={src}
                    alt="New Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
                    New
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {existingImages.length + newImageFiles.length < 4 && (
                <label className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 bg-gray-50/50">
                  <ImagePlus size={24} className="text-gray-400 mb-2" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-gray-500">
                    Add Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Variants Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-50 px-6 py-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Layers size={18} className="text-gray-400" /> Manage Variants
              </h3>
            </div>

            <div className="p-6">
              {variants.length > 0 ? (
                <div className="grid grid-cols-1 gap-5">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 transition-all hover:bg-white hover:shadow-md hover:border-gray-200"
                    >
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Edit3 size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Variant #{index + 1}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  parseInt(variant.stock) > 10
                                    ? "bg-green-500"
                                    : parseInt(variant.stock) > 0
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-[10px] uppercase font-medium text-gray-500 tracking-wider">
                                {parseInt(variant.stock) > 10
                                  ? "In Stock"
                                  : parseInt(variant.stock) > 0
                                  ? "Low Stock"
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onUpdateVariant(index)}
                          disabled={savingVariant === variant.id}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-primary transition-colors disabled:opacity-50"
                        >
                          {savingVariant === variant.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          {savingVariant === variant.id
                            ? "Saving..."
                            : "Save Variant"}
                        </button>
                      </div>

                      {/* Variant Fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Size
                          </label>
                          <select
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(index, "size", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:ring-0 outline-none"
                          >
                            {sizeOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Color
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:ring-0 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:ring-0 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "stock",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 focus:ring-0 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Variant Size Chart */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Size Chart Image
                          </label>
                          <div className="flex items-center gap-4">
                            {(sizeChartFiles[index] || variant.sizeChart) && (
                              <div className="relative w-12 h-16 rounded border border-gray-200 overflow-hidden bg-white shadow-sm shrink-0 group/img">
                                  <img
                                    src={
                                      sizeChartFiles[index]
                                        ? URL.createObjectURL(sizeChartFiles[index])
                                        : optimizeCloudinaryUrl(variant.sizeChart)
                                    }
                                    alt="Size Chart"
                                    className="w-full h-full object-cover"
                                  />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSizeChartFiles((prev) => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    const newVariants = [...variants];
                                    newVariants[index].sizeChart = "";
                                    setVariants(newVariants);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                >
                                  <X size={10} strokeWidth={3} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleSizeChartFileChange(index, e.target.files[0])
                              }
                              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Variant Feature Image */}
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Variant Image
                          </label>
                          <div className="flex items-center gap-4">
                            {(variantImageFiles[index] || variant.imageVariant) && (
                              <div className="relative w-12 h-16 rounded border border-gray-200 overflow-hidden bg-white shadow-sm shrink-0 group/img">
                                  <img
                                    src={
                                      variantImageFiles[index]
                                        ? URL.createObjectURL(variantImageFiles[index])
                                        : optimizeCloudinaryUrl(variant.imageVariant)
                                    }
                                    alt="Variant Image"
                                    className="w-full h-full object-cover"
                                  />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVariantImageFiles((prev) => {
                                      const updated = { ...prev };
                                      delete updated[index];
                                      return updated;
                                    });
                                    const newVariants = [...variants];
                                    newVariants[index].imageVariant = "";
                                    setVariants(newVariants);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                >
                                  <X size={10} strokeWidth={3} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleVariantImageFileChange(index, e.target.files[0])
                              }
                              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                    <Layers className="text-gray-300" size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    No variants exist
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Variants add sizes, colors, and stock to products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Box: Pricing Setup */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <DollarSign size={18} className="text-gray-400" /> Pricing Setup
            </h3>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Base Price (EGP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    form="updateProductForm"
                    {...register("basePrice", {
                      required: "Base Price is required",
                      min: { value: 0, message: "Price must be positive" },
                      onChange: (e) => {
                        const newPrice = e.target.value;
                        setVariants((prev) =>
                          prev.map((v, idx) =>
                            !editedVariantIndices[idx]
                              ? { ...v, price: newPrice }
                              : v
                          )
                        );
                      },
                    })}
                    className={`${inputClass} pl-8 ${
                      errors.basePrice
                        ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20"
                        : ""
                    }`}
                  />
                </div>
                {errors.basePrice && (
                  <p className={errorClass}>{errors.basePrice.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Discount (%)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    %
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    form="updateProductForm"
                    {...register("discount")}
                    className={`${inputClass} pr-8 ${
                      errors.discount
                        ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20"
                        : ""
                    }`}
                  />
                </div>
                {errors.discount && (
                  <p className={errorClass}>{errors.discount.message}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Set to 0 if there is no discount currently running.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
             <button
                type="submit"
                form="updateProductForm"
                disabled={isSubmitting || uploadingImages}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold tracking-wide hover:bg-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || uploadingImages) ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Update Product</>
                )}
              </button>
               <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="w-full py-3 bg-white text-gray-600 rounded-xl text-sm font-semibold tracking-wide border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Discard Changes
                </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
