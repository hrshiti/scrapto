import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const ScrapperProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
      return;
    }

    const storedKycStatus = localStorage.getItem('scrapperKYCStatus') || 'not_submitted';
    setKycStatus(storedKycStatus);

    const storedSub = localStorage.getItem('scrapperSubscription');
    if (storedSub) {
      try {
        setSubscription(JSON.parse(storedSub));
      } catch {
        setSubscription(null);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear scrapper flags plus global auth
    localStorage.removeItem('scrapperAuthenticated');
    localStorage.removeItem('scrapperUser');
    logout();
    navigate('/scrapper/login', { replace: true });
  };

  const scrapperUser = (() => {
    try {
      const stored = localStorage.getItem('scrapperUser');
      return stored ? JSON.parse(stored) : user;
    } catch {
      return user;
    }
  })();

  const getKycLabel = () => {
    switch (kycStatus) {
      case 'verified':
        return { label: 'Verified', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' };
      case 'pending':
        return { label: 'Pending', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
      case 'rejected':
        return { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { label: 'Not Submitted', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const kycConfig = getKycLabel();
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20 md:pb-0"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Sticky header similar to user profile */}
      <div className="sticky top-0 z-40 px-4 md:px-6 lg:px-8 py-4 md:py-6" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{ color: '#2d3748' }}
          >
            Scrapper Profile
          </h1>
          <button
            onClick={() => navigate('/scrapper')}
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#64946e', backgroundColor: 'rgba(100,148,110,0.12)' }}
          >
            Close
          </button>
        </div>
      </div>
 
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Profile header card – align with user profile style */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-6"
        >
          <div
            className="rounded-2xl p-4 md:p-6 shadow-md"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 relative"
                style={{
                  backgroundColor: 'rgba(100, 148, 110, 0.15)',
                  border: '3px solid rgba(100, 148, 110, 0.3)'
                }}
              >
                <span
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: '#64946e' }}
                >
                  {(scrapperUser?.name || 'S')[0].toUpperCase()}
                </span>
              </div>
 
              {/* Scrapper basic info + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <h2
                      className="text-lg md:text-xl font-bold"
                      style={{ color: '#2d3748' }}
                    >
                      {scrapperUser?.name || 'Scrapper'}
                    </h2>
                    <p
                      className="text-sm md:text-base"
                      style={{ color: '#718096' }}
                    >
                      {scrapperUser?.phone || 'Phone not set'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0"
                    style={{ borderColor: '#fecaca', color: '#b91c1c', backgroundColor: '#fef2f2' }}
                  >
                    Logout
                  </button>
                </div>
 
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  {/* KYC badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: kycConfig.bg, color: kycConfig.color }}
                  >
                    KYC: {kycConfig.label}
                  </span>
                  {/* Subscription badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: subscription ? 'rgba(100,148,110,0.1)' : 'rgba(148,163,184,0.2)',
                      color: subscription ? '#166534' : '#4b5563'
                    }}
                  >
                    {subscription ? `${subscription.planName} active` : 'No subscription'}
                  </span>
                  {/* Vehicle info small badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(148,163,184,0.16)', color: '#4b5563' }}
                  >
                    {scrapperUser?.vehicleInfo || 'Vehicle not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
 
        {/* Details + navigation list – follow user profile feel */}
        <div className="space-y-4 md:space-y-5 pb-4 md:pb-8">
          {/* Compact details card */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3 md:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm font-semibold" style={{ color: '#4b5563' }}>
                Profile details
              </p>
              <button
                type="button"
                className="text-[11px] md:text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(100,148,110,0.08)', color: '#166534' }}
                onClick={() => {
                  alert('Profile editing will be available soon.');
                }}
              >
                Edit profile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] md:text-xs" style={{ color: '#4b5563' }}>
              <span>Name</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.name || '-'}
              </span>
              <span>Phone</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.phone || '-'}
              </span>
              <span>Vehicle</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.vehicleInfo || 'Not provided'}
              </span>
              {scrapperUser?.heardFrom && (
                <>
                  <span>Heard about Scrapto</span>
                  <span className="font-semibold text-right" style={{ color: '#111827' }}>
                    {scrapperUser.heardFrom.startsWith('other:')
                      ? scrapperUser.heardFrom.replace('other:', '')
                      : scrapperUser.heardFrom}
                  </span>
                </>
              )}
            </div>
          </div>
 
          {/* All actions / links in one list */}
          <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-100">
              {/* KYC status */}
              <button
                type="button"
                onClick={() => navigate('/scrapper/kyc-status')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    KYC status
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    {kycConfig.label}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: kycConfig.bg, color: kycConfig.color }}
                >
                  View
                </span>
              </button>

              {/* Subscription */}
              <button
                type="button"
                onClick={() => navigate('/scrapper/subscription')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Subscription
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    {subscription
                      ? `${subscription.planName} • ₹${subscription.price}/month`
                      : 'No active subscription'}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: 'rgba(100,148,110,0.1)', color: '#166534' }}
                >
                  Manage
                </span>
              </button>

              {/* Requests & history */}
              <button
                type="button"
                onClick={() => navigate('/scrapper/my-active-requests')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Active requests
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    View and manage current pickups
                  </p>
                </div>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/scrapper')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Earnings & history
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    Check completed pickups and payouts
                  </p>
                </div>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  ›
                </span>
              </button>

              {/* Refer & legal */}
              <button
                type="button"
                onClick={() => navigate('/scrapper/refer')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Refer & Earn
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    Share your code and earn extra on pickups
                  </p>
                </div>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Terms & Conditions screen will be added later.');
                }}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Terms & Conditions
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    Read how Scrapto works for scrappers
                  </p>
                </div>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  ›
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/scrapper/help')}
                className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
              >
                <div>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                    Help & Support
                  </p>
                  <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                    Get help for any issue
                  </p>
                </div>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  ›
                </span>
              </button>
            </div>
          </div>
        </div>
    </motion.div>
  );
};

export default ScrapperProfile;


