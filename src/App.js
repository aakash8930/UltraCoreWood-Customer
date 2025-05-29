import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WishList from './pages/WishList';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './pages/CartContext';
import { WishlistProvider } from './pages/WishlistContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <Navbar /> {/* Always visible */}

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products" element={<ProductPage />} />
          </Routes>

          <Footer /> {/* Always visible */}
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}


export default App;
