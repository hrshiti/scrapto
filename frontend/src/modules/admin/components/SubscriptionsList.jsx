import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCreditCard, FaSearch, FaCheckCircle, FaTimesCircle, FaClock,
  FaEye, FaCalendarAlt, FaRupeeSign, FaUser
} from 'react-icons/fa';

const SubscriptionsList = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, expired, cancelled
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    // Load subscriptions from localStorage
    const scrapperSubscription = localStorage.getItem('scrapperSubscription');
    const scrapperSubscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
    const scrapperUser = localStorage.getItem('scrapperUser');

    const subscriptionList = [];

    if (scrapperSubscription && scrapperUser) {
      const sub = JSON.parse(scrapperSubscription);
      const user = JSON.parse(scrapperUser);
      subscriptionList.push({
        id: 'sub_001',
        scrapperId: 'scrapper_001',
        scrapperName: user.name || 'Scrapper',
        scrapperPhone: user.phone || 'N/A',
        planId: sub.planId || 'basic',
        planName: sub.planName || 'Basic Plan',
        price: sub.price || 99,
        status: scrapperSubscriptionStatus || 'active',
        subscribedAt: sub.subscribedAt || new Date().toISOString(),
        expiryDate: sub.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Add mock data
    const mockSubscriptions = [
      {
        id: 'sub_002',
        scrapperId: 'scrapper_002',
        scrapperName: 'Rajesh Kumar',
        scrapperPhone: '+91 98765 43210',
        planId: 'pro',
        planName: 'Pro Plan',
        price: 199,
        status: 'active',
        subscribedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sub_003',
        scrapperId: 'scrapper_003',
        scrapperName: 'Amit Sharma',
        scrapperPhone: '+91 98765 43211',
        planId: 'basic',
        planName: 'Basic Plan',
        price: 99,
        status: 'expired',
        subscribedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sub_004',
        scrapperId: 'scrapper_004',
        scrapperName: 'Priya Patel',
        scrapperPhone: '+91 98765 43212',
        planId: 'pro',
        planName: 'Pro Plan',
        price: 199,
        status: 'active',
        subscribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sub_005',
        scrapperId: 'scrapper_005',
        scrapperName: 'Suresh Reddy',
        scrapperPhone: '+91 98765 43213',
        planId: 'basic',
        planName: 'Basic Plan',
        price: 99,
        status: 'cancelled',
        subscribedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        cancelledAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setSubscriptions([...subscriptionList, ...mockSubscriptions]);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.status === filter;
    const matchesSearch =
      sub.scrapperName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.scrapperPhone.includes(searchQuery) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (sub) => {
    // Navigate to scrapper detail page
    if (sub.scrapperId) {
      navigate(`/admin/scrappers/${sub.scrapperId}`);
    } else {
      alert(`Subscription Details:\n\nScrapper: ${sub.scrapperName}\nPlan: ${sub.planName}\nPrice: ₹${sub.price}/month\nStatus: ${sub.status}`);
    }
  };

  const handleExtendSubscription = (subId, days = 30) => {
    const updatedSubs = subscriptions.map(sub => {
      if (sub.id === subId) {
        const currentExpiry = new Date(sub.expiryDate);
        const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
        return {
          ...sub,
          expiryDate: newExpiry.toISOString(),
          status: 'active'
        };
      }
      return sub;
    });
    setSubscriptions(updatedSubs);
    alert(`Subscription extended by ${days} days`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#d1fae5', color: '#10b981', icon: FaCheckCircle },
      expired: { bg: '#fee2e2', color: '#dc2626', icon: FaTimesCircle },
      cancelled: { bg: '#fee2e2', color: '#dc2626', icon: FaTimesCircle },
      pending: { bg: '#fef3c7', color: '#f59e0b', icon: FaClock }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
      </span>
    );
  };

  const getDaysRemaining = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#2d3748' }}>
              Subscription Management
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              Manage all scrapper subscriptions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                Monthly Revenue: ₹{totalRevenue}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-xs md:text-base" style={{ color: '#718096' }} />
            <input
              type="text"
              placeholder="Search by scrapper name, phone, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
              style={{
                borderColor: '#e2e8f0',
                focusBorderColor: '#64946e',
                focusRingColor: '#64946e'
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {['all', 'active', 'expired', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${filter === status ? 'shadow-md' : ''
                  }`}
                style={{
                  backgroundColor: filter === status ? '#64946e' : '#f7fafc',
                  color: filter === status ? '#ffffff' : '#2d3748'
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subscriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredSubscriptions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaCreditCard className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No subscriptions found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'No subscriptions found'}
              </p>
            </motion.div>
          ) : (
            filteredSubscriptions.map((sub, index) => {
              const daysRemaining = getDaysRemaining(sub.expiryDate);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${index !== filteredSubscriptions.length - 1 ? 'border-b' : ''
                    }`}
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    {/* Subscription Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
                        <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                          {sub.scrapperName}
                        </h3>
                        {getStatusBadge(sub.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-3 text-xs md:text-sm" style={{ color: '#718096' }}>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <FaUser className="text-xs" />
                          <span className="truncate">{sub.scrapperPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <FaCreditCard className="text-xs" />
                          <span className="font-semibold" style={{ color: '#2d3748' }}>{sub.planName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <FaRupeeSign className="text-xs" />
                          <span>₹{sub.price}/month</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <FaCalendarAlt className="text-xs" />
                          <span className="text-xs">
                            {sub.status === 'active'
                              ? `${daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}`
                              : `Expired on ${new Date(sub.expiryDate).toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(sub)}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                        style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                      >
                        <FaEye className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">View</span>
                      </motion.button>
                      {sub.status === 'active' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExtendSubscription(sub.id, 30)}
                          className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all"
                          style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
                        >
                          Extend
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SubscriptionsList;

