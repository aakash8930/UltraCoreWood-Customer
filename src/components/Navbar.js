import React, { useState, useRef, useEffect } from 'react';
import '../css/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faCartShopping, faSearch } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); // or whatever key you store auth in
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <Link to="/" className="logo">🛒 FURNITURE</Link>
        </div>

        <div className="navbar-search">
          <input type="text" placeholder="Search..." />
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} style={{ color: 'black' }} />
          </button>
        </div>

        <div className="navbar-icons">
          <div className="profile-dropdown" ref={dropdownRef}>
            <span className="icon" title="Profile" onClick={() => setShowDropdown(prev => !prev)}>
              <FontAwesomeIcon icon={faUser} />
            </span>

            {showDropdown && (
              <div className="dropdown-menu">
                {isLoggedIn ? (
                  <>
                  <Link to="/address">Address</Link>
                    <Link to="/account">My Account</Link>
                    <Link to="/orders">Orders</Link>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Signup</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/wishlist" className="icon"><FontAwesomeIcon icon={faHeart} /></Link>
          <Link to="/cart" className="icon"><FontAwesomeIcon icon={faCartShopping} /></Link>
        </div>
      </div>

      <div className="navbar-links-container">
        <ul className="navbar-links">
          <li><Link to="/products?category=Sale">SALE</Link></li>
          <li><Link to="/products?category=Bedroom">BEDROOM</Link></li>
          <li><Link to="/products?category=Living Room">LIVING ROOM</Link></li>
          <li><Link to="/products?category=Dining">DINING</Link></li>
          <li><Link to="/products?category=Office">OFFICE</Link></li>
          <li><Link to="/products?category=Tableware">TABLEWARE</Link></li>
          <li><Link to="/products?category=Outdoor">OUTDOOR</Link></li>
          <li><Link to="/products?category=Decor">DECOR</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
