import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Loader2, ImagePlus, X } from "lucide-react";
import {
  getMainPage,
  createMainPage,
  updateMainPage,
  uploadMainPageImage,
} from "../../../Services/api";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const MainPageAdmin = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExisting, setIsExisting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // States for Hero Images
  const [heroImageFiles, setHeroImageFiles] = useState([]);
  const [heroImagePreviews, setHeroImagePreviews] = useState([]);
  const [existingHeroImages, setExistingHeroImages] = useState([]); // Keep track of old ones not removed

  // States for About Images
  const [aboutImageFiles, setAboutImageFiles] = useState([]);
  const [aboutImagePreviews, setAboutImagePreviews] = useState([]);
  const [existingAboutImages, setExistingAboutImages] = useState([]); // Keep track of old ones not removed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMainPage();
        if (response.data) {
          setIsExisting(true);
          const data = response.data;
          
          // Populate ordinary fields
          setValue("HeroName", data.HeroName);
          setValue("HeroDescription", data.HeroDescription);
          setValue("HeroButton", data.HeroButton);
          setValue("CollectionsName", data.CollectionsName);
          setValue("CollectionsDescription", data.CollectionsDescription);
          setValue("OfferName", data.OfferName);
          setValue("OfferDescription", data.OfferDescription);
          setValue("AboutName", data.AboutName);
          setValue("AboutDescription", data.AboutDescription);

          // Populate existing images if available
          if (data.HeroImage && data.HeroImage.length > 0) {
            setExistingHeroImages(data.HeroImage);
            setHeroImagePreviews(data.HeroImage);
          }
          if (data.AboutImage && data.AboutImage.length > 0) {
            setExistingAboutImages(data.AboutImage);
            setAboutImagePreviews(data.AboutImage);
          }
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          toast.error("Failed to load Main Page data");
        }
        // 404 implies it's empty, we just leave form empty
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setValue]);

  // Image Upload Handlers
  const handleImageChange = (e, setFiles, setPreviews, isHero = true) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentLength = isHero ? heroImagePreviews.length : aboutImagePreviews.length;

    if (currentLength + files.length > 4) {
      toast.error("You can only upload a maximum of 4 images per section");
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

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index, isHero = true) => {
    if (isHero) {
      const isExistingImage = typeof heroImagePreviews[index] === "string" && !heroImagePreviews[index].startsWith("blob:");
      if (isExistingImage) {
        setExistingHeroImages(prev => prev.filter(img => img !== heroImagePreviews[index]));
      } else {
        // We have to figure out real file index. It's index - existingHeroImages.length
        const fileIndex = index - existingHeroImages.length;
        setHeroImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      }

      setHeroImagePreviews((prev) => {
        if (!isExistingImage) URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    } else {
       const isExistingImage = typeof aboutImagePreviews[index] === "string" && !aboutImagePreviews[index].startsWith("blob:");
       if (isExistingImage) {
         setExistingAboutImages(prev => prev.filter(img => img !== aboutImagePreviews[index]));
       } else {
         const fileIndex = index - existingAboutImages.length;
         setAboutImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
       }
 
       setAboutImagePreviews((prev) => {
         if (!isExistingImage) URL.revokeObjectURL(prev[index]);
         return prev.filter((_, i) => i !== index);
       });
    }
  };

  const handleImageUpload = async (files) => {
    if (files.length === 0) return [];
    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append("mainPageImage", file);
        return uploadMainPageImage(formData).then((res) => res.data.imageUrl);
      });
      return await Promise.all(uploadPromises);
    } catch {
      toast.error("Image upload failed");
      return null;
    }
  };

  const onSubmit = async (data) => {
    try {
      setUploading(true);
      
      let newHeroImagesUploaded = await handleImageUpload(heroImageFiles);
      if (newHeroImagesUploaded === null) return; // Error occurred
      
      let newAboutImagesUploaded = await handleImageUpload(aboutImageFiles);
      if (newAboutImagesUploaded === null) return; // Error occurred

      const finalPayload = {
        ...data,
        HeroImage: [...existingHeroImages, ...newHeroImagesUploaded],
        AboutImage: [...existingAboutImages, ...newAboutImagesUploaded]
      };

      if (isExisting) {
        await updateMainPage(finalPayload);
        toast.success("Main Page updated successfully");
      } else {
        await createMainPage(finalPayload);
        toast.success("Main Page created successfully");
        setIsExisting(true);
      }
      
      // Cleanup file states 
      setHeroImageFiles([]);
      setAboutImageFiles([]);
      // Update existing trackers
      setExistingHeroImages([...existingHeroImages, ...newHeroImagesUploaded]);
      setExistingAboutImages([...existingAboutImages, ...newAboutImagesUploaded]);

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save Main Page data");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-primary/5 outline-none placeholder:text-gray-400";
  const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";
  const errorClass = "text-red-500 text-[11px] font-medium mt-1";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-medium text-gray-900">
            Main Page Configuration
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update the frontend hero section, offers, collections content, and about us section.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Hero Title</label>
              <input
                type="text"
                {...register("HeroName")}
                className={inputClass}
                placeholder="E.g. Discover the Latest Abaya Collection"
              />
            </div>
            <div>
              <label className={labelClass}>Hero Description</label>
              <textarea
                {...register("HeroDescription")}
                rows="3"
                className={`${inputClass} resize-none`}
                placeholder="Write an engaging subtitle..."
              />
            </div>
            <div>
              <label className={labelClass}>Hero Button Text</label>
              <input
                type="text"
                {...register("HeroButton")}
                className={inputClass}
                placeholder="E.g. Shop Now"
              />
            </div>

            <div className="mt-4">
               <div className="flex items-center justify-between mb-2">
                 <label className={labelClass}>Hero Images</label>
                 <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">{heroImagePreviews.length} / 4 uploaded</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {heroImagePreviews.map((src, index) => (
                   <div key={index} className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                     <img src={optimizeCloudinaryUrl(src)} alt={`Hero ${index}`} className="w-full h-full object-cover" />
                     <button
                       type="button"
                       onClick={() => handleRemoveImage(index, true)}
                       className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                     >
                       <X size={14} strokeWidth={2.5}/>
                     </button>
                   </div>
                 ))}
                 {heroImagePreviews.length < 4 && (
                   <label className={`aspect-[16/9] flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer border-gray-300 hover:border-primary/50 hover:bg-primary/5`}>
                     <ImagePlus size={20} className="text-gray-400 mb-1" strokeWidth={1.5} />
                     <span className="text-[10px] font-medium text-gray-500">Add Image</span>
                     <input
                       type="file"
                       accept="image/*"
                       className="hidden"
                       multiple
                       onChange={(e) => handleImageChange(e, setHeroImageFiles, setHeroImagePreviews, true)}
                     />
                   </label>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900 mb-5">Collections Section</h3>
           <div className="space-y-4">
            <div>
              <label className={labelClass}>Collections Title</label>
              <input
                type="text"
                {...register("CollectionsName")}
                className={inputClass}
                placeholder="E.g. Our Premium Collections"
              />
            </div>
            <div>
              <label className={labelClass}>Collections Description</label>
              <textarea
                {...register("CollectionsDescription")}
                rows="2"
                className={`${inputClass} resize-none`}
                placeholder="Description of your collections..."
              />
            </div>
           </div>
        </div>

        {/* Offer Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900 mb-5">Special Offer Section</h3>
           <div className="space-y-4">
            <div>
              <label className={labelClass}>Offer Title</label>
              <input
                type="text"
                {...register("OfferName")}
                className={inputClass}
                placeholder="E.g. Ramdan Sale!"
              />
            </div>
            <div>
              <label className={labelClass}>Offer Description</label>
              <textarea
                {...register("OfferDescription")}
                rows="2"
                className={`${inputClass} resize-none`}
                placeholder="Explain the details of your offer..."
              />
            </div>
           </div>
        </div>

        {/* About Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900 mb-5">About Us Section</h3>
           <div className="space-y-4">
            <div>
              <label className={labelClass}>About Title</label>
              <input
                type="text"
                {...register("AboutName")}
                className={inputClass}
                placeholder="E.g. About SheShine"
              />
            </div>
            <div>
              <label className={labelClass}>About Description</label>
              <textarea
                {...register("AboutDescription")}
                rows="3"
                className={`${inputClass} resize-none`}
                placeholder="Your brand story..."
              />
            </div>

            <div className="mt-4">
               <div className="flex items-center justify-between mb-2">
                 <label className={labelClass}>About Images</label>
                 <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">{aboutImagePreviews.length} / 4 uploaded</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {aboutImagePreviews.map((src, index) => (
                   <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group shadow-sm">
                     <img src={optimizeCloudinaryUrl(src)} alt={`About ${index}`} className="w-full h-full object-cover" />
                     <button
                       type="button"
                       onClick={() => handleRemoveImage(index, false)}
                       className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                     >
                       <X size={14} strokeWidth={2.5}/>
                     </button>
                   </div>
                 ))}
                 {aboutImagePreviews.length < 4 && (
                   <label className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer border-gray-300 hover:border-primary/50 hover:bg-primary/5`}>
                     <ImagePlus size={20} className="text-gray-400 mb-1" strokeWidth={1.5} />
                     <span className="text-[10px] font-medium text-gray-500">Add Image</span>
                     <input
                       type="file"
                       accept="image/*"
                       className="hidden"
                       multiple
                       onChange={(e) => handleImageChange(e, setAboutImageFiles, setAboutImagePreviews, false)}
                     />
                   </label>
                 )}
               </div>
            </div>
           </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
           <button
             type="submit"
             disabled={isSubmitting || uploading}
             className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold tracking-wide hover:bg-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
           >
             {(isSubmitting || uploading) ? (
               <><Loader2 size={16} className="animate-spin" /> {uploading ? "Uploading..." : "Saving..."}</>
             ) : (
               isExisting ? "Update Main Page" : "Create Main Page"
             )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default MainPageAdmin;
