import React, { createContext, useContext, useState } from "react";
import socket from '../sockets.js';


const WishlistContext = createContext();

const getItemId = (item) => item?._id || item?.id || item?.name;

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (item) => {
    const itemId = getItemId(item);
    setWishlistItems((prev) => {
      const exists = prev.some((p) => getItemId(p) === itemId);
      if (exists) return prev;
      socket.emit("wishlist:add", item); // ✅ emit to others
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => {
      const updated = prev.filter((item) => getItemId(item) !== id);
      if (updated.length !== prev.length) socket.emit("wishlist:remove", id); // ✅ emit to others
      return updated;
    });
  };

  // Listen for updates from others
  React.useEffect(() => {
    socket.on("wishlist:added", (item) => {
      const itemId = getItemId(item);
      setWishlistItems((prev) => {
        const exists = prev.some((p) => getItemId(p) === itemId);
        return exists ? prev : [...prev, item];
      });
    });

    socket.on("wishlist:removed", (id) => {
      setWishlistItems((prev) =>
        prev.filter((item) => getItemId(item) !== id)
      );
    });

    return () => {
      socket.off("wishlist:added");
      socket.off("wishlist:removed");
    };
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
