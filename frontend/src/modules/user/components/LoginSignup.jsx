import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { validateReferralCode, createReferral, processSignupBonus, getReferralSettings } from '../../shared/utils/referralUtils';
import leafImage from '../../../assets/leaf.jpg';
import bgLeafImage from '../../../assets/earth-removebg-preview.png';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [heardFrom, setHeardFrom] = useState('');
  const [heardFromOther, setHeardFromOther] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeError, setReferralCodeError] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const inputRefs = useRef([]);
  const { login, isAuthenticated } = useAuth();
  
  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      setShowReferralCode(true);
      validateReferralCodeInput(refCode.toUpperCase());
    }
  }, [searchParams]);

  // Redirect after authentication state updates
  useEffect(() => {
    if (isAuthenticated && shouldRedirect) {
      navigate('/', { replace: true });
      setShouldRedirect(false);
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      if (!isLogin && !name.trim()) {
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
          handleRegistration(updatedOtp);
        }, 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validate referral code input
  const validateReferralCodeInput = (code) => {
    if (!code || code.trim() === '') {
      setReferralCodeError('');
      setReferrerName('');
      return;
    }
    
    const validation = validateReferralCode(code.toUpperCase());
    if (!validation.valid) {
      setReferralCodeError(validation.error);
      setReferrerName('');
    } else {
      // Check if cross-referrals are allowed
      const settings = getReferralSettings();
      if (!settings.allowCrossReferrals && validation.referrerType !== 'user') {
        setReferralCodeError('This code is for scrappers only. Please use a user referral code.');
        setReferrerName('');
      } else {
        setReferralCodeError('');
        if (validation.referrerType === 'scrapper') {
          setReferrerName('Scrapper Friend'); // Cross-referral
        } else {
          setReferrerName('User Friend');
        }
      }
    }
  };

  const handleReferralCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setReferralCode(value);
    validateReferralCodeInput(value);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== '')) {
      handleRegistration(otp);
    }
  };

  const handleRegistration = (otpArray) => {
    const computedHeardFrom =
      heardFrom === 'other' && heardFromOther.trim()
        ? `other:${heardFromOther.trim()}`
        : heardFrom || null;

    const userData = {
      name: isLogin ? 'User Name' : name,
      phone: phone,
      id: `user_${Date.now()}`,
      walletBalance: 0,
      heardFrom: computedHeardFrom
    };
    
    login(userData);
    
    // Process referral if code is provided and valid
    if (!isLogin && referralCode && referralCode.trim() !== '' && !referralCodeError) {
      try {
        const referralResult = createReferral(referralCode, phone, 'user');
        if (referralResult.success) {
          // Process signup bonus
          processSignupBonus(referralResult.referral.id);
        }
      } catch (error) {
        console.error('Referral processing error:', error);
      }
    }
    
    setShouldRedirect(true);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-6 md:px-6 md:py-10 lg:py-12 relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, #bbf7d0 0, transparent 50%), radial-gradient(circle at bottom right, #86efac 0, transparent 55%), linear-gradient(135deg, #022c22 0%, #064e3b 40%, #052e16 100%)'
      }}
    >
      {/* Soft background orbs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-72 h-72 rounded-full bg-emerald-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-lime-300/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-5xl grid md:grid-cols-2 gap-0 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden"
      >
        {/* Left panel – illustration & selling points */}
        <div className="hidden md:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white relative">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Cleaner city, smarter scrap
            </p>
            <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold leading-tight">
              Turn your scrap
              <br />
              into instant value.
            </h2>
            <p className="mt-3 text-sm lg:text-base text-emerald-100/90">
              Book doorstep pickups at live market prices. Trusted scrappers, fair weights, and quick payouts.
            </p>
          </div>

          <div className="mt-6 space-y-3 text-xs lg:text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
              </div>
              <p>No bargaining – transparent rates synced with admin price feed.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
              </div>
              <p>Track your referrals & rewards directly from your profile.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
              </div>
              <p>Login with OTP – no passwords, no hassle.</p>
            </div>
          </div>

          {/* Floating leaf image */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -4 }}
            animate={{ opacity: 0.12, y: 0, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="pointer-events-none absolute -right-10 bottom-4 w-56 h-56 rounded-full overflow-hidden border border-white/10"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${leafImage})` }}
            />
          </motion.div>
        </div>

        {/* Right panel – actual form */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full bg-white px-6 py-7 sm:px-7 sm:py-8 lg:px-8 lg:py-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-6 md:mb-8 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isLogin ? 'Welcome back to Scrapto' : 'New here? Join Scrapto in 30 seconds'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#1f2933' }}>
              {isLogin ? 'Login to your account' : 'Create your Scrapto account'}
            </h1>
            <p className="text-xs md:text-sm" style={{ color: '#6b7280' }}>
              Use your mobile number for a fast, secure OTP‑based login. No passwords required.
            </p>
          </motion.div>

          {/* Toggle Login/Signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="flex items-center justify-center md:justify-start gap-3 mb-6"
          >
            <button
              onClick={() => {
                setIsLogin(true);
                setOtpSent(false);
                setOtp(['', '', '', '', '', '']);
              }}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setOtpSent(false);
                setOtp(['', '', '', '', '', '']);
              }}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            onSubmit={otpSent && otp.every(d => d !== '') ? handleOtpSubmit : handlePhoneSubmit}
            className="space-y-4 md:space-y-5"
          >
            {/* Full Name Input (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <div 
                  className="flex items-center px-4 py-3 md:py-3.5 rounded-xl border transition-all"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5ddd4',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#64946e';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5ddd4';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3" style={{ color: '#64946e' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="flex-1 bg-transparent border-none outline-none text-base md:text-lg"
                    style={{ color: '#2d3748' }}
                  />
                </div>
              </motion.div>
            )}

            {/* How did you hear about Scrapto? (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <label className="block text-xs md:text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                  How did you hear about Scrapto?
                </label>
                <div 
                  className="flex items-center px-4 py-3 md:py-3.5 rounded-xl border transition-all mb-2"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5ddd4',
                  }}
                >
                  <select
                    value={heardFrom}
                    onChange={(e) => setHeardFrom(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm md:text-base"
                    style={{ color: '#2d3748' }}
                  >
                    <option value="">Select an option</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="google_search">Google Search</option>
                    <option value="friend_family">Friends / Family</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {heardFrom === 'other' && (
                  <div 
                    className="flex items-center px-4 py-3 md:py-3.5 rounded-xl border transition-all"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e5ddd4',
                    }}
                  >
                    <input
                      type="text"
                      value={heardFromOther}
                      onChange={(e) => setHeardFromOther(e.target.value)}
                      placeholder="Please specify (e.g., college event, poster)"
                      className="flex-1 bg-transparent border-none outline-none text-sm md:text-base"
                      style={{ color: '#2d3748' }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Referral Code Input (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setShowReferralCode(!showReferralCode)}
                    className="text-sm font-medium flex items-center gap-1"
                    style={{ color: '#64946e' }}
                  >
                    {showReferralCode ? 'Hide' : 'Have a referral code?'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points={showReferralCode ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                    </svg>
                  </button>
                </div>
                {showReferralCode && (
                  <div 
                    className={`flex items-center px-4 py-3 md:py-3.5 rounded-xl border transition-all ${
                      referralCodeError ? 'border-red-400' : referrerName ? 'border-green-400' : ''
                    }`}
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: referralCodeError ? '#ef4444' : referrerName ? '#10b981' : '#e5ddd4',
                    }}
                    onFocus={(e) => {
                      if (!referralCodeError && !referrerName) {
                        e.currentTarget.style.borderColor = '#64946e';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!referralCodeError && !referrerName) {
                        e.currentTarget.style.borderColor = '#e5ddd4';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3" style={{ color: referralCodeError ? '#ef4444' : referrerName ? '#10b981' : '#64946e' }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={handleReferralCodeChange}
                      placeholder="Enter referral code (e.g., USER-ABC123)"
                      className="flex-1 bg-transparent border-none outline-none text-base md:text-lg uppercase"
                      style={{ color: '#2d3748' }}
                      maxLength={13}
                    />
                    {referrerName && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="ml-2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )}
                {referralCodeError && (
                  <p className="text-xs mt-1 ml-1" style={{ color: '#ef4444' }}>
                    {referralCodeError}
                  </p>
                )}
                {referrerName && !referralCodeError && (
                  <p className="text-xs mt-1 ml-1" style={{ color: '#10b981' }}>
                    ✓ You were referred by {referrerName}
                  </p>
                )}
              </motion.div>
            )}

            {/* Phone Number Input */}
            {!otpSent && (
              <div className="relative">
                <div 
                  className="flex items-center px-4 py-3 md:py-3.5 rounded-xl border transition-all"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5ddd4',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#64946e';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5ddd4';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3" style={{ color: '#64946e' }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Phone Number"
                    className="flex-1 bg-transparent border-none outline-none text-base md:text-lg"
                    style={{ color: '#2d3748' }}
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            {/* OTP Input (shown after phone submission) */}
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <div 
                  className="flex items-center px-4 py-3 md:py-3.5 rounded-xl border"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5ddd4',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3" style={{ color: '#64946e' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <div className="flex-1 flex flex-wrap justify-between gap-1.5 max-w-xs mx-auto">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-9 h-10 md:w-11 md:h-11 text-center text-lg md:text-2xl font-bold border-2 rounded-lg focus:outline-none transition-all bg-white"
                        style={{ 
                          borderColor: digit ? '#64946e' : '#e5ddd4',
                          color: '#2d3748',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#64946e';
                          e.target.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = digit ? '#64946e' : '#e5ddd4';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Remember Me & Resend OTP */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div 
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-2 transition-all ${
                    rememberMe ? 'border-green-600' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: rememberMe ? '#64946e' : 'transparent',
                  }}
                >
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span className="text-sm" style={{ color: '#718096' }}>
                  Remember Me
                </span>
              </label>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(true);
                    setOtp(['', '', '', '', '', '']);
                    setTimeout(() => {
                      inputRefs.current[0]?.focus();
                    }, 100);
                  }}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#64946e' }}
                >
                  Resend OTP?
                </button>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={
                (!otpSent && (phone.length !== 10 || (!isLogin && !name.trim()))) ||
                (otpSent && otp.some(d => d === ''))
              }
              className="w-full text-white font-bold py-4 md:py-4.5 rounded-xl disabled:cursor-not-allowed disabled:opacity-50 transition-all text-base md:text-lg shadow-lg"
              style={{ 
                backgroundColor: (
                  (!otpSent && phone.length === 10 && (isLogin || name.trim())) ||
                  (otpSent && otp.every(d => d !== ''))
                ) ? '#64946e' : '#cbd5e0',
              }}
              onMouseEnter={(e) => {
                if ((!otpSent && phone.length === 10 && (isLogin || name.trim())) || (otpSent && otp.every(d => d !== ''))) {
                  e.target.style.backgroundColor = '#5a8263';
                }
              }}
              onMouseLeave={(e) => {
                if ((!otpSent && phone.length === 10 && (isLogin || name.trim())) || (otpSent && otp.every(d => d !== ''))) {
                  e.target.style.backgroundColor = '#64946e';
                }
              }}
            >
              {otpSent ? (otp.every(d => d !== '') ? 'Verify & Login' : 'Enter OTP') : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </motion.form>

          {/* Sign Up Link */}
          <div className="mt-6 md:mt-8 text-center">
            <p className="text-sm md:text-base" style={{ color: '#718096' }}>
              {isLogin ? "Don't have account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPhone('');
                  setName('');
                  setOtp(['', '', '', '', '', '']);
                  setOtpSent(false);
                }}
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#64946e' }}
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginSignup;
