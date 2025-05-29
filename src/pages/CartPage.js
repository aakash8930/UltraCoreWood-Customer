import React from 'react';
import { useCart } from './CartContext';
import '../css/HomePage.css';

const CartPage = () => {
  const { cartItems, removeFromCart } = useCart();

  return (
    <>
      <div className="sale-container">
        <h2 className="essentials-title">🛒 YOUR CART</h2>

        {cartItems.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Your cart is empty.</p>
        ) : (
          <div className="essentials-grid">
            {cartItems.map((item, index) => (
              <div className="product-card" key={index}>
                <img src={item.image} alt={item.name} />
                <div className="product-text">
                  <h4>{item.name}</h4>
                  <p>{item.subtext}</p>
                  <p><strong>Price:</strong> ₹28,500/-</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      padding: '5px 10px',
                      background: 'crimson',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      marginTop: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove from Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
