/**
 * Optimizes a Cloudinary image URL by adding transformation parameters.
 * @param {string} url - The original Cloudinary image URL.
 * @param {Object} options - Transformation options (width, height, quality, format).
 * @returns {string} The optimized Cloudinary image URL.
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;
  
  // Clean up any Windows backslashes
  let cleanUrl = url.replace(/\\/g, '/');

  // Handle local uploads (whether starting with /uploads/, uploads/, or fully qualified)
  if (cleanUrl.includes('/uploads/') || cleanUrl.startsWith('uploads/')) {
    const uploadPart = cleanUrl.includes('/uploads/') 
      ? cleanUrl.substring(cleanUrl.indexOf('/uploads/'))
      : `/${cleanUrl}`;
    const backendUrl = import.meta.env.DEV
      ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:9000")
      : window.location.origin;
    return `${backendUrl}${uploadPart}`;
  }

  // Only optimize Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  const {
    width = 'auto', // Changed to auto for responsive delivery
    dpr = 'auto', // Dynamic pixel ratio
    quality = 'auto:good', // Default quality
    format = 'auto', // Default format (webp/avif depending on browser)
    crop = 'limit', // Default crop mode (limit to prevent upscaling)
  } = options;

  // Build transformation string
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (dpr) transformations.push(`dpr_${dpr}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  // Check if URL already has transformations (usually right after 'upload/')
  const uploadIndex = url.indexOf('/upload/');
  
  if (uploadIndex !== -1) {
    // Insert transformations after '/upload/'
    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    
    // Check if there are already transformations (like v1234567890 or w_500)
    if (afterUpload.match(/^[a-z]+_[^/]+\//)) {
        // We could replace existing, but for simplicity we prepend our transformations
        return `${beforeUpload}${transformString}/${afterUpload}`;
    } else {
        return `${beforeUpload}${transformString}/${afterUpload}`;
    }
  }

  return url;
};
