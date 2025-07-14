// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import HomePage from './pages/HomePage';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import WishList from './pages/WishList';
// import AddressBook from './pages/AddressBook';
// import CartPage from './pages/CartPage';
// import CheckoutPage from './pages/CheckoutPage';
// import OrdersPage from './pages/OrdersPage';
// import OrderDetailsPage from './pages/OrderDetailsPage';
// import MyAccountPage from './pages/MyAccount';
// import ProtectedRoute from './api/ProtectedRoute';

// import Navbar from './components/Navbar';
// import Footer from './components/Footer';

// import { CartProvider } from './pages/CartContext';
// import { WishlistProvider } from './pages/WishlistContext';

// import ProductPage from './pages/ProductPage';
// import ProductDetailsPage from './pages/ProductDetails'; // updated filename

// function App() {
//   return (
//     <Router>
//       <CartProvider>
//         <WishlistProvider>
//           <Navbar />

//           <Routes>
//             {/* Public routes */}
//             <Route path="/" element={<HomePage />} />

//             {/* /products: listing, /products/:id: details */}
//             <Route path="/products" element={<ProductPage />} />
//             <Route path="/products/:id" element={<ProductDetailsPage />} />

//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/forgotpassword" element={<ForgotPassword />} />
//             <Route path="/resetpassword" element={<ResetPassword />} />

//             {/* Protected user routes */}
//             <Route
//               path="/wishlist"
//               element={
//                 <ProtectedRoute>
//                   <WishList />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/address"
//               element={
//                 <ProtectedRoute>
//                   <AddressBook />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/myaccount"
//               element={
//                 <ProtectedRoute>
//                   <MyAccountPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/cart"
//               element={
//                 <ProtectedRoute>
//                   <CartPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/checkout"
//               element={
//                 <ProtectedRoute>
//                   <CheckoutPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/orders"
//               element={
//                 <ProtectedRoute>
//                   <OrdersPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/orders/:id"
//               element={
//                 <ProtectedRoute>
//                   <OrderDetailsPage />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Fallback 404 could be added here */}
//           </Routes>

//           <Footer />
//         </WishlistProvider>
//       </CartProvider>
//     </Router>
//   );
// }

// export default App;

// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// CONTEXT PROVIDERS
import { AuthProvider } from './pages/AuthContext';
import { CartProvider } from './pages/CartContext';
import { WishlistProvider } from './pages/WishlistContext';

// LAYOUT COMPONENTS
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './api/ProtectedRoute';
import CartPage from './pages/CartPage'; // This is the Cart Slider

// PAGE COMPONENTS
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductDetailsPage from './pages/ProductDetails';
import WishList from './pages/WishList';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyAccountPage from './pages/MyAccount';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AddressBook from './pages/AddressBook';

function App() {
  // State and handlers for the cart slider, managed at the top level
  const [isCartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Navbar openCart={openCart} />

            <main>
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/resetpassword/:token" element={<ResetPassword />} />
                
                {/* --- Product Routes (Public, but need cart access) --- */}
                <Route path="/products" element={<ProductPage openCart={openCart} />} />
                <Route path="/products/:id" element={<ProductDetailsPage openCart={openCart} />} />

                {/* --- Protected Routes (Require user to be logged in) --- */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishList openCart={openCart} />
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
                <Route
                  path="/my-account"
                  element={
                    <ProtectedRoute>
                      <MyAccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/address-book"
                  element={
                    <ProtectedRoute>
                      <AddressBook />
                    </ProtectedRoute>
                  }
                />

                {/* You can add a 404 Not Found route here */}
              </Routes>
            </main>

            <Footer />

            {/* The Cart Slider is rendered outside Routes to act as an overlay */}
            <CartPage isOpen={isCartOpen} onClose={closeCart} />

          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;