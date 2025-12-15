import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  getReferralAnalytics, 
  getTopReferrers,
  getAllReferrals 
} from '../../shared/utils/referralUtils';
import {
  FaChartBar,
  FaUsers,
  FaTruck,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaDownload
} from 'react-icons/fa';

const ReferralAnalytics = () => {
  const [period, setPeriod] = useState('all'); // all, today, week, month
  const [analytics, setAnalytics] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = () => {
    const analyticsData = getReferralAnalytics(period);
    setAnalytics(analyticsData);
    
    const topUsers = getTopReferrers(10, 'user', period);
    const topScrappers = getTopReferrers(10, 'scrapper', period);
    setTopReferrers([...topUsers, ...topScrappers].sort((a, b) => b.totalReferrals - a.totalReferrals).slice(0, 10));
  };

  const handleExport = () => {
    alert('Export functionality will be implemented with backend integration');
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#718096' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
            >
              <FaChartBar className="text-3xl" style={{ color: '#64946e' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d3748' }}>
                Referral Analytics
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                Comprehensive referral system insights
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
            style={{ backgroundColor: '#64946e', color: '#ffffff' }}
          >
            <FaDownload />
            Export
          </motion.button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {['all', 'today', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all capitalize ${
                period === p ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: period === p ? '#64946e' : '#f7fafc',
                color: period === p ? '#ffffff' : '#2d3748'
              }}
            >
              {p === 'all' ? 'All Time' : p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-xl" style={{ color: '#64946e' }} />
            <FaArrowUp className="text-sm" style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#2d3748' }}>
            {analytics.totalReferrals}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>Total Referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FaCheckCircle className="text-xl" style={{ color: '#64946e' }} />
            <FaArrowUp className="text-sm" style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#2d3748' }}>
            {analytics.activeReferrals}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>Active Referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FaRupeeSign className="text-xl" style={{ color: '#64946e' }} />
            <FaArrowUp className="text-sm" style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#2d3748' }}>
            ₹{analytics.totalRewardsPaid.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>Total Rewards Paid</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FaChartBar className="text-xl" style={{ color: '#64946e' }} />
            <FaArrowUp className="text-sm" style={{ color: '#10b981' }} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#2d3748' }}>
            {analytics.conversionRate}%
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>Conversion Rate</p>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="text-xl" style={{ color: '#64946e' }} />
            <h3 className="font-bold" style={{ color: '#2d3748' }}>User Referrals</h3>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: '#64946e' }}>
            {analytics.userReferrals}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>
            {analytics.totalReferrals > 0 
              ? `${((analytics.userReferrals / analytics.totalReferrals) * 100).toFixed(1)}% of total`
              : '0% of total'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaTruck className="text-xl" style={{ color: '#64946e' }} />
            <h3 className="font-bold" style={{ color: '#2d3748' }}>Scrapper Referrals</h3>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: '#64946e' }}>
            {analytics.scrapperReferrals}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>
            {analytics.totalReferrals > 0 
              ? `${((analytics.scrapperReferrals / analytics.totalReferrals) * 100).toFixed(1)}% of total`
              : '0% of total'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="text-xl" style={{ color: '#3b82f6' }} />
            <h3 className="font-bold" style={{ color: '#2d3748' }}>Cross-Referrals</h3>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: '#3b82f6' }}>
            {analytics.crossReferrals}
          </p>
          <p className="text-xs" style={{ color: '#718096' }}>
            {analytics.totalReferrals > 0 
              ? `${((analytics.crossReferrals / analytics.totalReferrals) * 100).toFixed(1)}% of total`
              : '0% of total'}
          </p>
        </motion.div>
      </div>

      {/* Top Referrers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaTrophy className="text-xl" style={{ color: '#64946e' }} />
          <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
            Top 10 Referrers
          </h2>
        </div>
        <div className="space-y-3">
          {topReferrers.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: '#718096' }}>
              No referrers yet
            </p>
          ) : (
            topReferrers.map((referrer, index) => (
              <div
                key={`${referrer.referrerType}_${referrer.referrerId}`}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: '#f7fafc' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ 
                      backgroundColor: index < 3 ? '#ffd700' : 'rgba(100, 148, 110, 0.1)',
                      color: index < 3 ? '#2d3748' : '#64946e'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                      {referrer.referrerType === 'user' ? 'User' : 'Scrapper'} #{referrer.referrerId.slice(-6)}
                    </p>
                    <p className="text-xs" style={{ color: '#718096' }}>
                      {referrer.totalReferrals} referrals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#64946e' }}>
                    ₹{referrer.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: '#718096' }}>
                    Earnings
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReferralAnalytics;

