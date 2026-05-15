import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "../../../common/OptimizedImage";

const Hero = ({ heroData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasData = heroData && heroData.HeroImage && heroData.HeroImage.length > 0;

  const slides = hasData ? heroData.HeroImage.map(imageSrc => ({
    src: imageSrc,
    title: heroData.HeroName || "Welcome to SheShine",
    subtitle: "Featured",
    description: heroData.HeroDescription || "Explore our collection",
    buttonText: heroData.HeroButton || "Shop Now",
    buttonLink: "/products",
  })) : [];

  const nextSlide = React.useCallback(() => {
    if (!hasData) return;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [hasData, slides.length]);

  const prevSlide = () => {
    if (!hasData) return;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!hasData) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [hasData, nextSlide]);

  if (!hasData) {
    return <div className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-gray-900 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-gray-900">
      <AnimatePresence initial={false}>
        <motion.div

          key={currentIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <OptimizedImage
            src={slides[currentIndex].src}
            alt={slides[currentIndex].title}
            className="w-full h-full"
            style={{ position: 'absolute' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4 max-w-5xl mx-auto">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="mb-4 text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-white/90">
            {slides[currentIndex].subtitle}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 leading-tight">
            {slides[currentIndex].title}
          </h1>
          <p className="max-w-2xl text-lg md:text-xl font-light text-white/90 mb-10 leading-relaxed">
            {slides[currentIndex].description}
          </p>
          <a
            href={slides[currentIndex].buttonLink}
            className="group relative px-8 py-4 bg-white text-gray-900 overflow-hidden rounded-none font-medium tracking-wide transition-all"
          >
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              {slides[currentIndex].buttonText}
            </span>
            <div className="absolute inset-0 h-full w-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
        </motion.div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 text-white/70 hover:text-white transition-colors focus:outline-none"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={40} strokeWidth={1} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 text-white/70 hover:text-white transition-colors focus:outline-none"
        aria-label="Next Slide"
      >
        <ChevronRight size={40} strokeWidth={1} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 transition-all duration-300 ${
              currentIndex === index ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
