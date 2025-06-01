// src/pages/CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { fetchAddresses } from '../api/addressApi';
import { createOrder } from '../api/orderApi';
import {
  fetchAvailableCoupons,
  applyCoupon as applyCouponAPI
} from '../api/couponApi';
import { getAuth } from 'firebase/auth';
import '../css/CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  // Address & payment state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState('');

  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState([]); // visible + not expired
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [customCouponInput, setCustomCouponInput] = useState('');

  // Order placement state
  const [placingOrder, setPlacingOrder] = useState(false);

  // Helper to get Firebase ID token
  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  // Fetch saved addresses on mount
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setAddressError('Not authenticated');
        setLoadingAddresses(false);
        return;
      }
      try {
        const data = await fetchAddresses(token);
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault);
        setSelectedAddress(defaultAddr?._id || data[0]?._id || '');
      } catch (err) {
        console.error('Failed to load addresses', err);
        setAddressError('Could not load addresses');
      } finally {
        setLoadingAddresses(false);
      }
    })();
  }, []);

  // Compute price breakdown
  const itemsTotal = cart.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const tax = Math.round(itemsTotal * 0.1);
  const shipping = itemsTotal > 0 ? 99 : 0;
  const subtotal = itemsTotal + tax + shipping;

  // Fetch visible + not expired coupons on mount
  useEffect(() => {
    (async () => {
      try {
        const coupons = await fetchAvailableCoupons();
        const now = new Date();
        const active = coupons.filter(
          c => new Date(c.expiryDate) > now && c.visible
        );
        setAvailableCoupons(active);
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      }
    })();
  }, []);

  // When user clicks a visible‐coupon card, calculate discount
  useEffect(() => {
    if (!selectedCouponCode) {
      setDiscountValue(0);
      setCouponError('');
      return;
    }

    // Check if selectedCouponCode is one of the visible coupons
    const coupon = availableCoupons.find(c => c.code === selectedCouponCode);
    if (coupon) {
      if (itemsTotal < coupon.minOrderValue) {
        setCouponError(`Requires ₹${coupon.minOrderValue} minimum`);
        setDiscountValue(0);
        return;
      }
      const discount = coupon.discountPercent > 0
        ? Math.floor((coupon.discountPercent / 100) * itemsTotal)
        : coupon.discountAmount;
      setCouponError('');
      setDiscountValue(discount);
    } else {
      // If it's not a “visible” card (maybe user typed manually), do nothing here
      setDiscountValue(0);
    }
  }, [selectedCouponCode, availableCoupons, itemsTotal]);

  const grandTotal = subtotal - discountValue;

  // Handle manual “Apply” button for custom coupon code
  const handleApplyCustomCoupon = async () => {
    // Trim and uppercase
    const code = customCouponInput.trim().toUpperCase();

    // 1) If input is empty, bail out immediately
    if (!code) {
      return;
    }

    try {
      // 2) Call backend endpoint (ignores visibility) to validate / compute discount
      const { discount } = await applyCouponAPI(code, itemsTotal);

      // 3) If successful, clear errors and store code + discount
      setSelectedCouponCode(code);
      setDiscountValue(discount);
      setCouponError('');
    } catch (err) {
      // 4) If server returned 400/404, show the error message here
      const message = err.response?.data?.error || 'Invalid or expired coupon';
      setCouponError(message);
      setDiscountValue(0);
      setSelectedCouponCode('');
    } finally {
      // 5) Regardless, clear the input field
      setCustomCouponInput('');
    }
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    if (!cart.items.length) {
      alert('Your cart is empty');
      return;
    }
    if (couponError) {
      alert(couponError);
      return;
    }
    setPlacingOrder(true);
    const token = await getToken();
    const products = cart.items.map(i => ({
      product: i.product._id,
      quantity: i.quantity,
    }));

    try {
      const orderPayload = {
        userAddress: selectedAddress,
        paymentMethod,
        paymentBreakdown: {
          itemsTotal,
          tax,
          shipping,
          discount: discountValue,
          total: grandTotal,
        },
        products,
        couponCode: selectedCouponCode || null,
      };

      const order = await createOrder(token, orderPayload);
      clearCart();
      navigate(`/orders/${order.orderId}`);
    } catch (err) {
      console.error('Order placement failed', err);
      alert(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart.items.length) {
    return <p style={{ textAlign: 'center' }}>Your cart is empty.</p>;
  }

  return (
    <div className="checkout-container">
      {/* LEFT SIDE: Address & Payment & Coupons */}
      <div className="checkout-left">
        <h2>Delivery Address</h2>
        {loadingAddresses ? (
          <p>Loading addresses…</p>
        ) : addressError ? (
          <p style={{ color: 'red' }}>
            {addressError}. <Link to="/address">Manage addresses</Link>
          </p>
        ) : (
          addresses.map(a => (
            <label key={a._id} className="address-option">
              <input
                type="radio"
                name="address"
                value={a._id}
                checked={selectedAddress === a._id}
                onChange={() => setSelectedAddress(a._id)}
              />
              <span>
                {a.fullName}, {a.flat}, {a.area}, {a.city} – {a.pincode}
              </span>
            </label>
          ))
        )}

        <h2 style={{ marginTop: '2rem' }}>Payment Method</h2>
        {['CashOnDelivery', 'Card', 'UPI', 'NetBanking'].map(m => (
          <label key={m} className="payment-option">
            <input
              type="radio"
              name="payment"
              value={m}
              checked={paymentMethod === m}
              onChange={() => setPaymentMethod(m)}
            />
            <span>
              {m === 'CashOnDelivery'
                ? 'Cash On Delivery'
                : m === 'NetBanking'
                ? 'Net Banking'
                : m}
            </span>
          </label>
        ))}

        <h2 style={{ marginTop: '2rem' }}>Available Coupons</h2>
        <div className="coupon-list">
          {availableCoupons.length === 0 && (
            <p>No active coupons at the moment.</p>
          )}
          {availableCoupons.map(c => (
            <div
              key={c.code}
              className={
                'coupon-card' +
                (selectedCouponCode === c.code ? ' coupon-selected' : '')
              }
            >
              <div className="coupon-info">
                <p className="coupon-code">{c.code}</p>
                <p className="coupon-heading">{c.heading}</p>
                <p className="coupon-desc">{c.description}</p>
                <p className="coupon-expiry">
                  Expires: {new Date(c.expiryDate).toLocaleDateString()}
                </p>
                <p className="coupon-discount">
                  {c.discountPercent > 0
                    ? `${c.discountPercent}% off`
                    : `₹${c.discountAmount} off`}
                </p>
                <p className="coupon-minorder">
                  Min. Order: ₹{c.minOrderValue}
                </p>
              </div>
              <button
                className="apply-coupon-btn"
                onClick={() => {
                  // Clicking a visible coupon card:
                  setSelectedCouponCode(c.code);
                  setCustomCouponInput('');
                }}
              >
                {selectedCouponCode === c.code ? 'Applied' : 'Apply'}
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: '2rem' }}>Have a Coupon Code?</h2>
        <div className="custom-coupon-input">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={customCouponInput}
            onChange={e => setCustomCouponInput(e.target.value)}
            className="coupon-input"
          />
          <button
            type="button"
            onClick={handleApplyCustomCoupon}
            className="apply-btn"
          >
            Apply
          </button>
        </div>
        {couponError && <p style={{ color: 'red' }}>{couponError}</p>}
        {discountValue > 0 && (
          <p style={{ color: 'green' }}>
            Applied discount: ₹{discountValue.toLocaleString()}
          </p>
        )}
      </div>

      {/* RIGHT SIDE: Order Summary */}
      <div className="checkout-right">
        <h2>Order Summary</h2>

        <div className="summary-items">
          {cart.items.map(i => (
            <div key={i.product._id} className="summary-item">
              <img
                src={i.product.imageUrl || '/images/placeholder.jpg'}
                alt={i.product.name}
                className="summary-thumb"
              />
              <div className="summary-info">
                <p className="summary-name">{i.product.name}</p>
                <p>Qty: {i.quantity}</p>
                <p>₹{(i.product.price * i.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="price-breakdown">
          <div>
            <span>Items total:</span>
            <span>₹{itemsTotal.toLocaleString()}</span>
          </div>
          <div>
            <span>Tax (10%):</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div>
            <span>Shipping:</span>
            <span>{shipping ? `₹${shipping}` : 'FREE'}</span>
          </div>
          {discountValue > 0 && (
            <div>
              <span>Coupon discount:</span>
              <span>-₹{discountValue.toLocaleString()}</span>
            </div>
          )}
          <hr />
          <div className="grand-total">
            <strong>Total:</strong>
            <strong>₹{grandTotal.toLocaleString()}</strong>
          </div>
        </div>

        <button
          className="checkout-btn"
          onClick={handlePlaceOrder}
          disabled={placingOrder || (selectedCouponCode && couponError !== '')}
        >
          {placingOrder ? 'Placing…' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
