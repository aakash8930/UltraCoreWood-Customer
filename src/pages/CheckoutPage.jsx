// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BLANK_ADDRESS_FORM = {
  fullName: '', phone: '', flat: '', area: '', landmark: '', pincode: '', city: '', state: '', isDefault: false,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart, cartTotal } = useCart();
  
  // Determine cart items and totals
  const cartItems = cart?.items || [];
  const itemsTotal = cartTotal; 
  const tax = Math.round(itemsTotal * 0.10); // 10% tax example
  const deliveryFee = itemsTotal > 5000 ? 0 : 500;

  // State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(BLANK_ADDRESS_FORM);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [discountValue, setDiscountValue] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  const grandTotal = itemsTotal + tax + deliveryFee - discountValue;

  // Load Data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadAddresses();
    loadCoupons();
  }, [user, authLoading, navigate]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const token = await user.getIdToken();
      const data = await fetchAddresses(token);
      setAddresses(data);
      if (data.length > 0) {
        const def = data.find(a => a.isDefault);
        setSelectedAddressId(def ? def._id : data[0]._id);
      } else {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const data = await fetchAvailableCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Failed to load coupons", err);
    }
  };

  // Address Handlers
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const token = await user.getIdToken();
      const saved = await createAddress(token, newAddress);
      setAddresses(prev => [...prev, saved]);
      setSelectedAddressId(saved._id);
      setShowAddressForm(false);
      setNewAddress(BLANK_ADDRESS_FORM);
    } catch (err) {
      setError('Failed to save address.');
    }
  };

  // Coupon Handlers
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setError('');
    try {
      const token = await user.getIdToken();
      // NOTE: backend expects orderTotal before discount logic?
      // passing itemsTotal as the base
      const result = await applyCouponAPI(couponCode, itemsTotal, token);
      // result should be { code: "XYZ", discount: 150 }
      
      setAppliedCoupon({ code: result.code, discountAmount: result.discount });
      setDiscountValue(result.discount);
      setCouponCode('');
    } catch (err) {
      setError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
      setDiscountValue(0);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountValue(0);
  };

  // --- ORDER PLACEMENT ---
  const handlePlaceOrder = async () => {
    setError('');
    if (!selectedAddressId) {
      setError('Please select or add a delivery address.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setPlacingOrder(true);

    try {
      const token = await user.getIdToken();

      // Prepare minimal payload
      const orderPayload = {
        userAddress: selectedAddressId,
        paymentMethod,
        paymentBreakdown: {
          itemsTotal,
          tax,
          shipping: deliveryFee,
          discount: discountValue,
          total: grandTotal
        },
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      if (paymentMethod === 'CashOnDelivery') {
        // 1. Create Order Directly
        const response = await createOrder(token, orderPayload);
        
        // 🛑 FIX: Safely extract the ID. 
        // The backend returns { message: "...", order: { _id: "...", ... } }
        const createdOrder = response.order || response; 
        const orderId = createdOrder._id || createdOrder.orderId;

        await clearCart();
        navigate(`/orders/${orderId}`);
      } 
      else {
        // 2. Online Payment (Razorpay)
        // Step A: Create Order on Backend (Razorpay Order)
        const orderRes = await axios.post(
          `${API_URL}/api/payment/create-order`,
          { amount: grandTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const { id: razorpayOrderId, amount: razorpayAmount, currency } = orderRes.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayAmount,
          currency: currency,
          name: "Ultra Core Wood",
          description: "Furniture Order",
          order_id: razorpayOrderId,
          handler: async function (response) {
            // Step B: Verify Payment & Create Actual Order
            try {
              const verifyRes = await axios.post(
                `${API_URL}/api/payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  // Pass the full order payload so backend can create the order upon verification
                  ...orderPayload 
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                // 🛑 FIX: Extract ID safely here too
                const confirmedOrder = verifyRes.data.order || verifyRes.data;
                const confirmedId = confirmedOrder._id || confirmedOrder.orderId;

                await clearCart();
                navigate(`/orders/${confirmedId}`);
              } else {
                setError('Payment verification failed.');
              }
            } catch (verifyErr) {
              console.error(verifyErr);
              setError('Payment verification error.');
            }
          },
          prefill: {
            name: user.displayName || '',
            email: user.email || '',
            contact: user.phoneNumber || ''
          },
          theme: {
            color: "#C9A66B"
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response){
            setError(`Payment Failed: ${response.error.description}`);
        });
        rzp1.open();
      }

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      // Only stop loading if we are NOT redirecting (i.e., error happened)
      // If success, we navigate away, so loading state doesn't matter much
      if (paymentMethod === 'CashOnDelivery') {
         // Keep loading true for a split second until navigate kicks in
         // But if error, set false
      } else {
         setPlacingOrder(false);
      }
    }
  };

  if (authLoading || loadingAddresses) {
    return <div className="loading-full-page">Loading Checkout...</div>;
  }

  if (!cartItems.length) {
    return (
      <div className="checkout-container empty">
        <h2>Your cart is empty</h2>
        <p className="empty-cart-message">
          Add some items to your cart to checkout. <a href="/products">Shop Now</a>
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-content">
        
        {/* --- Left Column: Forms --- */}
        <div className="checkout-left">
          <section className="section-block">
            <h3>Shipping Address</h3>
            {addresses.length > 0 && !showAddressForm ? (
              <div className="address-selection">
                {addresses.map(addr => (
                  <div 
                    key={addr._id} 
                    className={`address-card-select ${selectedAddressId === addr._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="radio-circle">{selectedAddressId === addr._id && <div className="dot" />}</div>
                    <div>
                      <strong>{addr.fullName}</strong>
                      <p>{addr.flat}, {addr.area}, {addr.city} - {addr.pincode}</p>
                      <p>Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
                <button className="add-address-btn" onClick={() => setShowAddressForm(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Add New Address
                </button>
              </div>
            ) : (
              <div className="address-form-wrapper">
                <h4>{addresses.length === 0 ? 'Add Delivery Address' : 'Add New Address'}</h4>
                <form onSubmit={handleSaveAddress} className="checkout-address-form">
                  <div className="form-row">
                    <input name="fullName" placeholder="Full Name" value={newAddress.fullName} onChange={handleAddressChange} required />
                    <input name="phone" placeholder="Phone Number" value={newAddress.phone} onChange={handleAddressChange} required />
                  </div>
                  <input name="flat" placeholder="House No / Flat / Building" value={newAddress.flat} onChange={handleAddressChange} required />
                  <input name="area" placeholder="Area / Street / Sector" value={newAddress.area} onChange={handleAddressChange} required />
                  <div className="form-row">
                    <input name="city" placeholder="City" value={newAddress.city} onChange={handleAddressChange} required />
                    <input name="pincode" placeholder="Pincode" value={newAddress.pincode} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-row">
                    <input name="state" placeholder="State" value={newAddress.state} onChange={handleAddressChange} required />
                    <input name="landmark" placeholder="Landmark (Optional)" value={newAddress.landmark} onChange={handleAddressChange} />
                  </div>
                  <div className="form-actions-row">
                    <button type="submit" className="save-btn">Save & Deliver Here</button>
                    {addresses.length > 0 && (
                      <button type="button" className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </section>

          <section className="section-block payment-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'CashOnDelivery' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="CashOnDelivery" 
                  checked={paymentMethod === 'CashOnDelivery'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'Online' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Online" 
                  checked={paymentMethod === 'Online'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Online Payment (Card/UPI/NetBanking)</span>
              </label>
            </div>
          </section>
        </div>

        {/* --- Right Column: Order Summary --- */}
        <div className="checkout-right">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            {/* Coupon Section */}
            <div className="coupon-section">
              <div className="coupon-input-group">
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button onClick={removeCoupon} className="remove-coupon-btn">Remove</button>
                ) : (
                  <button onClick={handleApplyCoupon} disabled={!couponCode}>Apply</button>
                )}
              </div>
              {appliedCoupon && <p className="coupon-success">Coupon <strong>{appliedCoupon.code}</strong> applied!</p>}
              
              <div className="available-coupons-list">
                <p className="avail-title">Available Coupons:</p>
                {coupons.slice(0, 3).map(c => (
                  <div key={c._id} className="coupon-card" onClick={() => { setCouponCode(c.code); }}>
                    <span className="coupon-code-tag">{c.code}</span>
                    <span className="coupon-desc">{c.heading}</span>
                  </div>
                ))}
              </div>
            </div>

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
            
            <button 
              className="checkout-securely-btn" 
              onClick={handlePlaceOrder} 
              disabled={placingOrder || authLoading || loadingAddresses}
            >
              <FontAwesomeIcon icon={faLock} />
              {placingOrder ? 'Processing...' : (paymentMethod === 'Online' ? 'Proceed to Pay' : 'Place Order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}