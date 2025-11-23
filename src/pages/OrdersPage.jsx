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
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewedTabs, setViewedTabs] = useState(new Set(['all'])); // Track viewed tabs
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
        setFilteredOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
        setError(err.message || 'Could not load your orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

<<<<<<< HEAD
  // Helper to handle image source safely
  const getProductImage = (product) => {
    if (product && product.imageUrl) {
      return product.imageUrl;
=======
  // Filter orders based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      // Show only pending and shipped orders in "On Shipping"
      setFilteredOrders(orders.filter(order => 
        order.status.toLowerCase() === 'shipped' || 
        order.status.toLowerCase() === 'pending' ||
        order.status.toLowerCase() === 'confirmed'
      ));
    } else if (activeTab === 'delivered') {
      setFilteredOrders(orders.filter(order => order.status.toLowerCase() === 'delivered'));
    } else if (activeTab === 'cancelled') {
      setFilteredOrders(orders.filter(order => order.status.toLowerCase() === 'cancelled'));
    }
  }, [activeTab, orders]);

  // Calculate counts for each status
  const getStatusCounts = () => {
    return {
      shipped: orders.filter(order => 
        order.status.toLowerCase() === 'shipped' || 
        order.status.toLowerCase() === 'pending' ||
        order.status.toLowerCase() === 'confirmed'
      ).length,
      delivered: orders.filter(order => order.status.toLowerCase() === 'delivered').length,
      cancelled: orders.filter(order => order.status.toLowerCase() === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  // Handle tab click - mark as viewed
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setViewedTabs(prev => new Set([...prev, tabName]));
  };

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
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
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
<<<<<<< HEAD
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
=======
        <h1>My Orders</h1>
        
        {/* Status Tabs */}
        <div className="status-tabs">
          <button 
            className={`status-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabClick('all')}
          >
            On Shipping
          </button>
          <button 
            className={`status-tab ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => handleTabClick('delivered')}
          >
            Arrived
          </button>
          <button 
            className={`status-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleTabClick('cancelled')}
          >
            Canceled
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="center">No orders found in this category.</p>
        ) : (
          filteredOrders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-header-info">
                <div>
                  <strong>Order ID</strong>
                  <span className="order-id">{order.orderId}</span>
                </div>
                <div>
                  <strong>Estimated arrival</strong>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div>
                  <strong>Status</strong>
                  <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div>
                  <strong>Total</strong>
                  <span className="order-total">{formatPrice(order.paymentBreakdown.total)}</span>
                </div>
              </div>
              <div className="order-header-actions">
                <button className="buy-again-btn" onClick={() => handleBuyAgain(order.orderId)}>
                  Buy Again
                </button>
                <Link to={`/orders/${order._id}`} className="view-order-btn">
                  Details
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
                </Link>
              </div>
            </div>

<<<<<<< HEAD
            {/* Order Items Preview */}
            {order.products.length <= 2 ? (
              // LIST VIEW for few products
              <div className="order-items-list">
=======
            {/* Products Grid - Always use 2 columns for grid like Nike design */}
            {order.products.length < 3 ? (
              <div className="order-products-list">
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
                {order.products.filter(item => item.product).map(({ product, quantity }) => {
                  // Calculate price accounting for discount if present, otherwise raw price
                  const price = product.price || 0;
                  const discount = product.discount || 0;
                  const discountedPrice = Math.floor(price * (1 - discount / 100));

                  return (
                    <div key={product._id} className="list-item">
<<<<<<< HEAD
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="list-item-image"
                        onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                      />
                      <div className="list-item-info">
                        <div className="item-header">
=======
                      <img src={imageSrc} alt={product.name} className="list-item-image" />
                      <div className="list-item-details">
                        <div className="list-item-info">
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
                          <span className="list-item-name">{product.name}</span>
                          <span className="list-item-qty">Size: {quantity}</span>
                        </div>
                        <span className="list-item-price">{formatPrice(discountedPrice * quantity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
<<<<<<< HEAD
              // GRID VIEW for 3 or more products
              <div className="order-products-grid">
                {order.products.filter(item => item.product).map(({ product, quantity }) => (
=======
              <div className="order-products-grid">
                {order.products.filter(item => item.product).map(({ product, quantity }) => {
                  const { imageSrc, discountedPrice } = renderProductItem(product, quantity);
                  return (
>>>>>>> b39c67e98b7e86a220dc51c9f50c7ba9421bcae3
                    <div key={product._id} className="product-cell">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => (e.target.src = "/images/placeholder.jpg")}
                      />
                      <div className="product-info">
                        <p className="product-name">{product.name}</p>
                        <p className="product-qty">Size: {quantity}</p>
                        <p className="product-price">{formatPrice(discountedPrice * quantity)}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          ))
        )}
      </div>
    </>
  );
}