import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

const ActiveRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Check authentication first
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
      return;
    }
  }, [navigate]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location (Mumbai)
          setCurrentLocation({
            lat: 19.0760,
            lng: 72.8777
          });
        }
      );

      // Watch position for live updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
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
      setCurrentLocation({
        lat: 19.0760,
        lng: 72.8777
      });
    }
  }, []);

  // Simulate incoming request (for testing)
  useEffect(() => {
    // Simulate request after 3 seconds for testing
    const requestTimer = setTimeout(() => {
      // Try to use latest user request (with pickupSlot) if available
      let latestUserRequest = null;
      try {
        const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
        if (Array.isArray(userRequests) && userRequests.length > 0) {
          latestUserRequest = userRequests[userRequests.length - 1];
        }
      } catch (e) {
        console.error('Error reading userRequests for incoming request mock:', e);
      }

      // Mock scrap images (for now, using placeholder images)
      const mockImages = [
        {
          id: 1,
          preview: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
          name: 'scrap-image-1.jpg'
        },
        {
          id: 2,
          preview: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
          name: 'scrap-image-2.jpg'
        },
        {
          id: 3,
          preview: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
          name: 'scrap-image-3.jpg'
        }
      ];

      // Derive pickup slot & readable time string from latest user request (new or old data)
      const latestPickupSlot = latestUserRequest?.pickupSlot || null;
      const latestPreferredTime =
        latestUserRequest?.preferredTime ||
        (latestPickupSlot
          ? `${latestPickupSlot.dayName}, ${latestPickupSlot.date} • ${latestPickupSlot.slot}`
          : '');

      const mockRequest = {
        id: latestUserRequest?.id || 'REQ-' + Date.now(),
        userName: latestUserRequest?.userName || 'Rajesh Kumar',
        userPhone: latestUserRequest?.userPhone || '+919876543210',
        userEmail: latestUserRequest?.userEmail || 'rajesh.k@example.com',
        scrapType: latestUserRequest?.categories?.map?.((c) => c.name).join(', ') || 'Metal Scrap',
        weight: latestUserRequest?.weight || undefined,
        pickupSlot: latestPickupSlot,
        preferredTime: latestPreferredTime,
        images: latestUserRequest?.images || mockImages, // Prefer real images if present
        location: latestUserRequest?.location || {
          address: '123, MG Road, Mumbai',
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1
        },
        distance: latestUserRequest?.distance || '2.5 km',
        estimatedEarnings: latestUserRequest?.estimatedPayout
          ? `₹${latestUserRequest.estimatedPayout.toFixed(0)}`
          : '₹450'
      };
      
      setIncomingRequest(mockRequest);
      setIsSlideOpen(true);
      // Start playing sound
      setAudioPlaying(true);
    }, 3000);

    return () => clearTimeout(requestTimer);
  }, []);

  // Handle sound playback - Voice alert + vibration instead of ringtone
  useEffect(() => {
    let voiceInterval;
    let vibrateInterval;

    const stopAll = () => {
      if (voiceInterval) {
        clearInterval(voiceInterval);
      }
      if (vibrateInterval) {
        clearInterval(vibrateInterval);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (navigator.vibrate) {
        navigator.vibrate(0);
      }
    };

    if (audioPlaying && incomingRequest) {
      // Build announcement text in Hindi: user name, category, location and pickup time
      const name = incomingRequest.userName || 'नाम उपलब्ध नहीं है';
      const scrapType = incomingRequest.scrapType || 'कैटेगरी उपलब्ध नहीं है';
      const address =
        incomingRequest.location?.address || 'लोकेशन उपलब्ध नहीं है';
      const slot =
        incomingRequest.pickupSlot?.slot ||
        incomingRequest.preferredTime ||
        'पिकअप समय चुना नहीं गया है';

      let text = 'नई स्क्रैपटो रिक्वेस्ट आई है।';
      text += ` यूज़र का नाम: ${name}।`;
      text += ` प्रोडक्ट कैटेगरी: ${scrapType}।`;
      text += ` लोकेशन: ${address}।`;
      text += ` पिकअप टाइम: ${slot}।`;

      if (typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance) {
        const speakOnce = () => {
          try {
            // Cancel any ongoing speech to avoid overlap
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
          } catch (err) {
            console.error('Speech synthesis error:', err);
          }
        };

        // Speak immediately, then repeat every 6 seconds while ringing
        speakOnce();
        voiceInterval = setInterval(() => {
          if (audioPlaying && incomingRequest) {
            speakOnce();
          }
        }, 6000);
      } else {
        console.warn('Speech synthesis not supported in this browser.');
      }

      // Vibrate pattern (optional, same as before)
      if (navigator.vibrate) {
        const vibratePattern = [200, 100, 200];
        vibrateInterval = setInterval(() => {
          if (audioPlaying && incomingRequest) {
            navigator.vibrate(vibratePattern);
          }
        }, 4000);
      }
    }

    return () => {
      stopAll();
    };
  }, [audioPlaying, incomingRequest]);

  // Handle going offline
  const handleGoOffline = () => {
    setIsOnline(false);
    setAudioPlaying(false);
    navigate('/scrapper', { replace: true });
  };

  // Handle request accept
  const handleAcceptRequest = () => {
    console.log('✅ Request accepted!', incomingRequest);
    
    // Stop sound & vibration immediately
    setAudioPlaying(false);
    
    // Store request in localStorage
    if (incomingRequest) {
      localStorage.setItem('activeRequest', JSON.stringify(incomingRequest));
    }
    
    // Navigate to request details page
    navigate(`/scrapper/active-request/${incomingRequest?.id}`, {
      state: { request: incomingRequest },
      replace: true
    });
  };

  // Handle request reject
  const handleRejectRequest = () => {
    // Stop sound & vibration immediately
    setAudioPlaying(false);
    
    setIsSlideOpen(false);
    setIncomingRequest(null);
    // Request will be removed, wait for next one
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full relative"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header with Back Button and Status */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(244, 235, 226, 0.95)' }}>
        <button
          onClick={handleGoOffline}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: '#ffffff' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
          <span className="text-sm font-semibold" style={{ color: '#2d3748' }}>Online</span>
        </div>
      </div>

      {/* Map Container - Full Screen */}
      <div className="w-full h-screen">
        {currentLocation ? (
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={[currentLocation.lat, currentLocation.lng]} />
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={scrapperIcon}>
              <Popup>
                <div>
                  <p className="font-semibold">Your Location</p>
                  <p className="text-xs" style={{ color: '#718096' }}>Waiting for requests...</p>
                </div>
              </Popup>
            </Marker>
            {incomingRequest && (
              <Marker position={[incomingRequest.location.lat, incomingRequest.location.lng]}>
                <Popup>
                  <div>
                    <p className="font-semibold">{incomingRequest.userName}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>{incomingRequest.scrapType}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>{incomingRequest.location.address}</p>
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

      {/* Incoming Request Slide - Bottom */}
      {incomingRequest && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isSlideOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 z-30 rounded-t-2xl shadow-2xl flex flex-col"
          style={{ backgroundColor: '#020617', maxHeight: '55vh', height: '55vh' }}
        >
          {/* Slide Handle */}
          <div className="w-12 h-1.5 mx-auto mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#4b5563' }} />

          {/* Request Content - Compact - Scrollable */}
          <div
            className="p-4 pb-2 overflow-y-auto flex-1 pb-24 md:pb-2"
            style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#e5e7eb' }}>New Request</h2>
              <button
                onClick={handleRejectRequest}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#ef4444' }}>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Request Details - Compact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <span className="text-sm font-bold" style={{ color: '#bbf7d0' }}>
                    {incomingRequest.userName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f9fafb' }}>{incomingRequest.userName}</p>
                  <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{incomingRequest.scrapType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#4ade80' }}>{incomingRequest.estimatedEarnings}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#9ca3af', flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <p className="text-xs flex-1 truncate" style={{ color: '#e5e7eb' }}>{incomingRequest.location.address}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  {incomingRequest.distance}
                  {(incomingRequest.pickupSlot || incomingRequest.preferredTime) && (
                    <span className="ml-1">
                      •{' '}
                      {incomingRequest.pickupSlot
                        ? incomingRequest.pickupSlot.slot
                        : incomingRequest.preferredTime}
                    </span>
                  )}
                </p>
              </div>

              {/* Pickup slot / preferred time info (always show if user sent any time) */}
              {(incomingRequest.pickupSlot || incomingRequest.preferredTime) && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#9ca3af', flexShrink: 0 }}>
                    <path d="M8 2v2M16 2v2M5 7h14M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Pickup slot</p>
                    <p className="text-xs font-semibold truncate" style={{ color: '#e5e7eb' }}>
                      {incomingRequest.pickupSlot
                        ? `${incomingRequest.pickupSlot.dayName}, ${incomingRequest.pickupSlot.date} • ${incomingRequest.pickupSlot.slot}`
                        : incomingRequest.preferredTime}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Accept Button - Fixed at Bottom (Always Visible) */}
          <div
            className="fixed md:relative bottom-0 left-0 right-0 px-4 pb-4 pt-2 border-t flex-shrink-0 z-50"
            style={{
              borderColor: 'rgba(55, 65, 81, 0.7)',
              backgroundColor: '#020617'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAcceptRequest}
              className="w-full py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: '#22c55e', color: '#0f172a' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Accept Order
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActiveRequestsPage;
