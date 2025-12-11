import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import leafImage from '../../../assets/leafs.jpg';
import bgLeafImage from '../../../assets/bgleaf-removebg-preview.png';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const inputRefs = useRef([]);
  const { login } = useAuth();

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
          const userData = {
            name: isLogin ? 'User Name' : name,
            phone: phone,
          };
          login(userData);
        }, 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== '')) {
      const userData = {
        name: isLogin ? 'User Name' : name,
        phone: phone,
      };
      login(userData);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Dark Green Overlay for Better Contrast - Covers entire screen including form */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'rgba(45, 80, 22, 0.6)',
        }}
      />
      
      {/* Top Section - Green Leafy Background (Increased height) */}
      <div 
        className="relative h-[45vh] md:h-[50vh] overflow-hidden z-10"
        style={{ 
          backgroundColor: '#2d5016',
        }}
      >
        {/* Main Leaf Image Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${leafImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.7,
            filter: 'brightness(0.4) saturate(1.3)',
          }}
        />
        
        {/* Leaf Pattern Overlay for More Depth */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgLeafImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.5,
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Back Button */}
        <button
          className="absolute top-4 md:top-6 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110"
          style={{ backgroundColor: '#a8d5a3' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Wavy Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-16">
            <path d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z" fill="#ffffff"/>
          </svg>
        </div>
      </div>

      {/* Main Content Area - Project Theme Background */}
      <div 
        className="relative -mt-8 md:-mt-12 rounded-t-3xl z-10"
        style={{ backgroundColor: '#f4ebe2', minHeight: '55vh' }}
      >
        <div className="px-6 md:px-8 lg:px-12 pt-8 md:pt-12 pb-20 md:pb-12 max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: '#2d3748' }}
            >
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p 
              className="text-sm md:text-base"
              style={{ color: '#718096' }}
            >
              {isLogin ? 'Login to your account' : 'Create your account'}
            </p>
          </div>

          {/* Decorative Leaf Sprig */}
          <div className="absolute top-16 md:top-20 right-6 md:right-8 opacity-60">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
              <path d="M12 2C8 2 5 5 5 9c0 4 3 7 7 7s7-3 7-7c0-4-3-7-7-7z" fill="currentColor" opacity="0.3"/>
              <path d="M8 12c-2 0-4-1-4-3s2-3 4-3 4 1 4 3-2 3-4 3z" fill="currentColor"/>
            </svg>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
                  <div className="flex-1 flex gap-2 justify-center">
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
                        className="w-10 h-10 md:w-12 md:h-12 text-center text-xl md:text-2xl font-bold border-2 rounded-lg focus:outline-none transition-all bg-white"
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
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
