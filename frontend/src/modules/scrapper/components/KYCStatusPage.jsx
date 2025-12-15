import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { checkAndProcessMilestone } from '../../shared/utils/referralUtils';

const KYCStatusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState('pending');
  const [countdown, setCountdown] = useState(10); // For testing: countdown timer

  useEffect(() => {
    // Check if user is authenticated as scrapper
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
      return;
    }
    
    // Load KYC data from localStorage
    const storedKYC = localStorage.getItem('scrapperKYC');
    const storedStatus = localStorage.getItem('scrapperKYCStatus');
    
    if (storedKYC) {
      setKycData(JSON.parse(storedKYC));
    }
    if (storedStatus) {
      setKycStatus(storedStatus);
      
      // If KYC is verified, check subscription and redirect accordingly
      if (storedStatus === 'verified') {
        setTimeout(() => {
          const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
          if (subscriptionStatus === 'active') {
            navigate('/scrapper', { replace: true });
          } else {
            navigate('/scrapper/subscription', { replace: true });
          }
        }, 1500); // Small delay to show verified status
      }
      
      // FOR TESTING: Auto-verify KYC after 10 seconds if status is pending
      if (storedStatus === 'pending') {
        const autoVerifyTimer = setTimeout(() => {
          localStorage.setItem('scrapperKYCStatus', 'verified');
          setKycStatus('verified');
          
          // Process KYC verified milestone
          const scrapperUser = JSON.parse(localStorage.getItem('scrapperUser') || '{}');
          if (scrapperUser.phone || scrapperUser.id) {
            try {
              checkAndProcessMilestone(scrapperUser.phone || scrapperUser.id, 'scrapper', 'kycVerified');
            } catch (error) {
              console.error('Error processing milestone:', error);
            }
          }
          
          // Redirect to subscription page after verification
          setTimeout(() => {
            const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
            if (subscriptionStatus === 'active') {
              navigate('/scrapper', { replace: true });
            } else {
              navigate('/scrapper/subscription', { replace: true });
            }
          }, 1000);
        }, 10000); // 10 seconds
        
        return () => clearTimeout(autoVerifyTimer);
      }
    }
  }, [navigate]);

  // Check for status updates periodically (in real app, this would be via WebSocket or polling)
  useEffect(() => {
    const checkStatusInterval = setInterval(() => {
      const currentStatus = localStorage.getItem('scrapperKYCStatus');
      if (currentStatus === 'verified' && kycStatus !== 'verified') {
        setKycStatus('verified');
        
        // Process KYC verified milestone
        const scrapperUser = JSON.parse(localStorage.getItem('scrapperUser') || '{}');
        if (scrapperUser.phone || scrapperUser.id) {
          try {
            checkAndProcessMilestone(scrapperUser.phone || scrapperUser.id, 'scrapper', 'kycVerified');
          } catch (error) {
            console.error('Error processing milestone:', error);
          }
        }
        
        const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
        if (subscriptionStatus === 'active') {
          navigate('/scrapper', { replace: true });
        } else {
          navigate('/scrapper/subscription', { replace: true });
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkStatusInterval);
  }, [kycStatus, navigate]);

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'pending':
        return {
          label: 'Pending Verification',
          color: '#f59e0b',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.2"/>
              <path d="M12 6v6l4 2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          message: 'Your KYC is under review',
          description: 'Our admin team is verifying your documents. This usually takes 24-48 hours.',
          estimatedTime: '24-48 hours'
        };
      case 'verified':
        return {
          label: 'Verified',
          color: '#10b981',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="#10b981" fillOpacity="0.1"/>
              <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          message: 'Your KYC has been verified',
          description: 'You can now start receiving pickup requests.',
          estimatedTime: 'Completed'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: '#ef4444',
          icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#ef4444" fillOpacity="0.1"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ),
          message: 'Your KYC was rejected',
          description: 'Please resubmit your KYC documents with correct information.',
          estimatedTime: 'Resubmit required'
        };
      default:
        return {
          label: 'Not Submitted',
          color: '#718096',
          icon: null,
          message: 'KYC not submitted',
          description: 'Please complete your KYC to continue.',
          estimatedTime: 'Not started'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full p-4 md:p-6"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/scrapper')}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors flex-shrink-0"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2d3748' }}>
                KYC Status
              </h1>
            </div>
          </div>
          <p className="text-sm md:text-base ml-14" style={{ color: '#718096' }}>
            Track your KYC verification status
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 md:p-8 shadow-xl mb-6"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Status Icon & Label */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${statusConfig.color}20` }}
            >
              {statusConfig.icon}
            </div>
            <div className="flex-1">
              <h2
                className="text-xl md:text-2xl font-bold mb-1"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </h2>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                {statusConfig.message}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm md:text-base mb-4" style={{ color: '#2d3748' }}>
              {statusConfig.description}
            </p>
            
            {/* Testing: Auto-verification countdown */}
            {kycStatus === 'pending' && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl mb-4"
                style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-sm font-semibold" style={{ color: '#64946e' }}>
                    Testing Mode: Auto-verification in {countdown} seconds
                  </p>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 10, ease: 'linear' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: '#64946e' }}
                  />
                </div>
              </motion.div>
            )}
            
            {/* Estimated Time */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                    Estimated Completion Time:
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#64946e' }}>
                  {statusConfig.estimatedTime}
                </span>
              </div>
            </div>
          </div>

          {/* KYC Details */}
          {kycData && (
            <div className="pt-6 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
              <h3 className="text-base md:text-lg font-bold mb-4" style={{ color: '#2d3748' }}>
                Submitted Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#718096' }}>Aadhaar Number:</span>
                  <span className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                    {kycData.aadhaarNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#718096' }}>Submitted On:</span>
                  <span className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                    {new Date(kycData.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#718096' }}>Status:</span>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${statusConfig.color}20`,
                      color: statusConfig.color
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {kycStatus === 'rejected' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/scrapper/kyc')}
                className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#64946e', color: '#ffffff' }}
              >
                Resubmit KYC
              </motion.button>
            )}
            
            {kycStatus === 'verified' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Check subscription status before redirecting
                  const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
                  if (subscriptionStatus === 'active') {
                    navigate('/scrapper', { replace: true });
                  } else {
                    navigate('/scrapper/subscription', { replace: true });
                  }
                }}
                className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#64946e', color: '#ffffff' }}
              >
                Continue to Subscription
              </motion.button>
            )}

            {kycStatus === 'pending' && (
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#f59e0b' }}>
                  ⏳ Waiting for Verification
                </p>
                <p className="text-xs" style={{ color: '#718096' }}>
                  Your KYC is under review. You'll be automatically redirected to dashboard once verified.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e', flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                What happens next?
              </p>
              <ul className="text-xs md:text-sm space-y-1" style={{ color: '#718096' }}>
                <li>• Our admin team will verify your documents</li>
                <li>• Verification typically takes 24-48 hours</li>
                <li>• You'll receive a notification once verification is complete</li>
                <li>• Once verified, you can start receiving pickup requests</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KYCStatusPage;

