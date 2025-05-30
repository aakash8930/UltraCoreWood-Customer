// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useSearchParams } from 'react-router-dom';
import { getPublicBanners } from '../api/bannerApi';
import socket from '../sockets';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../css/HomePage.css';
import { getAllProducts } from '../api/productApi';

const essentials = [
  { title: "COFFEE TABLE", image: "/images/coffee_table.jpg" },
  { title: "SOFAS", image: "/images/sofa.jpg" },
  { title: "CHAIR", image: "/images/chair.jpg" },
  { title: "DECOR", image: "/images/chair.jpg" },
  { title: "TABLE", image: "/images/coffee_table.jpg" },
  { title: "OFFICE", image: "/images/sofa.jpg" },
];

const products = [
  { name: "Ball table top", subtext: "Coffee table", image: "/images/coffee_table.jpg" },
  { name: "Basic Chair", subtext: "Chair that's it", image: "/images/sofa.jpg" },
  { name: "Bowl Chair", subtext: "Modular Chair", image: "/images/chair.jpg" },
  { name: "Dash Shelf", subtext: "Cupboard combo", image: "/images/coffee_table.jpg" },
  { name: "Fate Desk", subtext: "Study Table", image: "/images/sofa.jpg" },
  { name: "Luffy Lounge", subtext: "Recliner Chair", image: "/images/chair.jpg" },
];

const productSliderSettings = {
  dots: false,
  infinite: true,
  speed: 1000,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

const baseBannerSettings = {
  dots: false,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 4000,
  speed: 2000,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
};

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await getPublicBanners();
        setBanners(data);
      } catch (err) {
        console.error('Failed to load banners', err);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (category) {
        const data = await getAllProducts(category);
        setFilteredProducts(data);
      } else {
        setFilteredProducts([]);
      }
    };
    load();
  }, [category]);

  useEffect(() => {
    socket.on("product:added", (newProduct) => {
      setFilteredProducts(prev => [...prev, newProduct]);
    });
    socket.on("product:deleted", (deletedId) => {
      setFilteredProducts(prev =>
        prev.filter(p => (p._id || p.id || p.name) !== deletedId)
      );
    });
    return () => {
      socket.off("product:added");
      socket.off("product:deleted");
    };
  }, []);

  // if only one banner, disable infinite/autoplay to avoid clones
  const bannerSettings = banners.length > 1
    ? baseBannerSettings
    : { ...baseBannerSettings, infinite: false, autoplay: false };

  return (
    <>
      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="banner-slider">
          {banners.length > 1
            ? <Slider {...bannerSettings}>
                {banners.map(b => {
                  const href = b.link && (b.link.startsWith('http') ? b.link : `https://${b.link}`);
                  return (
                    <a key={b._id} href={href || '#'} target="_blank" rel="noreferrer" className="banner-link">
                      <div className="banner-slide">
                        <img src={b.image} alt={b.text || 'Banner'} className="banner-image" />
                        {b.text && <div className="banner-text">{b.text}</div>}
                      </div>
                    </a>
                  );
                })}
              </Slider>
            : (() => {
                const b = banners[0];
                const href = b.link && (b.link.startsWith('http') ? b.link : `https://${b.link}`);
                return (
                  <a key={b._id} href={href || '#'} target="_blank" rel="noreferrer" className="banner-link">
                    <div className="banner-slide">
                      <img src={b.image} alt={b.text || 'Banner'} className="banner-image" />
                      {b.text && <div className="banner-text">{b.text}</div>}
                    </div>
                  </a>
                );
              })()
          }
        </div>
      )}

      {/* Essentials */}
      <div className="essentials-section">
        <h2 className="essentials-title">THE ESSENTIALS</h2>
        <div className="essentials-grid">
          {essentials.map((item, i) => (
            <div
              className="essentials-item"
              style={{ backgroundImage: `url(${item.image})` }}
              key={i}
            >
              <div className="essentials-overlay"><span>{item.title}</span></div>
            </div>
          ))}
        </div>
        <div className="comfort-section">
          <hr className="underline" />
          <h2>CRAFTED COMFORT DELIVERED TO YOUR DOOR</h2>
          <hr className="underline" />
        </div>
      </div>

      {/* Top Selections Slider */}
      <div className="top-button-section">
        <button className="top-selections-btn">TOP SELECTIONS</button>
      </div>
      <div className="carousel-slider-wrapper">
        <Slider {...productSliderSettings}>
          {products.map((item, i) => (
            <div className="product-card" key={i}>
              <img src={item.image} alt={item.name} />
              <div className="product-text">
                <h4>{item.name}</h4>
                <p>{item.subtext}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Filtered Products */}
      {category && filteredProducts.length > 0 && (
        <>
          <div className="top-button-section">
            <button className="top-selections-btn">{category.toUpperCase()} PRODUCTS</button>
          </div>
          <div className="carousel-slider-wrapper">
            <Slider {...productSliderSettings}>
              {filteredProducts.map((item, i) => (
                <div className="product-card" key={i}>
                  <img src={item.image} alt={item.name} />
                  <div className="product-text">
                    <h4>{item.name}</h4>
                    <p>{item.subtext}</p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </>
      )}

      {/* Why Us */}
      <div className="whyus-section">
        <div className="whyus-button">
          <button className="whyus-btn">Why Us</button>
        </div>
        <div className="whyus-container">
          <div className="whyus-content">
            <div className="whyus-description">
              <p>We are a furniture design brand based in New Delhi... Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </div>
            <div className="whyus-image">
              <img src="/images/sofa.jpg" alt="Why Us" />
            </div>
          </div>
          <div className="whyus-features">
            <div className="feature">🚚 <span>Free Delivery and Returns</span></div>
            <hr className="underline" />
            <div className="feature">👑 <span>1 Lakh Happy Customers</span></div>
            <hr className="underline" />
            <div className="feature">🔁 <span>7 Day Return Policy</span></div>
          </div>
          <div className="whyus-trustpilot">
            <div className="brand">
              <h3><img src="/images/logo_white.png" alt="logo" /> FURNITURE</h3>
              <div className="brand star">
                <h3 className="trust"><img src="/images/trust_star.png" alt="star" /> Trustpilot</h3>
                <img src="/images/star.png" alt="Trustpilot" />
                <p>TrustScore <strong>4.8</strong> <span>141,840</span> reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
