// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getAuth } from "firebase/auth";
// import { useCart } from "../pages/CartContext";
// import { useWishlist } from "../pages/WishlistContext";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faHeart as solidHeart,
//   faStar as solidStar,
//   faCartShopping,
// } from "@fortawesome/free-solid-svg-icons";
// import { faHeart as regularHeart, faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
// import "../css/ProductCard.css";

// const formatPrice = (amount) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// export default function ProductCard({ product }) {
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

//   const itemId = product._id;
//   const isWished = wishlistItems.some((item) => item._id === itemId);

//   const handleWishlistToggle = () => {
//     isWished ? removeFromWishlist(itemId) : addToWishlist(product);
//   };

//   const handleAddToCart = () => {
//     const user = getAuth().currentUser;
//     if (!user) {
//       return navigate("/login");
//     }
//     addToCart(itemId, 1);
//   };

//   // Pick first available image
//   let imageSrc = "/images/placeholder.jpg";
//   if (product.images) {
//     const key = Object.keys(product.images).find((k) => product.images[k]?.data);
//     if (key) {
//       const { contentType, data } = product.images[key];
//       imageSrc = `data:${contentType};base64,${data}`;
//     }
//   } else if (product.image) {
//     imageSrc = product.image;
//   }

//   const discount = product.discount || 0;
//   const hasDiscount = discount > 0;
//   const discountedPrice = hasDiscount
//     ? (product.price * (100 - discount)) / 100
//     : product.price;

//   // Retrieve average rating & count
//   const avgRating = product.rating?.average || 0; // e.g. 4.2
//   const reviewCount = product.rating?.count || 0; // e.g. 97

//   // Build star icons
//   const starElements = [];
//   for (let i = 1; i <= 5; i++) {
//     if (i <= Math.floor(avgRating)) {
//       starElements.push(
//         <FontAwesomeIcon key={i} icon={solidStar} className="star filled" />
//       );
//     } else {
//       starElements.push(
//         <FontAwesomeIcon key={i} icon={regularStar} className="star" />
//       );
//     }
//   }

//   return (
//     <div className="product-card">

//       {/* --------- Image + Icons --------- */}
//       <div className="image-section">
//         {hasDiscount && <div className="discount-badge">-{discount}%</div>}

//         <Link to={`/products/${itemId}`} className="image-link">
//           <img
//             src={imageSrc}
//             alt={product.name}
//             className="product-image"
//             onError={(e) => (e.target.src = "/images/placeholder.jpg")}
//           />
//         </Link>

//         <div className="actions-icons">
//           {/* If you want a "compare" icon above, substitute “faScaleBalanced” or any other icon here */}
//           {/* <div className="compare-icon">
//             <FontAwesomeIcon icon={faScaleBalanced} />
//           </div> */}
//           <div className="wishlist-icon" onClick={handleWishlistToggle}>
//             <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
//           </div>
//         </div>
//       </div>

//       {/* --------- Product Details --------- */}
//       <div className="product-info">
//         <Link to={`/products/${itemId}`} className="name-link">
//           <h4 className="product-name">{product.name}</h4>
//         </Link>
//         <p className="product-category">{product.category || ""}</p>

//         <div className="rating-row">
//           {starElements}
//           <span className="review-count">{reviewCount}</span>
//         </div>

//         <div className="price-row">
//           {hasDiscount && (
//             <span className="original-price">{formatPrice(product.price)}</span>
//           )}
//           {hasDiscount && (
//             <span className="discount-percentage">-{discount}%</span>
//           )}
//         </div>
//       </div>
//       <div className="pricing">
//       <span className="discounted-price">{formatPrice(discountedPrice)}</span>
//       {/* --------- Add to Cart Button --------- */}
//       <button className="cart-button" onClick={handleAddToCart}>
//         <FontAwesomeIcon icon={faCartShopping} />
//       </button>
//     </div>
//     </div>
//   );
// }


// src/pages/ProductCard.js

import React, { useState } from "react";
// 1. IMPORT `useNavigate` HERE
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
  // 2. INITIALIZE `Maps` HERE
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
          {isInCart && (
            <div className="added-checkmark">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          )}
        </button>

        {showToast && (
          <div className="add-to-cart-toast">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Item added to cart</span>
          </div>
        )}
      </div>
    </div>
  );
}