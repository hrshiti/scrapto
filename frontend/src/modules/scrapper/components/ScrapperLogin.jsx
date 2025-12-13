import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const ScrapperLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const inputRefs = useRef([]);
  const { login, isAuthenticated } = useAuth();

  // Helper function to check KYC status
  const getKYCStatus = () => {
    const kycStatus = localStorage.getItem('scrapperKYCStatus');
    const kycData = localStorage.getItem('scrapperKYC');
    
    if (!kycData) return 'not_submitted';
    if (kycStatus === 'verified') return 'verified';
    if (kycStatus === 'pending') return 'pending';
    if (kycStatus === 'rejected') return 'rejected';
    return 'not_submitted';
  };

  // Redirect after authentication state updates
  useEffect(() => {
    if (isAuthenticated && shouldRedirect) {
      const kycStatus = getKYCStatus();
      
      // Strict routing: Only verified can access dashboard
      if (kycStatus === 'not_submitted' || kycStatus === 'rejected') {
        // First time login or rejected - must do KYC
        navigate('/scrapper/kyc', { replace: true });
      } else if (kycStatus === 'pending') {
        // KYC submitted but pending - show status page
        navigate('/scrapper/kyc-status', { replace: true });
      } else if (kycStatus === 'verified') {
        // KYC verified - check subscription status
        const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
        if (subscriptionStatus === 'active') {
          navigate('/scrapper', { replace: true });
        } else {
          navigate('/scrapper/subscription', { replace: true });
        }
      } else {
        // Default: redirect to KYC
        navigate('/scrapper/kyc', { replace: true });
      }
      
      setShouldRedirect(false);
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      if (!isLogin && (!name.trim() || !vehicleInfo.trim())) {
        return;
      }
      setOtpSent(true);
      // Auto-focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all OTP digits are filled
    if (value && index === 5) {
      const updatedOtp = [...newOtp];
      if (updatedOtp.every((digit) => digit !== '')) {
        setTimeout(() => {
          const userData = {
            name: isLogin ? 'Scrapper Name' : name,
            phone: phone,
            role: 'scrapper',
            vehicleInfo: vehicleInfo || 'Not provided'
          };
          login(userData);
          setShouldRedirect(true);
        }, 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    // In real app, resend OTP API call here
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ backgroundColor: '#f4ebe2' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#64946e' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 17h14l-1-7H6l-1 7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.2"/>
              <circle cx="7" cy="19" r="1.5" fill="white"/>
              <circle cx="17" cy="19" r="1.5" fill="white"/>
              <path d="M3 12h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2d3748' }}>
            Scrapper Portal
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#718096' }}>
            {isLogin ? 'Welcome back!' : 'Start earning with us'}
          </p>
        </motion.div>

        {/* Toggle Login/Signup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <button
            onClick={() => {
              setIsLogin(true);
              setOtpSent(false);
              setOtp(['', '', '', '', '', '']);
            }}
            className={`px-6 py-2 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
              isLogin
                ? 'shadow-md'
                : 'opacity-50 hover:opacity-70'
            }`}
            style={{
              backgroundColor: isLogin ? '#64946e' : 'transparent',
              color: isLogin ? '#ffffff' : '#718096',
              border: isLogin ? 'none' : '2px solid rgba(100, 148, 110, 0.3)'
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setOtpSent(false);
              setOtp(['', '', '', '', '', '']);
            }}
            className={`px-6 py-2 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
              !isLogin
                ? 'shadow-md'
                : 'opacity-50 hover:opacity-70'
            }`}
            style={{
              backgroundColor: !isLogin ? '#64946e' : 'transparent',
              color: !isLogin ? '#ffffff' : '#718096',
              border: !isLogin ? 'none' : '2px solid rgba(100, 148, 110, 0.3)'
            }}
          >
            Register
          </button>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl p-6 md:p-8 shadow-xl"
          style={{ backgroundColor: '#ffffff' }}
        >
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.form
                key="phone-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
                      style={{
                        borderColor: name ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                        color: '#2d3748',
                        backgroundColor: '#f9f9f9'
                      }}
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                      Vehicle Information
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo}
                      onChange={(e) => setVehicleInfo(e.target.value)}
                      placeholder="e.g., Truck - MH-12-AB-1234"
                      className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
                      style={{
                        borderColor: vehicleInfo ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                        color: '#2d3748',
                        backgroundColor: '#f9f9f9'
                      }}
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(value);
                    }}
                    placeholder="Enter 10-digit phone number"
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
                    style={{
                      borderColor: phone.length === 10 ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                      color: '#2d3748',
                      backgroundColor: '#f9f9f9'
                    }}
                    maxLength={10}
                    required
                  />
                </div>

                {isLogin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#64946e' }}
                    />
                    <label htmlFor="remember" className="text-xs md:text-sm" style={{ color: '#718096' }}>
                      Remember me
                    </label>
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={phone.length !== 10 || (!isLogin && (!name.trim() || !vehicleInfo.trim()))}
                  className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                >
                  {isLogin ? 'Send OTP' : 'Register & Send OTP'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2d3748' }}>
                    Enter OTP
                  </h3>
                  <p className="text-sm" style={{ color: '#718096' }}>
                    We've sent a 6-digit OTP to <span className="font-semibold">+91 {phone}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2 md:gap-3">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        borderColor: digit ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                        color: '#2d3748',
                        backgroundColor: digit ? 'rgba(100, 148, 110, 0.1)' : '#f9f9f9'
                      }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: '#64946e' }}
                  >
                    Resend OTP
                  </button>
                </div>

                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (otp.every((digit) => digit !== '')) {
                      const userData = {
                        name: isLogin ? 'Scrapper Name' : name,
                        phone: phone,
                        role: 'scrapper',
                        vehicleInfo: vehicleInfo || 'Not provided'
                      };
                      login(userData);
                      setShouldRedirect(true);
                    }
                  }}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!otp.every((digit) => digit !== '')}
                  className="w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                >
                  Verify & Continue
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
            By continuing, you agree to our{' '}
            <span className="font-semibold" style={{ color: '#64946e' }}>
              Terms & Conditions
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ScrapperLogin;

