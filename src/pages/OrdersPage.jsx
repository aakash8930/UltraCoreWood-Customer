// src/pages/OrdersPage.jsx

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

  // Helper to handle image source safely
  const getProductImage = (product) => {
    if (product && product.imageUrl) {
      return product.imageUrl;
    }
    return "/images/placeholder.jpg"; // Fallback image
  };

  if (loading) return <div className="orders-container">Loading orders...</div>;
  if (error) return <div className="orders-container error">{error}</div>;
  if (!orders.length) return <div className="orders-container">You have no orders yet.</div>;

  return (
    <>
      {toastMessage && <div className="order-toast">{toastMessage}</div>}
      
      <div className="orders-container">
        <h1 className="page-title">My Orders</h1>
        
        {orders.map((order) => (
          <div key={order._id || order.orderId} className="order-card">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-meta">
                <span className="order-id">Order #{order.orderId}</span>
                <span className="order-date">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-actions-header">
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <Link to={`/orders/${order._id || order.orderId}`} className="btn-view-details">
                  View Details
                </Link>
              </div>
            </div>

            {/* Order Items Preview */}
            {order.products.length <= 2 ? (
              // LIST VIEW for few products
              <div className="order-items-list">
                {order.products.filter(item => item.product).map(({ product, quantity }) => {
                  // Calculate price accounting for discount if present, otherwise raw price
                  const price = product.price || 0;
                  const discount = product.discount || 0;
                  const discountedPrice = Math.floor(price * (1 - discount / 100));

                  return (
                    <div key={product._id} className="list-item">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="list-item-image"
                        onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                      />
                      <div className="list-item-info">
                        <div className="item-header">
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
              // GRID VIEW for 3 or more products
              <div className="order-products-grid">
                {order.products.filter(item => item.product).map(({ product, quantity }) => (
                    <div key={product._id} className="product-cell">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                      />
                      <div className="product-info">
                        <p className="product-name">{product.name}</p>
                        <p className="product-qty">Qty: {quantity}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}