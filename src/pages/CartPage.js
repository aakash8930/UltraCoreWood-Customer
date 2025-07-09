// // src/pages/CartPage.js
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from './CartContext';
// // import '../css/HomePage.css';
// // import '../css/ProductCard.css';

// const formatPrice = (amount) =>
//   new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// const CartPage = () => {
//   const navigate = useNavigate();
//   const {
//     cart: { items },
//     updateCartItem,
//     removeFromCart,
//     cartTotal
//   } = useCart();

//   if (!items.length) {
//     return <p style={{ textAlign: 'center' }}>Your cart is empty.</p>;
//   }

//   return (
//     <div className="sale-container">
//       <h2 className="essentials-title" style={{ color: 'black' }}>🛒 YOUR CART</h2>
//       <div className="essentials-grid">
//         {items.map(({ product, quantity }) => {
//           // 1) Build `imageSrc` from product.images.{…}.data (already Base64 from the backend)
//           let imageSrc = '/images/placeholder.jpg';
//           if (product.images) {
//             const keyWithImage = Object.keys(product.images).find(
//               (k) => product.images[k]?.data
//             );
//             if (keyWithImage) {
//               const { contentType, data } = product.images[keyWithImage];
//               imageSrc = `data:${contentType};base64,${data}`;
//             }
//           }

//           const discount = product.discount || 0;
//           const hasDiscount = discount > 0;
//           const discountedPrice = hasDiscount
//             ? (product.price * (100 - discount)) / 100
//             : product.price;

//           return (
//             <div className="product-card-enhanced" key={product._id}>
//               <div className="image-wrapper">
//                 {hasDiscount && <div className="discount-badge">-{discount}%</div>}
//                 <img
//                   src={imageSrc}
//                   alt={product.name}
//                   className="product-image"
//                   onError={(e) => {
//                     e.target.src = '/images/placeholder.jpg';
//                   }}
//                 />
//               </div>

//               <div className="product-details">
//                 <h4 className="product-name">{product.name}</h4>
//                 <p className="product-subtext">{product.subtext || product.category}</p>
//                 <div className="price-row">
//                   {hasDiscount && (
//                     <span className="original-price">{formatPrice(product.price)}</span>
//                   )}
//                   <span className="discounted-price">{formatPrice(discountedPrice)}</span>
//                 </div>

//                 <div style={{ margin: '0.5rem 0' }}>
//                   Qty:{' '}
//                   <button
//                     onClick={() => updateCartItem(product._id, quantity - 1)}
//                     disabled={quantity <= 1}
//                   >
//                     –
//                   </button>{' '}
//                   {quantity}{' '}
//                   <button onClick={() => updateCartItem(product._id, quantity + 1)}>
//                     +
//                   </button>
//                 </div>

//                 <button
//                   className="add-cart-btn"
//                   style={{ background: 'crimson' }}
//                   onClick={() => removeFromCart(product._id)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div style={{ textAlign: 'right', margin: '1rem' }}>
//         <h3>Total: ₹{cartTotal.toLocaleString()}</h3>
//         <button
//           onClick={() => navigate('/checkout')}
//           style={{
//             marginTop: '0.5rem',
//             padding: '0.75rem 1.5rem',
//             background: '#0284C7',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '1rem'
//           }}
//         >
//           Proceed to Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CartPage;



// src/pages/CartPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import '../css/CartSlider.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const CartPage = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    cart: { items },
    updateCartItem,
    cartTotal
  } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  return (
    <>
      {/* The backdrop is still rendered conditionally */}
      {isOpen && <div className="cart-backdrop" onClick={onClose}></div>}

      <div className={`cart-slider ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="cart-slider-header">
          <h2>Your Cart</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="cart-slider-body">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', fontWeight: 300 }}>Your cart is empty.</p>
          ) : (
            items.map(({ product, quantity }) => {
              let imageSrc = '/images/placeholder.jpg';
              if (product.images) {
                const keyWithImage = Object.keys(product.images).find(
                  (k) => product.images[k]?.data
                );
                if (keyWithImage) {
                  const { contentType, data } = product.images[keyWithImage];
                  imageSrc = `data:${contentType};base64,${data}`;
                }
              }
              const discountedPrice = (product.price * (100 - (product.discount || 0))) / 100;

              return (
                <div className="cart-slider-item" key={product._id}>
                  <img src={imageSrc} alt={product.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <div className="cart-item-info">
                      <div>
                        <h4>{product.name}</h4>
                        <p className="cart-item-subtext">{product.subtext || 'Walnut, Wood'}</p>
                      </div>
                    </div>
                    <div className='quantity-price'>
                      <div className="quantity-controls">
                        <button onClick={() => updateCartItem(product._id, quantity - 1)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => updateCartItem(product._id, quantity + 1)}>+</button>
                      </div>

                      <div className="cart-item-price">{formatPrice(discountedPrice * quantity)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-slider-footer">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-btn">Checkout</button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;