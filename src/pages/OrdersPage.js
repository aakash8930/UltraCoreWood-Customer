// src/pages/OrdersPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getMyOrders } from '../api/orderApi';
import '../css/OrdersPage.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      try {
        const data = await getMyOrders(token);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError(err.message || 'Could not load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="center">Loading your orders…</p>;
  if (error)   return <p className="center error">{error}</p>;
  if (!orders.length) return <p className="center">You have no orders yet.</p>;

  return (
    <div className="orders-container">
      <h1>Your Orders</h1>
      {orders.map(order => (
        <div key={order._id} className="order-card">
          <div className="order-card-header">
            <div>
              <strong>Order ID:</strong> {order.orderId}
            </div>
            <div>
              <strong>Date:</strong>{' '}
              {new Date(order.createdAt).toLocaleDateString()}{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <Link to={`/orders/${order._id}`} className="view-order-btn">
              View Order
            </Link>
          </div>

          <div className="order-products-grid">
            {order.products.map(({ product, quantity }) => (
              <div key={product._id} className="product-cell">
                <img
                  src={product.imageUrl || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="product-thumb"
                />
                <div className="product-info">
                  <p className="product-name">{product.name}</p>
                  <p className="product-qty">x{quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
