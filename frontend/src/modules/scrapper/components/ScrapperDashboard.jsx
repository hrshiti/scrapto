import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { FaGift, FaChartLine } from 'react-icons/fa';
import PriceTicker from '../../user/components/PriceTicker';
import ScrapperSolutions from './ScrapperSolutions';
import { getActiveRequestsCount, getScrapperAssignedRequests, migrateOldActiveRequest } from '../../shared/utils/scrapperRequestUtils';
import { earningsAPI, scrapperOrdersAPI } from '../../shared/utils/api';
import { kycAPI } from '../../shared/utils/api';
import BannerSlider from '../../shared/components/BannerSlider';

const ScrapperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [kycStatus, setKycStatus] = useState(null); // Backend KYC status
  const [subscriptionData, setSubscriptionData] = useState(null); // Backend subscription data
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Load earnings and stats from localStorage
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });

  const [stats, setStats] = useState({
    completedPickups: 0,
    rating: 4.8,
    activeRequests: 0
  });
  const [marketSubStatus, setMarketSubStatus] = useState('inactive'); // for real-time market price subscription

  const [completedOrders, setCompletedOrders] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);

  // Function to load and update dashboard data
  const loadDashboardData = async () => {
    try {
      // Load earnings from backend
      const earningsResponse = await earningsAPI.getSummary();
      if (earningsResponse.success && earningsResponse.data?.summary) {
        const summary = earningsResponse.data.summary;
        setEarnings({
          today: summary.today || 0,
          week: summary.week || 0,
          month: summary.month || 0,
          total: summary.total || 0
        });
        setStats(prev => ({
          ...prev,
          completedPickups: summary.completedOrders || 0,
          rating: summary.rating || 5.0
        }));
      } else {
        // Fallback to localStorage if backend fails
        const earningsData = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"today": 0, "week": 0, "month": 0, "total": 0}');
        setEarnings({
          today: earningsData.today || 0,
          week: earningsData.week || 0,
          month: earningsData.month || 0,
          total: earningsData.total || 0
        });
        // We persist stats in a separate key or just keep previous/default
      }
    } catch (error) {
      console.error('Failed to load earnings from backend:', error);
      // Fallback to localStorage
      const earningsData = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"today": 0, "week": 0, "month": 0, "total": 0}');
      setEarnings({
        today: earningsData.today || 0,
        week: earningsData.week || 0,
        month: earningsData.month || 0,
        total: earningsData.total || 0
      });
    }

    try {
      // Load completed orders from backend (earnings history)
      const historyResponse = await earningsAPI.getHistory('limit=100');
      if (historyResponse.success && historyResponse.data?.history) {
        const sortedOrders = historyResponse.data.history;
        setCompletedOrders(sortedOrders);
        setStats(prev => ({
          ...prev,
          completedPickups: sortedOrders.length
        }));
      } else {
        // Fallback to localStorage
        const orders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
        const sortedOrders = orders.sort((a, b) => {
          const dateA = new Date(a.completedAt || a.pickedUpAt || 0);
          const dateB = new Date(b.completedAt || b.pickedUpAt || 0);
          return dateB - dateA;
        });
        setCompletedOrders(sortedOrders);
        setStats(prev => ({
          ...prev,
          completedPickups: orders.length
        }));
      }
    } catch (error) {
      console.error('Failed to load earnings history from backend:', error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
      const sortedOrders = orders.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.pickedUpAt || 0);
        const dateB = new Date(b.completedAt || b.pickedUpAt || 0);
        return dateB - dateA;
      });
      setCompletedOrders(sortedOrders);
    }

    try {
      // Load active requests from backend
      const activeResponse = await scrapperOrdersAPI.getMyAssigned();
      if (activeResponse.success && activeResponse.data?.orders) {
        const active = activeResponse.data.orders.filter(o => {
          const s = o.status?.toLowerCase();
          return s !== 'completed' && s !== 'cancelled';
        });
        setActiveRequests(active);
        setStats(prev => ({
          ...prev,
          activeRequests: active.length
        }));
      } else {
        // Fallback to localStorage
        const requests = getScrapperAssignedRequests();
        const activeCount = requests.filter(req => {
          const s = req.status?.toLowerCase();
          return s !== 'completed' && s !== 'cancelled';
        }).length;
        setActiveRequests(requests.filter(req => {
          const s = req.status?.toLowerCase();
          return s !== 'completed' && s !== 'cancelled';
        }));
        setStats(prev => ({
          ...prev,
          activeRequests: activeCount
        }));
      }
    } catch (error) {
      console.error('Failed to load active requests from backend:', error);
      // Fallback to localStorage
      const requests = getScrapperAssignedRequests();
      const activeCount = requests.filter(req => {
        const s = req.status?.toLowerCase();
        return s !== 'completed' && s !== 'cancelled';
      }).length;
      setActiveRequests(requests.filter(req => {
        const s = req.status?.toLowerCase();
        return s !== 'completed' && s !== 'cancelled';
      }));
      setStats(prev => ({
        ...prev,
        activeRequests: activeCount
      }));
    }

    // Load separate market price subscription status (different from onboarding subscription)
    const marketStatus =
      localStorage.getItem('scrapperMarketPriceSubscriptionStatus') || 'inactive';
    setMarketSubStatus(marketStatus);
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);

    // If turning ON, navigate to active requests page
    if (newAvailability) {
      navigate('/scrapper/active-requests', { replace: false });
    }
    // If turning OFF, stay on dashboard (or you can add logic to go back)
  };

  // Verify authentication and fetch KYC/Subscription status from backend
  useEffect(() => {
    const verifyAndFetchStatus = async () => {
      // Check if user is authenticated as scrapper
      const token = localStorage.getItem('token');
      const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
      const scrapperUser = localStorage.getItem('scrapperUser');

      if (!token || scrapperAuth !== 'true' || !scrapperUser) {
        navigate('/scrapper/login', { replace: true });
        return;
      }

      // Verify token with backend
      try {
        const { authAPI } = await import('../../shared/utils/api');
        const response = await authAPI.getMe();

        if (!response.success || !response.data?.user) {
          // Token invalid
          navigate('/scrapper/login', { replace: true });
          return;
        }

        const userData = response.data.user;

        // Check if user has scrapper role
        if (userData.role !== 'scrapper') {
          console.warn('User does not have scrapper role:', userData.role);
          navigate('/scrapper/login', { replace: true });
          return;
        }

        // Update scrapper-specific localStorage
        localStorage.setItem('scrapperAuthenticated', 'true');
        localStorage.setItem('scrapperUser', JSON.stringify(userData));

        // Check if scrapper is blocked
        const scrapperStatus = localStorage.getItem('scrapperStatus') || 'active';
        if (scrapperStatus === 'blocked') {
          navigate('/scrapper/login', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // On 401, redirect to login
        if (error.status === 401) {
          navigate('/scrapper/login', { replace: true });
          return;
        }
        // For other errors, continue with localStorage check
      }

      // Fetch KYC and Subscription status from backend
      setIsLoadingStatus(true);
      try {
        // Fetch KYC and subscription status from backend
        const res = await kycAPI.getMy();
        const kyc = res.data?.kyc;
        const subscription = res.data?.subscription;

        if (kyc) {
          // Update state with backend data
          setKycStatus(kyc.status || 'not_submitted');

          // Sync with localStorage for compatibility
          localStorage.setItem('scrapperKYCStatus', kyc.status || 'not_submitted');
          localStorage.setItem('scrapperKYC', JSON.stringify(kyc));
        } else {
          setKycStatus('not_submitted');
        }

        if (subscription) {
          // Update state with backend subscription data
          setSubscriptionData(subscription);

          // Check if subscription is actually active (not expired)
          const expiryDate = subscription.expiryDate ? new Date(subscription.expiryDate) : null;
          const now = new Date();
          const isActive = subscription.status === 'active' && expiryDate && expiryDate > now;

          // Sync with localStorage for compatibility
          localStorage.setItem('scrapperSubscriptionStatus', isActive ? 'active' : 'expired');
          if (isActive) {
            localStorage.setItem('scrapperSubscription', JSON.stringify({
              status: 'active',
              expiryDate: subscription.expiryDate,
              startDate: subscription.startDate
            }));
          }
        } else {
          setSubscriptionData(null);
          localStorage.setItem('scrapperSubscriptionStatus', 'expired');
        }

        // Redirect based on REAL backend data
        const backendKycStatus = kyc?.status || 'not_submitted';

        // If KYC not submitted or rejected, redirect to KYC page
        if (!kyc || backendKycStatus === 'rejected' || backendKycStatus === 'not_submitted') {
          navigate('/scrapper/kyc', { replace: true });
          return;
        }

        // If KYC is pending, redirect to status page
        if (backendKycStatus === 'pending') {
          navigate('/scrapper/kyc-status', { replace: true });
          return;
        }

        // If KYC is verified but subscription not active, redirect to subscription page
        if (backendKycStatus === 'verified') {
          const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
          const now = new Date();
          const isSubscriptionActive = subscription?.status === 'active' && expiryDate && expiryDate > now;

          if (!isSubscriptionActive) {
            navigate('/scrapper/subscription', { replace: true });
            return;
          }
        }

        // If KYC not verified, redirect to status page
        if (backendKycStatus !== 'verified') {
          navigate('/scrapper/kyc-status', { replace: true });
          return;
        }

        // If all checks pass (KYC verified + Subscription active), allow dashboard to render
        migrateOldActiveRequest();
        loadDashboardData();
      } catch (error) {
        console.error('Error fetching KYC/Subscription status:', error);
        // On error, check localStorage as fallback
        const fallbackKycStatus = localStorage.getItem('scrapperKYCStatus');
        if (!fallbackKycStatus || fallbackKycStatus === 'not_submitted') {
          navigate('/scrapper/kyc', { replace: true });
          return;
        }
        if (fallbackKycStatus === 'pending') {
          navigate('/scrapper/kyc-status', { replace: true });
          return;
        }
        // If verified in localStorage, allow dashboard (but will show loading)
        loadDashboardData();
      } finally {
        setIsLoadingStatus(false);
      }
    };

    // Call the verifier on mount
    verifyAndFetchStatus();
  }, [navigate]);

  // Poll for KYC/Subscription status updates (every 10 seconds)
  useEffect(() => {
    if (isLoadingStatus) return; // Don't poll while initial load

    const interval = setInterval(async () => {
      try {
        const res = await kycAPI.getMy();
        const kyc = res.data?.kyc;
        const subscription = res.data?.subscription;

        if (kyc) {
          setKycStatus(kyc.status || 'not_submitted');
          localStorage.setItem('scrapperKYCStatus', kyc.status || 'not_submitted');
          localStorage.setItem('scrapperKYC', JSON.stringify(kyc));
        }

        if (subscription) {
          setSubscriptionData(subscription);
          const expiryDate = subscription.expiryDate ? new Date(subscription.expiryDate) : null;
          const now = new Date();
          const isActive = subscription.status === 'active' && expiryDate && expiryDate > now;
          localStorage.setItem('scrapperSubscriptionStatus', isActive ? 'active' : 'expired');
          if (isActive) {
            localStorage.setItem('scrapperSubscription', JSON.stringify({
              status: 'active',
              expiryDate: subscription.expiryDate,
              startDate: subscription.startDate
            }));
          }
        }
      } catch (error) {
        console.error('Error polling KYC/Subscription status:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isLoadingStatus]);

  // Load data from localStorage on mount and when component updates
  useEffect(() => {
    if (!isLoadingStatus) {
      loadDashboardData();
    }
  }, [isLoadingStatus]);

  // Listen for storage changes and page visibility to update dashboard in real-time
  useEffect(() => {
    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', loadDashboardData);

    // Also check on focus (when user comes back to this tab)
    window.addEventListener('focus', loadDashboardData);

    // Check when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', loadDashboardData);
      window.removeEventListener('focus', loadDashboardData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Show loading state while fetching status from backend
  if (isLoadingStatus) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: '#f4ebe2' }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: '#64946e' }}
          />
          <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
            Loading dashboard...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#2d3748' }}>
              Welcome, {user?.name || 'Scrapper'}! 👋
            </h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: '#718096' }}>
              Ready to start earning?
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/scrapper/profile')}
            className="focus:outline-none"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundColor: '#64946e' }}
            >
              <span className="text-white font-bold text-lg">
                {(user?.name || 'S')[0].toUpperCase()}
              </span>
            </div>
          </button>
        </div>

        {/* Availability Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 rounded-xl shadow-md"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isAvailable ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isAvailable ? '#10b981' : '#ef4444' }}
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                {isAvailable ? 'Available for Pickups' : 'Currently Offline'}
              </p>
              <p className="text-xs" style={{ color: '#718096' }}>
                {isAvailable ? 'You will receive requests' : 'Turn on to receive requests'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAvailabilityToggle}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${isAvailable ? 'shadow-lg' : ''
              }`}
            style={{
              backgroundColor: isAvailable ? '#64946e' : 'rgba(100, 148, 110, 0.2)',
              color: isAvailable ? '#ffffff' : '#64946e'
            }}
          >
            {isAvailable ? 'ON' : 'OFF'}
          </motion.button>
        </motion.div>

        {/* Live Market Prices for Scrappers (base admin feed / real-time with add-on) */}
        <div className="mt-4">
          <PriceTicker />
        </div>

        {/* Ad Banners */}
        <div className="mt-4">
          <BannerSlider audience="scrapper" />
        </div>

        {/* Market Price Subscription (separate from onboarding subscription) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 rounded-2xl shadow-md p-4 md:p-5 border border-gray-800"
          style={{ backgroundColor: '#020617' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-1 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)' }}>
                <FaChartLine className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#a5b4fc' }}>
                  Market Price Add‑On
                </p>
                <h3 className="text-sm md:text-base font-bold mb-1" style={{ color: '#e5e7eb' }}>
                  Unlock real‑time scrap rates
                </h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className="mt-1 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold border transition-colors"
                style={{
                  borderColor: '#4b5563',
                  color: '#e5e7eb',
                  backgroundColor: 'transparent'
                }}
              >
                View plans
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
            Earnings Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>Today</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#64946e' }}>
                ₹{earnings.today.toLocaleString()}
              </p>
            </div>
            <div className="p-3 md:p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>This Week</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#64946e' }}>
                ₹{earnings.week.toLocaleString()}
              </p>
            </div>
            <div className="p-3 md:p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>This Month</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#64946e' }}>
                ₹{earnings.month.toLocaleString()}
              </p>
            </div>
            <div className="p-3 md:p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>Total</p>
              <p className="text-lg md:text-2xl font-bold" style={{ color: '#64946e' }}>
                ₹{earnings.total.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h2 className="text-lg md:text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
            Quick Stats
          </h2>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#64946e' }}>
                {stats.completedPickups}
              </p>
              <p className="text-xs md:text-sm" style={{ color: '#718096' }}>Completed</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24" />
                </svg>
                <p className="text-2xl md:text-3xl font-bold" style={{ color: '#64946e' }}>
                  {stats.rating}
                </p>
              </div>
              <p className="text-xs md:text-sm" style={{ color: '#718096' }}>Rating</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <p className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#64946e' }}>
                {stats.activeRequests}
              </p>
              <p className="text-xs md:text-sm" style={{ color: '#718096' }}>Active</p>
            </div>
          </div>
        </motion.div>

        {/* Scrapper Solutions Section */}
        <div className="px-2">
          <ScrapperSolutions />
        </div>

        {/* Active Requests List */}
        {activeRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-4 md:p-6 shadow-lg"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
                Active Requests
              </h2>
              <button
                onClick={() => navigate('/scrapper/my-active-requests')}
                className="text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#166534' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {activeRequests.slice(0, 3).map((request, index) => {
                const statusColors = {
                  accepted: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', label: 'Accepted' },
                  picked_up: { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', label: 'Picked Up' },
                  payment_pending: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', label: 'Payment Pending' }
                };
                const statusConfig = statusColors[request.status] || statusColors.accepted;
                const pickupTime = request.pickupSlot
                  ? `${request.pickupSlot.dayName}, ${request.pickupSlot.date} • ${request.pickupSlot.slot}`
                  : request.preferredTime || 'Time not specified';

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(`/scrapper/active-request/${request.id}`, { state: { request }, replace: false })}
                    className="p-3 md:p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(100, 148, 110, 0.05)',
                      borderColor: 'rgba(100, 148, 110, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
                            <span className="text-xs font-bold" style={{ color: '#64946e' }}>
                              {request.userName?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#2d3748' }}>
                              {request.userName || 'Unknown User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#718096' }}>
                              {request.scrapType || 'Scrap'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-10 space-y-1">
                          {request.location?.address && (
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0 }}>
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                              </svg>
                              <p className="text-xs truncate" style={{ color: '#718096' }}>
                                {request.location.address}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0 }}>
                              <path d="M8 2v2M16 2v2M5 7h14M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-xs truncate" style={{ color: '#718096' }}>
                              {pickupTime}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold mb-1" style={{ color: '#64946e' }}>
                          {request.estimatedEarnings || '₹0'}
                        </p>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {activeRequests.length > 3 && (
              <button
                onClick={() => navigate('/scrapper/my-active-requests')}
                className="w-full mt-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#166534' }}
              >
                View {activeRequests.length - 3} more request{activeRequests.length - 3 > 1 ? 's' : ''}
              </button>
            )}
          </motion.div>
        )}

        {/* Subscription Status - Only show if KYC is verified AND subscription is active (from backend) */}
        {(() => {
          // Use backend data (state) instead of localStorage
          // Only show subscription card if KYC is verified from backend
          if (!kycStatus || kycStatus !== 'verified') {
            return null;
          }

          // Check subscription from backend data
          if (!subscriptionData || subscriptionData.status !== 'active') {
            return null;
          }

          // Check if subscription is not expired
          const expiryDate = subscriptionData.expiryDate ? new Date(subscriptionData.expiryDate) : null;
          const now = new Date();

          if (!expiryDate || expiryDate <= now) {
            return null;
          }

          // Subscription is active and not expired - show card
          const formattedDate = expiryDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-4 md:p-6 shadow-lg"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-bold mb-1" style={{ color: '#2d3748' }}>
                    Subscription Status
                  </h3>
                  <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
                    Active until {formattedDate}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <p className="text-xs md:text-sm font-semibold" style={{ color: '#10b981' }}>
                    Active
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Recent Activity (Completed Orders History) */}
        {completedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 md:p-6 shadow-lg"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/scrapper/earnings')}
                className="text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#166534' }}
              >
                View Earnings
              </button>
            </div>
            <div className="space-y-3">
              {completedOrders.slice(0, 5).map((order, index) => {
                const date = new Date(order.completedAt || order.createdAt);

                return (
                  <motion.div
                    key={order.id || order.orderId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 md:p-4 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}
                      >
                        <span className="text-sm font-bold" style={{ color: '#64946e' }}>
                          ✓
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                          {order.scrapType || 'Scrap Pickup'}
                        </p>
                        <p className="text-xs" style={{ color: '#718096' }}>
                          {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • from {order.userName || 'User'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#64946e' }}>
                        ₹{order.amount || order.totalAmount || 0}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                        Completed
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Refer & Earn Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-4 md:p-6 shadow-lg cursor-pointer"
          style={{ backgroundColor: '#ffffff' }}
          onClick={() => navigate('/scrapper/refer')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
              >
                <FaGift className="text-2xl" style={{ color: '#64946e' }} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold mb-1" style={{ color: '#2d3748' }}>
                  Refer & Earn
                </h3>
                <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
                  Invite scrappers and earn rewards
                </p>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64946e" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </motion.div>

        {/* Orders History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
              Orders History
            </h2>
            {completedOrders.length > 0 && (
              <span className="text-xs md:text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}>
                {completedOrders.length} {completedOrders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>

          {completedOrders.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 17h14l-1-7H6l-1 7z" stroke="#64946e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="7" cy="19" r="1.5" fill="#64946e" />
                  <circle cx="17" cy="19" r="1.5" fill="#64946e" />
                  <path d="M3 12h18" stroke="#64946e" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: '#2d3748' }}>
                No Completed Orders Yet
              </h3>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                Your completed orders will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {completedOrders.map((order, index) => {
                const completedDate = order.completedAt ? new Date(order.completedAt) : null;
                const formattedDate = completedDate
                  ? completedDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : 'Date not available';

                const amount = order.paidAmount || order.finalAmount || order.estimatedEarnings || '₹0';
                const amountValue = typeof amount === 'string' ? amount.replace(/[₹,\s]/g, '') : amount.toString();

                return (
                  <motion.div
                    key={order.id || order.orderId || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-xl border transition-all hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(100, 148, 110, 0.05)',
                      borderColor: 'rgba(100, 148, 110, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
                            <span className="text-xs font-bold" style={{ color: '#64946e' }}>
                              {order.userName?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#2d3748' }}>
                              {order.userName || 'Unknown User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#718096' }}>
                              {order.orderId || order.id || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-10 space-y-1">
                          <p className="text-xs font-medium" style={{ color: '#2d3748' }}>
                            {order.scrapType || 'Scrap'}
                          </p>
                          {order.location?.address && (
                            <div className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0 }}>
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                              </svg>
                              <p className="text-xs truncate" style={{ color: '#718096' }}>
                                {order.location.address}
                              </p>
                            </div>
                          )}
                          {/* Scrap Images */}
                          {order.images && order.images.length > 0 && (
                            <div className="mt-2">
                              <div className="flex gap-1.5">
                                {order.images.slice(0, 4).map((image, imgIdx) => (
                                  <motion.div
                                    key={image.id || imgIdx}
                                    whileHover={{ scale: 1.1 }}
                                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                                  >
                                    <img
                                      src={image.preview || image}
                                      alt={`Scrap ${imgIdx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/48?text=Scrap';
                                      }}
                                    />
                                  </motion.div>
                                ))}
                                {order.images.length > 4 && (
                                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
                                    <span className="text-xs font-bold" style={{ color: '#64946e' }}>
                                      +{order.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold mb-1" style={{ color: '#64946e' }}>
                          {typeof amount === 'string' && amount.includes('₹') ? amount : `₹${amountValue}`}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#10b981' }}>
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-xs font-semibold" style={{ color: '#10b981' }}>
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
                      <p className="text-xs" style={{ color: '#718096' }}>
                        Completed on: {formattedDate}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScrapperDashboard;

