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
        {[
          ['Living room', ['Living room furniture', 'Bedroom furniture', 'Dining room furniture', 'Accent Chairs', 'Customized recliners']],
          ['Kitchen', ['Cookware', 'Storage & Containers', 'Kitchenware', 'Kitchen Linens']],
          ['Tableware', ['Serveware', 'Crockery', 'Dinner sets', 'Table Linen', 'Cutlery']],
          ['Decor', ['Home Accessories', 'Lighting', 'Wall Decor', 'Fragrances', 'Garden']],
          ['Furnishing', ['Bedding', 'Curtains', 'Cushions', 'Floor coverings', 'Accessories']]
        ].map(([heading, items], idx) => (
          <div key={idx}>
            <h4>{heading}</h4>
            <ul>
              {items.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-grid bottom">
        {[
          ['Explore', ['Catalogues', 'Store Locator', 'Visit our Store', 'Accent Chairs', 'Customized recliners']],
          ['About', ['About us', 'Feedback', 'Careers', 'Take a Tour']],
          ['Help', ['Contact us', 'Shipping', 'Return Process', 'Return Policy', 'FAQ']]
        ].map(([heading, items], idx) => (
          <div key={idx}>
            <h4>{heading}</h4>
            <ul>
              {items.map((text, i) => <li key={i}>{text}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom-section">
        <div className="footer-logo-area">
          <img src="/images/logo_black.png" alt="Furniture Logo" className="footer-logo" />
          <h3>FURNITURE</h3>
        </div>

        <div className="footer-contact-items">
          <div className="footer-contact-box">
            <FontAwesomeIcon icon={faPhone} size="lg" />
            <div>
              <p className="footer-contact-label">Talk to us</p>
              <p className="footer-contact-value">1800-234-2384</p>
            </div>
          </div>
          <div className="footer-contact-box">
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
            <div>
              <p className="footer-contact-label">Write to us</p>
              <p className="footer-contact-value">tralala@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="footer-social-icons">
          <FontAwesomeIcon icon={faInstagram} size="2x" style={{ color: "#000000", marginRight: "20px" }} />
          <FontAwesomeIcon icon={faFacebookF} size="2x" style={{ color: "#000000", marginRight: "20px" }} />
          <FontAwesomeIcon icon={faXTwitter} size="2x" style={{ color: "#000000" }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
