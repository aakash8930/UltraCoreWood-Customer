// src/pages/OrderDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getOrder, updateOrderStatus } from '../api/orderApi';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import '../css/OrderDetailsPage.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
        const data = await getOrder(token, id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
        setError(err.message || 'Could not load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(true);
    const token = await getToken();
    try {
      const updated = await updateOrderStatus(token, id, 'Cancelled');
      setOrder(updated);
    } catch (err) {
      alert(err.message || 'Unable to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const token = await getToken();
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/orders/${id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice');
      console.error(err);
    }
  };

  if (loading) return <p className="center">Loading order details…</p>;
  if (error) return <p className="center error">{error}</p>;

  const canCancel =
    order.status !== 'Cancelled' && order.status !== 'Delivered';
  const canDownload = order.status === 'Delivered';

  return (
    <div className="order-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Orders
      </button>

      <div className="order-info">
        <h2>Order #{order.orderId}</h2>
        <p>
          <strong>Date:</strong>{' '}
          {new Date(order.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`status status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </p>
        <p>
          <strong>Payment Method:</strong> {order.paymentMethod}
        </p>
      </div>

      <div className="payment-breakdown">
        <h3>Payment Breakdown</h3>
        <div>
          <span>Items Total:</span>
          <span>₹{order.paymentBreakdown.itemsTotal.toLocaleString()}</span>
        </div>
        <div>
          <span>Tax:</span>
          <span>₹{order.paymentBreakdown.tax.toLocaleString()}</span>
        </div>
        <div>
          <span>Shipping:</span>
          <span>₹{order.paymentBreakdown.shipping.toLocaleString()}</span>
        </div>
        {order.paymentBreakdown.discount > 0 && (
          <div>
            <span>Discount:</span>
            <span>
              -₹{order.paymentBreakdown.discount.toLocaleString()}
            </span>
          </div>
        )}
        <hr />
        <div className="grand-total">
          <strong>Total:</strong>
          <strong>₹{order.paymentBreakdown.total.toLocaleString()}</strong>
        </div>
      </div>

      <div className="order-products">
        <h3>Products</h3>
        <div className="products-grid">
          {order.products.map(({ product, quantity }) => (
            <div key={product._id} className="product-cell">
              <img
                src={product.imageUrl || '/images/placeholder.jpg'}
                alt={product.name}
              />
              <p>{product.name}</p>
              <p>Qty: {quantity}</p>
              <p>₹{(product.price * quantity).toLocaleString()}</p>

              {order.status === 'Delivered' && (
                <div className="review-section">
                  <h4>Leave a Review:</h4>
                  <ReviewForm
                    productId={product._id}
                    onReviewSubmitted={() => {
                      // Optional: you can add logic here to refresh product reviews or disable the form
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="order-address">
        <h3>Delivery Address</h3>
        <p>{order.userAddress.fullName}</p>
        <p>
          {order.userAddress.flat}, {order.userAddress.area}
        </p>
        <p>
          {order.userAddress.city} – {order.userAddress.pincode}
        </p>
        <p>{order.userAddress.state}</p>
        <p>Phone: {order.userAddress.phone}</p>
      </div>

      <div className="order-actions">
        {canCancel && (
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
        <button
          className={`invoice-btn ${!canDownload ? 'disabled' : ''}`}
          onClick={handleDownloadInvoice}
          disabled={!canDownload}
        >
          Download Invoice
        </button>
      </div>

      <div className="order-tracking">
        <h3>Track Shipment</h3>
        {/* Shipment tracking integration here */}
        Yaha pe Shipment company ki api lagegi aur uski tracking aa jayegi
      </div>
    </div>
  );
}
