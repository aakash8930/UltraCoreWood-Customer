// src/pages/OrderDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrder, updateOrderStatus } from '../api/orderApi';
import axios from 'axios';
import ProductReview from './ProductReview'; 
import '../css/OrderDetailsPage.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return; 

    (async () => {
      try {
        const token = await user.getIdToken();
        const data = await getOrder(token, id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
        setError(err.message || 'Could not load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(true);
    try {
      const token = await user.getIdToken();
      // Update status to Cancelled
      const updated = await updateOrderStatus(token, order._id || order.orderId, 'Cancelled');
      setOrder(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
        const token = await user.getIdToken();
        const res = await axios.get(`http://localhost:8000/api/orders/${order._id}/invoice`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${order.orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error('Download invoice failed', err);
        alert('Could not download invoice');
    }
  };

  if (loading) return <div className="order-details-page">Loading...</div>;
  if (error) return <div className="order-details-page error">{error}</div>;
  if (!order) return <div className="order-details-page">Order not found.</div>;

  const canCancel = order.status === 'Pending' || order.status === 'Confirmed';
  const canDownload = order.status !== 'Cancelled';

  return (
    <div className="order-details-page">
<<<<<<< HEAD
      <button className="back-btn" onClick={() => navigate('/account', { state: { defaultTab: 'orders' } })}>
        ← Back to Orders
      </button>
=======
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3

      <h1 style={{ marginBottom: '1rem' }}>Order Details</h1>

      <div className="order-info">
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`status ${'status-' + order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      </div>

      <div className="payment-breakdown">
        <h3>Payment Summary</h3>
        <div><span>Subtotal</span> <span>₹{order.paymentBreakdown.itemsTotal}</span></div>
        <div><span>Tax</span> <span>₹{order.paymentBreakdown.tax}</span></div>
        <div><span>Shipping</span> <span>₹{order.paymentBreakdown.shipping}</span></div>
        {order.paymentBreakdown.discount > 0 && (
          <div style={{ color: 'green' }}>
            <span>Discount</span> <span>-₹{order.paymentBreakdown.discount}</span>
          </div>
        )}
        <div className="grand-total">
          <strong>Total</strong> <strong>₹{order.paymentBreakdown.total}</strong>
        </div>
      </div>

      <div className="order-products">
        <h3>Items</h3>
        <div className="products-grid">
<<<<<<< HEAD
          {order.products.filter(item => item.product).map(({ product, quantity }) => (
            <div key={product._id} className="product-cell">
              <img
                // Use the imageUrl provided by the backend
                src={product.imageUrl || '/images/placeholder.jpg'}
                alt={product.name}
                onError={(e) => (e.target.src = "/images/placeholder.jpg")}
              />
              <p className='product-name'>{product.name}</p>
              <p>Qty: {quantity}</p>
              <p>₹{(product.price * quantity).toLocaleString()}</p>

              {/* Allow review if order is delivered */}
              {order.status === 'Delivered' && (
                <ProductReview productId={product._id} />
              )}
            </div>
          ))}
=======
          {order.products.filter(item => item.product).map(({ product, quantity }) => {
            // Handle product images (base64 encoded)
            let imageSrc = '/images/placeholder.jpg';
            if (product.images) {
              const firstImageKey = Object.keys(product.images).find(key => product.images[key]?.data);
              if (firstImageKey) {
                const { contentType, data } = product.images[firstImageKey];
                imageSrc = `data:${contentType};base64,${data}`;
              }
            }

            return (
              <div key={product._id} className="product-cell">
                <img
                  src={imageSrc}
                  alt={product.name}
                />
                <p>{product.name}</p>
                <p>Qty: {quantity}</p>
                <p>₹{(product.price * quantity).toLocaleString()}</p>

                {/* **REPLACED** with the new component */}
                {order.status === 'Delivered' && (
                  <ProductReview productId={product._id} />
                )}
              </div>
            );
          })}
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
        </div>
      </div>

      <div className="order-address">
        <h3>Delivery Address</h3>
        <p>{order.userAddress.fullName}</p>
        <p>{order.userAddress.flat}, {order.userAddress.area}</p>
        <p>{order.userAddress.city} – {order.userAddress.pincode}</p>
        <p>{order.userAddress.state}</p>
        <p>Phone: {order.userAddress.phone}</p>
      </div>

      <div className="order-actions">
        {canCancel && (
          <button className="cancel-btn" onClick={handleCancel} disabled={actionLoading}>
            {actionLoading ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
        <button className={`invoice-btn ${!canDownload ? 'disabled' : ''}`} onClick={handleDownloadInvoice} disabled={!canDownload}>
          Download Invoice
        </button>
      </div>
    </div>
  );
}