import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../shared/context/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);
  const { login, isAuthenticated } = useAdminAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
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
          const adminData = {
            id: 'admin_001',
            name: 'Admin User',
            phone: phone,
            email: 'admin@scrapto.com',
            role: 'admin',
            permissions: ['all']
          };
          login(adminData);
          navigate('/admin', { replace: true });
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
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.2"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.2"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.2"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2d3748' }}>
            Admin Portal
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#718096' }}>
            Sign in to manage the platform
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
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
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: '#e2e8f0',
                      focusBorderColor: '#64946e',
                      focusRingColor: '#64946e'
                    }}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all"
                  style={{ backgroundColor: '#64946e' }}
                  disabled={phone.length !== 10}
                >
                  Send OTP
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
                <div>
                  <label className="block text-sm font-semibold mb-2 text-center" style={{ color: '#2d3748' }}>
                    Enter OTP sent to {phone}
                  </label>
                  <div className="flex gap-2 justify-center">
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
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: '#e2e8f0',
                          focusBorderColor: '#64946e',
                          focusRingColor: '#64946e'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: '#64946e' }}
                  >
                    Resend OTP
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-sm"
          style={{ color: '#718096' }}
        >
          <p>Secure admin access only</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

