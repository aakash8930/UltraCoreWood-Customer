import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev; // Avoid duplicates
      return [...prev, item];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cartItems.length * 28500; // Dummy flat price (₹28,500 per item)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
