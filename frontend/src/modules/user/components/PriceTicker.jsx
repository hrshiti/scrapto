import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEffectivePriceFeed } from '../../shared/utils/priceFeedUtils';

const PriceTicker = () => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const feed = getEffectivePriceFeed();
    const mapped = feed.map((item) => ({
      type: item.category,
      price: item.pricePerKg,
      unit: 'kg',
      change: null
    }));
    setPrices(mapped);
  }, []);

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="mb-8 md:mb-12"
    >
      <div 
        className="rounded-xl shadow-md p-4 md:p-6 overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 
            className="text-lg md:text-xl font-bold"
            style={{ color: '#2d3748' }}
          >
            Live Market Prices
          </h3>
          <span 
            className="text-xs md:text-sm"
            style={{ color: '#718096' }}
          >
            Source: Admin price feed
          </span>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2">
          {prices.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              className="flex-shrink-0 rounded-lg p-3 md:p-4 min-w-[120px] md:min-w-[140px]"
              style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
            >
              <p 
                className="text-xs md:text-sm mb-1"
                style={{ color: '#718096' }}
              >
                {item.type}
              </p>
              <p 
                className="text-base md:text-lg font-bold"
                style={{ color: '#64946e' }}
              >
                ₹{item.price.toFixed(0)}/{item.unit}
              </p>
              {item.change !== undefined && item.change !== null && (
                <p 
                  className="text-xs"
                  style={{ color: item.change.startsWith('+') ? '#64946e' : '#e53e3e' }}
                >
                  {item.change}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PriceTicker;

