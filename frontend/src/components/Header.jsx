import { motion } from 'framer-motion';
import { useState } from 'react';

const Header = () => {
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <motion.header
      initial={{ y: -10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 md:px-6 lg:px-8 py-4 md:py-6"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h2
            className="text-xl md:text-2xl font-bold"
            style={{ color: '#2d3748' }}
          >
            
            Hi, User!
          </h2>
          <p 
            className="text-sm md:text-base"
            style={{ color: '#718096' }}
          >
            Welcome back to Scrapto
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setHasNotifications(false)}
            className="relative p-2 rounded-full transition-colors"
            style={{ 
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(100, 148, 110, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: '#64946e' }}
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {hasNotifications && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
              />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

