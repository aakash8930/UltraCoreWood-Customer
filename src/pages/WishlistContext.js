// import React, { createContext, useContext, useState } from "react";
// import socket from '../sockets.js';


// const WishlistContext = createContext();

// const getItemId = (item) => item?._id || item?.id || item?.name;

// export const WishlistProvider = ({ children }) => {
//   const [wishlistItems, setWishlistItems] = useState([]);

//   const addToWishlist = (item) => {
//     const itemId = getItemId(item);
//     setWishlistItems((prev) => {
//       const exists = prev.some((p) => getItemId(p) === itemId);
//       if (exists) return prev;
//       socket.emit("wishlist:add", item); // ✅ emit to others
//       return [...prev, item];
//     });
//   };

//   const removeFromWishlist = (id) => {
//     setWishlistItems((prev) => {
//       const updated = prev.filter((item) => getItemId(item) !== id);
//       if (updated.length !== prev.length) socket.emit("wishlist:remove", id); // ✅ emit to others
//       return updated;
//     });
//   };

//   // Listen for updates from others
//   React.useEffect(() => {
//     socket.on("wishlist:added", (item) => {
//       const itemId = getItemId(item);
//       setWishlistItems((prev) => {
//         const exists = prev.some((p) => getItemId(p) === itemId);
//         return exists ? prev : [...prev, item];
//       });
//     });

//     socket.on("wishlist:removed", (id) => {
//       setWishlistItems((prev) =>
//         prev.filter((item) => getItemId(item) !== id)
//       );
//     });

//     return () => {
//       socket.off("wishlist:added");
//       socket.off("wishlist:removed");
//     };
//   }, []);

//   return (
//     <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
//       {children}
//     </WishlistContext.Provider>
//   );
// };

// export const useWishlist = () => useContext(WishlistContext);


// src/pages/WishlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchWishlist, addItemToWishlist, removeItemFromWishlist } from '../api/wishlistApi';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const auth = getAuth();

  // Effect to load wishlist when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const serverWishlist = await fetchWishlist(token);
          setWishlistItems(serverWishlist.items || []);
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
          setWishlistItems([]); // Clear on error
        }
      } else {
        // User logged out, clear the wishlist
        setWishlistItems([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const addToWishlist = async (product) => {
    const user = auth.currentUser;
    if (!user || !product?._id) return;

    // Optimistic UI update: Add immediately to the frontend state
    setWishlistItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      return exists ? prev : [...prev, product];
    });

    // Call the backend to save the change
    try {
      const token = await user.getIdToken();
      await addItemToWishlist(token, product._id);
    } catch (error) {
      console.error("Failed to add item to wishlist:", error);
      // Revert optimistic update on error
      setWishlistItems((prev) => prev.filter((p) => p._id !== product._id));
    }
  };

  const removeFromWishlist = async (productId) => {
    const user = auth.currentUser;
    if (!user || !productId) return;

    const originalItems = [...wishlistItems];
    // Optimistic UI update: Remove immediately
    setWishlistItems((prev) => prev.filter((p) => p._id !== productId));
    
    // Call the backend
    try {
      const token = await user.getIdToken();
      await removeItemFromWishlist(token, productId);
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      // Revert on error
      setWishlistItems(originalItems);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};