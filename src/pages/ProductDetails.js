// src/pages/ProductDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "./CartContext";
import { getProductById } from "../api/productApi";
import { getReviewsByProduct } from "../api/reviewApi";
import ReviewList from "./ReviewList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
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

export default function ProductDetailsPage() {
  // Adjust this if your route uses a different param name
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const currentUser = getAuth().currentUser; // used only for cart; not for reviews

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // 1) Fetch product details
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

  // 2) Fetch reviews
  useEffect(() => {
    if (!productId) {
      setLoadingReviews(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        // No token needed to fetch public reviews
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

  const handleAddToCart = () => {
    if (!currentUser) {
      return navigate("/login");
    }
    addToCart(product._id, 1);
  };

  if (loadingProduct) return <p className="loading-text">Loading product...</p>;
  if (!product) return <p className="empty-text">Product not found.</p>;

  // Build image list from Base64
  const imageKeys = ["image1", "image2", "image3", "image4", "image5"];
  const imageList = imageKeys
    .map((key) => {
      if (product.images[key]?.data) {
        return `data:${product.images[key].contentType};base64,${product.images[key].data}`;
      }
      return null;
    })
    .filter(Boolean);

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

        <button
          className="detail-add-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? "🛒 Add to Cart" : "Unavailable"}
        </button>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-heading">
            Reviews ({product.rating?.count || 0})
          </h2>

          {/* 1) Show overall average rating as stars, if available */}
          {product.rating?.count > 0 && (
            <div className="overall-rating">
              {renderAverageStars(product.rating.average)}
              <span className="avg-text">
                {product.rating.average.toFixed(1)} / 5
              </span>
            </div>
          )}

          {/* 2) Individual Review List */}
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
