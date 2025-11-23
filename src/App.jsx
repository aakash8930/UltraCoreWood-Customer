// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// CONTEXT PROVIDERS
import { AuthProvider } from './pages/AuthContext';
import { CartProvider } from './pages/CartContext';
import { WishlistProvider } from './pages/WishlistContext';

// LAYOUT & PROTECTED ROUTE COMPONENTS
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './api/ProtectedRoute';
import CartPage from './pages/CartPage';

// PAGE COMPONENTS
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetails';
import WishList from './pages/WishList';
import AddressBook from './pages/AddressBook';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AccountDashboard from './pages/AccountDashboard'; // Import the new component
import Login from './pages/Login';
import Signup from './pages/Signup';


function App() {
  const [isCartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Navbar openCart={openCart} />

            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* --- Product Routes --- */}
              {/* FIX: Removed duplicate route and corrected function name */}
              <Route path="/products" element={<ProductPage openCart={openCart} />} />
              <Route path="/products/:id" element={<ProductDetailsPage openCart={openCart} />} />

              {/* --- Protected User Routes --- */}
              <Route path="/wishlist" element={<ProtectedRoute><WishList openCart={openCart} /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />

              {/* FIX: Consolidated account section route */}
              <Route path="/account" element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>} />
            </Routes>

            {/* The Cart Slider is rendered outside Routes to act as an overlay */}
            <CartPage isOpen={isCartOpen} onClose={closeCart} />

            <Footer />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;