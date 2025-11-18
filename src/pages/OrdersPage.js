// src/pages/OrdersPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders } from '../api/orderApi';
import '../css/OrdersPage.css';

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadOrders = async () => {
      try {
        const token = await user.getIdToken();
        const data = await getMyOrders(token);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError(err.message || 'Could not load your orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const handleBuyAgain = (orderId) => {
    setToastMessage(`Feature simulation: Items from order ${orderId} would be added to your cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) return <p className="center">Loading your orders…</p>;
  if (error) return <p className="center error">{error}</p>;
  if (!orders.length) return <p className="center">You have no orders yet.</p>;

  // Helper function to render a single product item
  const renderProductItem = (product, quantity) => {
    let imageSrc = '/images/placeholder.jpg';
    if (product.images) {
      const firstImageKey = Object.keys(product.images).find(key => product.images[key]?.data);
      if (firstImageKey) {
        const { contentType, data } = product.images[firstImageKey];
        imageSrc = `data:${contentType};base64,${data}`;
      }
    }
    // Calculate discounted price for a single item
    const discountedPrice = (product.price * (100 - (product.discount || 0))) / 100;

    return { imageSrc, discountedPrice };
  };

  return (
    <>
      {toastMessage && <div className="order-toast">{toastMessage}</div>}

      <div className="orders-container">
        <h1>Your Orders</h1>
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-header-info">
                <div><strong>Order ID:</strong> {order.orderId}</div>
                <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div className="order-total">
                  <strong>Total:</strong> {formatPrice(order.paymentBreakdown.total)}
                </div>
              </div>
              <div className="order-header-actions">
                <button className="buy-again-btn" onClick={() => handleBuyAgain(order.orderId)}>
                  Buy Again
                </button>
                <Link to={`/orders/${order._id}`} className="view-order-btn">
                  View Details
                </Link>
              </div>
            </div>

            {/* --- UI IMPROVEMENT: Conditional Layout Logic --- */}
            {order.products.length < 3 ? (
              // Use LIST VIEW for 1 or 2 products
              // Find this section in your OrdersPage.js file

              // Use LIST VIEW for 1 or 2 products
              <div className="order-products-list">
                {order.products.filter(item => item.product).map(({ product, quantity }) => {
                  const { imageSrc, discountedPrice } = renderProductItem(product, quantity);
                  return (
                    <div key={product._id} className="list-item">
                      <img src={imageSrc} alt={product.name} className="list-item-image" />
                      {/* --- CHANGE IS HERE --- */}
                      <div className="list-item-details">
                        <div className="list-item-info">
                          <span className="list-item-name">{product.name}</span>
                          <span className="list-item-qty">Qty: {quantity}</span>
                        </div>
                        <span className="list-item-price">{formatPrice(discountedPrice * quantity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Use GRID VIEW for 3 or more products
              <div className="order-products-grid">
                {order.products.filter(item => item.product).map(({ product, quantity }) => {
                  const { imageSrc } = renderProductItem(product, quantity);
                  return (
                    <div key={product._id} className="product-cell">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                      />
                      <div className="product-info">
                        <p className="product-name">{product.name}</p>
                        <p className="product-qty">Qty: {quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}