import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { kycAPI, subscriptionAPI, reviewAPI, scrapperProfileAPI } from '../../shared/utils/api';
import RatingDisplay from '../../shared/components/RatingDisplay';
import { usePageTranslation } from '../../../hooks/usePageTranslation';

const ScrapperProfile = () => {
  const staticTexts = [
    "Loading profile...",
    "Scrapper Profile",
    "Close",
    "Scrapper",
    "Phone not set",
    "Logout",
    "Verified",
    "Pending",
    "Rejected",
    "Not Submitted",
    "No subscription",
    "{planName} active",
    "Vehicle not set",
    "Profile details",
    "Edit profile",
    "Name",
    "Phone",
    "Vehicle",
    "Not provided",
    "Heard about Scrapto",
    "Profile editing will be available soon.",
    "KYC status",
    "View",
    "Subscription",
    "{planName} • ₹{price}/month",
    "No active subscription",
    "Manage",
    "Active requests",
    "View and manage current pickups",
    "Earnings & history",
    "Check completed pickups and payouts",
    "Refer & Earn",
    "Share your code and earn extra on pickups",
    "Terms & Conditions",
    "Read how Scrapto works for scrappers",
    "Terms & Conditions screen will be added later.",
    "Help & Support",
    "Get help for any issue"
  ];
  const { getTranslatedText } = usePageTranslation(staticTexts);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrapperUser, setScrapperUser] = useState(user);
  const [rating, setRating] = useState({ average: 0, count: 0, breakdown: null });

  useEffect(() => {
    const fetchScrapperData = async () => {
      try {
        setLoading(true);

        // Verify authentication
        if (!user || user.role !== 'scrapper') {
          navigate('/scrapper/login', { replace: true });
          return;
        }

        setScrapperUser(user);

        // Fetch KYC status from API
        try {
          const kycResponse = await kycAPI.getMy();
          if (kycResponse.success && kycResponse.data?.kyc) {
            setKycStatus(kycResponse.data.kyc.status || 'not_submitted');
          }
        } catch (kycError) {
          console.error('Error fetching KYC:', kycError);
          setKycStatus('not_submitted');
        }

        // Fetch subscription status from API
        try {
          const subResponse = await subscriptionAPI.getMySubscription();
          if (subResponse.success && subResponse.data?.subscription) {
            const sub = subResponse.data.subscription;
            setSubscription({
              status: sub.status,
              planId: sub.planId?._id || sub.planId,
              planName: sub.planId?.name || 'Unknown Plan',
              price: sub.planId?.price || 0,
              startDate: sub.startDate,
              expiryDate: sub.expiryDate,
              autoRenew: sub.autoRenew
            });
          }
        } catch (subError) {
          console.error('Error fetching subscription:', subError);
          setSubscription(null);
        }

        // Fetch detailed Scrapper Profile (including ratings)
        try {
          const profileResponse = await scrapperProfileAPI.getMyProfile();
          if (profileResponse.success && profileResponse.data?.scrapper) {
            const scrapperData = profileResponse.data.scrapper;

            // Update scrapper user with more details if needed
            setScrapperUser(prev => ({ ...prev, ...scrapperData }));

            // Set Rating
            if (scrapperData.rating) {
              setRating({
                average: parseFloat(scrapperData.rating.average || 0),
                count: scrapperData.rating.count || 0,
                breakdown: scrapperData.rating.breakdown || null
              });
            }
          }
        } catch (profileError) {
          console.error('Error fetching scrapper profile:', profileError);
        }
      } catch (error) {
        console.error('Error fetching scrapper data:', error);
        navigate('/scrapper/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchScrapperData();
  }, [user, navigate]);

  const handleLogout = () => {
    // Clear scrapper flags plus global auth
    localStorage.removeItem('scrapperAuthenticated');
    localStorage.removeItem('scrapperUser');
    logout();
    navigate('/scrapper/login', { replace: true });
  };

  const getKycLabel = () => {
    switch (kycStatus) {
      case 'verified':
        return { label: getTranslatedText('Verified'), color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' };
      case 'pending':
        return { label: getTranslatedText('Pending'), color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
      case 'rejected':
        return { label: getTranslatedText('Rejected'), color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { label: getTranslatedText('Not Submitted'), color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const kycConfig = getKycLabel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-green-600 mx-auto mb-4 animate-spin" />
          <p style={{ color: '#718096' }}>{getTranslatedText("Loading profile...")}</p>
        </div>
      </div>
    );
  }

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
            {getTranslatedText("Scrapper Profile")}
          </h1>
          <button
            onClick={() => navigate('/scrapper')}
            className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#64946e', backgroundColor: 'rgba(100,148,110,0.12)' }}
          >
            {getTranslatedText("Close")}
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
                      {scrapperUser?.name || getTranslatedText('Scrapper')}
                    </h2>
                    <p
                      className="text-sm md:text-base"
                      style={{ color: '#718096' }}
                    >
                      {scrapperUser?.phone || getTranslatedText('Phone not set')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0"
                    style={{ borderColor: '#fecaca', color: '#b91c1c', backgroundColor: '#fef2f2' }}
                  >
                    {getTranslatedText("Logout")}
                  </button>
                </div>

                {/* Rating Display */}
                {rating.count > 0 && (
                  <div className="mt-2 mb-2">
                    <RatingDisplay
                      averageRating={rating.average}
                      totalReviews={rating.count}
                      breakdown={rating.breakdown}
                      showBreakdown={false}
                      size="sm"
                    />
                  </div>
                )}

                <div className="flex items-center flex-wrap gap-2 mt-2">
                  {/* KYC badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: kycConfig.bg, color: kycConfig.color }}
                  >
                    {getTranslatedText("KYC:")} {kycConfig.label}
                  </span>
                  {/* Subscription badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: subscription ? 'rgba(100,148,110,0.1)' : 'rgba(148,163,184,0.2)',
                      color: subscription ? '#166534' : '#4b5563'
                    }}
                  >
                    {subscription ? getTranslatedText("{planName} active", { planName: subscription.planName }) : getTranslatedText('No subscription')}
                  </span>
                  {/* Vehicle info small badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(148,163,184,0.16)', color: '#4b5563' }}
                  >
                    {scrapperUser?.vehicleInfo || getTranslatedText('Vehicle not set')}
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
                {getTranslatedText("Profile details")}
              </p>
              <button
                type="button"
                className="text-[11px] md:text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(100,148,110,0.08)', color: '#166534' }}
                onClick={() => {
                  alert(getTranslatedText('Profile editing will be available soon.'));
                }}
              >
                {getTranslatedText("Edit profile")}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] md:text-xs" style={{ color: '#4b5563' }}>
              <span>{getTranslatedText("Name")}</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.name || '-'}
              </span>
              <span>{getTranslatedText("Phone")}</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.phone || '-'}
              </span>
              <span>{getTranslatedText("Vehicle")}</span>
              <span className="font-semibold text-right" style={{ color: '#111827' }}>
                {scrapperUser?.vehicleInfo || getTranslatedText('Not provided')}
              </span>
              {scrapperUser?.heardFrom && (
                <>
                  <span>{getTranslatedText("Heard about Scrapto")}</span>
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
                  {getTranslatedText("KYC status")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {kycConfig.label}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: kycConfig.bg, color: kycConfig.color }}
              >
                {getTranslatedText("View")}
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
                  {getTranslatedText("Subscription")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {subscription
                    ? getTranslatedText("{planName} • ₹{price}/month", { planName: subscription.planName, price: subscription.price })
                    : getTranslatedText('No active subscription')}
                </p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: 'rgba(100,148,110,0.1)', color: '#166534' }}
              >
                {getTranslatedText("Manage")}
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
                  {getTranslatedText("Active requests")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {getTranslatedText("View and manage current pickups")}
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
                  {getTranslatedText("Earnings & history")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {getTranslatedText("Check completed pickups and payouts")}
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
                  {getTranslatedText("Refer & Earn")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {getTranslatedText("Share your code and earn extra on pickups")}
                </p>
              </div>
              <span className="text-sm" style={{ color: '#6b7280' }}>
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert(getTranslatedText('Terms & Conditions screen will be added later.'));
              }}
              className="w-full flex items-center justify-between px-3 md:px-4 py-3 md:py-3.5 text-left"
            >
              <div>
                <p className="text-xs md:text-sm font-semibold" style={{ color: '#111827' }}>
                  {getTranslatedText("Terms & Conditions")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {getTranslatedText("Read how Scrapto works for scrappers")}
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
                  {getTranslatedText("Help & Support")}
                </p>
                <p className="text-[11px] md:text-xs" style={{ color: '#6b7280' }}>
                  {getTranslatedText("Get help for any issue")}
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


