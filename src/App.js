// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WishList from './pages/WishList';
// import AddressBook from './pages/AddressBook'; // No longer needed as a direct route
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
// import OrdersPage from './pages/OrdersPage'; // No longer needed as a direct route
import OrderDetailsPage from './pages/OrderDetailsPage';
// import MyAccountPage from './pages/MyAccount'; // No longer needed as a direct route
import ProtectedRoute from './api/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { CartProvider } from './pages/CartContext';
import { WishlistProvider } from './pages/WishlistContext';

import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetails';

// 1. Import the new AccountPage you created
import ProfilePanel from './pages/ProfilePanel';

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <Navbar />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />

            {/* Protected user routes */}
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishList />
                </ProtectedRoute>
              }
            />

            {/* 2. REMOVE the old, separate routes for account pages */}
            {/*
              <Route path="/address" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
              <Route path="/myaccount" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            */}

            {/* 3. ADD the new, single route for the account panel */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <ProfilePanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            {/* The general /orders route is now handled by /account */}
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />

          </Routes>

          <Footer />
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;