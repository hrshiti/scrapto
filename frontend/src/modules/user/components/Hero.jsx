import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PriceTicker from './PriceTicker';
import TrustSignals from './TrustSignals';
import Testimonials from './Testimonials';
import OTPModal from './OTPModal';
import MicroDemo from './MicroDemo';
import Profile from './Profile';
import scrapImage from '../assets/scrap3-Photoroom.png';
import scrapImage2 from '../assets/scrab.png';
import scrapImage3 from '../assets/scrap5.png';
import plasticImage from '../assets/plastic.jpg';
import metalImage from '../assets/metal.jpg';
import electronicImage from '../assets/electronicbg.png';

const Hero = () => {
  const navigate = useNavigate();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isWebView, setIsWebView] = useState(false);
  const heroRef = useRef(null);
  const lenisRef = useRef(null);
  const bannerIntervalRef = useRef(null);
  const placeholderIntervalRef = useRef(null);

  const placeholders = [
    'Search here...',
    'Search for scrap types...',
    'Find nearby scrappers...',
    'Search by material...',
    'Look for pickup services...',
  ];

  useEffect(() => {
    // Detect if running in webview
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isWebViewDetected = 
      /wv/i.test(userAgent) || // Android WebView
      /WebView/i.test(userAgent) || // iOS WebView
      (window.ReactNativeWebView !== undefined); // React Native WebView
    
    setIsWebView(isWebViewDetected);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Hero entrance animation
    gsap.from(heroRef.current, {
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    });

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 3);
    }, 4000); // Change banner every 4 seconds

    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, []);

  // Auto-rotate placeholder text with fast animation
  useEffect(() => {
    placeholderIntervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 2000); // Change placeholder every 2 seconds (faster)

    return () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
      }
    };
  }, []);

  const banners = [
    {
      title: 'REDUCE REUSE RECYCLE',
      description: 'Learn tips to apply these 3 steps and earn money from your scrap.',
      image: scrapImage,
    },
    {
      title: 'GET BEST PRICES',
      description: 'Real-time market rates ensure you get the maximum value for your scrap materials.',
      image: scrapImage2,
    },
    {
      title: 'VERIFIED COLLECTORS',
      description: 'All our scrappers are KYC verified and background checked for your safety.',
      image: scrapImage3,
    },
  ];

  return (
    <>
    <AnimatePresence mode="wait">
      {showProfile ? (
        <Profile onClose={() => setShowProfile(false)} />
      ) : (
        <div 
          ref={heroRef} 
          className="min-h-screen relative z-0 pb-20 md:pb-0 overflow-x-hidden"
          style={{ backgroundColor: '#f4ebe2' }}
        >
      {/* Header */}
      <Header />

      {/* Search Bar */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto mb-4 md:mb-6">
        <motion.div
          initial={{ y: 5 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div 
            className="flex items-center rounded-full px-4 py-3 md:py-4 border transition-all"
            style={{ 
              backgroundColor: '#ffffff',
              borderColor: '#e5ddd4',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-3"
              style={{ color: '#64946e' }}
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
            </svg>
            <div className="flex-1 relative">
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-sm md:text-base w-full"
                style={{ color: '#2d3748' }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPlaceholder}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="absolute left-0 top-0 pointer-events-none text-sm md:text-base flex items-center h-full"
                  style={{ 
                    color: '#a0aec0'
                  }}
                >
                  {placeholders[currentPlaceholder]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Hero Content */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Value Proposition Section with Image */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 md:mt-6 lg:mt-12 xl:mt-16"
        >
          <div className="flex flex-row items-center md:items-start gap-3 md:gap-6 lg:gap-8">
            {/* Left Side - Text and Button */}
            <div className="flex-1 text-left">
              <h1 
                className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-4 lg:mb-6 leading-tight ${isWebView ? 'text-left' : 'text-right'}`}
                style={{ color: '#2d3748' }}
              >
                Sell Your Scrap
                <br />
                <span style={{ color: '#64946e' }}>We'll Pick It Up</span>
              </h1>
              <p 
                className="hidden md:block text-base md:text-lg lg:text-xl xl:text-2xl mb-4 md:mb-6 lg:mb-8 max-w-2xl"
                style={{ color: '#4a5568' }}
              >
                Real-time market prices. Verified scrappers. Cash on pickup.
                <br />
                <span className="text-sm md:text-base lg:text-lg mt-2 block" style={{ color: '#718096' }}>
                  Learn how to get the best value for your scrap materials.
                </span>
              </p>
              
              {/* Primary CTA */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`flex mb-4 md:mb-8 lg:mb-12 ${isWebView ? 'justify-start' : 'justify-end'}`}
              >
                <button
                  onClick={() => setShowOTPModal(true)}
                  className="text-white font-semibold py-2 px-6 md:py-4 md:px-8 lg:py-5 lg:px-12 xl:py-6 xl:px-16 rounded-full text-sm md:text-lg lg:text-xl xl:text-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#64946e' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a8263'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#64946e'}
                >
                  Request Pickup Now
                </button>
              </motion.div>
            </div>

            {/* Image - No Container Div with Circular Rotation */}
            <motion.img
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                rotate: 360,
              }}
              transition={{ 
                opacity: { duration: 0.6, delay: 0.4 },
                x: { duration: 0.6, delay: 0.4 },
                rotate: { 
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }
              }}
              src={scrapImage} 
              alt="Scrap collection" 
              className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 h-auto object-cover"
              style={{ 
                background: 'transparent',
                transformOrigin: 'center center',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Promotional Banner Carousel */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative rounded-2xl md:rounded-3xl mb-8 md:mb-12 overflow-hidden"
          style={{ backgroundColor: '#64946e', minHeight: '150px' }}
        >
          {/* Banner Slides */}
          <div className="relative h-full">
            {banners.map((banner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === currentBanner ? 0 : (index < currentBanner ? -100 : 100) }}
                animate={{ 
                  opacity: index === currentBanner ? 1 : 0,
                  x: index === currentBanner ? 0 : (index < currentBanner ? -100 : 100),
                  display: index === currentBanner ? 'block' : 'none'
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 p-4 md:p-6 lg:p-8 flex items-center"
              >
                <div className="relative z-10 flex flex-row items-center justify-between w-full gap-4 md:gap-6">
                  {/* Left Side - Content */}
                  <div className="flex-1 text-left">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2">
                      {banner.title}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base mb-2 md:mb-3">
                      {banner.description}
                    </p>
                    <button 
                      className="font-semibold py-1.5 px-4 md:py-2 md:px-5 rounded-full text-xs md:text-sm transition-all duration-300"
                      style={{ 
                        backgroundColor: '#f4ebe2',
                        color: '#64946e'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#e8ddd0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f4ebe2';
                      }}
                    >
                      More Information
                    </button>
                  </div>

                  {/* Right Side - Image */}
                  <div className="flex-shrink-0 w-24 sm:w-32 md:w-40 lg:w-48">
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="w-full h-auto object-cover rounded-lg"
                      style={{ background: 'transparent' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Banner Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentBanner(index);
                  if (bannerIntervalRef.current) {
                    clearInterval(bannerIntervalRef.current);
                  }
                  bannerIntervalRef.current = setInterval(() => {
                    setCurrentBanner((prev) => (prev + 1) % 3);
                  }, 4000);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBanner ? 'w-8' : ''
                }`}
                style={{
                  backgroundColor: index === currentBanner ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live Price Ticker */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <PriceTicker />
      </div>

      {/* Micro Demo Animation */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <MicroDemo />
      </div>

      {/* Trust Signals */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <TrustSignals />
      </div>

      {/* Scrap Categories */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 md:mt-12 mb-8"
        >
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 
              className="text-xl md:text-2xl font-bold"
              style={{ color: '#2d3748' }}
            >
              Scrap Categories
            </h3>
            <button 
              className="text-sm md:text-base font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#64946e' }}
            >
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pl-0">
            {[
              { 
                name: 'Plastic', 
                image: plasticImage
              },
              { 
                name: 'Metal', 
                image: metalImage
              },
              { 
                name: 'Paper', 
                image: scrapImage2
              },
              { 
                name: 'Electronics', 
                image: electronicImage
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex-shrink-0 w-32 md:w-40 lg:w-48"
              >
                <div 
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100" style={{ width: '100%' }}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <p 
                      className="text-sm md:text-base font-semibold text-center"
                      style={{ color: '#2d3748' }}
                    >
                      {category.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Why ScrapConnect Section */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-6 md:mt-12 mb-6 md:mb-8"
        >
          <h3 
            className="text-lg md:text-2xl font-bold mb-4 md:mb-8 text-center"
            style={{ color: '#2d3748' }}
          >
            Why ScrapConnect?
          </h3>
          <div className="flex flex-row md:flex-row gap-2 md:gap-6 overflow-x-auto pb-2 md:pb-4 scrollbar-hide">
            {[
              { 
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                ), 
                title: 'Best Prices', 
                desc: 'Real-time rates'
              },
              { 
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                ), 
                title: 'Verified', 
                desc: 'KYC checked'
              },
              { 
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
                  </svg>
                ), 
                title: 'Quick Pickup', 
                desc: 'Same day'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                className="flex-shrink-0 w-28 md:w-1/3"
              >
                <div 
                  className="rounded-xl md:rounded-2xl p-3 md:p-8 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(100, 148, 110, 0.15)',
                    minHeight: 'auto'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                    {/* Icon Container */}
                    <div 
                      className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: 'rgba(100, 148, 110, 0.1)',
                        color: '#64946e'
                      }}
                    >
                      {item.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-bold text-xs md:text-xl mb-1 md:mb-2 truncate"
                        style={{ color: '#2d3748' }}
                      >
                        {item.title}
                      </h4>
                      <p 
                        className="text-xs md:text-base leading-tight md:leading-relaxed text-gray-600"
                        style={{ color: '#718096' }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* Decorative accent line - hidden on mobile */}
                  <div 
                    className="hidden md:block mt-4 h-1 rounded-full"
                    style={{ 
                      backgroundColor: '#64946e',
                      width: '40px'
                    }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Social Proof - Testimonials */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <Testimonials />
      </div>

      {/* OTP Modal */}
      {showOTPModal && <OTPModal onClose={() => setShowOTPModal(false)} />}
      </div>
      )}
    </AnimatePresence>

      {/* Bottom Navigation (Mobile Only - Fixed to Viewport) - Always visible */}
      <div 
        className="fixed md:hidden bottom-0 left-0 right-0 w-full bg-green-700 shadow-2xl z-[9999]"
      >
        <div className="flex justify-around items-center py-3 px-4">
          <div 
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setShowProfile(false)}
          >
            <div 
              className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${!showProfile ? 'bg-green-600' : 'bg-transparent'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xs text-white font-medium">Home</span>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => navigate('/add-scrap/category')}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg bg-white"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div 
            className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => setShowProfile(true)}
          >
            <div className={`w-6 h-6 mb-1 flex items-center justify-center ${showProfile ? 'bg-green-600 rounded-full' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="text-xs text-white font-medium">Profile</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
