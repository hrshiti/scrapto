import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScrapperAssignedRequests } from '../../shared/utils/scrapperRequestUtils';

const MyActiveRequestsPage = () => {
  const navigate = useNavigate();
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
      return;
    }
  }, [navigate]);

  // Load active requests
  const loadActiveRequests = () => {
    try {
      const requests = getScrapperAssignedRequests();
      const active = requests.filter(req => req.status !== 'completed');
      // Sort by acceptedAt (newest first)
      active.sort((a, b) => {
        const dateA = new Date(a.acceptedAt || 0);
        const dateB = new Date(b.acceptedAt || 0);
        return dateB - dateA;
      });
      setActiveRequests(active);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load active requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveRequests();

    // Refresh on focus/visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadActiveRequests();
      }
    };

    const handleFocus = () => {
      loadActiveRequests();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', loadActiveRequests);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', loadActiveRequests);
    };
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      accepted: {
        bg: 'rgba(59, 130, 246, 0.1)',
        color: '#2563eb',
        label: 'Accepted',
        icon: '✓'
      },
      picked_up: {
        bg: 'rgba(234, 179, 8, 0.1)',
        color: '#ca8a04',
        label: 'Picked Up',
        icon: '📦'
      },
      payment_pending: {
        bg: 'rgba(249, 115, 22, 0.1)',
        color: '#f97316',
        label: 'Payment Pending',
        icon: '💰'
      }
    };
    return configs[status] || configs.accepted;
  };

  const formatPickupTime = (request) => {
    if (request.pickupSlot) {
      return `${request.pickupSlot.dayName}, ${request.pickupSlot.date} • ${request.pickupSlot.slot}`;
    }
    if (request.preferredTime) {
      return request.preferredTime;
    }
    return 'Time not specified';
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#f4ebe2' }}>
        <p style={{ color: '#718096' }}>Loading active requests...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full pb-20 md:pb-0"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b" style={{ backgroundColor: '#f4ebe2', borderColor: 'rgba(100, 148, 110, 0.2)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/scrapper')}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: '#ffffff' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#2d3748' }}>
                My Active Requests
              </h1>
              <p className="text-xs md:text-sm mt-1" style={{ color: '#718096' }}>
                {activeRequests.length} {activeRequests.length === 1 ? 'request' : 'requests'} in progress
              </p>
            </div>
          </div>
          {activeRequests.length > 0 && (
            <button
              onClick={() => navigate('/scrapper/active-requests')}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              Go Online
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-6">
        {activeRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="#64946e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#2d3748' }}>
              No Active Requests
            </h3>
            <p className="text-sm md:text-base mb-6" style={{ color: '#718096' }}>
              You don't have any active requests at the moment.
            </p>
            <button
              onClick={() => navigate('/scrapper/active-requests')}
              className="px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              Go Online to Receive Requests
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {activeRequests.map((request, index) => {
              const statusConfig = getStatusConfig(request.status);
              const pickupTime = formatPickupTime(request);

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/scrapper/active-request/${request.id}`, { state: { request } })}
                  className="rounded-2xl p-4 md:p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl border"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(100, 148, 110, 0.2)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(100, 148, 110, 0.15)' }}
                      >
                        <span className="text-lg md:text-xl font-bold" style={{ color: '#64946e' }}>
                          {request.userName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base md:text-lg font-bold truncate" style={{ color: '#2d3748' }}>
                            {request.userName || 'Unknown User'}
                          </h3>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                          >
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm md:text-base mb-2" style={{ color: '#718096' }}>
                          {request.scrapType || 'Scrap'}
                        </p>
                        <p className="text-lg md:text-xl font-bold" style={{ color: '#64946e' }}>
                          {request.estimatedEarnings || '₹0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.1)' }}>
                    {/* Location */}
                    {request.location?.address && (
                      <div className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0, marginTop: '2px' }}>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Location</p>
                          <p className="text-sm font-medium truncate" style={{ color: '#2d3748' }}>
                            {request.location.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pickup Time */}
                    <div className="flex items-start gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0, marginTop: '2px' }}>
                        <path d="M8 2v2M16 2v2M5 7h14M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Pickup Time</p>
                        <p className="text-sm font-medium truncate" style={{ color: '#2d3748' }}>
                          {pickupTime}
                        </p>
                      </div>
                    </div>

                    {/* Distance */}
                    {request.distance && (
                      <div className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0, marginTop: '2px' }}>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Distance</p>
                          <p className="text-sm font-medium" style={{ color: '#2d3748' }}>
                            {request.distance}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Accepted At */}
                    {request.acceptedAt && (
                      <div className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#718096', flexShrink: 0, marginTop: '2px' }}>
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Accepted</p>
                          <p className="text-sm font-medium" style={{ color: '#2d3748' }}>
                            {new Date(request.acceptedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.1)' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/scrapper/active-request/${request.id}`, { state: { request } });
                      }}
                      className="w-full py-3 rounded-xl font-semibold text-sm md:text-base transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      View Details & Continue
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyActiveRequestsPage;

