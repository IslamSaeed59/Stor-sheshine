import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { optimizeCloudinaryUrl } from "../../../../utils/cloudinaryParams";

const defaultAboutImageUrl = "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?q=80&w=2070&auto=format&fit=crop";

const AboutUs = ({ aboutData }) => {
  const navigate = useNavigate();

  const imageUrl = (aboutData?.AboutImage && aboutData.AboutImage.length > 0) 
    ? aboutData.AboutImage[0] 
    : defaultAboutImageUrl;

  return (
    <section className="bg-gray-50 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Image */}
        <div className="relative h-[50vh] lg:h-[80vh] w-full order-2 lg:order-1">
          <motion.div
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={optimizeCloudinaryUrl(imageUrl)}
              alt="Brand Story"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Right Side: Text Content */}
        <div className="flex flex-col justify-center px-8 py-20 sm:px-16 lg:px-24 xl:px-32 order-1 lg:order-2 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4 block">
              The Brand Story
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-8">
              {aboutData?.AboutName || (
                <>Where Vision<br/>Meets Design.</>
              )}
            </h2>
            
            <div className="w-12 h-1 bg-gray-200 mb-8"></div>
            
            {aboutData?.AboutDescription ? (
               <p className="text-gray-600 text-lg leading-relaxed font-light mb-12 whitespace-pre-line">
                 {aboutData.AboutDescription}
               </p>
            ) : (
               <>
                 <p className="text-gray-600 text-lg leading-relaxed font-light mb-6">
                   Founded on the belief that everyday essentials should be extraordinary, our
                   mission is to empower through carefully selected fashion, beauty, and lifestyle pieces.
                 </p>
                 <p className="text-gray-600 text-lg leading-relaxed font-light mb-12">
                   We are passionate about delivering uncompromising quality and timeless elegance 
                   in everything we do—because you deserve to feel your absolute best.
                 </p>
               </>
            )}

            <button 
              onClick={() => navigate('/products')}
              className="group flex items-center gap-4 text-sm font-medium tracking-widest uppercase text-gray-900 hover:text-primary transition-colors"
            >
              Explore Collection
              <div className="w-12 h-px bg-gray-900 group-hover:bg-primary group-hover:w-16 transition-all duration-300 relative">
                <ArrowRight size={14} className="absolute -right-1 -top-[6px] group-hover:text-primary transition-colors" />
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
