import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../modules/shared/context/AuthContext';
import { checkAndProcessMilestone } from '../../../modules/shared/utils/referralUtils';
import { orderAPI } from '../../../modules/shared/utils/api';

const PriceConfirmationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [weightData, setWeightData] = useState(null);
  const [notes, setNotes] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // ISO date string
  const [selectedSlot, setSelectedSlot] = useState('');
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

  // Helper: generate next 7 days (including today)
  const getNextDays = (count = 7) => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const iso = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const display = `${dayName}, ${date.getDate()}`;
      days.push({ iso, dayName, display });
    }
    return days;
  };

  const mapCategoryToBackend = (cat) => {
    const id = (cat.id || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();
    if (id.includes('metal') || name === 'metal') return 'metal';
    if (id.includes('plastic') || name === 'plastic') return 'plastic';
    if (id.includes('paper') || name === 'paper') return 'paper';
    if (id.includes('electronic') || name === 'electronics' || name === 'electronic') return 'electronic';
    if (id.includes('glass') || name === 'glass') return 'glass';
    return 'other';
  };

  const handleSubmit = useCallback(async (e) => {
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
    
    if (!selectedDate || !selectedSlot) {
      alert('Please select a pickup date and time slot before applying.');
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      alert('Please login to place a pickup request.');
      setIsSubmitting(false);
      return;
    }

    const dateObj = new Date(selectedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];
    const pickupSlot = {
      date: selectedDate,
      dayName,
      slot: selectedSlot
    };

    const totalWeight = Number(weightData?.weight || 0);
    const itemCount = Math.max(selectedCategories.length, 1);
    const weightPerItem = totalWeight > 0 ? totalWeight / itemCount : 0;

    const scrapItems = selectedCategories.map((cat) => {
      const category = mapCategoryToBackend(cat);
      const rate = cat.price || marketPrices[cat.name] || 0;
      const total = weightPerItem * rate;
      return {
        category,
        weight: weightPerItem || 1,
        rate,
        total
      };
    });

    const images = uploadedImages.map((img) => ({
      url: img.url || img.preview,
      publicId: img.publicId || null
    }));

    const payload = {
      scrapItems,
      preferredTime,
      pickupSlot,
      images,
      notes
    };

    try {
      const response = await orderAPI.create(payload);
      const createdOrder = response.data?.order || null;

      if (createdOrder) {
        try {
          checkAndProcessMilestone(user.phone || user.id, 'user', 'firstRequest');
        } catch (err) {
          console.error('Error processing milestone:', err);
        }
      }

      navigate('/request-status', { 
        state: { requestData: createdOrder || payload },
        replace: true 
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error stack:', error.stack);
      alert(error.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  }, [isSubmitting, selectedDate, selectedSlot, selectedCategories, uploadedImages, weightData, preferredTime, user, navigate, marketPrices]);

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM'
  ];

  const dayOptions = getNextDays(7);

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
      <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-6">
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

          {/* Preferred Pickup Date & Time Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4 md:p-6"
            style={{ backgroundColor: '#ffffff' }}
          >
            <label className="block text-sm md:text-base font-semibold mb-2" style={{ color: '#2d3748' }}>
              Preferred Pickup Date & Time
            </label>

            {/* Date selection */}
            <div className="mb-3">
              <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
                Select a day (today or upcoming days)
              </p>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedDate(day.iso);
                      // Keep preferredTime string in sync for older consumers
                      if (selectedSlot) {
                        setPreferredTime(`${day.dayName}, ${day.iso} • ${selectedSlot}`);
                      }
                    }}
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 border-2 ${
                      selectedDate === day.iso ? 'shadow-md' : ''
                    }`}
                    style={{
                      borderColor: selectedDate === day.iso ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                      backgroundColor: selectedDate === day.iso ? '#64946e' : 'transparent',
                      color: selectedDate === day.iso ? '#ffffff' : '#64946e'
                    }}
                  >
                    {day.display}
                  </button>
                ))}
              </div>

              {/* Manual date input (theme-styled, no native picker) */}
              <div className="mt-3">
                <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>
                  Or type a specific date
                </p>
                <input
                  type="text"
                  placeholder="e.g. 2025-01-20"
                  value={selectedDate || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDate(value);
                    if (value && selectedSlot) {
                      const dateObj = new Date(value);
                      if (!isNaN(dateObj)) {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = dayNames[dateObj.getDay()];
                        setPreferredTime(`${dayName}, ${value} • ${selectedSlot}`);
                      } else {
                        setPreferredTime(`${value} • ${selectedSlot}`);
                      }
                    } else {
                      setPreferredTime('');
                    }
                  }}
                  className="w-full py-2 px-3 md:py-2.5 md:px-3.5 rounded-lg border-2 focus:outline-none focus:ring-2 text-xs md:text-sm"
                  style={{
                    borderColor: selectedDate ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                    color: '#2d3748',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </div>
            </div>

            {/* Time slot selection */}
            <div>
              <p className="text-xs md:text-sm mb-2" style={{ color: '#718096' }}>
                Select a time window
              </p>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newSlot = slot === selectedSlot ? '' : slot;
                      setSelectedSlot(newSlot);
                      if (selectedDate && newSlot) {
                        const dateObj = new Date(selectedDate);
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = dayNames[dateObj.getDay()];
                        setPreferredTime(`${dayName}, ${selectedDate} • ${newSlot}`);
                      } else if (!newSlot) {
                        setPreferredTime('');
                      }
                    }}
                    className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 border-2 ${
                      selectedSlot === slot ? 'shadow-md' : ''
                    }`}
                    style={{
                      borderColor: selectedSlot === slot ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                      backgroundColor: selectedSlot === slot ? '#64946e' : 'transparent',
                      color: selectedSlot === slot ? '#ffffff' : '#64946e'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSlot !== slot) {
                        e.target.style.backgroundColor = 'rgba(100, 148, 110, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSlot !== slot) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              {/* Manual time input (theme-styled, no native picker) */}
              <div className="mt-3">
                <p className="text-xs md:text-sm mb-1" style={{ color: '#718096' }}>
                  Or type a specific time
                </p>
                <input
                  type="text"
                  placeholder="e.g. 14:30 or 2:30 PM"
                  value={selectedSlot || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSlot(value);
                    if (selectedDate && value) {
                      const dateObj = new Date(selectedDate);
                      if (!isNaN(dateObj)) {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = dayNames[dateObj.getDay()];
                        setPreferredTime(`${dayName}, ${selectedDate} • ${value}`);
                      } else {
                        setPreferredTime(`${selectedDate} • ${value}`);
                      }
                    } else {
                      setPreferredTime('');
                    }
                  }}
                  className="w-full py-2 px-3 md:py-2.5 md:px-3.5 rounded-lg border-2 focus:outline-none focus:ring-2 text-xs md:text-sm"
                  style={{
                    borderColor: selectedSlot ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                    color: '#2d3748',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </div>
            </div>

            {/* Small summary line when both selected */}
            {selectedDate && selectedSlot && (
              <p className="mt-3 text-xs md:text-sm" style={{ color: '#718096' }}>
                You selected: <span className="font-semibold" style={{ color: '#2d3748' }}>{preferredTime}</span>
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer with Apply Button - Fixed on Mobile */}
      <div 
        className="fixed md:relative bottom-0 left-0 right-0 p-3 md:p-6 border-t"
        style={{ 
          borderColor: 'rgba(100, 148, 110, 0.2)',
          backgroundColor: '#f4ebe2',
          pointerEvents: 'auto',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 9999
        }}
      >
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
            onClick={(e) => {
              console.log('Button clicked, isSubmitting:', isSubmitting, 'selectedDate:', selectedDate, 'selectedSlot:', selectedSlot);
              e.preventDefault();
              e.stopPropagation();
              if (!isSubmitting) {
                console.log('Calling handleSubmit');
                handleSubmit(e);
              } else {
                console.log('Already submitting, ignoring click');
              }
            }}
            type="button"
            disabled={isSubmitting}
            className="w-full py-4 md:py-5 rounded-full text-white font-bold text-base md:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: '#64946e', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'auto',
              zIndex: 50,
              position: 'relative'
            }}
            whileTap={{ scale: 0.98 }}
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

