import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTruck, FaSearch, FaUserCheck, FaUserTimes, FaEye, FaPhone, 
  FaIdCard, FaStar, FaRupeeSign, FaCheckCircle, FaClock, FaTimesCircle
} from 'react-icons/fa';

const ScrappersList = () => {
  const navigate = useNavigate();
  const [scrappers, setScrappers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, verified, pending, rejected, blocked
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadScrappersData();
  }, []);

  const loadScrappersData = () => {
    // Aggregate scrapper data from localStorage
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    const kycStatus = localStorage.getItem('scrapperKYCStatus');
    const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
    const scrapperStatus = localStorage.getItem('scrapperStatus') || 'active'; // active | blocked
    const completedOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');

    const scrapperList = [];

    // If there's a scrapper, add it
    if (scrapperAuth === 'true' && scrapperUser) {
      const user = JSON.parse(scrapperUser);
      const earnings = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"total": 0}');
      scrapperList.push({
        id: 'scrapper_001',
        name: user.name || 'Scrapper',
        phone: user.phone || 'N/A',
        kycStatus: kycStatus || 'not_submitted',
        status: scrapperStatus,
        subscriptionStatus: subscriptionStatus || 'not_subscribed',
        rating: 4.8,
        totalPickups: completedOrders.length,
        totalEarnings: earnings.total || 0,
        vehicleInfo: user.vehicleInfo || 'Not provided',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Add mock data
    const mockScrappers = [
      {
        id: 'scrapper_002',
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        kycStatus: 'verified',
        subscriptionStatus: 'active',
        rating: 4.9,
        totalPickups: 45,
        totalEarnings: 125000,
        vehicleInfo: 'Truck - MH-01-AB-1234',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'scrapper_003',
        name: 'Amit Sharma',
        phone: '+91 98765 43211',
        kycStatus: 'pending',
        subscriptionStatus: 'not_subscribed',
        rating: 0,
        totalPickups: 0,
        totalEarnings: 0,
        vehicleInfo: 'Auto Rickshaw - DL-01-CD-5678',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'scrapper_004',
        name: 'Priya Patel',
        phone: '+91 98765 43212',
        kycStatus: 'verified',
        subscriptionStatus: 'active',
        rating: 4.7,
        totalPickups: 32,
        totalEarnings: 89000,
        vehicleInfo: 'Van - GJ-01-EF-9012',
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'scrapper_005',
        name: 'Suresh Reddy',
        phone: '+91 98765 43213',
        kycStatus: 'rejected',
        subscriptionStatus: 'not_subscribed',
        rating: 0,
        totalPickups: 0,
        totalEarnings: 0,
        vehicleInfo: 'Truck - KA-01-GH-3456',
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setScrappers([...scrapperList, ...mockScrappers]);
  };

  const filteredScrappers = scrappers.filter(scrapper => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'blocked'
        ? scrapper.status === 'blocked'
        : scrapper.kycStatus === filter;
    const matchesSearch = 
      scrapper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scrapper.phone.includes(searchQuery) ||
      scrapper.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (scrapperId) => {
    navigate(`/admin/scrappers/${scrapperId}`);
  };

  const getKYCStatusBadge = (status, scrapperStatus) => {
    const styles = {
      verified: { bg: '#d1fae5', color: '#10b981', icon: FaCheckCircle },
      pending: { bg: '#fef3c7', color: '#f59e0b', icon: FaClock },
      rejected: { bg: '#fee2e2', color: '#ef4444', icon: FaUserTimes },
      not_submitted: { bg: '#e2e8f0', color: '#718096', icon: FaIdCard }
    };
    const style = styles[status] || styles.not_submitted;
    const Icon = style.icon;
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">
          {scrapperStatus === 'blocked'
            ? 'Blocked'
            : status === 'not_submitted'
            ? 'Not Submitted'
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <span className="sm:hidden">
          {scrapperStatus === 'blocked'
            ? 'B'
            : status === 'not_submitted'
            ? 'N'
            : status.charAt(0).toUpperCase()}
        </span>
      </span>
    );
  };

  const getSubscriptionBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
          <FaCheckCircle className="text-xs" />
          <span className="hidden sm:inline">Active</span>
          <span className="sm:hidden">A</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
        <FaTimesCircle className="text-xs" />
        <span className="hidden sm:inline">Not Subscribed</span>
        <span className="sm:hidden">N</span>
      </span>
    );
  };

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
              Scrapper Management
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              Manage all registered scrappers on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                {scrappers.length} Total Scrappers
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
              placeholder="Search by name, phone, or vehicle..."
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
            {['all', 'verified', 'pending', 'rejected', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  filter === status ? 'shadow-md' : ''
                }`}
                style={{
                  backgroundColor: filter === status ? '#64946e' : '#f7fafc',
                  color: filter === status ? '#ffffff' : '#2d3748'
                }}
                >
                {status === 'all'
                  ? 'All'
                  : status === 'blocked'
                  ? 'Blocked'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scrappers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredScrappers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaTruck className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No scrappers found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'No scrappers registered yet'}
              </p>
            </motion.div>
          ) : (
            filteredScrappers.map((scrapper, index) => (
              <motion.div
                key={scrapper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredScrappers.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Scrapper Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div
                        className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f7fafc' }}
                      >
                        <FaTruck className="text-lg md:text-2xl" style={{ color: '#64946e' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2 flex-wrap">
                          <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                            {scrapper.name}
                          </h3>
                          {getKYCStatusBadge(scrapper.kycStatus, scrapper.status)}
                          {getSubscriptionBadge(scrapper.subscriptionStatus)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2 text-xs md:text-sm" style={{ color: '#718096' }}>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaPhone className="text-xs" />
                            <span className="truncate">{scrapper.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaStar className="text-xs" style={{ color: '#fbbf24' }} />
                            <span>{scrapper.rating > 0 ? scrapper.rating.toFixed(1) : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaCheckCircle className="text-xs" />
                            <span>{scrapper.totalPickups} Pickups</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaRupeeSign className="text-xs" />
                            <span>₹{scrapper.totalEarnings.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-xs mt-1 md:mt-2" style={{ color: '#718096' }}>
                          🚗 {scrapper.vehicleInfo}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(scrapper.id)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      <FaEye className="text-xs md:text-sm" />
                      <span className="hidden sm:inline">View</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const nextStatus = scrapper.status === 'blocked' ? 'active' : 'blocked';
                        if (
                          window.confirm(
                            `Are you sure you want to ${scrapper.status === 'blocked' ? 'unblock' : 'block'} this scrapper?`
                          )
                        ) {
                          // Persist status for primary scrapper stored in localStorage
                          const stored = localStorage.getItem('scrapperUser');
                          if (stored) {
                            const parsed = JSON.parse(stored);
                            // add status field to scrapperUser so future login checks can read it if needed
                            parsed.status = nextStatus;
                            localStorage.setItem('scrapperUser', JSON.stringify(parsed));
                          }
                          localStorage.setItem('scrapperStatus', nextStatus);

                          // Update local state list
                          setScrappers((prev) =>
                            prev.map((s) =>
                              s.id === scrapper.id
                                ? {
                                    ...s,
                                    status: nextStatus
                                  }
                                : s
                            )
                          );
                        }
                      }}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{
                        backgroundColor: scrapper.status === 'blocked' ? '#dcfce7' : '#fee2e2',
                        color: scrapper.status === 'blocked' ? '#166534' : '#b91c1c'
                      }}
                    >
                      {scrapper.status === 'blocked' ? (
                        <FaUserCheck className="text-xs md:text-sm" />
                      ) : (
                        <FaUserTimes className="text-xs md:text-sm" />
                      )}
                      <span className="hidden sm:inline">
                        {scrapper.status === 'blocked' ? 'Unblock' : 'Block'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ScrappersList;

