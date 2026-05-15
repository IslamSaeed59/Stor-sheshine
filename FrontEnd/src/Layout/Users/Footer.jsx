import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterest } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, href: "https://www.facebook.com/groups/439867414711089/" },
    { icon: <FaInstagram />, href: "https://www.instagram.com/sheshine_o/?hl=en" },
  ];

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & About */}
          <div className="lg:col-span-4">
            <Link to="/" className="text-3xl font-serif font-bold tracking-widest text-gray-900 block mb-6">
              SHE<span className="text-primary">SHINE</span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-6 font-light max-w-sm">
              Discover curated fashion, beauty essentials, and accessories that elevate your style and celebrate confidence. 
              Designed for the modern woman.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-6">Shop</h3>
            <ul className="space-y-4">
              {['New Arrivals', 'Bestsellers', 'Clothing', 'Accessories', 'Beauty'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-gray-600 hover:text-primary transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-6">Join The Club</h3>
            <p className="text-gray-600 text-sm mb-4 font-light">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-none py-3 px-4 outline-none transition-all text-sm"
                required
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 text-gray-900 hover:text-primary transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-light">
          <p>&copy; {new Date().getFullYear()} SheShine. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
