import React, { useState } from "react";

/**
 * Optimized Cloudinary Image Component
 *
 * Credit-saving strategy:
 *  - No blurSrc: CSS skeleton replaces it, saving 50% of transformations.
 *  - q_auto:eco: smaller files vs q_auto:good.
 *  - Fixed srcset (400/800/1200): prevents endless w_auto variants.
 *  - f_auto: serves WebP/AVIF automatically.
 *  - Optional `crop` prop: callers can inject e.g. "c_fill,g_auto,ar_3:4"
 *    for smart cropping without baking card-specific logic into this component.
 *  - loading="lazy" + decoding="async": defers off-screen requests.
 *  - Error fallback: broken URLs show a grey skeleton instead of a broken icon.
 */

/** Cloudinary srcset breakpoints — keep short to limit transformation count. */
const WIDTHS = [400, 800, 1200];

/**
 * Build a Cloudinary delivery URL.
 * @param {string} src   - Original Cloudinary URL.
 * @param {number} width - Target width for this srcset entry.
 * @param {string} crop  - Optional extra transformation, e.g. "c_fill,g_auto,ar_3:4".
 */
function buildCloudinaryUrl(src, width, crop = "") {
  const uploadIndex = src.indexOf("/upload/");
  if (uploadIndex === -1) return src;

  const beforeUpload = src.substring(0, uploadIndex + 8); // includes "/upload/"
  const afterUpload = src.substring(uploadIndex + 8);

  // Strip any pre-existing transformation block so we never stack transforms.
  const cleanPath = afterUpload.replace(
    /^(?:[a-z_0-9]+(?::[a-z_0-9.]+)?(?:,)?)+\//,
    "",
  );

  const cropParam = crop ? `${crop},` : "";
  return `${beforeUpload}${cropParam}f_auto,q_auto:eco,w_${width}/${cleanPath}`;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  style,
  sizes,
  crop,
  onImageLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isCloudinary = src && src.includes("res.cloudinary.com");
  const isLocal = src && src.startsWith("/uploads/");

  const srcSet = isCloudinary
    ? WIDTHS.map((w) => `${buildCloudinaryUrl(src, w, crop)} ${w}w`).join(", ")
    : undefined;

  // Fallback src uses the middle breakpoint or local path.
  let resolvedSrc = src;
  if (isCloudinary) {
    resolvedSrc = buildCloudinaryUrl(src, 800, crop);
  } else if (isLocal) {
    const backendUrl = import.meta.env.DEV
      ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:9000")
      : window.location.origin;
    resolvedSrc = `${backendUrl}${src}`;
  }

  if (!src || hasError) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className || ""}`}
        style={style}
        role="img"
        aria-label={alt || "Image unavailable"}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={style}
    >
      {/* Skeleton shown while image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <img
        src={resolvedSrc}
        srcSet={srcSet}
        sizes={
          sizes || "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
        }
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          if (onImageLoad) onImageLoad();
        }}
        onError={() => {
          setHasError(true);
          if (onImageLoad) onImageLoad();
        }}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default OptimizedImage;
