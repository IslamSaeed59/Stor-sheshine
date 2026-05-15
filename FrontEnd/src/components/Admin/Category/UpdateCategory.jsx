import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getCategoryById,
  updateCategory,
  getCategories,
  uploadCategoryImage,
} from "../../../Services/api";
import { ArrowLeft, ImagePlus, X, Loader2, Save } from "lucide-react";

const UpdateCategory = () => {
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, allCategoriesRes] = await Promise.all([
           getCategoryById(id),
           getCategories()
        ]);

        const currentCategory = categoryRes.data;
        const allCategories = allCategoriesRes.data || [];
        
        // Prevent setting itself as its parent
        setCategories(allCategories.filter(cat => cat.id !== id));
        
        // Set form values
        setValue("name", currentCategory.name);
        setValue("parentId", currentCategory.parentId || "");
        
        if (currentCategory.image) {
            setImagePreview(currentCategory.image);
            setOriginalImage(currentCategory.image);
        }

      } catch (error) {
        toast.error("Failed to load category data");
        navigate("/admin/category");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, setValue]);

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

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview !== originalImage) {
       URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const handleImageUpload = async (categoryName) => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("categoryName", categoryName || "categories");
    formData.append("categoryImage", imageFile);

    try {
      setUploading(true);
      const response = await uploadCategoryImage(formData);
      return response.data.imageUrl;
    } catch (error) {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    let imageUrl = originalImage;

    // If a new image was uploaded
    if (imageFile) {
        const uploadedUrl = await handleImageUpload(data.name);
        if (!uploadedUrl) return; // Stop if upload failed
        imageUrl = uploadedUrl;
    } else if (!imagePreview) {
       // If image was removed completely
       imageUrl = null;
    }

    try {
      const payload = {
        ...data,
        parentId: data.parentId || null,
        image: imageUrl,
      };
      
      await updateCategory(id, payload);
      toast.success("Category updated successfully");
      navigate("/admin/category");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
         <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
         <p className="text-sm font-medium text-gray-500 animate-pulse">Loading category info...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm transition-all focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";
  const errorClass = "text-red-500 text-[11px] font-medium mt-1";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
       
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/category")}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-colors shadow-sm bg-gray-50 border border-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-serif font-medium text-gray-900">
            Edit Category
          </h2>
          <p className="text-sm text-gray-500 mt-1">Update category details and media.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
             <label className={labelClass}>Category Name</label>
             <input
               type="text"
               {...register("name", { required: "Name is required" })}
               className={`${inputClass} ${errors.name ? "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-500/20" : ""}`}
             />
             {errors.name && <p className={errorClass}>{errors.name.message}</p>}
           </div>

           <div>
             <label className={labelClass}>Parent Category</label>
             <select
               {...register("parentId")}
               className={`${inputClass} appearance-none cursor-pointer`}
             >
               <option value="">None (Top Level Category)</option>
               {categories.map((cat) => (
                 <option key={cat.id} value={cat.id}>
                   {cat.name}
                 </option>
               ))}
             </select>
             <p className="text-[10px] text-gray-400 mt-1.5">Leave 'None' to make it a primary category.</p>
           </div>
        </div>

        {/* Media Upload */}
        <div className="pt-2">
           <label className={labelClass}>Category Thumbnail Image</label>
           
           {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                 <ImagePlus size={32} className="text-gray-300 mb-3" strokeWidth={1.5} />
                 <p className="text-sm font-medium text-gray-700">Upload Image</p>
                 <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                 <input
                   type="file"
                   className="hidden"
                   accept="image/*"
                   onChange={handleImageChange}
                 />
              </label>
           ) : (
              <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                 <img
                   src={imagePreview}
                   alt="Preview"
                   className="w-full h-full object-cover"
                 />
                 <button
                   type="button"
                   onClick={handleRemoveImage}
                   className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                 >
                   <X size={16} strokeWidth={2.5} />
                 </button>
              </div>
           )}
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
               type="button"
               onClick={() => navigate("/admin/category")}
               className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
               Cancel
            </button>
            <button
               type="submit"
               disabled={isSubmitting || uploading}
               className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold tracking-wide text-white bg-gray-900 rounded-xl hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {(isSubmitting || uploading) ? (
                 <><Loader2 size={16} className="animate-spin" /> {uploading ? "Uploading..." : "Saving..."}</>
               ) : (
                 <><Save size={16} /> Save Changes</>
               )}
            </button>
        </div>

      </form>
    </div>
  );
};

export default UpdateCategory;
