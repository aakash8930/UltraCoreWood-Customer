


/// src/pages/ProductCard.js
import ReactDOM from "react-dom"; // <--- NEW IMPORT
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { formatPrice } from "../utils/formatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faStar as solidStar,
  faStarHalfAlt,
  faCartShopping,
  faComment,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as regularHeart,
  faStar as regularStar,
} from "@fortawesome/free-regular-svg-icons";
import "../css/ProductCard.css";

export default function ProductCard({ product, openCart }) {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { cart: { items }, addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const [showToast, setShowToast] = useState(false);

  const itemId = product._id;
  const isWished = wishlistItems.some((item) => item?._id === itemId);
  const isInCart = items.some((item) => item.product?._id === itemId);

  const handleWishlistToggle = () => {
    isWished ? removeFromWishlist(itemId) : addToWishlist(product);
  };

  const handleCartButtonClick = () => {
    if (isInCart) {
      if (typeof openCart === "function") openCart();
      return;
    }
    if (showToast) return;
    if (!user) return navigate("/login");

    addToCart(product, 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
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
  const avgRating = product.rating?.average || 0;
  const reviewCount = product.rating?.count || 0;
  const starElements = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    if (avgRating >= starValue) {
      return <FontAwesomeIcon key={i} icon={solidStar} className="star" />;
    } else if (avgRating >= starValue - 0.5) {
      return <FontAwesomeIcon key={i} icon={faStarHalfAlt} className="star" />;
    } else {
      return <FontAwesomeIcon key={i} icon={regularStar} className="star" />;
    }
  });


  return (
    <div className="product-card">
      <div className="product-id">id: {itemId}</div>

      <div className="image-section">
        <Link to={`/products/${itemId}`} className="image-link">
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")}
          />
        </Link>
        <div className="actions-icons">
          <div className="action-icon" onClick={handleWishlistToggle}>
            <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
          </div>
        </div>
      </div>

      <div className="product-info">
        <Link to={`/products/${itemId}`} className="name-link">
          <h4 className="product-name">{product.name}</h4>
        </Link>
        <div className="rating-row">
          {starElements}
          <div className="review-count">
            <FontAwesomeIcon icon={faComment} />
            <span>{reviewCount}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="price-details">
          {hasDiscount && (
            <div className="price-top-row">
              <span className="original-price">{formatPrice(product.price)}</span>
              <span className="discount-percentage">-{discount}%</span>
            </div>
          )}
          <div className="final-price">{formatPrice(discountedPrice)}</div>
        </div>

        <button
          className={`cart-button ${isInCart ? 'is-in-cart' : ''}`}
          onClick={handleCartButtonClick}
        >
          <FontAwesomeIcon icon={faCartShopping} />
          {/* --- NEW: Tooltip added here --- */}
          <span className="cart-tooltip">
            {isInCart ? 'View Cart' : 'Add to Cart'}
          </span>
          {isInCart && (
            <div className="added-checkmark">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          )}
        </button>

        {showToast && ReactDOM.createPortal(
        <div className="add-to-cart-toast">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>Item added to cart</span>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
}
