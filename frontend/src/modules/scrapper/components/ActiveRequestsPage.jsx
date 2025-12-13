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
  const [audioRef, setAudioRef] = useState(null);

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

      const mockRequest = {
        id: 'REQ-' + Date.now(),
        userName: 'Rajesh Kumar',
        userPhone: '+919876543210',
        userEmail: 'rajesh.k@example.com',
        scrapType: 'Metal Scrap',
        images: mockImages, // Add images to request
        location: {
          address: '123, MG Road, Mumbai',
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1
        },
        distance: '2.5 km',
        estimatedEarnings: '₹450'
      };
      
      setIncomingRequest(mockRequest);
      setIsSlideOpen(true);
      // Start playing sound
      setAudioPlaying(true);
    }, 3000);

    return () => clearTimeout(requestTimer);
  }, []);

  // Handle sound playback - Fast, vibrating ringtone
  useEffect(() => {
    let audioContext;
    let ringtoneInterval;
    let vibrateInterval;

    const playRingtone = async () => {
      if (!audioPlaying || !incomingRequest || !audioContext) return;
      
      try {
        // Ensure audio context is running
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        if (audioContext.state !== 'running') return;
        
        // First beep - higher pitch
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        
        osc1.frequency.value = 1000; // Higher pitch
        osc1.type = 'sine';
        
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        osc1.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.15);
        
        // Second beep - slightly lower, creates vibration effect
        setTimeout(() => {
          if (!audioPlaying || !incomingRequest || !audioContext) return;
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
              const osc2 = audioContext.createOscillator();
              const gain2 = audioContext.createGain();
              osc2.connect(gain2);
              gain2.connect(audioContext.destination);
              
              osc2.frequency.value = 900; // Slightly lower for vibration
              osc2.type = 'sine';
              
              gain2.gain.setValueAtTime(0.4, audioContext.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
              
              osc2.start(audioContext.currentTime);
              osc2.stop(audioContext.currentTime + 0.15);
            }).catch(console.error);
          } else {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            
            osc2.frequency.value = 900; // Slightly lower for vibration
            osc2.type = 'sine';
            
            gain2.gain.setValueAtTime(0.4, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.15);
          }
        }, 150);
      } catch (error) {
        console.error('Error playing ringtone:', error);
      }
    };

    if (audioPlaying && incomingRequest) {
      // Create audio context
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context if suspended (required for autoplay policies)
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            // Play initial ringtone after resume
            playRingtone();
            
            // Play ringtone every 0.5 seconds (faster)
            ringtoneInterval = setInterval(() => {
              playRingtone();
            }, 500);
            
            // Also trigger vibration if supported
            if (navigator.vibrate) {
              const vibratePattern = [100, 50, 100, 50, 100]; // Vibrate pattern
              vibrateInterval = setInterval(() => {
                if (audioPlaying && incomingRequest) {
                  navigator.vibrate(vibratePattern);
                }
              }, 500);
            }
            
            setAudioRef({ audioContext, ringtoneInterval, vibrateInterval });
          }).catch(console.error);
        } else {
          // Play initial ringtone immediately
          playRingtone();
          
          // Play ringtone every 0.5 seconds (faster)
          ringtoneInterval = setInterval(() => {
            playRingtone();
          }, 500);
          
          // Also trigger vibration if supported
          if (navigator.vibrate) {
            const vibratePattern = [100, 50, 100, 50, 100]; // Vibrate pattern
            vibrateInterval = setInterval(() => {
              if (audioPlaying && incomingRequest) {
                navigator.vibrate(vibratePattern);
              }
            }, 500);
          }
          
          setAudioRef({ audioContext, ringtoneInterval, vibrateInterval });
        }
      } catch (error) {
        console.error('Error creating audio context:', error);
      }
    } else {
      // Stop audio when not playing
      if (audioRef) {
        if (audioRef.ringtoneInterval) {
          clearInterval(audioRef.ringtoneInterval);
        }
        if (audioRef.vibrateInterval) {
          clearInterval(audioRef.vibrateInterval);
        }
        if (audioRef.audioContext) {
          audioRef.audioContext.close().catch(console.error);
        }
        setAudioRef(null);
      }
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop vibration
      }
    }

    return () => {
      if (ringtoneInterval) {
        clearInterval(ringtoneInterval);
      }
      if (vibrateInterval) {
        clearInterval(vibrateInterval);
      }
      if (audioContext) {
        audioContext.close().catch(console.error);
      }
      if (navigator.vibrate) {
        navigator.vibrate(0);
      }
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
    
    // Stop sound immediately
    setAudioPlaying(false);
    if (audioRef) {
      if (audioRef.ringtoneInterval) {
        clearInterval(audioRef.ringtoneInterval);
      }
      if (audioRef.vibrateInterval) {
        clearInterval(audioRef.vibrateInterval);
      }
      if (audioRef.audioContext) {
        audioRef.audioContext.close().catch(console.error);
      }
      setAudioRef(null);
    }
    
    // Stop vibration
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    
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
    // Stop sound immediately
    setAudioPlaying(false);
    if (audioRef) {
      if (audioRef.ringtoneInterval) {
        clearInterval(audioRef.ringtoneInterval);
      }
      if (audioRef.vibrateInterval) {
        clearInterval(audioRef.vibrateInterval);
      }
      if (audioRef.audioContext) {
        audioRef.audioContext.close().catch(console.error);
      }
      setAudioRef(null);
    }
    
    // Stop vibration
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    
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
              style={{ backgroundColor: '#ffffff', maxHeight: '55vh', height: '55vh' }}
            >
              {/* Slide Handle */}
              <div className="w-12 h-1.5 mx-auto mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#cbd5e0' }} />

              {/* Request Content - Compact - Scrollable */}
              <div className="p-4 pb-2 overflow-y-auto flex-1 pb-24 md:pb-2" style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#2d3748' }}>New Request</h2>
              <button
                onClick={handleRejectRequest}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#ef4444' }}>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Request Details - Compact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
                  <span className="text-sm font-bold" style={{ color: '#64946e' }}>
                    {incomingRequest.userName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#2d3748' }}>{incomingRequest.userName}</p>
                  <p className="text-xs truncate" style={{ color: '#718096' }}>{incomingRequest.scrapType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#64946e' }}>{incomingRequest.estimatedEarnings}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 148, 110, 0.05)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e', flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <p className="text-xs flex-1 truncate" style={{ color: '#2d3748' }}>{incomingRequest.location.address}</p>
                <p className="text-xs" style={{ color: '#718096' }}>{incomingRequest.distance}</p>
              </div>
            </div>

          </div>

          {/* Accept Button - Fixed at Bottom (Always Visible) */}
          <div 
            className="fixed md:relative bottom-0 left-0 right-0 px-4 pb-4 pt-2 border-t flex-shrink-0 z-50" 
            style={{ 
              borderColor: 'rgba(100, 148, 110, 0.2)', 
              backgroundColor: '#ffffff'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAcceptRequest}
              className="w-full py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
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
