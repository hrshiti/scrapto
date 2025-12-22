import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSave } from 'react-icons/fa';
import { adminAPI, subscriptionAPI } from '../../shared/utils/api';

const SubscriptionPlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'INR',
    duration: '',
    durationType: 'monthly',
    features: [],
    maxPickups: '',
    priority: 0,
    isActive: true,
    isPopular: false,
    sortOrder: 0
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await subscriptionAPI.getPlans();
      if (response.success && response.data?.plans) {
        setPlans(response.data.plans);
      } else {
        setError('Failed to load subscription plans');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError(err.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'INR',
      duration: '',
      durationType: 'monthly',
      features: [],
      maxPickups: '',
      priority: 0,
      isActive: true,
      isPopular: false,
      sortOrder: 0
    });
    setEditingId(null);
    setShowCreateModal(true);
  };

  const handleEdit = (plan) => {
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || '',
      currency: plan.currency || 'INR',
      duration: plan.duration || '',
      durationType: plan.durationType || 'monthly',
      features: plan.features || [],
      maxPickups: plan.maxPickups || '',
      priority: plan.priority || 0,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      isPopular: plan.isPopular || false,
      sortOrder: plan.sortOrder || 0
    });
    setEditingId(plan._id || plan.id);
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        maxPickups: formData.maxPickups ? parseInt(formData.maxPickups) : null,
        priority: parseInt(formData.priority) || 0,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      let response;
      if (editingId) {
        response = await adminAPI.updatePlan(editingId, planData);
      } else {
        response = await adminAPI.createPlan(planData);
      }

      if (response.success) {
        await loadPlans();
        setShowCreateModal(false);
        setEditingId(null);
        alert(editingId ? 'Plan updated successfully!' : 'Plan created successfully!');
      } else {
        throw new Error(response.error || response.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(error.message || 'Failed to save plan. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminAPI.deletePlan(id);
      if (response.success) {
        await loadPlans();
        alert('Plan deleted successfully!');
      } else {
        throw new Error(response.error || response.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert(error.message || 'Failed to delete plan. Please try again.');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const formatDuration = (duration, durationType) => {
    if (durationType === 'monthly') {
      return duration === 1 ? '1 month' : `${duration} months`;
    } else if (durationType === 'quarterly') {
      return `${duration} months`;
    } else if (durationType === 'yearly') {
      return duration === 12 ? '1 year' : `${duration / 12} years`;
    }
    return `${duration} days`;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#2d3748' }}>
              Subscription Plan Management
            </h1>
            <p className="text-xs md:text-sm lg:text-base" style={{ color: '#718096' }}>
              Create and manage subscription plans for scrappers
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg md:rounded-xl font-semibold text-sm md:text-base flex items-center gap-2 transition-all"
            style={{ backgroundColor: '#64946e', color: '#ffffff' }}
          >
            <FaPlus />
            <span>Create Plan</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Loading / Error State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#64946e' }} />
          <p className="text-sm md:text-base font-semibold" style={{ color: '#2d3748' }}>
            Loading plans...
          </p>
        </motion.div>
      )}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center"
        >
          <p className="text-sm md:text-base mb-4" style={{ color: '#718096' }}>
            {error}
          </p>
          <button
            onClick={loadPlans}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#64946e' }}
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Plans Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan._id || plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 relative"
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#64946e' }}>
                  Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#2d3748' }}>
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className="text-xs md:text-sm mb-3" style={{ color: '#718096' }}>
                    {plan.description}
                  </p>
                )}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl md:text-3xl font-bold" style={{ color: '#64946e' }}>
                    ₹{plan.price}
                  </span>
                  <span className="text-sm" style={{ color: '#718096' }}>
                    / {formatDuration(plan.duration, plan.durationType)}
                  </span>
                </div>
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs md:text-sm flex items-start gap-2" style={{ color: '#4b5563' }}>
                        <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs" style={{ color: '#718096' }}>
                        +{plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {plan.maxPickups && (
                    <span className="text-xs" style={{ color: '#718096' }}>
                      Max {plan.maxPickups} pickups
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(plan)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#f7fafc', color: '#64946e' }}
                >
                  <FaEdit />
                  <span>Edit</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(plan._id || plan.id)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <FaTrash />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#2d3748' }}>
              {editingId ? 'Edit Plan' : 'Create New Plan'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                  placeholder="e.g., Basic Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                  rows="3"
                  placeholder="Plan description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Duration *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Duration Type *
                  </label>
                  <select
                    value={formData.durationType}
                    onChange={(e) => setFormData({ ...formData, durationType: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                    Max Pickups (leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.maxPickups}
                    onChange={(e) => setFormData({ ...formData, maxPickups: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e2e8f0', focusBorderColor: '#64946e' }}
                    placeholder="Add a feature..."
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: '#64946e' }}
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: '#f7fafc' }}>
                      <span className="text-sm" style={{ color: '#2d3748' }}>{feature}</span>
                      <button
                        onClick={() => removeFeature(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPopular" className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                    Popular
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#64946e' }}
                >
                  <FaSave />
                  <span>Save Plan</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                  style={{ backgroundColor: '#f7fafc', color: '#2d3748' }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionPlanManagement;



