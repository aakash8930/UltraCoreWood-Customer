
// src/App.js
import React, { useState } from 'react'; // <-- Import useState
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WishList from './pages/WishList';
// import AddressBook from './pages/AddressBook'; // No longer needed as a direct route
import AddressBook from './pages/AddressBook';
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
import CartPage from './pages/CartPage'; // <-- This is your Cart SLIDER component

function App() {
  // 1. Manage the cart slider's open/closed state here
  const [isCartOpen, setCartOpen] = useState(false);

  // 2. Create functions to control the state
  const openCartSlider = () => setCartOpen(true);
  const closeCartSlider = () => setCartOpen(false);

  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          {/* You may also want to pass openCartSlider to your Navbar */}
          <Navbar openCart={openCartSlider} />

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPage />} />

            {/* 3. Pass the `openCart` function to your ProductPage */}
            <Route 
              path="/products" 
              element={<ProductPage openCart={openCartSlider} />} 
            />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />

            {/* Protected user routes */}
            <Route
              path="/wishlist"
              element={<ProtectedRoute><WishList /></ProtectedRoute>}
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
              path="/address"
              element={<ProtectedRoute><AddressBook /></ProtectedRoute>}
            />
            <Route
              path="/checkout"
              element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
            />
            {/* The general /orders route is now handled by /account */}
            <Route
              path="/orders/:id"
              element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>}
            />

          </Routes>

          <Footer />

          {/* 4. Render the Cart Slider here, outside of Routes */}
          <CartPage isOpen={isCartOpen} onClose={closeCartSlider} />

        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;