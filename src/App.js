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
import AddressBook from './pages/AddressBook';

function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/resetpassword" element={<ResetPassword />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/address" element={<AddressBook/>}/>
          </Routes>

          <Footer />
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
