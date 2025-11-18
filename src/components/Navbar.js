// src/components/Navbar.js

import React, { useState, useRef, useEffect } from 'react';
import '../css/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../pages/CartContext';
import { useAuth } from '../hooks/useAuth'; // Import the useAuth hook
import { getAuth, signOut } from 'firebase/auth'; // Import signOut
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faCartShopping, faSearch, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ openCart }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // <-- FIX: This line was missing
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setShowDropdown(false);
      navigate('/login');
    }).catch((error) => {
      console.error("Logout Error:", error);
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <Link to="/" className="logo">
            <img src="/images/logo_white.png" alt="Furniture Logo" className="navbar_logo_img" />
            FURNITURE
          </Link>
        </div>
        {/* --- UPDATED SEARCH FORM STRUCTURE --- */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
        {/* --- END UPDATED STRUCTURE --- */}
        <div className="navbar-icons">
          <div className="profile-dropdown" ref={dropdownRef}>
            <span className="icon" title="Profile" onClick={() => setShowDropdown(prev => !prev)}>
              <FontAwesomeIcon icon={faUser} />
            </span>
            {showDropdown && (
              <div className="dropdown-menu">
                {isLoggedIn ? (
                  <>
                    {/* --- FIX: Added onClick to each link to close the dropdown --- */}
                    <Link to="/account" state={{ defaultTab: 'address' }} onClick={() => setShowDropdown(false)}>Address</Link>
                    <Link to="/account" state={{ defaultTab: 'account' }} onClick={() => setShowDropdown(false)}>My Account</Link>
                    <Link to="/account" state={{ defaultTab: 'orders' }} onClick={() => setShowDropdown(false)}>Orders</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setShowDropdown(false)}>Login</Link>
                    <Link to="/signup" onClick={() => setShowDropdown(false)}>Signup</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <Link to="/wishlist" className="icon">
            <FontAwesomeIcon icon={faHeart} />
          </Link>
          <span className="icon cart-icon-wrapper" onClick={openCart} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faCartShopping} />
          </span>
          <span className="icon navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
          </span>
        </div>
      </div>
      <div className={`navbar-links-container ${menuOpen ? 'open' : ''}`}>
        <ul className="navbar-links">
          <li><Link to="/products?category=Sale" onClick={() => setMenuOpen(false)}>SALE</Link></li>
          <li><Link to="/products?category=Bedroom" onClick={() => setMenuOpen(false)}>BEDROOM</Link></li>
          <li><Link to="/products?category=Living Room" onClick={() => setMenuOpen(false)}>LIVING ROOM</Link></li>
          <li><Link to="/products?category=Dining" onClick={() => setMenuOpen(false)}>DINING</Link></li>
          <li><Link to="/products?category=Office" onClick={() => setMenuOpen(false)}>OFFICE</Link></li>
          <li><Link to="/products?category=Tableware" onClick={() => setMenuOpen(false)}>TABLEWARE</Link></li>
          <li><Link to="/products?category=Outdoor" onClick={() => setMenuOpen(false)}>OUTDOOR</Link></li>
          <li><Link to="/products?category=Decor" onClick={() => setMenuOpen(false)}>DECOR</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;