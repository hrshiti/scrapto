import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const KYCUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is authenticated as scrapper
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
    }
  }, [navigate]);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAadhaarPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadhaarPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfiePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelfiePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAadhaarNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    if (!aadhaarPhoto) {
      alert('Please upload Aadhaar photo');
      return;
    }
    
    if (!selfiePhoto) {
      alert('Please upload selfie photo');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      // Store KYC data in localStorage (frontend only)
      const kycData = {
        aadhaarNumber: aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-****-$3'), // Masked format
        aadhaarPhotoUrl: aadhaarPreview,
        selfieUrl: selfiePreview,
        status: 'pending', // pending, verified, rejected
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem('scrapperKYC', JSON.stringify(kycData));
      localStorage.setItem('scrapperKYCStatus', 'pending');

      setIsSubmitting(false);
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect to KYC status page after showing success message
      // Use window.location to force route re-evaluation
      setTimeout(() => {
        window.location.href = '/scrapper/kyc-status';
      }, 2000);
    }, 1500);
  };

  const maskedAadhaar = aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-****-$3');

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
          <button
            onClick={() => navigate('/scrapper/login')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors mb-4"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#2d3748' }}>
            KYC Verification
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#718096' }}>
            Complete your KYC to start receiving pickup requests
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: '#64946e' }}
              />
            </div>
            <span className="text-xs md:text-sm" style={{ color: '#718096' }}>Step 1 of 1</span>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Aadhaar Number */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Aadhaar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={aadhaarNumber}
              onChange={handleAadhaarNumberChange}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
              style={{
                borderColor: aadhaarNumber.length === 12 ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                color: '#2d3748',
                backgroundColor: '#f9f9f9'
              }}
              required
            />
            {aadhaarNumber.length === 12 && (
              <p className="text-xs mt-1" style={{ color: '#718096' }}>
                Masked: {maskedAadhaar}
              </p>
            )}
          </div>

          {/* Aadhaar Photo Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Aadhaar Card Photo <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500"
                style={{
                  borderColor: aadhaarPhoto ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                  backgroundColor: aadhaarPhoto ? 'rgba(100, 148, 110, 0.05)' : '#f9f9f9'
                }}
              >
                {aadhaarPreview ? (
                  <img src={aadhaarPreview} alt="Aadhaar preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3" style={{ color: '#64946e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm" style={{ color: '#718096' }}>
                      <span className="font-semibold">Click to upload</span> Aadhaar photo
                    </p>
                    <p className="text-xs" style={{ color: '#a0aec0' }}>PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAadhaarPhotoChange}
                  required
                />
              </label>
              {aadhaarPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setAadhaarPhoto(null);
                    setAadhaarPreview(null);
                  }}
                  className="text-xs font-semibold"
                  style={{ color: '#ef4444' }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Selfie Photo Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Selfie Photo <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500"
                style={{
                  borderColor: selfiePhoto ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                  backgroundColor: selfiePhoto ? 'rgba(100, 148, 110, 0.05)' : '#f9f9f9'
                }}
              >
                {selfiePreview ? (
                  <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3" style={{ color: '#64946e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="mb-2 text-sm" style={{ color: '#718096' }}>
                      <span className="font-semibold">Click to upload</span> selfie photo
                    </p>
                    <p className="text-xs" style={{ color: '#a0aec0' }}>PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSelfiePhotoChange}
                  required
                />
              </label>
              {selfiePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setSelfiePhoto(null);
                    setSelfiePreview(null);
                  }}
                  className="text-xs font-semibold"
                  style={{ color: '#ef4444' }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e', flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#2d3748' }}>
                  Important Information
                </p>
                <ul className="text-xs space-y-1" style={{ color: '#718096' }}>
                  <li>• Your KYC documents will be verified by our admin team</li>
                  <li>• Verification usually takes 24-48 hours</li>
                  <li>• You can start receiving requests after verification</li>
                  <li>• All documents are securely stored and encrypted</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || !aadhaarNumber || aadhaarNumber.length !== 12 || !aadhaarPhoto || !selfiePhoto}
            className="w-full py-4 md:py-5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#64946e', color: '#ffffff' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit KYC'
            )}
          </motion.button>
        </motion.form>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className="rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: '#ffffff', border: '2px solid #10b981' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="#10b981" fillOpacity="0.1"/>
                      <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: '#2d3748' }}>
                      KYC Submitted Successfully!
                    </h3>
                    <p className="text-sm mb-2" style={{ color: '#718096' }}>
                      Your KYC documents have been submitted for verification.
                    </p>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#2d3748' }}>
                        ⏱️ Verification Time:
                      </p>
                      <p className="text-xs" style={{ color: '#64946e' }}>
                        Usually takes 24-48 hours. You'll be notified once verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default KYCUploadPage;

