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
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

const CustomPrevArrow = ({ onClick }) => (
  <div className="custom-arrow custom-prev" onClick={onClick}>
    <FaChevronLeft />
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div className="custom-arrow custom-next" onClick={onClick}>
    <FaChevronRight />
  </div>
);

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 1000,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  prevArrow: <CustomPrevArrow />,
  nextArrow: <CustomNextArrow />,
};

const productSliderSettings = {
  ...sliderSettings,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

const baseBannerSettings = {
  ...sliderSettings,
  slidesToShow: 1,
  slidesToScroll: 1,
  speed: 2500,
  autoplaySpeed: 3000,
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

  const bannerSettings = banners.length > 1
    ? baseBannerSettings
    : { ...baseBannerSettings, infinite: false, autoplay: false };

  return (
    <>
      {/* Banner Slider */}
      {banners.length > 0 && (
        <div className="banner-slider">
          <Slider {...bannerSettings}>
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
          <hr className="underline1" />
          <h2>CRAFTED COMFORT DELIVERED TO YOUR DOOR</h2>
          <hr className="underline1" />
        </div>
      </div>

      {/* Top Selections */}
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
              <p>Lorem Ipsum is simply dummy text...A wiki is a web-based collaborative platform that enables users to store, create and modify content in an organized manner. The term comes from the word wiki wiki, which means fast in Hawaiian.</p>
            </div>
            <div className="whyus-image">
              <img src="/images/sofa.jpg" alt="Why Us" />
            </div>
          </div>

          <div className='whyus_column'>
            <div className="whyus-features">
              <div className="feature">🚚 <span>Free Delivery and Returns</span></div>
              <hr className="underline2" />
              <div className="feature">🔁 <span>7 Day Return Policy</span></div>
              <hr className="underline2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
