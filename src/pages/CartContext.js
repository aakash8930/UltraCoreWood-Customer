
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import {
//   getCart as fetchCartApi,
//   addToCart as addToCartApi,
//   updateCartItem as updateCartItemApi,
//   removeFromCart as removeFromCartApi,
//   clearCart as clearCartApi
// } from '../api/cartApi';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState({ items: [] });

//   // Whenever auth state changes, load (or clear) the cart
//   useEffect(() => {
//     const auth = getAuth();
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           const token = await user.getIdToken();
//           const data  = await fetchCartApi(token);
//           setCart(data);
//         } catch (e) {
//           console.error('Failed to load cart', e);
//           setCart({ items: [] });
//         }
//       } else {
//         // signed out
//         setCart({ items: [] });
//       }
//     });
//     return () => unsub();
//   }, []);

//   const addToCart = async (productId, quantity = 1) => {
//     const auth  = getAuth();
//     const user  = auth.currentUser;
//     if (!user) {
//       console.warn('Not signed in – cannot add to cart');
//       return;
//     }
//     try {
//       const token   = await user.getIdToken();
//       const updated = await addToCartApi(token, productId, quantity);
//       setCart(updated);
//     } catch (e) {
//       console.error('Add to cart failed', e);
//     }
//   };

//   const updateCartItem = async (productId, quantity) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;
//     try {
//       const token   = await user.getIdToken();
//       const updated = await updateCartItemApi(token, productId, quantity);
//       setCart(updated);
//     } catch (e) {
//       console.error('Update cart item failed', e);
//     }
//   };

//   const removeFromCart = async (productId) => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;
//     try {
//       const token   = await user.getIdToken();
//       const updated = await removeFromCartApi(token, productId);
//       setCart(updated);
//     } catch (e) {
//       console.error('Remove from cart failed', e);
//     }
//   };

//   const clearCart = async () => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;
//     try {
//       const token = await user.getIdToken();
//       await clearCartApi(token);
//       setCart({ items: [] });
//     } catch (e) {
//       console.error('Clear cart failed', e);
//     }
//   };

//   const cartTotal = cart.items.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   );

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         updateCartItem,
//         removeFromCart,
//         clearCart,
//         cartTotal
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);


// src/pages/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCart as fetchCartApi,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeFromCartApi,
  clearCart as clearCartApi
} from '../api/cartApi';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const data  = await fetchCartApi(token);
          setCart(data);
        } catch (e) {
          console.error('Failed to load cart', e);
          setCart({ items: [] });
        }
      } else {
        setCart({ items: [] });
      }
    });
    return () => unsub();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    const auth  = getAuth();
    const user  = auth.currentUser;
    if (!user) {
      console.warn('Not signed in – cannot add to cart');
      return;
    }
    try {
      const token   = await user.getIdToken();
      // Pass the product's ID to the API
      const updated = await addToCartApi(token, product._id, quantity);
      setCart(updated);
    } catch (e) {
      console.error('Add to cart failed', e);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token   = await user.getIdToken();
      const updated = await updateCartItemApi(token, productId, quantity);
      setCart(updated);
    } catch (e) {
      console.error('Update cart item failed', e);
    }
  };
  
  const removeFromCart = async (productId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token   = await user.getIdToken();
      const updated = await removeFromCartApi(token, productId);
      setCart(updated);
    } catch (e) {
      console.error('Remove from cart failed', e);
    }
  };

  const clearCart = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await clearCartApi(token);
      setCart({ items: [] });
    } catch (e) {
      console.error('Clear cart failed', e);
    }
  };

  // ✅ FIX: `cartTotal` now correctly calculates using the discount
  const cartTotal = cart.items.reduce((sum, item) => {
      const discountedPrice = (item.product.price * (100 - (item.product.discount || 0))) / 100;
      return sum + discountedPrice * item.quantity;
    },
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};