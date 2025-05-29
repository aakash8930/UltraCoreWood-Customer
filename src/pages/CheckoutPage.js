import React, { useState } from 'react';
import './CheckoutPage.css'; // Optional: you can use Tailwind or your CSS

const CheckoutPage = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    pin: '',
    mobile: '',
    email: '',
    deliveryMethod: '',
  });

  const [quantity, setQuantity] = useState(1);
  const itemPrice = 18980;
  const savings = 980;
  const deliveryCharge = form.deliveryMethod === 'home' ? 99 : 0;
  const subtotal = itemPrice - savings;
  const totalAmount = subtotal + deliveryCharge;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (value) => {
    setForm((prev) => ({ ...prev, deliveryMethod: value }));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="checkout-container">
        {/* Shipping Form */}
        <div className="left">
          <h2>Shipping Address</h2>
          <input name="name" placeholder="Full Name*" required onChange={handleInputChange} />
          <input name="address" placeholder="Address*" required onChange={handleInputChange} />
          <div className="row">
            <input name="pin" placeholder="PIN Code*" required onChange={handleInputChange} />
            <input name="mobile" placeholder="Mobile*" required onChange={handleInputChange} />
          </div>
          <input name="email" placeholder="Email-id" onChange={handleInputChange} />

          <h3>Delivery Method</h3>
          <div className="delivery-option" onClick={() => handleDeliveryChange('home')}>
            <input type="radio" name="delivery" checked={form.deliveryMethod === 'home'} readOnly />
            <div className="label">
              <div>Home Delivery <span className="small-text">In Stock</span></div>
              <div>₹99</div>
            </div>
          </div>
          <div className="delivery-option" onClick={() => handleDeliveryChange('collection')}>
            <input type="radio" name="delivery" checked={form.deliveryMethod === 'collection'} readOnly />
            <div className="label">
              <div>Collection</div>
              <div>FREE</div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="right">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <img src="/images/product.jpg" alt="product" />
            <div>
              <p className="product-title">Ball Table Top</p>
              <p className="qty">Qty: {quantity}</p>
              <div className="qty-buttons">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="summary-totals">
            <div><span>Items total</span><span>₹{itemPrice}</span></div>
            <div className="savings"><span>Savings</span><span>-₹{savings}</span></div>
            <div><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div><span>Delivery</span><span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}</span></div>
            <hr />
            <div className="total"><strong>Total amount</strong><strong>₹{totalAmount}</strong></div>
          </div>

          <button className="checkout-btn">🔒 Checkout Securely</button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
