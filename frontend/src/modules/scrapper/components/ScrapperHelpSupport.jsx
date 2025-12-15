import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../shared/context/AuthContext';
import { createTicket, TICKET_ROLE } from '../../shared/utils/helpSupportUtils';

const ScrapperHelpSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // After successful submit, show black status box and then redirect to scrapper home
  useEffect(() => {
    if (success) {
      setStatusMessage('Your ticket has been submitted. Redirecting you to dashboard...');
      const timer = setTimeout(() => {
        navigate('/scrapper', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !message.trim()) return;
    if (submitting) return;

    setSubmitting(true);
    setStatusMessage('Submitting your ticket...');
    try {
      createTicket({
        role: TICKET_ROLE.SCRAPPER,
        userId: user?.id || user?.phone,
        name: user?.name || 'Scrapper',
        phone: user?.phone || '',
        category,
        message: message.trim()
      });
      setSuccess(true);
      setMessage('');
      setCategory('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full p-4 md:p-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="w-full p-2 md:p-4">
          <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#2d3748' }}>
            Help & Support
          </h2>
          <p className="text-xs md:text-sm mb-4" style={{ color: '#718096' }}>
            Facing an issue with pickups, payments, or the app? Create a support request and the admin team will review it.
          </p>

          {(submitting || success) && statusMessage && (
            <div
              className="mb-4 text-xs md:text-sm rounded-xl p-3 md:p-4"
              style={{ backgroundColor: '#000000', color: '#e5e7eb' }}
            >
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
                style={{
                  borderColor: category ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                  color: '#2d3748',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <option value="">Select an issue</option>
                <option value="pickup_routing">Pickup routing / request assignment</option>
                <option value="payment_payout">Payout / payment issue</option>
                <option value="subscription">Subscription / billing</option>
                <option value="kyc">KYC / verification</option>
                <option value="app_bug">App not working</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Describe your issue
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Please include request ID, approximate time, and any details that can help us..."
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base resize-none"
                style={{
                  borderColor: message.trim() ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                  color: '#2d3748',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || !category || !message.trim()}
              className="w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </motion.button>
          </form>
        </div>
    </motion.div>
  );
};

export default ScrapperHelpSupport;


