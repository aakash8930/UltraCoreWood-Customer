import React from 'react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import '../css/ProductCard.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const itemId = product._id || product.id || product.name;
  const isWished = wishlistItems.some((item) => (item._id || item.id || item.name) === itemId);

  const handleWishlistToggle = () => {
    isWished ? removeFromWishlist(itemId) : addToWishlist(product);
  };

  return (
    <div className="product-card-enhanced">
      <div className="image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => (e.target.src = '/images/placeholder.jpg')}
        />
        <div className="wishlist-icon" onClick={handleWishlistToggle}>
          <FontAwesomeIcon icon={isWished ? solidHeart : regularHeart} />
        </div>
      </div>
      <div className="product-details">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-subtext">{product.subtext}</p>
        <p className="product-price">
          {formatPrice(product.price)} <span className="inr-label">inr</span>
        </p>
        <button className="add-cart-btn" onClick={() => addToCart(product)}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
