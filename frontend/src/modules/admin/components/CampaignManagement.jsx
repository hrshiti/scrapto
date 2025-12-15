import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign 
} from '../../shared/utils/referralUtils';
import {
  FaGift,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaUsers,
  FaRupeeSign,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetAudience: 'both', // user, scrapper, both
    customRewards: {
      signupBonus: 0,
      refereeWelcomeBonus: 0
    },
    status: 'active'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const allCampaigns = getCampaigns();
    setCampaigns(allCampaigns);
  };

  const handleCreate = () => {
    const result = createCampaign(formData);
    if (result.success) {
      loadCampaigns();
      setShowCreateModal(false);
      resetForm();
      alert('Campaign created successfully');
    } else {
      alert(result.error || 'Failed to create campaign');
    }
  };

  const handleUpdate = () => {
    const result = updateCampaign(editingCampaign.id, formData);
    if (result.success) {
      loadCampaigns();
      setEditingCampaign(null);
      resetForm();
      alert('Campaign updated successfully');
    } else {
      alert(result.error || 'Failed to update campaign');
    }
  };

  const handleDelete = (campaignId) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      const result = deleteCampaign(campaignId);
      if (result.success) {
        loadCampaigns();
        alert('Campaign deleted successfully');
      } else {
        alert(result.error || 'Failed to delete campaign');
      }
    }
  };

  const handleToggleStatus = (campaignId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateCampaign(campaignId, { status: newStatus });
    loadCampaigns();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetAudience: 'both',
      customRewards: {
        signupBonus: 0,
        refereeWelcomeBonus: 0
      },
      status: 'active'
    });
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      targetAudience: campaign.targetAudience || 'both',
      customRewards: campaign.customRewards || {
        signupBonus: 0,
        refereeWelcomeBonus: 0
      },
      status: campaign.status || 'active'
    });
    setShowCreateModal(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
        >
          Active
        </span>
      );
    }
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}
      >
        Inactive
      </span>
    );
  };

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
                Campaign Management
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#718096' }}>
                Create and manage referral campaigns
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingCampaign(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
            style={{ backgroundColor: '#64946e', color: '#ffffff' }}
          >
            <FaPlus />
            Create Campaign
          </motion.button>
        </div>
      </motion.div>

      {/* Campaigns List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <FaGift className="text-5xl mx-auto mb-4" style={{ color: '#cbd5e0' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2d3748' }}>
              No Campaigns Yet
            </h3>
            <p className="text-sm mb-4" style={{ color: '#718096' }}>
              Create your first referral campaign to boost growth
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setEditingCampaign(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              <FaPlus className="inline mr-2" />
              Create Campaign
            </motion.button>
          </div>
        ) : (
          campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                index !== campaigns.length - 1 ? 'border-b' : ''
              }`}
              style={{ borderColor: '#e2e8f0' }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                      {campaign.name}
                    </h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#718096' }}>
                    {campaign.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs md:text-sm" style={{ color: '#718096' }}>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt />
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUsers />
                      <span className="capitalize">{campaign.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign />
                      <span>₹{campaign.customRewards?.signupBonus || 0} bonus</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                    className="p-2 rounded-lg transition-all"
                    style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
                  >
                    {campaign.status === 'active' ? (
                      <FaToggleOn className="text-2xl" style={{ color: '#10b981' }} />
                    ) : (
                      <FaToggleOff className="text-2xl" style={{ color: '#cbd5e0' }} />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal(campaign)}
                    className="px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all"
                    style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                  >
                    <FaEdit />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(campaign.id)}
                    className="px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all"
                    style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                  >
                    <FaTrash />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingCampaign(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: '#2d3748' }}>
                    {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes style={{ color: '#718096' }} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      placeholder="e.g., Summer Referral Boost"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                      rows="3"
                      placeholder="Campaign description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                        style={{
                          borderColor: '#e2e8f0',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                        style={{
                          borderColor: '#e2e8f0',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f7fafc',
                        color: '#2d3748'
                      }}
                    >
                      <option value="both">Both Users & Scrappers</option>
                      <option value="user">Users Only</option>
                      <option value="scrapper">Scrappers Only</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Signup Bonus (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={formData.customRewards.signupBonus}
                          onChange={(e) => setFormData({
                            ...formData,
                            customRewards: {
                              ...formData.customRewards,
                              signupBonus: parseFloat(e.target.value) || 0
                            }
                          })}
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
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                        Welcome Bonus (₹)
                      </label>
                      <div className="relative">
                        <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#64946e' }} />
                        <input
                          type="number"
                          value={formData.customRewards.refereeWelcomeBonus}
                          onChange={(e) => setFormData({
                            ...formData,
                            customRewards: {
                              ...formData.customRewards,
                              refereeWelcomeBonus: parseFloat(e.target.value) || 0
                            }
                          })}
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
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={editingCampaign ? handleUpdate : handleCreate}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                  >
                    <FaSave />
                    {editingCampaign ? 'Update' : 'Create'} Campaign
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                    style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignManagement;

