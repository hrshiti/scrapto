import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAllReferrals } from '../../shared/utils/referralUtils';
import {
  FaGift,
  FaSearch,
  FaFilter,
  FaUsers,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaEye
} from 'react-icons/fa';

const ReferralsList = () => {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, user, scrapper
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending

  useEffect(() => {
    loadReferrals();
  }, []);

  useEffect(() => {
    filterReferrals();
  }, [searchTerm, filterType, filterStatus, referrals]);

  const loadReferrals = () => {
    const allReferrals = getAllReferrals();
    setReferrals(allReferrals);
    setFilteredReferrals(allReferrals);
  };

  const filterReferrals = () => {
    let filtered = [...referrals];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(ref => ref.referrerType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ref => ref.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ref =>
        ref.referrerCode.toLowerCase().includes(term) ||
        ref.referrerId.toLowerCase().includes(term) ||
        ref.refereeId.toLowerCase().includes(term)
      );
    }

    setFilteredReferrals(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: FaCheckCircle, text: 'Active' },
      pending: { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', icon: FaClock, text: 'Pending' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
        style={{ backgroundColor: badge.bg, color: badge.color }}
      >
        <Icon />
        {badge.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'scrapper') {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
        >
          <FaTruck />
          Scrapper
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
      >
        <FaUsers />
        User
      </span>
    );
  };

  const getTotalRewards = (referral) => {
    const referrerRewards = referral.rewards?.referrerRewards || [];
    return referrerRewards.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

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
              <FaGift className="text-3xl" style={{ color: '#64946e' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d3748' }}>
                All Referrals
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                View and manage all referral relationships
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: '#64946e' }}>
              {referrals.length}
            </p>
            <p className="text-xs" style={{ color: '#718096' }}>
              Total Referrals
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#718096' }} />
            <input
              type="text"
              placeholder="Search by code, referrer, or referee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
              style={{
                borderColor: '#e2e8f0',
                backgroundColor: '#f7fafc',
                color: '#2d3748'
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
            style={{
              borderColor: '#e2e8f0',
              backgroundColor: '#f7fafc',
              color: '#2d3748'
            }}
          >
            <option value="all">All Types</option>
            <option value="user">User Referrals</option>
            <option value="scrapper">Scrapper Referrals</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
            style={{
              borderColor: '#e2e8f0',
              backgroundColor: '#f7fafc',
              color: '#2d3748'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredReferrals.length === 0 ? (
            <div className="p-12 text-center">
              <FaGift className="text-5xl mx-auto mb-4" style={{ color: '#cbd5e0' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: '#2d3748' }}>
                No Referrals Found
              </h3>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No referrals have been created yet'}
              </p>
            </div>
          ) : (
            filteredReferrals.map((referral, index) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredReferrals.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Referral Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                      >
                        <FaGift style={{ color: '#64946e', fontSize: '20px' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                            {referral.referrerCode}
                          </h3>
                          {getTypeBadge(referral.referrerType)}
                          {getStatusBadge(referral.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm" style={{ color: '#718096' }}>
                          <div>
                            <span className="font-semibold">Referrer:</span> {referral.referrerId}
                          </div>
                          <div>
                            <span className="font-semibold">Referee:</span> {referral.refereeId}
                          </div>
                          <div>
                            <span className="font-semibold">Type:</span> {referral.referrerType} → {referral.refereeType}
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span> {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <FaRupeeSign style={{ color: '#64946e' }} />
                            <span className="font-semibold" style={{ color: '#2d3748' }}>
                              ₹{getTotalRewards(referral)}
                            </span>
                            <span style={{ color: '#718096' }}>earned</span>
                          </div>
                        </div>
                      </div>
                    </div>
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

export default ReferralsList;

