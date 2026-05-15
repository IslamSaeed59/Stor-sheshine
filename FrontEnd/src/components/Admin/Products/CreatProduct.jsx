import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createProduct,
  getCategories,
  uploadImage,
  uploadVariantImage,
  uploadsizeChartImage,
} from "../../../Services/api";
import { UploadCloud, X, ArrowLeft, Loader2, ImagePlus } from "lucide-react";

const CreatProduct = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [variantImageFile, setVariantImageFile] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  const [sizeChartImageFile, setSizeChartImageFile] = useState(null);
  const [sizeChartImagePreview, setSizeChartImagePreview] = useState(null);
  const [isVariantPriceEdited, setIsVariantPriceEdited] = useState(false);

  const sizeOptions = ["Xs", "S", "M", "L", "XL", "XXL", "NoSize"];
  const selectedCategoryId = watch("categoryId");
  const basePrice = watch("basePrice");

  useEffect(() => {
    if (!isVariantPriceEdited) {
      setValue("price", basePrice, { shouldValidate: true });
    }
  }, [basePrice, isVariantPriceEdited, setValue]);

  const getSelectedCategoryName = () => {
    const selected = categories.find((cat) => cat.id === selectedCategoryId);
    if (!selected) return "uncategorized";
    const parent = categories.find((c) => c.id === selected.parentId);
    return parent ? parent.name : selected.name;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data || []);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 4) {
      toast.error("You can only upload a maximum of 4 images");
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`Skipped ${file.name}: Not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Skipped ${file.name}: Size must be less than 5MB`);
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSingleImageChange = (e, setFile, setPreview) => {
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
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeSingleImage = (setFile, preview, setPreview) => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return null;
    const categoryName = getSelectedCategoryName();
    try {
      setUploading(true);
      const uploadPromises = imageFiles.map((file) => {
        const formData = new FormData();
        formData.append("categoryName", categoryName);
        formData.append("productImage", file);
        return uploadImage(formData).then((res) => res.data.imageUrl);
      });
      return await Promise.all(uploadPromises);
    } catch (error) {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (imageFiles.length === 0) {
        toast.error("Please upload at least one product image");
        return;
      }
      if (!data.categoryId) {
        toast.error("Please select a category first");
        return;
      }

      const imageUrls = await handleImageUpload();
      if (!imageUrls) return;

      let variantImageUrl = "";
      if (variantImageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("imageVariant", variantImageFile);
        try {
          const res = await uploadVariantImage(formData);
          variantImageUrl = res.data.imageUrl;
        } catch (error) {
          toast.error("Failed to upload variant image");
          return;
        }
      }

      let sizeChartUrl = "";
      if (sizeChartImageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("sizeChart", sizeChartImageFile);
        try {
          const res = await uploadsizeChartImage(formData);
          sizeChartUrl = res.data.imageUrl;
        } catch (error) {
          toast.error("Failed to upload size chart image");
          return;
        }
      }

      const payload = {
        ...data,
        basePrice: parseFloat(data.basePrice),
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        discount: parseFloat(data.discount || 0),
        categoryId: data.categoryId,
        color: data.color.split(",").map((c) => c.trim()),
        images: imageUrls,
        imageVariant: variantImageUrl,
        sizeChart: sizeChartUrl,
      };

      await createProduct(payload);
      toast.success("Product created successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-gray-400";
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
            Create New Product
          </h2>
          <p className="text-sm text-gray-500 mt-1">Add a new item to your store's inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Box 1: Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Basic Information</h3>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`${inputClass} ${errors.name ? "border-red-300 bg-red-50" : ""}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>
                
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    {...register("description")}
                    rows="4"
                    className={`${inputClass} resize-none custom-scrollbar`}
                    placeholder="Describe this product..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      {...register("categoryId", { required: "Category is required" })}
                      className={`${inputClass} appearance-none cursor-pointer ${errors.categoryId ? "border-red-300 bg-red-50" : ""}`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => {
                        const parent = categories.find((c) => c.id === cat.parentId);
                        return (
                          <option key={cat.id} value={cat.id}>
                            {parent ? `${parent.name} > ${cat.name}` : cat.name}
                          </option>
                        );
                      })}
                    </select>
                    {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Brand</label>
                    <input
                      type="text"
                      {...register("brand")}
                      className={inputClass}
                      placeholder="e.g. Zara, Nike"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Media */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-gray-900">Product Images</h3>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">{imageFiles.length} / 4 uploaded</span>
               </div>
               
              {!selectedCategoryId && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs flex items-center gap-2">
                  <span className="text-base">⚠️</span> Please select a category above before uploading images.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    >
                      <X size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 4 && (
                  <label className={`aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all ${
                    selectedCategoryId ? "border-gray-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5" : "border-gray-200 cursor-not-allowed bg-gray-50 opacity-50"
                  }`}>
                    <ImagePlus size={24} className="text-gray-400 mb-2" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-gray-500">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      disabled={!selectedCategoryId}
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Box 3: Initial Variant */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Initial Variant Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div>
                  <label className={labelClass}>Color</label>
                  <input
                    type="text"
                    {...register("color", { required: "Color is required" })}
                    className={`${inputClass} ${errors.color ? "border-red-300 bg-red-50" : ""}`}
                    placeholder="e.g. Red, Blue, #FFFFFF"
                  />
                  {errors.color && <p className={errorClass}>{errors.color.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Size</label>
                  <select
                    {...register("size", { required: "Size is required" })}
                    className={`${inputClass} appearance-none cursor-pointer ${errors.size ? "border-red-300 bg-red-50" : ""}`}
                  >
                    <option value="">Select Size</option>
                    {sizeOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.size && <p className={errorClass}>{errors.size.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Stock Quantity</label>
                  <input
                    type="number"
                    {...register("stock", { required: "Stock is required", min: 0 })}
                    className={`${inputClass} ${errors.stock ? "border-red-300 bg-red-50" : ""}`}
                    placeholder="0"
                  />
                  {errors.stock && <p className={errorClass}>{errors.stock.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Variant Specific Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", { required: "Price is required", min: 0 })}
                    onInput={() => setIsVariantPriceEdited(true)}
                    className={`${inputClass} ${errors.price ? "border-red-300 bg-red-50" : ""}`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className={errorClass}>{errors.price.message}</p>}
                </div>

                 {/* Variant & Size chart images side by side */}
                 <div className="sm:col-span-2 grid grid-cols-2 gap-5 mt-2">
                    <div>
                      <label className={labelClass}>Variant Image (Optional)</label>
                      {!variantImagePreview ? (
                        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <UploadCloud size={20} className="text-gray-400 mb-1" strokeWidth={1.5} />
                          <span className="text-[11px] font-medium text-gray-500">Upload Variant</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setVariantImageFile, setVariantImagePreview)} />
                        </label>
                      ) : (
                        <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                          <img src={variantImagePreview} alt="Variant" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeSingleImage(setVariantImageFile, variantImagePreview, setVariantImagePreview)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 shadow">
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Size Chart (Optional)</label>
                      {!sizeChartImagePreview ? (
                        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <UploadCloud size={20} className="text-gray-400 mb-1" strokeWidth={1.5} />
                          <span className="text-[11px] font-medium text-gray-500">Upload Chart</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setSizeChartImageFile, setSizeChartImagePreview)} />
                        </label>
                      ) : (
                        <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                          <img src={sizeChartImagePreview} alt="Size Chart" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeSingleImage(setSizeChartImageFile, sizeChartImagePreview, setSizeChartImagePreview)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 shadow">
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </div>
                 </div>

              </div>
            </div>
            
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            
            {/* Box 4: Pricing */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="text-base font-semibold text-gray-900 mb-5">Pricing</h3>
               <div className="space-y-5">
                <div>
                  <label className={labelClass}>Base Price (EGP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">£</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register("basePrice", { required: "Base Price is required", min: 0 })}
                      className={`${inputClass} pl-8 ${errors.basePrice ? "border-red-300 bg-red-50" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.basePrice && <p className={errorClass}>{errors.basePrice.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Discount Percentage (%)</label>
                  <div className="relative">
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
                     <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...register("discount", {
                          min: { value: 0, message: "Must be positive" },
                          max: { value: 100, message: "Cannot exceed 100%" },
                        })}
                        className={`${inputClass} pr-8 ${errors.discount ? "border-red-300 bg-red-50" : ""}`}
                        placeholder="0.00"
                      />
                  </div>
                  {errors.discount && <p className={errorClass}>{errors.discount.message}</p>}
                </div>
               </div>
            </div>

            {/* Submit Action Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold tracking-wide hover:bg-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isSubmitting || uploading) ? (
                  <><Loader2 size={16} className="animate-spin" /> {uploading ? "Uploading media..." : "Saving..."}</>
                ) : (
                  "Create Product"
                )}
              </button>
               <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="w-full py-3 bg-white text-gray-600 rounded-xl text-sm font-semibold tracking-wide border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Discard
                </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatProduct;
