// src/pages/ProductDetails.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useCart } from "./CartContext";
import { getProductById } from "../api/productApi";
import { getReviewsByProduct } from "../api/reviewApi";
import ReviewList from "./ReviewList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// --- UPDATED: faEye icon removed ---
import { faStar as solidStar, faStarHalfAlt, faCartShopping, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "../css/ProductDetails.css";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const renderAverageStars = (avg) => {
  const stars = [];
  const fullStars = Math.floor(avg);
  const hasHalf = avg - fullStars >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={solidStar} className="avg-star selected" />);
  }
  if (hasHalf) {
    stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="avg-star selected" />);
  }
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={solidStar} className="avg-star" />);
  }
  return stars;
};

export default function ProductDetailsPage({ openCart }) {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const currentUser = getAuth().currentUser;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageList = useMemo(() =>
    product?.images ? Object.keys(product.images).map(key => {
      const img = product.images[key];
      return img && img.data ? `data:${img.contentType};base64,${img.data}` : null;
    }).filter(Boolean) : [],
    [product]
  );

  const itemInCart = useMemo(() =>
    cartItems?.find(item => item?.product?._id === product?._id),
    [cartItems, product]
  );

  useEffect(() => {
    if (!productId) {
      setLoadingProduct(false);
      return;
    }
    const fetchProduct = async () => {
      setProduct(null);
      setLoadingProduct(true);
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
  
  // --- UPDATED: New handler for the Add to Cart button ---
  const handleCartButtonClick = () => {
    if (!currentUser) {
      return navigate("/login");
    }

    // If item is already in cart, just open the cart slider
    if (itemInCart) {
      if (typeof openCart === 'function') {
        openCart();
      }
      return;
    }
    
    // If item is NOT in cart, add it and show a toast
    if (showToast) return; // Prevent multiple clicks
    addToCart(product, 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loadingProduct) return <p className="loading-text">Loading product...</p>;
  if (!product) return <p className="empty-text">Product not found.</p>;

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageList.length - 1 : prevIndex - 1
    );
  };

  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (100 - discount)) / 100
    : product.price;

  return (
    <div className="product-details-page">
      {/* Image Gallery Slider */}
      <div className="gallery-section">
        {imageList.length > 0 ? (
          <>
            <div className="slider-main-image">
              <img
                key={currentImageIndex}
                src={imageList[currentImageIndex]}
                alt={`${product.name} ${currentImageIndex + 1}`}
                className="gallery-image-main"
              />
              {imageList.length > 1 && (
                <>
                  <button onClick={prevImage} className="slider-btn prev-btn" aria-label="Previous image">&#10094;</button>
                  <button onClick={nextImage} className="slider-btn next-btn" aria-label="Next image">&#10095;</button>
                </>
              )}
            </div>
            {imageList.length > 1 && (
              <div className="slider-thumbnails">
                {imageList.map((src, idx) => (
                  <img
                    key={`thumb-${idx}`}
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail-image ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="slider-main-image">
            <img src="/images/placeholder.jpg" alt="No image available" className="gallery-image-main" />
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="details-section">
        <h1 className="detail-name">{product.name}</h1>
        <p className="detail-category">Category: {product.category}</p>

        <div className="detail-pricing">
          {hasDiscount && <span className="detail-price-original">{formatPrice(product.price)}</span>}
          <span className="detail-price-discounted">{formatPrice(discountedPrice)}</span>
          {hasDiscount && <span className="detail-discount-tag">-{discount}%</span>}
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

        {/* --- UPDATED: Button is no longer conditional and uses the new handler --- */}
        <button 
          className="detail-add-cart-btn" 
          onClick={handleCartButtonClick} 
          disabled={product.stock === 0}
        >
          <FontAwesomeIcon icon={faCartShopping} />
          {itemInCart ? 'Go to Cart' : (product.stock > 0 ? 'Add to Cart' : 'Unavailable')}
        </button>

        {showToast && (
          <div className="add-to-cart-toast active">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Item added to cart</span>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-heading">Reviews ({product.rating?.count || 0})</h2>
          {product.rating?.count > 0 && (
            <div className="overall-rating">
              {renderAverageStars(product.rating.average)}
              <span className="avg-text">{product.rating.average.toFixed(1)} / 5</span>
            </div>
          )}
          {loadingReviews ? <p className="loading-text">Loading reviews...</p> : <ReviewList reviews={reviews} />}
        </div>
      </div>
    </div>
  );
}