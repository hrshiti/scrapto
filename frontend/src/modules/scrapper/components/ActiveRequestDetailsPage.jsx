import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { checkAndProcessMilestone } from '../../shared/utils/referralUtils';
import {
  getScrapperRequestById,
  updateScrapperRequest,
  removeScrapperRequest,
  getScrapperAssignedRequests
} from '../../shared/utils/scrapperRequestUtils';
import { orderAPI, scrapperOrdersAPI } from '../../shared/utils/api';
import { useRef } from 'react';
import ScrapperMap from './GoogleMaps/ScrapperMap';

const ActiveRequestDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId } = useParams();
  const { user } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [scrapperLocation, setScrapperLocation] = useState(null);
  const [userLiveLocation, setUserLiveLocation] = useState(null);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, paid, completed
  const [finalAmount, setFinalAmount] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'pickup', 'payment', 'complete'
  const [confirmMessage, setConfirmMessage] = useState('');
  const [allActiveRequests, setAllActiveRequests] = useState([]);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(-1);

  // Check authentication first
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
      return;
    }
  }, [navigate]);

  // Load order data from backend
  useEffect(() => {
    const loadOrderData = async () => {
      if (!requestId) {
        // Try navigation state first
        if (location.state?.request) {
          const request = location.state.request;
          setRequestData(request);
          setUserLiveLocation({
            lat: request.location?.lat || 19.0760,
            lng: request.location?.lng || 72.8777
          });
          return;
        }
        navigate('/scrapper/my-active-requests', { replace: true });
        return;
      }

      try {
        // Load order from backend
        const response = await orderAPI.getById(requestId);

        if (response.success && response.data?.order) {
          const order = response.data.order;

          // Map backend order to frontend format
          const mappedRequest = {
            id: order._id || order.id,
            _id: order._id || order.id,
            userName: order.user?.name || 'User',
            userPhone: order.user?.phone || '',
            userEmail: order.user?.email || '',
            scrapType: order.scrapItems?.map(item => item.category).join(', ') || 'Scrap',
            weight: order.totalWeight,
            pickupSlot: order.pickupSlot || null,
            preferredTime: order.preferredTime || null,
            images: order.images?.map(img => ({
              id: img.publicId || img.url,
              preview: img.url,
              url: img.url
            })) || [],
            location: {
              address: order.pickupAddress?.street
                ? `${order.pickupAddress.street}, ${order.pickupAddress.city || ''}, ${order.pickupAddress.state || ''} ${order.pickupAddress.pincode || ''}`.trim()
                : 'Address not available',
              lat: order.pickupAddress?.coordinates?.lat || 19.0760,
              lng: order.pickupAddress?.coordinates?.lng || 72.8777
            },
            estimatedEarnings: `₹${order.totalAmount || 0}`,
            status: order.status,
            paymentStatus: order.paymentStatus,
            // Backend fields
            assignmentStatus: order.assignmentStatus,
            acceptedAt: order.acceptedAt
          };

          setRequestData(mappedRequest);
          setUserLiveLocation({
            lat: mappedRequest.location.lat,
            lng: mappedRequest.location.lng
          });

          // Check if already picked up (status is in_progress or completed)
          if (order.status === 'in_progress' || order.status === 'completed') {
            setIsPickedUp(true);
            setPaymentStatus(order.paymentStatus || 'pending');
            setFinalAmount(`₹${order.totalAmount || 0}`);
            setShowPaymentInput(order.paymentStatus === 'pending');
          }

          // Load all active requests for navigation
          const allActiveResponse = await scrapperOrdersAPI.getMyAssigned('status=IN_PROGRESS');
          if (allActiveResponse.success && allActiveResponse.data?.orders) {
            const allRequests = allActiveResponse.data.orders
              .map(o => ({
                id: o._id || o.id,
                status: o.status
              }))
              .filter(req => req.status !== 'completed');
            setAllActiveRequests(allRequests);
            const index = allRequests.findIndex(req => req.id === mappedRequest.id);
            setCurrentRequestIndex(index >= 0 ? index : 0);
          }
        } else {
          throw new Error('Order not found');
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        // Fallback to localStorage if backend fails
        const localRequest = getScrapperRequestById(requestId);
        if (localRequest) {
          setRequestData(localRequest);
          setUserLiveLocation({
            lat: localRequest.location?.lat || 19.0760,
            lng: localRequest.location?.lng || 72.8777
          });
        } else {
          navigate('/scrapper/my-active-requests', { replace: true });
        }
      }
    };

    loadOrderData();
  }, [requestId, location, navigate]);

  // Refresh request data from backend periodically
  useEffect(() => {
    if (!requestData?._id && !requestData?.id) return;

    const refreshRequest = async () => {
      const orderId = requestData._id || requestData.id;
      try {
        const response = await orderAPI.getById(orderId);
        if (response.success && response.data?.order) {
          const order = response.data.order;

          // Map backend order to frontend format
          const mappedRequest = {
            id: order._id || order.id,
            _id: order._id || order.id,
            userName: order.user?.name || 'User',
            userPhone: order.user?.phone || '',
            userEmail: order.user?.email || '',
            scrapType: order.scrapItems?.map(item => item.category).join(', ') || 'Scrap',
            weight: order.totalWeight,
            pickupSlot: order.pickupSlot || null,
            preferredTime: order.preferredTime || null,
            images: order.images?.map(img => ({
              id: img.publicId || img.url,
              preview: img.url,
              url: img.url
            })) || [],
            location: {
              address: order.pickupAddress?.street
                ? `${order.pickupAddress.street}, ${order.pickupAddress.city || ''}, ${order.pickupAddress.state || ''} ${order.pickupAddress.pincode || ''}`.trim()
                : 'Address not available',
              lat: order.pickupAddress?.coordinates?.lat || 19.0760,
              lng: order.pickupAddress?.coordinates?.lng || 72.8777
            },
            estimatedEarnings: `₹${order.totalAmount || 0}`,
            status: order.status,
            paymentStatus: order.paymentStatus
          };

          setRequestData(mappedRequest);

          // Update state based on new order status
          if (order.status === 'in_progress' || order.status === 'completed') {
            setIsPickedUp(true);
            setPaymentStatus(order.paymentStatus || 'pending');
            setFinalAmount(`₹${order.totalAmount || 0}`);
            setShowPaymentInput(order.paymentStatus === 'pending');
          }
        }
      } catch (error) {
        console.error('Failed to refresh order:', error);
      }
    };

    // Refresh on focus/visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshRequest();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshRequest);

    // Also refresh every 5 seconds
    const interval = setInterval(refreshRequest, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshRequest);
      clearInterval(interval);
    };
  }, [requestData?._id, requestData?.id]);

  // Auto-redirect if order is completed
  useEffect(() => {
    if (requestData?.status === 'completed') {
      const timer = setTimeout(() => {
        navigate('/scrapper', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [requestData?.status, navigate]);

  // Get scrapper's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setScrapperLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location (Mumbai)
          setScrapperLocation({
            lat: 19.0760,
            lng: 72.8777
          });
        }
      );

      // Watch position for live updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setScrapperLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error watching location:', error);
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      // Default location if geolocation not supported
      setScrapperLocation({
        lat: 19.0760,
        lng: 72.8777
      });
    }
  }, []);

  const renderPickupSlot = () => {
    const slot = requestData.pickupSlot;
    if (!slot && !requestData.preferredTime) return null;

    const label = slot
      ? `${slot.dayName}, ${slot.date} • ${slot.slot}`
      : requestData.preferredTime;

    return (
      <div className="mb-4">
        <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>
          Pickup Slot:
        </p>
        <p className="text-sm md:text-base font-semibold" style={{ color: '#2d3748' }}>
          {label}
        </p>
      </div>
    );
  };

  if (!requestData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#f4ebe2' }}>
        <p style={{ color: '#718096' }}>Loading request details...</p>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${requestData.userPhone || '+919876543210'}`;
  };

  const handleMessage = () => {
    window.location.href = `sms:${requestData.userPhone || '+919876543210'}`;
  };

  const handleChat = () => {
    if (requestData?.id || requestData?._id) {
      navigate(`/scrapper/chat`, {
        state: { orderId: requestData.id || requestData._id }
      });
    }
  };

  const handleScrapPickedUp = () => {
    setConfirmAction('pickup');
    setConfirmMessage('Have you picked up the scrap from the customer?');
    setShowConfirmModal(true);
  };

  const handlePaymentMade = () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    setConfirmAction('payment');
    setConfirmMessage(`Have you paid ₹${paidAmount} to the customer?`);
    setShowConfirmModal(true);
  };

  const handleCompleteOrder = () => {
    setConfirmAction('complete');
    setConfirmMessage('Are you sure you want to complete this order?');
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    const orderId = requestData._id || requestData.id;
    if (!orderId) {
      alert('Order ID not found');
      return;
    }

    try {
      if (confirmAction === 'pickup') {
        // Update order status to in_progress
        const response = await orderAPI.updateStatus(orderId, 'in_progress');

        if (response.success) {
          setIsPickedUp(true);
          const amount = requestData.estimatedEarnings || '₹450';
          setFinalAmount(amount);
          setPaymentStatus('pending');
          setShowPaymentInput(true);

          // Update local state
          setRequestData({
            ...requestData,
            status: 'in_progress',
            paymentStatus: 'pending'
          });
        } else {
          throw new Error(response.message || 'Failed to update order status');
        }
      } else if (confirmAction === 'payment') {
        // Update order status to in_progress (just in case) and paymentStatus to completed
        const response = await orderAPI.updateStatus(orderId, 'in_progress', 'completed', Number(paidAmount));

        if (response.success) {
          setPaymentStatus('completed');
          setShowPaymentInput(false);

          // Update local state
          setRequestData({
            ...requestData,
            status: 'in_progress',
            paymentStatus: 'completed',
            paidAmount: paidAmount
          });
        } else {
          throw new Error(response.message || 'Failed to update payment status');
        }
      } else if (confirmAction === 'complete') {
        // Update order status to completed
        const response = await orderAPI.updateStatus(orderId, 'completed');

        if (response.success) {
          setPaymentStatus('completed');

          // Earnings are now calculated from backend (Order model)
          // No need to update localStorage - backend will calculate from completed orders

          // Keep localStorage update as fallback for completed orders display (temporary)
          const completedOrder = {
            id: requestData.id,
            _id: requestData._id,
            orderId: `ORD-${Date.now()}`,
            userName: requestData.userName,
            userPhone: requestData.userPhone,
            scrapType: requestData.scrapType,
            images: requestData.images || [],
            location: requestData.location,
            estimatedEarnings: requestData.estimatedEarnings,
            finalAmount: finalAmount || requestData.estimatedEarnings,
            paidAmount: paidAmount || '0',
            status: 'completed',
            completedAt: new Date().toISOString()
          };

          const existingOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
          const wasFirstPickup = existingOrders.length === 0;
          existingOrders.push(completedOrder);
          localStorage.setItem('scrapperCompletedOrders', JSON.stringify(existingOrders));

          // Process milestones
          const scrapperUser = JSON.parse(localStorage.getItem('scrapperUser') || '{}');
          if (scrapperUser.phone || scrapperUser.id) {
            if (wasFirstPickup) {
              try {
                checkAndProcessMilestone(scrapperUser.phone || scrapperUser.id, 'scrapper', 'firstPickup');
              } catch (error) {
                console.error('Error processing milestone:', error);
              }
            }
          }

          // Redirect to dashboard after delay
          // The dashboard will show any remaining active requests
          setTimeout(() => {
            navigate('/scrapper', { replace: true });
          }, 1500);
        } else {
          throw new Error(response.message || 'Failed to complete order');
        }
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmMessage('');
    } catch (error) {
      console.error('Failed to confirm action:', error);
      alert(error.message || 'Failed to process. Please try again.');
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmMessage('');
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Create custom icons


  // Calculate route path with intermediate points for better visualization


  // Calculate center for map


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full relative flex flex-col"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header with Back Button and Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(244, 235, 226, 0.95)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/scrapper/my-active-requests')}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: '#ffffff' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2d3748' }}>Active Request</h1>
            {allActiveRequests.length > 1 && (
              <p className="text-xs" style={{ color: '#718096' }}>
                {currentRequestIndex + 1} of {allActiveRequests.length}
              </p>
            )}
          </div>
        </div>

        {/* Navigation between requests */}
        {allActiveRequests.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentRequestIndex > 0) {
                  const prevRequest = allActiveRequests[currentRequestIndex - 1];
                  navigate(`/scrapper/active-request/${prevRequest.id}`, {
                    state: { request: prevRequest },
                    replace: true
                  });
                }
              }}
              disabled={currentRequestIndex <= 0}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-opacity disabled:opacity-30"
              style={{ backgroundColor: '#ffffff' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (currentRequestIndex < allActiveRequests.length - 1) {
                  const nextRequest = allActiveRequests[currentRequestIndex + 1];
                  navigate(`/scrapper/active-request/${nextRequest.id}`, {
                    state: { request: nextRequest },
                    replace: true
                  });
                }
              }}
              disabled={currentRequestIndex >= allActiveRequests.length - 1}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-opacity disabled:opacity-30"
              style={{ backgroundColor: '#ffffff' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>



      {/* Map Container - Full Screen */}
      <div className="w-full h-screen">
        <ScrapperMap
          stage="pickup"
          scrapperLocation={scrapperLocation}
          userLocation={userLiveLocation}
          userName={requestData?.userName}
        />
      </div>


      {/* Payment Page - Full Screen (when payment pending) */}
      {
        isPickedUp && paymentStatus === 'pending' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 flex flex-col"
            style={{ backgroundColor: '#020617' }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center gap-4 border-b"
              style={{ borderColor: 'rgba(31, 41, 55, 0.9)', backgroundColor: '#020617' }}
            >
              <button
                onClick={() => {
                  setShowPaymentInput(false);
                  setIsPickedUp(false);
                  setPaymentStatus('pending');
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="text-xl font-bold" style={{ color: '#e5e7eb' }}>Make Payment</h1>
            </div>

            {/* Payment Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-md mx-auto">
                {/* Customer Info */}
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#0b1120' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <span className="text-lg font-bold" style={{ color: '#bbf7d0' }}>
                        {requestData.userName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold" style={{ color: '#f9fafb' }}>{requestData.userName}</p>
                      <p className="text-sm" style={{ color: '#9ca3af' }}>{requestData.scrapType}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                    <p className="text-xs mb-1" style={{ color: '#9ca3af' }}>Estimated Amount</p>
                    <p className="text-xl font-bold" style={{ color: '#4ade80' }}>{finalAmount || requestData?.estimatedEarnings || '₹450'}</p>
                  </div>
                </div>

                {/* Payment Input */}
                <div className="mb-6 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#020617' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: '#e5e7eb' }}>Enter Payment Amount</h2>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#d1d5db' }}>
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-2xl font-bold text-center bg-transparent"
                      style={{
                        borderColor: paidAmount ? '#22c55e' : 'rgba(148, 163, 184, 0.5)',
                        color: '#f9fafb'
                      }}
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                    {paidAmount && (
                      <p className="text-sm mt-2 text-center" style={{ color: '#9ca3af' }}>
                        You will pay ₹{parseFloat(paidAmount) || 0} to the customer
                      </p>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[100, 200, 300, 400, 500, 1000].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaidAmount(amount.toString())}
                        className="py-2 rounded-lg font-semibold text-sm"
                        style={{
                          backgroundColor: paidAmount === amount.toString() ? '#22c55e' : 'rgba(31, 41, 55, 1)',
                          color: paidAmount === amount.toString() ? '#0f172a' : '#e5e7eb'
                        }}
                      >
                        ₹{amount}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePaymentMade}
                    disabled={!paidAmount || parseFloat(paidAmount) <= 0}
                    className="w-full py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#22c55e', color: '#0f172a' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                    </svg>
                    Confirm Payment
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Request Details & Contact Info - Bottom Slide (when payment not pending) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-30 rounded-t-2xl shadow-2xl flex flex-col"
              style={{ backgroundColor: '#020617', maxHeight: '65vh', overflow: 'hidden' }}
            >
              {/* Slide Handle */}
              <div className="w-12 h-1.5 mx-auto mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#4b5563' }} />

              {/* Request Content - Compact - Scrollable */}
              <div className="p-4 pb-2 overflow-y-auto flex-1" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold" style={{ color: '#e5e7eb' }}>Pickup Details</h2>
                </div>

                {/* Request Details - Compact */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <span className="text-sm font-bold" style={{ color: '#bbf7d0' }}>
                        {requestData.userName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#f9fafb' }}>{requestData.userName}</p>
                      <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{requestData.scrapType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#4ade80' }}>{requestData.estimatedEarnings}</p>
                    </div>
                  </div>

                  {/* Scrap Images */}
                  {requestData.images && requestData.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold mb-2" style={{ color: '#e5e7eb' }}>Scrap Images</p>
                      <div className="grid grid-cols-3 gap-2">
                        {requestData.images.slice(0, 6).map((image, idx) => (
                          <motion.div
                            key={image.id || idx}
                            whileHover={{ scale: 1.05 }}
                            className="relative aspect-square rounded-lg overflow-hidden"
                            style={{ backgroundColor: 'rgba(15, 23, 42, 1)' }}
                          >
                            <img
                              src={image.preview || image}
                              alt={`Scrap ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                e.target.src = 'https://via.placeholder.com/150?text=Scrap';
                              }}
                            />
                            {requestData.images.length > 6 && idx === 5 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  +{requestData.images.length - 6}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Made Status - Step 3 */}
                {/* Payment Made Status - Step 3 */
                  // Show this if payment is done BUT order is not yet completed
                }
                {(paymentStatus === 'paid' || paymentStatus === 'completed') && requestData?.status !== 'completed' && (
                  <div className="mb-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#bbf7d0' }}>Payment Status</span>
                      <span className="text-sm font-bold" style={{ color: '#4ade80' }}>Paid ✓</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#e5e7eb' }}>
                      Payment of ₹{paidAmount || requestData?.paidAmount || '0'} made successfully to customer
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompleteOrder}
                      className="w-full py-3 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#22c55e', color: '#0f172a' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Complete Order
                    </motion.button>
                  </div>
                )}

                {/* Order Completed Status */}
                {requestData?.status === 'completed' && (
                  <div className="mb-3 p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2" style={{ color: '#4ade80' }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm font-bold mb-1" style={{ color: '#bbf7d0' }}>Order Completed!</p>
                    <p className="text-xs" style={{ color: '#e5e7eb' }}>Redirecting to dashboard...</p>
                  </div>
                )}
              </div>

              {/* Contact Buttons - Fixed at Bottom */}
              <div
                className="px-4 pb-4 pt-2 border-t flex-shrink-0"
                style={{
                  borderColor: 'rgba(31, 41, 55, 0.9)',
                  backgroundColor: '#020617'
                }}
              >
                {/* Scrap Picked Up Button - Primary Action */}
                {!isPickedUp ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScrapPickedUp}
                    className="w-full py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 mb-3"
                    style={{ backgroundColor: '#22c55e', color: '#0f172a' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Scrap Picked Up
                  </motion.button>
                ) : (
                  <div
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-3"
                    style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#bbf7d0' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Scrap Picked Up Successfully
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCall}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl shadow-sm"
                    style={{ backgroundColor: '#022c22', color: '#6ee7b7' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16.92C2 16.4099 2.1841 15.9196 2.52016 15.5455C2.85622 15.1714 3.30751 14.9416 3.78 14.88L7.22 14.32C7.7301 14.2441 8.2204 14.4282 8.5945 14.7642C8.9686 15.1003 9.1984 15.5516 9.26 16.02L9.72 19.46C9.78 19.93 10.01 20.38 10.35 20.72C10.69 21.06 11.14 21.29 11.61 21.35L12.39 21.46C12.86 21.52 13.31 21.29 13.65 20.95C13.99 20.61 14.22 20.16 14.28 19.69L14.74 16.25C14.8 15.78 15.03 15.33 15.37 14.99C15.71 14.65 16.16 14.42 16.63 14.36L20.07 13.8C20.5405 13.7384 21.0099 13.9682 21.3798 14.3043C21.7497 14.6404 21.9795 15.0917 22 15.5996V16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2L12 4L10 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-semibold text-sm">Call</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChat}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl shadow-sm"
                    style={{ backgroundColor: '#0b1120', color: '#60a5fa' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-semibold text-sm">Chat</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )
      }

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-2xl shadow-2xl p-6"
              style={{ backgroundColor: '#ffffff' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#2d3748' }}>
                Confirm Action
              </h3>
              <p className="text-sm text-center mb-6" style={{ color: '#718096' }}>
                {confirmMessage}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm shadow-lg"
                  style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  );
};

export default ActiveRequestDetailsPage;
