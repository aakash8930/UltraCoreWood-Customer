import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <hr className="footer-divider" />

      <div className="footer-grid top">
        <div>
          <h4>Living room</h4>
          <ul>
            <li>Living room furniture</li>
            <li>Bedroom furniture</li>
            <li>Dining room furniture</li>
            <li>Accent Chairs</li>
            <li>Customized recliners</li>
          </ul>
        </div>
        <div>
          <h4>Kitchen</h4>
          <ul>
            <li>Cookware</li>
            <li>Storage & Containers</li>
            <li>Kitchenware</li>
            <li>Kitchen Linens</li>
          </ul>
        </div>
        <div>
          <h4>Tableware</h4>
          <ul>
            <li>Serveware</li>
            <li>Crockery</li>
            <li>Dinner sets</li>
            <li>Table Linen</li>
            <li>Cutlery</li>
          </ul>
        </div>
        <div>
          <h4>Decor</h4>
          <ul>
            <li>Home Accessories</li>
            <li>Lighting</li>
            <li>Wall Decor</li>
            <li>Fragrances</li>
            <li>Garden</li>
          </ul>
        </div>
        <div>
          <h4>Furnishing</h4>
          <ul>
            <li>Bedding</li>
            <li>Curtains</li>
            <li>Cusions</li>
            <li>Floor Coverings</li>
            <li>Accessories</li>
          </ul>
        </div>


        <div className="footer-grid bottom">

          <div className="footer-explore">
            <h4>Explore</h4>
            <ul>
              <li>Catalogues</li>
              <li>Store Locator</li>
              <li>Visit our Store</li>
              <li>Accent Chairs</li>
              <li>Customized recliners</li>
            </ul>
          </div>
        </div>
        <div className="footer-about">
          <h4>About</h4>
          <ul>
            <li>About us</li>
            <li>Feedback</li>
            <li>Careers</li>
            <li>Take a Tour</li>
          </ul>
        </div>
        <div className="footer-help">
          <h4>Help</h4>
          <ul>
            <li>Contact us</li>
            <li>Shipping</li>
            <li>Return Process</li>
            <li>Return Policy</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom-section">
        <div className="contact-social">
          <div className="footer-contact-items">
            <div className="footer-contact-box">
              <FontAwesomeIcon icon={faPhone} />
              <div>
                <p className="footer-contact-label">Talk to us</p>
                <p className="footer-contact-value">1800-234-2384</p>
              </div>
            </div>
            <div className="footer-contact-box">
              <FontAwesomeIcon icon={faEnvelope} />
              <div>
                <p className="footer-contact-label">Write to us</p>
                <p className="footer-contact-value">tralala@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="footer-social-icons">
            <FontAwesomeIcon icon={faInstagram} className="social-icon" />
            <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
            <FontAwesomeIcon icon={faXTwitter} className="social-icon" />
          </div>
        </div>

        <div className="footer-logo-area">
          <img src="/images/logo_black.png" alt="Furniture Logo" className="footer-logo" />
          <h3>FURNITURE</h3>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
