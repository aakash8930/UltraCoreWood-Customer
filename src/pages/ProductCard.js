// src/components/ProductCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faStar as solidStar,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart, faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import "../css/ProductCard.css";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const itemId = product._id;
  const isWished = wishlistItems.some((item) => item._id === itemId);

  const handleWishlistToggle = () => {
    isWished ? removeFromWishlist(itemId) : addToWishlist(product);
  };

  const handleAddToCart = () => {
    const user = getAuth().currentUser;
    if (!user) {
      return navigate("/login");
    }
    addToCart(itemId, 1);
  };

  // Pick first available image
  let imageSrc = "/images/placeholder.jpg";
  if (product.images) {
    const key = Object.keys(product.images).find((k) => product.images[k]?.data);
    if (key) {
      const { contentType, data } = product.images[key];
      imageSrc = `data:${contentType};base64,${data}`;
    }
  } else if (product.image) {
    imageSrc = product.image;
  }

  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (100 - discount)) / 100
    : product.price;

  // --- NEW: retrieve average rating & count from product.rating ---
  const avgRating = product.rating?.average || 0; // e.g. 4.2
  const reviewCount = product.rating?.count || 0; // e.g. 5

  // Convert avgRating (e.g. 4.2) into 5 stars UI
  const starElements = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(avgRating)) {
      starElements.push(<FontAwesomeIcon key={i} icon={solidStar} className="star filled" />);
    } else if (i === Math.ceil(avgRating) && avgRating % 1 >= 0.5) {
      // If half star needed (optional): we’ll use a regular star for simplicity—but you can swap in a half‐star icon if available.
      starElements.push(<FontAwesomeIcon key={i} icon={solidStar} className="star filled" />);
    } else {
      starElements.push(<FontAwesomeIcon key={i} icon={regularStar} className="star" />);
    }
  }

  return (
    <div className="product-card-enhanced">
      <div className="image-wrapper">
        {hasDiscount && <div className="discount-badge">-{discount}%</div>}

        <Link to={`/products/${itemId}`} className="product-image-link">
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")}
          />
        </Link>

        <div className="wishlist-icon" onClick={handleWishlistToggle}>
          <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
        </div>
      </div>

      <div className="product-details">
        <Link to={`/products/${itemId}`} className="product-name-link">
          <h4 className="product-name">{product.name}</h4>
        </Link>
        <p className="product-subtext">{product.subtext || product.category}</p>

        {/* --- NEW: Show stars and review count --- */}
        <div className="rating-row">
          {starElements}
          <span className="review-count">({reviewCount})</span>
        </div>

        <div className="price-row">
          {hasDiscount && <span className="original-price">{formatPrice(product.price)}</span>}
          <span className="discounted-price">{formatPrice(discountedPrice)}</span>
        </div>

        <button className="add-cart-btn" onClick={handleAddToCart}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}
