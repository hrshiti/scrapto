import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  getTierConfig, 
  updateTierConfig 
} from '../../shared/utils/referralUtils';
import {
  FaTrophy,
  FaSave,
  FaRupeeSign,
  FaPercent
} from 'react-icons/fa';

const TierManagement = () => {
  const [tiers, setTiers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentTiers = getTierConfig();
    setTiers(currentTiers);
  }, []);

  const handleSave = () => {
    setLoading(true);
    updateTierConfig(tiers);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (tierKey, field, value) => {
    setTiers(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        [field]: field === 'name' || field === 'color' ? value : (parseFloat(value) || 0)
      }
    }));
  };

  if (!tiers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#718096' }}>Loading tiers...</p>
        </div>
      </div>
    );
  }

  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const tierColors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
          >
            <FaTrophy className="text-3xl" style={{ color: '#64946e' }} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d3748' }}>
              Tier Management
            </h1>
            <p className="text-sm md:text-base" style={{ color: '#718096' }}>
              Configure referral tier thresholds and bonuses
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiers */}
      {tierOrder.map((tierKey, index) => {
        const tier = tiers[tierKey];
        return (
          <motion.div
            key={tierKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tier.color}20`, border: `2px solid ${tier.color}` }}
              >
                <FaTrophy style={{ color: tier.color }} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
                  {tier.name} Tier
                </h2>
                <p className="text-xs" style={{ color: '#718096' }}>
                  Minimum {tier.minReferrals} referrals required
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Tier Name
                </label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => handleChange(tierKey, 'name', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                  style={{
                    borderColor: '#e2e8f0',
                    backgroundColor: '#f7fafc',
                    color: '#2d3748'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Min Referrals
                </label>
                <input
                  type="number"
                  value={tier.minReferrals}
                  onChange={(e) => handleChange(tierKey, 'minReferrals', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                  style={{
                    borderColor: '#e2e8f0',
                    backgroundColor: '#f7fafc',
                    color: '#2d3748'
                  }}
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Bonus %
                </label>
                <div className="relative">
                  <FaPercent className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                  <input
                    type="number"
                    value={tier.bonusPercent}
                    onChange={(e) => handleChange(tierKey, 'bonusPercent', e.target.value)}
                    className="w-full px-4 py-2 pr-8 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                    style={{
                      borderColor: '#e2e8f0',
                      backgroundColor: '#f7fafc',
                      color: '#2d3748'
                    }}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Monthly Bonus (₹)
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                  <input
                    type="number"
                    value={tier.monthlyBonus}
                    onChange={(e) => handleChange(tierKey, 'monthlyBonus', e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
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
        );
      })}

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
              Save Tiers
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TierManagement;

