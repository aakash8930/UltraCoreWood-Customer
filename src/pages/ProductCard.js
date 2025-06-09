import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faStar as solidStar,
  faCartShopping,
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

  // Retrieve average rating & count
  const avgRating = product.rating?.average || 0; // e.g. 4.2
  const reviewCount = product.rating?.count || 0; // e.g. 97

  // Build star icons
  const starElements = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(avgRating)) {
      starElements.push(
        <FontAwesomeIcon key={i} icon={solidStar} className="star filled" />
      );
    } else {
      starElements.push(
        <FontAwesomeIcon key={i} icon={regularStar} className="star" />
      );
    }
  }

  return (
    <div className="product-card">

      {/* --------- Image + Icons --------- */}
      <div className="image-section">
        {hasDiscount && <div className="discount-badge">-{discount}%</div>}

        <Link to={`/products/${itemId}`} className="image-link">
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")}
          />
        </Link>

        <div className="actions-icons">
          {/* If you want a "compare" icon above, substitute “faScaleBalanced” or any other icon here */}
          {/* <div className="compare-icon">
            <FontAwesomeIcon icon={faScaleBalanced} />
          </div> */}
          <div className="wishlist-icon" onClick={handleWishlistToggle}>
            <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
          </div>
        </div>
      </div>

      {/* --------- Product Details --------- */}
      <div className="product-info">
        <Link to={`/products/${itemId}`} className="name-link">
          <h4 className="product-name">{product.name}</h4>
        </Link>
        <p className="product-category">{product.category || ""}</p>

        <div className="rating-row">
          {starElements}
          <span className="review-count">{reviewCount}</span>
        </div>

        <div className="price-row">
          {hasDiscount && (
            <span className="original-price">{formatPrice(product.price)}</span>
          )}
          {hasDiscount && (
            <span className="discount-percentage">-{discount}%</span>
          )}
        </div>
      </div>
      <div className="pricing">
      <span className="discounted-price">{formatPrice(discountedPrice)}</span>
      {/* --------- Add to Cart Button --------- */}
      <button className="cart-button" onClick={handleAddToCart}>
        <FontAwesomeIcon icon={faCartShopping} />
      </button>
    </div>
    </div>
  );
}
