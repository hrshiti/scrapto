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
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit map bounds to show both markers
function MapBounds({ scrapperLocation, userLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (scrapperLocation && userLocation) {
      const bounds = L.latLngBounds(
        [scrapperLocation.lat, scrapperLocation.lng],
        [userLocation.lat, userLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (scrapperLocation) {
      map.setView([scrapperLocation.lat, scrapperLocation.lng], 15);
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [scrapperLocation, userLocation, map]);
  
  return null;
}

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

  // Get request data from navigation state, URL params, or array
  useEffect(() => {
    let request = null;
    
    // First try navigation state
    if (location.state?.request) {
      request = location.state.request;
    }
    // Then try to get from array using requestId from URL
    else if (requestId) {
      request = getScrapperRequestById(requestId);
    }
    // Fallback to old localStorage format (for migration)
    else {
      const oldRequest = localStorage.getItem('activeRequest');
      if (oldRequest) {
        try {
          request = JSON.parse(oldRequest);
        } catch (e) {
          console.error('Failed to parse old activeRequest', e);
        }
      }
    }
    
    if (request) {
      setRequestData(request);
      // Set user's pickup location as live location
      setUserLiveLocation({
        lat: request.location.lat,
        lng: request.location.lng
      });
      
      // Check if already picked up
      if (request.status === 'picked_up' || request.status === 'payment_pending') {
        setIsPickedUp(true);
        setPaymentStatus(request.paymentStatus || 'pending');
        setFinalAmount(request.finalAmount || request.estimatedEarnings);
        setPaidAmount(request.paidAmount || '');
        setShowPaymentInput(request.paymentStatus === 'pending');
      }
      
      // Load all active requests for navigation
      const allRequests = getScrapperAssignedRequests().filter(req => req.status !== 'completed');
      setAllActiveRequests(allRequests);
      const index = allRequests.findIndex(req => req.id === request.id);
      setCurrentRequestIndex(index);
    } else {
      // If no request data, redirect back to active requests or dashboard
      navigate('/scrapper/active-requests', { replace: true });
    }
  }, [location, navigate, requestId]);

  // Refresh request data from array periodically (in case updated elsewhere)
  useEffect(() => {
    if (!requestData?.id) return;
    
    const refreshRequest = () => {
      const updatedRequest = getScrapperRequestById(requestData.id);
      if (updatedRequest) {
        setRequestData(updatedRequest);
        // Update state based on new request status
        if (updatedRequest.status === 'picked_up' || updatedRequest.status === 'payment_pending') {
          setIsPickedUp(true);
          setPaymentStatus(updatedRequest.paymentStatus || 'pending');
          setFinalAmount(updatedRequest.finalAmount || updatedRequest.estimatedEarnings);
          setPaidAmount(updatedRequest.paidAmount || '');
          setShowPaymentInput(updatedRequest.paymentStatus === 'pending');
        }
        
        // Refresh active requests list
        const allRequests = getScrapperAssignedRequests().filter(req => req.status !== 'completed');
        setAllActiveRequests(allRequests);
        const index = allRequests.findIndex(req => req.id === requestData.id);
        setCurrentRequestIndex(index);
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
  }, [requestData?.id]);

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

  const handleConfirm = () => {
    if (confirmAction === 'pickup') {
      setIsPickedUp(true);
      
      // Calculate final amount (for now, use estimated earnings, can be updated based on actual weight)
      const amount = requestData.estimatedEarnings || '₹450';
      setFinalAmount(amount);
      setPaymentStatus('pending');
      
      // Update request status using utility function
      const updatedRequest = updateScrapperRequest(requestData.id, {
        status: 'picked_up',
        pickedUpAt: new Date().toISOString(),
        paymentStatus: 'pending',
        finalAmount: amount
      });
      setRequestData(updatedRequest);
      setShowPaymentInput(true);
    } else if (confirmAction === 'payment') {
      setPaymentStatus('paid');
      setShowPaymentInput(false);
      
      // Update request using utility function
      const updatedRequest = updateScrapperRequest(requestData.id, {
        paymentStatus: 'paid',
        paidAmount: paidAmount,
        paymentMadeAt: new Date().toISOString(),
        status: 'payment_pending' // Update status to payment_pending
      });
      setRequestData(updatedRequest);
    } else if (confirmAction === 'complete') {
      setPaymentStatus('completed');
      
      // Save completed order to scrapper's orders history
      const completedOrder = {
        id: requestData.id,
        orderId: `ORD-${Date.now()}`,
        userName: requestData.userName,
        userPhone: requestData.userPhone,
        scrapType: requestData.scrapType,
        images: requestData.images || [], // Include images in completed order
        location: requestData.location,
        estimatedEarnings: requestData.estimatedEarnings,
        finalAmount: finalAmount || requestData.estimatedEarnings,
        paidAmount: paidAmount || requestData.paidAmount || '0',
        status: 'completed',
        completedAt: new Date().toISOString(),
        pickedUpAt: requestData.pickedUpAt,
        paymentMadeAt: requestData.paymentMadeAt
      };
      
      // Get existing orders from localStorage
      const existingOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
      const wasFirstPickup = existingOrders.length === 0; // check before adding this one
      
      // Add new completed order
      existingOrders.push(completedOrder);
      
      // Save back to localStorage
      localStorage.setItem('scrapperCompletedOrders', JSON.stringify(existingOrders));
      
      // Update scrapper earnings data
      const earningsData = JSON.parse(localStorage.getItem('scrapperEarnings') || '{"today": 0, "week": 0, "month": 0, "total": 0}');
      
      // Extract numeric value from amount (handle both string with ₹ and number)
      let orderAmount = 0;
      const amountString = (paidAmount || finalAmount || requestData.estimatedEarnings || '0').toString();
      const numericValue = amountString.replace(/[₹,\s]/g, '');
      orderAmount = parseFloat(numericValue) || 0;
      
      const now = new Date();
      const orderDate = new Date(completedOrder.completedAt);
      
      // Update total earnings
      earningsData.total = (earningsData.total || 0) + orderAmount;
      
      // Check if order is today
      if (orderDate.toDateString() === now.toDateString()) {
        earningsData.today = (earningsData.today || 0) + orderAmount;
      }
      
      // Check if order is this week (last 7 days)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (orderDate >= weekAgo) {
        earningsData.week = (earningsData.week || 0) + orderAmount;
      }
      
      // Check if order is this month
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        earningsData.month = (earningsData.month || 0) + orderAmount;
      }
      
      localStorage.setItem('scrapperEarnings', JSON.stringify(earningsData));
      
      // Check if this is scrapper's first pickup and process milestone
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
      
      // Check if this is user's first completion and process milestone
      if (requestData.userId) {
        const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
        const userCompletedRequests = userRequests.filter(req => req.status === 'completed');
        const isFirstCompletion = userCompletedRequests.length === 0;
        
        if (isFirstCompletion) {
          try {
            checkAndProcessMilestone(requestData.userId, 'user', 'firstCompletion');
          } catch (error) {
            console.error('Error processing milestone:', error);
          }
        }
      }
      
      // Remove request from array using utility function
      removeScrapperRequest(requestData.id);
      
      // Check if there are other active requests
      const remainingRequests = getScrapperAssignedRequests().filter(req => req.status !== 'completed');
      
      // Redirect after delay
      setTimeout(() => {
        if (remainingRequests.length > 0) {
          // Navigate to my active requests list page
          navigate('/scrapper/my-active-requests', { replace: true });
        } else {
          // No more active requests, go to dashboard
          navigate('/scrapper', { replace: true });
        }
      }, 1500);
    }
    
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Create custom icons
  const scrapperIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Calculate route path with intermediate points for better visualization
  const calculateRoutePath = () => {
    if (!scrapperLocation || !userLiveLocation) return [];
    
    // Create a more visible path with intermediate points
    const start = [scrapperLocation.lat, scrapperLocation.lng];
    const end = [userLiveLocation.lat, userLiveLocation.lng];
    
    // Add intermediate points for smoother curve (simple bezier-like effect)
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    
    // Add slight curve for better visualization
    const curveOffset = 0.001; // Small offset for curve
    const midPoint = [
      midLat + curveOffset,
      midLng + curveOffset
    ];
    
    return [start, midPoint, end];
  };

  const routePath = calculateRoutePath();
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const distance = scrapperLocation && userLiveLocation 
    ? calculateDistance(scrapperLocation.lat, scrapperLocation.lng, userLiveLocation.lat, userLiveLocation.lng)
    : 0;

  // Calculate center for map
  const mapCenter = scrapperLocation || userLiveLocation || [19.0760, 72.8777];

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
        {scrapperLocation || userLiveLocation ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBounds scrapperLocation={scrapperLocation} userLocation={userLiveLocation} />
            
            {/* Route Path - Highlighted */}
            {routePath.length > 0 && (
              <>
                {/* Shadow/Outline for better visibility */}
                <Polyline
                  positions={routePath}
                  pathOptions={{
                    color: '#2d3748',
                    weight: 6,
                    opacity: 0.3,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                {/* Main highlighted path */}
                <Polyline
                  positions={routePath}
                  pathOptions={{
                    color: '#64946e',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round',
                    dashArray: '15, 10'
                  }}
                />
              </>
            )}
            
            {/* Scrapper Location Marker */}
            {scrapperLocation && (
              <Marker position={[scrapperLocation.lat, scrapperLocation.lng]} icon={scrapperIcon}>
                <Popup>
                  <div>
                    <p className="font-semibold">Your Location</p>
                    <p className="text-xs" style={{ color: '#718096' }}>You are here</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* User Location Marker */}
            {userLiveLocation && (
              <Marker position={[userLiveLocation.lat, userLiveLocation.lng]} icon={userIcon}>
                <Popup>
                  <div>
                    <p className="font-semibold">{requestData.userName}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>{requestData.scrapType}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>{requestData.location.address}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#e2e8f0' }}>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Page - Full Screen (when payment pending) */}
      {isPickedUp && paymentStatus === 'pending' ? (
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
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
              {paymentStatus === 'paid' && (
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
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Complete Order
                  </motion.button>
                </div>
              )}

              {/* Order Completed Status */}
              {paymentStatus === 'completed' && (
                <div className="mb-3 p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2" style={{ color: '#4ade80' }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scrap Picked Up
            </motion.button>
          ) : (
            <div
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-3"
              style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#bbf7d0' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M22 16.92V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16.92C2 16.4099 2.1841 15.9196 2.52016 15.5455C2.85622 15.1714 3.30751 14.9416 3.78 14.88L7.22 14.32C7.7301 14.2441 8.2204 14.4282 8.5945 14.7642C8.9686 15.1003 9.1984 15.5516 9.26 16.02L9.72 19.46C9.78 19.93 10.01 20.38 10.35 20.72C10.69 21.06 11.14 21.29 11.61 21.35L12.39 21.46C12.86 21.52 13.31 21.29 13.65 20.95C13.99 20.61 14.22 20.16 14.28 19.69L14.74 16.25C14.8 15.78 15.03 15.33 15.37 14.99C15.71 14.65 16.16 14.42 16.63 14.36L20.07 13.8C20.5405 13.7384 21.0099 13.9682 21.3798 14.3043C21.7497 14.6404 21.9795 15.0917 22 15.5996V16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2L12 4L10 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-semibold text-sm">Call</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMessage}
              className="flex items-center justify-center gap-2 p-3 rounded-xl shadow-sm"
              style={{ backgroundColor: '#0b1120', color: '#60a5fa' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V9C21 8.46957 20.7893 7.96086 20.4142 7.58579C20.0391 7.21071 19.5304 7 19 7H5C4.46957 7 3.96086 7.21071 3.58579 7.58579C3.21071 7.96086 3 8.46957 3 9V15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H19C19.5304 17 20.0391 16.7893 20.4142 16.4142C20.7893 16.0391 21 15.5304 21 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9L12 14L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-semibold text-sm">Message</span>
            </motion.button>
          </div>
        </div>
          </motion.div>
        </>
      )}

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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
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
    </motion.div>
  );
};

export default ActiveRequestDetailsPage;
