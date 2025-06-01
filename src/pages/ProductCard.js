// src/components/ProductCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useCart } from '../pages/CartContext';
import { useWishlist } from './WishlistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import '../css/ProductCard.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const ProductCard = ({ product }) => {
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
      return navigate('/login');
    }
    addToCart(product._id, 1);
  };

  let imageSrc = '/images/placeholder.jpg';
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

  return (
    <div className="product-card-enhanced">
      <div className="image-wrapper">
        {hasDiscount && <div className="discount-badge">-{discount}%</div>}
        <img
          src={imageSrc}
          alt={product.name}
          className="product-image"
          onError={(e) => (e.target.src = '/images/placeholder.jpg')}
        />
        <div className="wishlist-icon" onClick={handleWishlistToggle}>
          <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
        </div>
      </div>
      <div className="product-details">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-subtext">{product.subtext || product.category}</p>
        <div className="price-row">
          {hasDiscount && (
            <span className="original-price">{formatPrice(product.price)}</span>
          )}
          <span className="discounted-price">{formatPrice(discountedPrice)}</span>
        </div>
        <button className="add-cart-btn" onClick={handleAddToCart}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
