import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  getMilestoneRewards, 
  updateMilestoneRewards 
} from '../../shared/utils/referralUtils';
import {
  FaGift,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaRupeeSign,
  FaUsers,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa';

const MilestoneRewards = () => {
  const [milestones, setMilestones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentMilestones = getMilestoneRewards();
    setMilestones(currentMilestones);
  }, []);

  const handleSave = () => {
    setLoading(true);
    updateMilestoneRewards(milestones);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggle = (userType, milestoneType) => {
    setMilestones(prev => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [milestoneType]: {
          ...prev[userType][milestoneType],
          enabled: !prev[userType][milestoneType].enabled
        }
      }
    }));
  };

  const handleChange = (userType, milestoneType, field, value) => {
    setMilestones(prev => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [milestoneType]: {
          ...prev[userType][milestoneType],
          [field]: parseFloat(value) || 0
        }
      }
    }));
  };

  if (!milestones) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#718096' }}>Loading milestones...</p>
        </div>
      </div>
    );
  }

  const userMilestones = [
    { key: 'firstRequest', label: 'First Request', desc: 'When referred user creates first request' },
    { key: 'firstCompletion', label: 'First Completion', desc: 'When referred user\'s first request is completed' }
  ];

  const scrapperMilestones = [
    { key: 'kycVerified', label: 'KYC Verified', desc: 'When referred scrapper\'s KYC is verified' },
    { key: 'subscription', label: 'Subscription', desc: 'When referred scrapper subscribes' },
    { key: 'firstPickup', label: 'First Pickup', desc: 'When referred scrapper completes first pickup' }
  ];

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
            <FaGift className="text-3xl" style={{ color: '#64946e' }} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d3748' }}>
              Milestone Rewards
            </h1>
            <p className="text-sm md:text-base" style={{ color: '#718096' }}>
              Configure milestone reward amounts for users and scrappers
            </p>
          </div>
        </div>
      </motion.div>

      {/* User Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaUsers className="text-2xl" style={{ color: '#64946e' }} />
          <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
            User Milestone Rewards
          </h2>
        </div>
        
        <div className="space-y-6">
          {userMilestones.map((milestone) => {
            const config = milestones.user[milestone.key];
            return (
              <div key={milestone.key} className="p-4 rounded-xl border" style={{ borderColor: '#e2e8f0', backgroundColor: '#f7fafc' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#2d3748' }}>
                      {milestone.label}
                    </h3>
                    <p className="text-xs" style={{ color: '#718096' }}>
                      {milestone.desc}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('user', milestone.key)}
                  >
                    {config.enabled ? (
                      <FaToggleOn className="text-3xl" style={{ color: '#10b981' }} />
                    ) : (
                      <FaToggleOff className="text-3xl" style={{ color: '#cbd5e0' }} />
                    )}
                  </motion.button>
                </div>
                
                {config.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Referrer Reward (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={config.referrer}
                          onChange={(e) => handleChange('user', milestone.key, 'referrer', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#2d3748'
                          }}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Referee Reward (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={config.referee}
                          onChange={(e) => handleChange('user', milestone.key, 'referee', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#2d3748'
                          }}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scrapper Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaTruck className="text-2xl" style={{ color: '#64946e' }} />
          <h2 className="text-lg md:text-xl font-bold" style={{ color: '#2d3748' }}>
            Scrapper Milestone Rewards
          </h2>
        </div>
        
        <div className="space-y-6">
          {scrapperMilestones.map((milestone) => {
            const config = milestones.scrapper[milestone.key];
            return (
              <div key={milestone.key} className="p-4 rounded-xl border" style={{ borderColor: '#e2e8f0', backgroundColor: '#f7fafc' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#2d3748' }}>
                      {milestone.label}
                    </h3>
                    <p className="text-xs" style={{ color: '#718096' }}>
                      {milestone.desc}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle('scrapper', milestone.key)}
                  >
                    {config.enabled ? (
                      <FaToggleOn className="text-3xl" style={{ color: '#10b981' }} />
                    ) : (
                      <FaToggleOff className="text-3xl" style={{ color: '#cbd5e0' }} />
                    )}
                  </motion.button>
                </div>
                
                {config.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Referrer Reward (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={config.referrer}
                          onChange={(e) => handleChange('scrapper', milestone.key, 'referrer', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#2d3748'
                          }}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Referee Reward (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={config.referee}
                          onChange={(e) => handleChange('scrapper', milestone.key, 'referee', e.target.value)}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 text-sm"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#2d3748'
                          }}
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
              <FaCheckCircle />
              Saved!
            </>
          ) : (
            <>
              <FaSave />
              Save Milestones
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MilestoneRewards;

