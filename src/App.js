// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WishList from './pages/WishList';
import AddressBook from './pages/AddressBook';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyAccountPage from './pages/MyAccount';
import ProtectedRoute from './api/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { CartProvider } from './pages/CartContext';
import { WishlistProvider } from './pages/WishlistContext';

import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetails'; // updated filename

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <Navbar />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />

            {/* /products: listing, /products/:id: details */}
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
            <Route
              path="/address"
              element={
                <ProtectedRoute>
                  <AddressBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myaccount"
              element={
                <ProtectedRoute>
                  <MyAccountPage />
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
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback 404 could be added here */}
          </Routes>

          <Footer />
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
