
// frontend/src/pages/CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import { createOrder } from '../api/orderApi';
import { fetchAddresses, createAddress } from '../api/addressApi';
import { fetchAvailableCoupons, applyCoupon as applyCouponAPI } from '../api/couponApi';
import { useAuth } from '../hooks/useAuth';
import '../css/CheckoutPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faPlus } from '@fortawesome/free-solid-svg-icons';

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const BLANK_ADDRESS_FORM = {
  fullName: '', phone: '', flat: '', area: '', landmark: '', pincode: '', city: '', state: '', isDefault: false,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart, cartTotal } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState(BLANK_ADDRESS_FORM);

  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  // --- New Coupon State ---
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState('');
  const [customCouponInput, setCustomCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discountValue, setDiscountValue] = useState(0);

  // --- Fetch Addresses and Coupons on User Load ---
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoadingAddresses(true);
        try {
          const token = await user.getIdToken();
          const [fetchedAddresses, fetchedCoupons] = await Promise.all([
            fetchAddresses(token),
            fetchAvailableCoupons()
          ]);

          setAddresses(fetchedAddresses);
          if (fetchedAddresses.length > 0) {
            const defaultAddress = fetchedAddresses.find(a => a.isDefault) || fetchedAddresses[0];
            setSelectedAddressId(defaultAddress._id);
            setShowAddressForm(false);
          } else {
            setShowAddressForm(true);
          }

          setAvailableCoupons(fetchedCoupons);

        } catch (err) {
          setError("Could not load page data.");
          console.error(err);
        } finally {
          setLoadingAddresses(false);
        }
      };
      loadData();
    }
  }, [user]);

  // --- Price Calculation ---
  const itemsTotal = cartTotal;
  const tax = Math.round((itemsTotal - discountValue) * 0.1); // Assumes discountValue is for coupons
  const deliveryFee = itemsTotal > 0 ? 99 : 0;
  const grandTotal = itemsTotal - discountValue + tax + deliveryFee;

  const handleInputChange = (e) => {
    setError('');
    setNewAddressForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancelAddNew = () => {
    setShowAddressForm(false);
    setNewAddressForm(BLANK_ADDRESS_FORM);
    setError('');
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
  };

  const getFinalAddressId = async (token) => {
    if (showAddressForm) {
      if (!newAddressForm.fullName || !newAddressForm.flat || !newAddressForm.pincode) {
        throw new Error('Please fill in all required fields for the new address.');
      }
      const newAddress = await createAddress(token, newAddressForm);
      return newAddress._id;
    }
    if (!selectedAddressId) {
      throw new Error('Please select a delivery address.');
    }
    return selectedAddressId;
  };

  // --- Coupon Logic ---
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || customCouponInput).trim().toUpperCase();
    if (!code) return;
    setCouponError('');

    try {
      const token = await user.getIdToken();
      // Use the API to validate the coupon and get the discount amount
      const { discount } = await applyCouponAPI(code, itemsTotal, token);
      setDiscountValue(discount);
      setSelectedCouponCode(code);
      setCustomCouponInput(''); // Clear input on success
    } catch (err) {
      setCouponError(err.message || "Invalid Coupon");
      setDiscountValue(0);
      setSelectedCouponCode('');
    }
  };

  // --- Place Order Logic ---
  const handlePlaceOrder = async () => {
    setError('');
    if ((!selectedAddressId && !showAddressForm) || couponError) {
      setError(couponError || 'Please select or add a shipping address.');
      return;
    }
    setPlacingOrder(true);

    try {
      const token = await user.getIdToken();
      const finalAddressId = await getFinalAddressId(token);

      const orderPayload = {
        userAddress: finalAddressId,
        paymentMethod,
        products: cart.items.map(item => ({ product: item.product._id, quantity: item.quantity })),
        paymentBreakdown: { itemsTotal, tax, shipping: deliveryFee, discount: discountValue, total: grandTotal },
        couponCode: selectedCouponCode || null, // Pass applied coupon code
      };

      if (paymentMethod === 'Online') {
        const { data: razorpayOrder } = await axios.post(`${API_URL}/api/payment/create-order`,
          { amount: grandTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "FURNITURE",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          handler: async (response) => {
            setPlacingOrder(true);
            try {
              const verificationPayload = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: razorpayOrder.id,
                razorpay_signature: response.razorpay_signature,
              };
              await axios.post(`${API_URL}/api/payment/verify`, verificationPayload, { headers: { Authorization: `Bearer ${token}` } });

              const finalOrderPayload = { ...orderPayload, paymentMethod: 'Online', razorpayDetails: response };
              const createdOrder = await createOrder(token, finalOrderPayload);
              clearCart();
              navigate(`/orders/${createdOrder._id}`);
            } catch (err) {
              setError("Payment verification failed. Please contact support.");
              setPlacingOrder(false);
            }
          },
          prefill: { name: user.displayName || 'Customer', email: user.email, contact: user.phoneNumber },
          theme: { color: "#0d6efd" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setError(`Payment Failed: ${response.error.description || 'An unknown error occurred.'}`);
          setPlacingOrder(false);
        });
        rzp.open();
        setPlacingOrder(false); // Allow user to close Razorpay popup without being stuck
      } else if (paymentMethod === 'CashOnDelivery') {
        const createdOrder = await createOrder(token, orderPayload);
        clearCart();
        navigate(`/orders/${createdOrder._id}`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setPlacingOrder(false);
    }
  };

  // --- JSX Rendering ---
  if (authLoading || loadingAddresses) {
    return <div className="loading-container">Loading Checkout...</div>;
  }

  if (!cart.items.length) {
    return <div className="empty-cart-message">Your cart is empty. <Link to="/products">Continue shopping</Link>.</div>;
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-content">
        <div className="checkout-left">
          {/* --- Shipping Address Section --- */}
          <section className="shipping-address">
            <h2>Shipping Address</h2>
            {addresses.length > 0 && !showAddressForm
              ? (
                <div className="address-selection-list">
                  {addresses.map(addr => (
                    <label key={addr._id} className={`address-option-card ${selectedAddressId === addr._id ? 'selected' : ''}`}>
                      <input type="radio" name="address" value={addr._id} checked={selectedAddressId === addr._id}
                        onChange={() => { setSelectedAddressId(addr._id); setShowAddressForm(false); setError(''); }}
                      />
                      <div className="address-details">
                        <p><strong>{addr.fullName}</strong> ({addr.phone})</p>
                        <p>{addr.flat}, {addr.area}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <button className="add-new-address-link" onClick={() => { setShowAddressForm(true); setSelectedAddressId(''); }}>
                    <FontAwesomeIcon icon={faPlus} /> Add a New Address
                  </button>
                </div>
              )
              : (
                <form className="address-form">
                  <input type="text" name="fullName" value={newAddressForm.fullName} onChange={handleInputChange} placeholder="Full Name*" required />
                  <input type="text" name="flat" value={newAddressForm.flat} onChange={handleInputChange} placeholder="Flat, House No., Building*" required />
                  <input type="text" name="area" value={newAddressForm.area} onChange={handleInputChange} placeholder="Area, Street, Sector" />
                  <div className="form-row">
                    <input type="text" name="pincode" value={newAddressForm.pincode} onChange={handleInputChange} placeholder="PIN Code*" required />
                    <input type="tel" name="phone" value={newAddressForm.phone} onChange={handleInputChange} placeholder="Mobile*" required />
                  </div>
                  <div className="form-row">
                    <input type="text" name="city" value={newAddressForm.city} onChange={handleInputChange} placeholder="Town/City*" required />
                    <input type="text" name="state" value={newAddressForm.state} onChange={handleInputChange} placeholder="State*" required />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancelAddNew}>Cancel</button>
                  </div>
                </form>
              )
            }
          </section>

          {/* --- Coupon Section --- */}
          <section className="coupon-section">
            <h2>Apply Coupon</h2>
            <div className="custom-coupon-input-group">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={customCouponInput}
                onChange={(e) => setCustomCouponInput(e.target.value)}
                className="coupon-input-field"
              />
              <button onClick={() => handleApplyCoupon()} className="apply-coupon-button">Apply</button>
            </div>
            {couponError && <p className="coupon-error-message">{couponError}</p>}
            {selectedCouponCode && !couponError && <p className="coupon-success-message">Coupon "{selectedCouponCode}" applied!</p>}

            {/* --- START: NEWLY ADDED UI FOR AVAILABLE COUPONS --- */}
            {availableCoupons.length > 0 && (
              <div className="available-coupons-list">
                {availableCoupons.map((c) => (
                  <div key={c.code} className="coupon-card" onClick={() => handleApplyCoupon(c.code)}>
                    <div className="coupon-code-tag">{c.code}</div>
                    <div className="coupon-details">
                      <p className="coupon-heading">{c.heading}</p>
                      <p className="coupon-desc">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* --- END: NEWLY ADDED UI --- */}
          </section>

          {/* --- Payment Method Section --- */}
          <section className="delivery-method">
            <h2>Payment Method</h2>
            <div className="delivery-options">
              <div className="delivery-option">
                <label><input type="radio" name="payment" value="Online" checked={paymentMethod === 'Online'} onChange={(e) => setPaymentMethod(e.target.value)} /> Pay Online (Card, UPI)</label>
              </div>
              <div className="delivery-option">
                <label><input type="radio" name="payment" value="CashOnDelivery" checked={paymentMethod === 'CashOnDelivery'} onChange={(e) => setPaymentMethod(e.target.value)} /> Cash On Delivery</label>
              </div>
            </div>
          </section>
        </div>

        {/* --- Right Column: Order Summary --- */}
        <div className="checkout-right">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="price-breakdown">
              <div className="price-row"><span>Items total</span><span>{formatPrice(itemsTotal)}</span></div>
              {discountValue > 0 && <div className="price-row savings"><span>Coupon Discount</span><span>-{formatPrice(discountValue)}</span></div>}
              <hr />
              <div className="price-row"><span>Subtotal</span><span>{formatPrice(itemsTotal - discountValue)}</span></div>
              <div className="price-row"><span>Tax (10%)</span><span>{formatPrice(tax)}</span></div>
              <div className="price-row"><span>Delivery</span><span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'FREE'}</span></div>
              <hr />
              <div className="price-row total-amount"><span>Total amount</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button className="checkout-securely-btn" onClick={handlePlaceOrder} disabled={placingOrder || authLoading || loadingAddresses}>
              <FontAwesomeIcon icon={faLock} />
              {placingOrder ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}