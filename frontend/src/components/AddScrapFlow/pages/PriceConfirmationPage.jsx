import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PriceConfirmationPage = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [weightData, setWeightData] = useState(null);
  const [notes, setNotes] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [marketPrices, setMarketPrices] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPayout, setEstimatedPayout] = useState(0);

  // Load all data from sessionStorage
  useEffect(() => {
    const storedCategories = sessionStorage.getItem('selectedCategories');
    const storedImages = sessionStorage.getItem('uploadedImages');
    const storedWeight = sessionStorage.getItem('weightData');

    if (storedCategories) {
      setSelectedCategories(JSON.parse(storedCategories));
    }
    if (storedImages) {
      setUploadedImages(JSON.parse(storedImages));
    }
    if (storedWeight) {
      const weight = JSON.parse(storedWeight);
      setWeightData(weight);
      setEstimatedPayout(weight.estimatedPayout || 0);
    }

    // Redirect if missing required data
    if (!storedCategories || !storedImages || !storedWeight) {
      navigate('/add-scrap/category');
    }
  }, [navigate]);

  // Mock market prices
  useEffect(() => {
    setMarketPrices({
      'Plastic': 45,
      'Metal': 180,
      'Paper': 12,
      'Electronics': 85,
      'Copper': 650,
      'Aluminium': 180,
      'Steel': 35,
      'Brass': 420,
    });
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring click');
      return;
    }
    
    console.log('handleSubmit called');
    setIsSubmitting(true);
    
    // Prepare submission data
    const submissionData = {
      categories: selectedCategories,
      images: uploadedImages,
      weight: weightData?.weight,
      estimatedPayout: estimatedPayout,
      notes: notes,
      preferredTime: preferredTime,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('Storing data in sessionStorage', submissionData);
      // Store in sessionStorage for now (in real app, send to backend)
      sessionStorage.setItem('scrapRequest', JSON.stringify(submissionData));
      console.log('Data stored successfully');
      
      // Simulate brief API call delay (reduced for better UX)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('About to navigate to /request-status');
      console.log('Current pathname:', window.location.pathname);
      console.log('Navigate function type:', typeof navigate);
      
      // Redirect to status page - use replace: true to avoid back button issues
      navigate('/request-status', { 
        state: { requestData: submissionData },
        replace: true 
      });
      
      console.log('Navigation called');
      
      // Force navigation after a short delay to ensure it happens
      setTimeout(() => {
        const currentPath = window.location.pathname;
        console.log('Checking path after delay:', currentPath);
        if (currentPath !== '/request-status') {
          console.log('Fallback: Using window.location.href');
          window.location.href = '/request-status';
        } else {
          console.log('Navigation successful via React Router');
        }
      }, 200);
    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error stack:', error.stack);
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    'Anytime'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
        <button
          onClick={() => navigate('/add-scrap/weight')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 
          className="text-lg md:text-2xl font-bold"
          style={{ color: '#2d3748' }}
        >
          Confirm & Apply
        </h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Progress Indicator */}
      <div className="px-3 md:px-6 pt-3 md:pt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'rgba(100, 148, 110, 0.2)' }}>
            <motion.div
              initial={{ width: '75%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ backgroundColor: '#64946e' }}
            />
          </div>
          <span className="text-xs md:text-sm" style={{ color: '#718096' }}>Step 4 of 4</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h3 className="text-base md:text-lg font-bold mb-4" style={{ color: '#2d3748' }}>
            Request Summary
          </h3>

          {/* Selected Categories */}
          <div className="mb-4">
            <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
              Categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium"
                  style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
                Images ({uploadedImages.length}):
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weight */}
          {weightData && (
            <div className="mb-4">
              <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>
                Weight:
              </p>
              <p className="text-base md:text-lg font-semibold" style={{ color: '#2d3748' }}>
                {weightData.weight} kg
                {weightData.mode === 'auto' && (
                  <span className="text-xs md:text-sm ml-2" style={{ color: '#718096' }}>
                    (Auto-detected)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="mb-4 pb-4 border-b" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
            <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
              Price Breakdown:
            </p>
            {selectedCategories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center mb-1">
                <span className="text-xs md:text-sm" style={{ color: '#2d3748' }}>
                  {cat.name}
                </span>
                <span className="text-xs md:text-sm font-medium" style={{ color: '#64946e' }}>
                  ₹{marketPrices[cat.name] || 0}/kg
                </span>
              </div>
            ))}
          </div>

          {/* Total Estimated Payout */}
          <div className="pt-4">
            <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
              Estimated Payout:
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold" style={{ color: '#64946e' }}>
                ₹{estimatedPayout.toFixed(0)}
              </span>
              <span className="text-sm md:text-base" style={{ color: '#718096' }}>
                for {weightData?.weight || 0} kg
              </span>
            </div>
          </div>
        </motion.div>

        {/* Additional Options */}
        <div className="space-y-4 md:space-y-6">
          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-4 md:p-6"
            style={{ backgroundColor: '#ffffff' }}
          >
            <label className="block text-sm md:text-base font-semibold mb-2" style={{ color: '#2d3748' }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or details about your scrap..."
              rows={4}
              className="w-full py-2 px-3 md:py-3 md:px-4 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-none text-sm md:text-base"
              style={{
                borderColor: notes ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                color: '#2d3748',
                backgroundColor: '#f9f9f9'
              }}
            />
          </motion.div>

          {/* Preferred Time Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4 md:p-6"
            style={{ backgroundColor: '#ffffff' }}
          >
            <label className="block text-sm md:text-base font-semibold mb-2" style={{ color: '#2d3748' }}>
              Preferred Pickup Time (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setPreferredTime(slot === preferredTime ? '' : slot)}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 border-2 ${
                    preferredTime === slot ? 'shadow-md' : ''
                  }`}
                  style={{
                    borderColor: preferredTime === slot ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                    backgroundColor: preferredTime === slot ? '#64946e' : 'transparent',
                    color: preferredTime === slot ? '#ffffff' : '#64946e'
                  }}
                  onMouseEnter={(e) => {
                    if (preferredTime !== slot) {
                      e.target.style.backgroundColor = 'rgba(100, 148, 110, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preferredTime !== slot) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer with Apply Button */}
      <div className="p-3 md:p-6 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.2)' }}>
        {isSubmitting ? (
          <div className="w-full py-3 md:py-4 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4"
              style={{ borderTopColor: '#64946e', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
            />
            <span className="ml-3 text-sm md:text-base font-semibold" style={{ color: '#64946e' }}>
              Submitting Request...
            </span>
          </div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleSubmit}
            type="button"
            disabled={isSubmitting}
            className="w-full py-4 md:py-5 rounded-full text-white font-bold text-base md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#64946e', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#5a8263';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = '#64946e';
              }
            }}
          >
            Apply for Pickup - ₹{estimatedPayout.toFixed(0)}
          </motion.button>
        )}
        <p className="text-xs md:text-sm text-center mt-3" style={{ color: '#718096' }}>
          By applying, you agree to our terms and conditions
        </p>
      </div>
    </motion.div>
  );
};

export default PriceConfirmationPage;

