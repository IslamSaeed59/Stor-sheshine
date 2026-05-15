import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart_items");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart form localStorage", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    const addQty = product.quantity || 1;

    setCartItems((prevItems) => {
      // Create a unique key for the item based on id, size, and color to distinguish variants
      const itemKey = `${product.id}-${product.size || ""}-${product.color || ""}`;

      const existingItemIndex = prevItems.findIndex(
        (item) =>
          `${item.id}-${item.size || ""}-${item.color || ""}` === itemKey,
      );

      if (existingItemIndex !== -1) {
        // Item exists — compute the target quantity once (safe under StrictMode)
        const currentQty = prevItems[existingItemIndex].quantity;
        const targetQty = currentQty + addQty;
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: targetQty,
        };
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity: addQty }];
      }
    });

    toast.success("Product added to cart!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const updateQuantity = (id, size, color, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const currentItemKey = `${item.id}-${item.size || ""}-${item.color || ""}`;
        const targetItemKey = `${id}-${size || ""}-${color || ""}`;

        if (currentItemKey === targetItemKey) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const currentItemKey = `${item.id}-${item.size || ""}-${item.color || ""}`;
        const targetItemKey = `${id}-${size || ""}-${color || ""}`;
        return currentItemKey !== targetItemKey;
      }),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart_items");
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
