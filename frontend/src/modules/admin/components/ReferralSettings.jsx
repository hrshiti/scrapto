import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  getReferralSettings, 
  updateReferralSettings 
} from '../../shared/utils/referralUtils';
import {
  FaGift,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaRupeeSign,
  FaUsers,
  FaTruck
} from 'react-icons/fa';

const ReferralSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentSettings = getReferralSettings();
    setSettings(currentSettings);
  }, []);

  const handleSave = () => {
    setLoading(true);
    updateReferralSettings(settings);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggle = () => {
    setSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = parseFloat(value) || 0;
      return newSettings;
    });
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#718096' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
            >
              <FaGift className="text-3xl" style={{ color: '#64946e' }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d3748' }}>
                Referral Settings
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                Configure referral system and reward amounts
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enable/Disable Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#2d3748' }}>
              Referral System Status
            </h2>
            <p className="text-sm" style={{ color: '#718096' }}>
              Enable or disable the referral system globally
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="flex items-center gap-2"
          >
            {settings.enabled ? (
              <FaToggleOn className="text-4xl" style={{ color: '#10b981' }} />
            ) : (
              <FaToggleOff className="text-4xl" style={{ color: '#cbd5e0' }} />
            )}
          </motion.button>
        </div>
        <div
          className={`p-3 rounded-lg ${
            settings.enabled ? 'bg-green-50' : 'bg-gray-50'
          }`}
        >
          <p className="text-sm font-medium" style={{ color: settings.enabled ? '#10b981' : '#718096' }}>
            {settings.enabled ? '✓ Referral system is active' : '✗ Referral system is disabled'}
          </p>
        </div>
      </motion.div>

      {/* Cross-Referral Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#2d3748' }}>
              Cross-Referral System
            </h2>
            <p className="text-sm" style={{ color: '#718096' }}>
              Allow users to refer scrappers and vice versa
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                allowCrossReferrals: !prev.allowCrossReferrals
              }));
            }}
            className="flex items-center gap-2"
          >
            {settings.allowCrossReferrals ? (
              <FaToggleOn className="text-4xl" style={{ color: '#10b981' }} />
            ) : (
              <FaToggleOff className="text-4xl" style={{ color: '#cbd5e0' }} />
            )}
          </motion.button>
        </div>
        <div
          className={`p-3 rounded-lg ${
            settings.allowCrossReferrals ? 'bg-green-50' : 'bg-gray-50'
          }`}
        >
          <p className="text-sm font-medium" style={{ color: settings.allowCrossReferrals ? '#10b981' : '#718096' }}>
            {settings.allowCrossReferrals ? '✓ Cross-referrals are enabled' : '✗ Cross-referrals are disabled'}
          </p>
        </div>
      </motion.div>

      {/* User Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaUsers className="text-2xl" style={{ color: '#64946e' }} />
          <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
            User Referral Rewards
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Signup Bonus (Referrer)
            </label>
            <p className="text-xs mb-2" style={{ color: '#718096' }}>
              Amount credited to referrer when referee signs up
            </p>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
              <input
                type="number"
                value={settings.userRewards.signupBonus}
                onChange={(e) => handleChange('userRewards.signupBonus', e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748'
                }}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Welcome Bonus (Referee)
            </label>
            <p className="text-xs mb-2" style={{ color: '#718096' }}>
              Amount credited to new user when they sign up with referral code
            </p>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
              <input
                type="number"
                value={settings.userRewards.refereeWelcomeBonus}
                onChange={(e) => handleChange('userRewards.refereeWelcomeBonus', e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748'
                }}
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scrapper Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaTruck className="text-2xl" style={{ color: '#64946e' }} />
          <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
            Scrapper Referral Rewards
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Signup Bonus (Referrer)
            </label>
            <p className="text-xs mb-2" style={{ color: '#718096' }}>
              Amount credited to referrer when referee signs up
            </p>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
              <input
                type="number"
                value={settings.scrapperRewards.signupBonus}
                onChange={(e) => handleChange('scrapperRewards.signupBonus', e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748'
                }}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
              Welcome Bonus (Referee)
            </label>
            <p className="text-xs mb-2" style={{ color: '#718096' }}>
              Amount credited to new scrapper when they sign up with referral code
            </p>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
              <input
                type="number"
                value={settings.scrapperRewards.refereeWelcomeBonus}
                onChange={(e) => handleChange('scrapperRewards.refereeWelcomeBonus', e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#e2e8f0',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748'
                }}
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cross-Referral Rewards */}
      {settings.allowCrossReferrals && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaGift className="text-2xl" style={{ color: '#3b82f6' }} />
            <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
              Cross-Referral Rewards
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* User to Scrapper */}
            <div>
              <h3 className="text-base font-semibold mb-3" style={{ color: '#2d3748' }}>
                User → Scrapper Referrals
              </h3>
              <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: '#e2e8f0' }}>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Referrer Bonus (User gets)
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                    <input
                      type="number"
                      value={settings.crossReferralRewards?.userToScrapper?.referrerBonus || 0}
                      onChange={(e) => handleChange('crossReferralRewards.userToScrapper.referrerBonus', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Welcome Bonus (Scrapper gets)
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                    <input
                      type="number"
                      value={settings.crossReferralRewards?.userToScrapper?.refereeWelcomeBonus || 0}
                      onChange={(e) => handleChange('crossReferralRewards.userToScrapper.refereeWelcomeBonus', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrapper to User */}
            <div>
              <h3 className="text-base font-semibold mb-3" style={{ color: '#2d3748' }}>
                Scrapper → User Referrals
              </h3>
              <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: '#e2e8f0' }}>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Referrer Bonus (Scrapper gets)
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                    <input
                      type="number"
                      value={settings.crossReferralRewards?.scrapperToUser?.referrerBonus || 0}
                      onChange={(e) => handleChange('crossReferralRewards.scrapperToUser.referrerBonus', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Welcome Bonus (User gets)
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                    <input
                      type="number"
                      value={settings.crossReferralRewards?.scrapperToUser?.refereeWelcomeBonus || 0}
                      onChange={(e) => handleChange('crossReferralRewards.scrapperToUser.refereeWelcomeBonus', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-semibold text-base flex items-center gap-2 transition-all"
          style={{ 
            backgroundColor: saved ? '#10b981' : '#64946e', 
            color: '#ffffff' 
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              <FaSave />
              Saved!
            </>
          ) : (
            <>
              <FaSave />
              Save Settings
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ReferralSettings;

