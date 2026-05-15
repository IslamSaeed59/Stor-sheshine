import React, { useEffect, useState } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Instagram,
  Facebook,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../../context/CartContext";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinaryParams";

const CartDrawer = () => {
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    isCartOpen: isOpen,
    setIsCartOpen: onClose,
  } = useCart();

  // Lock body scroll when drawer or modals are open
  useEffect(() => {
    if (isOpen || showCheckoutModal || showClearCartModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, showCheckoutModal, showClearCartModal]);

  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => onClose(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-serif font-medium text-gray-900 flex items-center gap-2">
                  Your Bag{" "}
                  <span className="text-sm font-sans text-gray-400 font-normal">
                    ({cartItems.length})
                  </span>
                </h2>
                <button
                  onClick={() => onClose(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
                  aria-label="Close cart"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Cart Items Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShoppingBag
                        size={32}
                        className="text-gray-300"
                        strokeWidth={1}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-medium text-gray-900 mb-2">
                        Your bag is empty
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Discover our latest arrivals and elevate your wardrobe.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose(false);
                        navigate("/Products");
                      }}
                      className="mt-4 px-8 py-3 bg-gray-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-primary transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        className="flex gap-3 py-4 first:pt-0 group"
                      >
                        {/* Item Image */}
                        <div
                          className="w-[72px] h-[90px] bg-gray-50 overflow-hidden cursor-pointer shrink-0"
                          onClick={() => {
                            onClose(false);
                            navigate(`/Product/${item.id}`);
                          }}
                        >
                          <img
                            src={optimizeCloudinaryUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                {item.brand && (
                                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                                    {item.brand}
                                  </p>
                                )}
                                <h4
                                  className="text-[13px] font-medium text-gray-900 truncate hover:text-primary cursor-pointer transition-colors"
                                  onClick={() => {
                                    onClose(false);
                                    navigate(`/Product/${item.id}`);
                                  }}
                                >
                                  {item.name}
                                </h4>
                              </div>
                              <button
                                onClick={() =>
                                  removeFromCart(item.id, item.size, item.color)
                                }
                                className="text-gray-300 hover:text-red-500 transition-colors p-0.5 -mr-1 shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Color & Size inline */}
                            <div className="text-[11px] text-gray-400 mt-0.5 space-x-1.5">
                              {item.color && <span>{item.color}</span>}
                              {item.color && item.size && (
                                <span className="text-gray-200">·</span>
                              )}
                              {item.size && <span>{item.size}</span>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity selector */}
                            <div className="flex items-center border border-gray-200 h-7">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.size,
                                    item.color,
                                    item.quantity - 1,
                                  )
                                }
                                className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                              >
                                <Minus size={11} strokeWidth={2} />
                              </button>
                              <span className="w-7 text-center text-xs font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.size,
                                    item.color,
                                    item.quantity + 1,
                                  )
                                }
                                className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                              >
                                <Plus size={11} strokeWidth={2} />
                              </button>
                            </div>

                            <span className="text-[13px] font-semibold text-gray-900">
                              EGP {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Checkout */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 bg-white p-6 space-y-5 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>EGP {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                        Total
                      </span>
                      <span className="text-xl font-semibold text-gray-900">
                        EGP {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-1">
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="w-full h-14 bg-gray-900 hover:bg-primary text-white text-xs tracking-[0.2em] font-medium uppercase transition-colors duration-300 flex items-center justify-center gap-2 group"
                    >
                      Checkout Securely
                      <ArrowRight
                        size={16}
                        strokeWidth={1.5}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() => onClose(false)}
                      className="w-full h-12 bg-transparent border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 text-xs tracking-widest font-medium uppercase transition-all duration-300"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Instagram Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowCheckoutModal(false);
                setShowClearCartModal(true);
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 max-w-md w-full relative z-10 shadow-2xl"
            >
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setShowClearCartModal(true);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-2"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6 flex items-center gap-3">
                <ShoppingBag className="text-primary" /> Checkout
              </h3>

              <div className="space-y-4 text-sm text-gray-600 mb-8 p-4 bg-gray-50 border border-gray-100">
                <p className="font-medium text-gray-900 mb-2">
                  Before completing your order:
                </p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Please take a screenshot of your full cart.</li>
                  <li>
                    Click one of the links below to visit our Instagram or
                    Facebook page.
                  </li>
                  <li>Send us the screenshot via DM to complete your order.</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="https://ig.me/m/sheshine_o"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-[#E1306C] hover:bg-[#C13584] text-white flex items-center justify-center gap-2 font-medium tracking-wide transition-colors"
                >
                  <Instagram size={20} />
                  Message on Instagram
                </a>
                <a
                  href="https://www.facebook.com/groups/439867414711089/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center gap-2 font-medium tracking-wide transition-colors"
                >
                  <Facebook size={20} />
                  Message on Facebook
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearCartModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowClearCartModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 max-w-sm w-full relative z-10 shadow-2xl text-center"
            >
              <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
                Clear your cart?
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Do you want to clear your cart now?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearCartModal(false);
                    onClose(false);
                    navigate("/");
                  }}
                  className="w-full h-12 bg-gray-900 hover:bg-black text-white text-xs tracking-widest uppercase transition-colors"
                >
                  Yes, clear my cart
                </button>
                <button
                  onClick={() => setShowClearCartModal(false)}
                  className="w-full h-12 bg-white text-gray-600 hover:text-gray-900 text-xs tracking-widest uppercase transition-colors"
                >
                  No, I still need the items
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
