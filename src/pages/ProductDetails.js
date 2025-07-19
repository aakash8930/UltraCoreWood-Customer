// src/pages/ProductDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "./CartContext";
import { getProductById } from "../api/productApi";
import { getReviewsByProduct } from "../api/reviewApi";
import ReviewList from "./ReviewList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// --- UPDATED: Added icons for the button and toast message ---
import { faStar as solidStar, faStarHalfAlt, faCartShopping, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "../css/ProductDetails.css";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// Helper to render full & half stars based on an average rating
const renderAverageStars = (avg) => {
  const stars = [];
  const fullStars = Math.floor(avg);
  const hasHalf = avg - fullStars >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FontAwesomeIcon
        key={`full-${i}`}
        icon={solidStar}
        className="avg-star selected"
      />
    );
  }
  if (hasHalf) {
    stars.push(
      <FontAwesomeIcon
        key="half"
        icon={faStarHalfAlt}
        className="avg-star selected"
      />
    );
  }
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FontAwesomeIcon key={`empty-${i}`} icon={solidStar} className="avg-star" />
    );
  }
  return stars;
};

// --- UPDATED: Accepting openCart prop ---
export default function ProductDetailsPage({ openCart }) {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const currentUser = getAuth().currentUser;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // --- ADDED: State for the toast notification ---
  const [showToast, setShowToast] = useState(false);

  // 1) Fetch product details (User's original logic retained)
  useEffect(() => {
    if (!productId) {
      setLoadingProduct(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // 2) Fetch reviews (User's original logic retained)
  useEffect(() => {
    if (!productId) {
      setLoadingReviews(false);
      return;
    }
    const fetchReviews = async () => {
      try {
        const revData = await getReviewsByProduct(productId, null);
        setReviews(revData);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [productId]);

  // --- UPDATED: handleAddToCart function with correct logic and toast ---
  const handleAddToCart = () => {
    if (!currentUser) {
      return navigate("/login");
    }
    if (showToast) return; // Prevent multiple clicks while toast is active

    // The CartContext expects the full product object, not just the ID
    addToCart(product, 1);

    // Show toast message for user feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Open the cart slider if the function is provided
    if (typeof openCart === 'function') {
      openCart();
    }
  };

  if (loadingProduct) return <p className="loading-text">Loading product...</p>;
  if (!product) return <p className="empty-text">Product not found.</p>;

  const imageList = product.images ? Object.keys(product.images).map(key => {
    const img = product.images[key];
    if (img && img.data) {
      return `data:${img.contentType};base64,${img.data}`;
    }
    return null;
  }).filter(Boolean) : [];
  
  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (100 - discount)) / 100
    : product.price;

  return (
    <div className="product-details-page">
      {/* Gallery */}
      <div className="gallery-section">
        {imageList.length > 0 ? (
          imageList.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${product.name} ${idx + 1}`}
              className="gallery-image"
              onError={(e) => (e.target.src = "/images/placeholder.jpg")}
            />
          ))
        ) : (
          <img
            src="/images/placeholder.jpg"
            alt="No image available"
            className="gallery-image"
          />
        )}
      </div>

      {/* Details */}
      <div className="details-section">
        <h1 className="detail-name">{product.name}</h1>
        <p className="detail-category">Category: {product.category}</p>

        <div className="detail-pricing">
          {hasDiscount && (
            <span className="detail-price-original">
              {formatPrice(product.price)}
            </span>
          )}
          <span className="detail-price-discounted">
            {formatPrice(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="detail-discount-tag">-{discount}%</span>
          )}
        </div>

        <p className="detail-stock">
          {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
        </p>

        {product.details && (
          <div className="detail-description">
            <h3>Details</h3>
            <p>{product.details}</p>
          </div>
        )}

        {/* --- UPDATED: Button logic and style --- */}
        <button
          className="detail-add-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || showToast}
        >
          <FontAwesomeIcon icon={faCartShopping} />
          {product.stock > 0 ? " Add to Cart" : " Unavailable"}
        </button>

        {/* --- ADDED: Toast notification rendered conditionally --- */}
        {showToast && (
            <div className="add-to-cart-toast active">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Item added to cart</span>
            </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-heading">
            Reviews ({product.rating?.count || 0})
          </h2>

          {product.rating?.count > 0 && (
            <div className="overall-rating">
              {renderAverageStars(product.rating.average)}
              <span className="avg-text">
                {product.rating.average.toFixed(1)} / 5
              </span>
            </div>
          )}

          {loadingReviews ? (
            <p className="loading-text">Loading reviews...</p>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>
    </div>
  );
}