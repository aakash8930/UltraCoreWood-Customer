// src/components/WishList.jsx

import React from "react";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "./WishlistContext";
import "../css/WishList.css";

const WishList = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // In WishList.js
  const handleAddToCart = async (item) => {
    // Pass the full product object from the wishlist item
    await addToCart(item, 1);
    removeFromWishlist(item._id || item.id || item.name);
  };

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title">WISHLIST</h1>
      <div className="wishlist-grid">
        {wishlistItems.length === 0 ? (
          <p className="empty-text">Your wishlist is empty.</p>
        ) : (
          wishlistItems.map((item) => (
            <div
              key={item._id || item.id || item.name}
              className="wishlist-card"
            >
              <img src={item.image} alt={item.name} />
              <div className="wishlist-card-content">
                <h3>{item.name}</h3>
                <p className="category-link">{item.category}</p>
                <p className="price">₹{item.price}</p>

                <div className="wishlist-action-row">
                  <button
                    className="add-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    ADD TO CART
                  </button>
                  <button
                    className="remove-icon-btn"
                    onClick={() =>
                      removeFromWishlist(item._id || item.id || item.name)
                    }
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishList;
