import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import ReferAndEarn from './ReferAndEarn';
import { 
  FaCheckCircle, 
  FaBox, 
  FaWallet, 
  FaCheck, 
  FaWeight, 
  FaStar, 
  FaTrophy,
  FaChartLine,
  FaEdit,
  FaTimes,
  FaUser,
  FaPhone,
  FaSignOutAlt,
  FaGift
} from 'react-icons/fa';
import { 
  HiTrendingUp,
  HiCollection,
  HiCash
} from 'react-icons/hi';
import { 
  MdCategory,
  MdPayment,
  MdCheckCircleOutline
} from 'react-icons/md';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, activity, analysis
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'User Name',
    phone: user?.phone || '+91 98765 43210',
    profilePicture: null,
  });

  // Mock data for activity feed
  const activityFeed = [
    {
      id: 1,
      type: 'request_completed',
      title: 'Pickup Completed',
      description: 'Metal scrap pickup completed successfully',
      amount: '₹450',
      timestamp: '2 hours ago',
      icon: FaCheckCircle,
      color: '#64946e',
    },
    {
      id: 2,
      type: 'request_created',
      title: 'New Request Created',
      description: 'Plastic scrap pickup requested',
      amount: '₹180',
      timestamp: '1 day ago',
      icon: FaBox,
      color: '#64946e',
    },
    {
      id: 3,
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Amount credited to wallet',
      amount: '₹450',
      timestamp: '2 days ago',
      icon: FaWallet,
      color: '#64946e',
    },
    {
      id: 4,
      type: 'request_accepted',
      title: 'Request Accepted',
      description: 'Scrapper accepted your pickup request',
      amount: null,
      timestamp: '3 days ago',
      icon: MdCheckCircleOutline,
      color: '#64946e',
    },
    {
      id: 5,
      type: 'request_completed',
      title: 'Pickup Completed',
      description: 'Electronics scrap pickup completed',
      amount: '₹320',
      timestamp: '5 days ago',
      icon: FaCheckCircle,
      color: '#64946e',
    },
  ];

  // Mock stats data
  const stats = {
    totalRequests: 24,
    completedRequests: 18,
    totalEarnings: 1250,
    averageRating: 4.8,
    totalWeight: 156, // kg
    favoriteCategory: 'Metal',
  };

  // Mock analysis data
  const monthlyData = [
    { month: 'Jan', requests: 3, earnings: 450 },
    { month: 'Feb', requests: 5, earnings: 680 },
    { month: 'Mar', requests: 4, earnings: 520 },
    { month: 'Apr', requests: 6, earnings: 890 },
    { month: 'May', requests: 5, earnings: 750 },
    { month: 'Jun', requests: 6, earnings: 920 },
  ];

  const categoryDistribution = [
    { name: 'Metal', value: 45, color: '#64946e' },
    { name: 'Plastic', value: 25, color: '#5a8263' },
    { name: 'Electronics', value: 20, color: '#4a7c5a' },
    { name: 'Paper', value: 10, color: '#3a6c4a' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'User Name',
        phone: user.phone || '+91 98765 43210',
        profilePicture: null,
      });
    }
  }, [user]);

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditMode(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-20 md:pb-0"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 md:px-6 lg:px-8 py-4 md:py-6" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 
            className="text-xl md:text-2xl font-bold"
            style={{ color: '#2d3748' }}
          >
            My Profile
          </h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:opacity-70 transition-opacity"
            style={{ color: '#64946e' }}
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Profile Header Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4 md:mb-6"
        >
          <div 
            className="rounded-2xl p-4 md:p-6 shadow-md"
            style={{ backgroundColor: '#ffffff' }}
          >
            <AnimatePresence mode="wait">
              {!isEditMode ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 md:gap-4"
                >
                  {/* Profile Picture */}
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 relative"
                    style={{ 
                      backgroundColor: 'rgba(100, 148, 110, 0.15)',
                      border: '3px solid rgba(100, 148, 110, 0.3)'
                    }}
                  >
                    {formData.profilePicture ? (
                      <img 
                        src={URL.createObjectURL(formData.profilePicture)} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span 
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: '#64946e' }}
                      >
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 
                      className="text-lg md:text-xl font-bold mb-1"
                      style={{ color: '#2d3748' }}
                    >
                      {formData.name}
                    </h2>
                    <p 
                      className="text-sm md:text-base mb-1"
                      style={{ color: '#718096' }}
                    >
                      {formData.phone}
                    </p>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: 'rgba(100, 148, 110, 0.1)',
                          color: '#64946e'
                        }}
                      >
                        Verified
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ 
                          backgroundColor: 'rgba(100, 148, 110, 0.1)',
                          color: '#64946e'
                        }}
                      >
                        {stats.averageRating} <FaStar size={10} />
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0"
                    style={{ 
                      backgroundColor: 'rgba(100, 148, 110, 0.1)',
                      color: '#64946e'
                    }}
                  >
                    <FaEdit size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative overflow-hidden"
                        style={{ 
                          backgroundColor: 'rgba(100, 148, 110, 0.15)',
                          border: '3px solid rgba(100, 148, 110, 0.3)'
                        }}
                      >
                        {formData.profilePicture ? (
                          <img 
                            src={URL.createObjectURL(formData.profilePicture)} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span 
                            className="text-3xl md:text-4xl font-bold"
                            style={{ color: '#64946e' }}
                          >
                            {formData.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <label
                        htmlFor="profile-picture"
                        className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: '#64946e',
                          color: '#ffffff'
                        }}
                      >
                        <FaEdit size={14} />
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setFormData({ ...formData, profilePicture: e.target.files[0] });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label 
                      className="block text-xs md:text-sm font-medium mb-1.5"
                      style={{ color: '#4a5568' }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base border transition-all focus:outline-none"
                      style={{ 
                        borderColor: '#e5ddd4',
                        color: '#2d3748',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#64946e';
                        e.target.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5ddd4';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label 
                      className="block text-xs md:text-sm font-medium mb-1.5"
                      style={{ color: '#4a5568' }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base border transition-all focus:outline-none"
                      style={{ 
                        borderColor: '#e5ddd4',
                        color: '#2d3748',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#64946e';
                        e.target.style.boxShadow = '0 0 0 2px rgba(100, 148, 110, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5ddd4';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:gap-3 pt-2">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 py-2 md:py-2.5 px-4 rounded-lg font-semibold text-sm md:text-base transition-all"
                      style={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(100, 148, 110, 0.3)',
                        color: '#64946e'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-2 md:py-2.5 px-4 rounded-lg font-semibold text-sm md:text-base text-white transition-all"
                      style={{ backgroundColor: '#64946e' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'activity', label: 'Activity' },
            { id: 'analysis', label: 'Analysis' },
            { id: 'refer', label: 'Refer & Earn', icon: FaGift },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-600'
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? '#64946e' : '#ffffff',
                border: activeTab === tab.id ? 'none' : '1px solid rgba(100, 148, 110, 0.15)',
              }}
            >
              {tab.icon && <tab.icon />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Quick Stats */}
              <div 
                className="rounded-2xl p-4 md:p-6"
                style={{ backgroundColor: '#ffffff' }}
              >
                <h3 
                  className="font-bold text-base md:text-lg mb-4"
                  style={{ color: '#2d3748' }}
                >
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { label: 'Total Requests', value: stats.totalRequests, icon: FaBox, color: '#64946e' },
                    { label: 'Completed', value: stats.completedRequests, icon: FaCheck, color: '#64946e' },
                    { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: HiCash, color: '#64946e' },
                    { label: 'Total Weight', value: `${stats.totalWeight} kg`, icon: FaWeight, color: '#64946e' },
                    { label: 'Avg Rating', value: `${stats.averageRating}`, icon: FaStar, color: '#64946e' },
                    { label: 'Top Category', value: stats.favoriteCategory, icon: FaTrophy, color: '#64946e' },
                  ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-3 md:p-4 rounded-xl text-center"
                        style={{ backgroundColor: 'rgba(100, 148, 110, 0.05)' }}
                      >
                        <div className="flex justify-center mb-2">
                          <IconComponent 
                            className="text-2xl md:text-3xl" 
                            style={{ color: stat.color }}
                          />
                        </div>
                        <p 
                          className="text-lg md:text-xl font-bold mb-1"
                          style={{ color: '#64946e' }}
                        >
                          {stat.value}
                        </p>
                        <p 
                          className="text-xs md:text-sm"
                          style={{ color: '#718096' }}
                        >
                          {stat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Wallet Balance */}
              <div 
                className="rounded-2xl p-4 md:p-6"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="font-bold text-base md:text-lg"
                    style={{ color: '#2d3748' }}
                  >
                    Wallet Balance
                  </h3>
                  <button
                    className="text-sm font-medium"
                    style={{ color: '#64946e' }}
                  >
                    View All
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                  >
                    <HiCash 
                      className="text-2xl md:text-3xl" 
                      style={{ color: '#64946e' }}
                    />
                  </div>
                  <div>
                    <p 
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: '#64946e' }}
                    >
                      ₹{stats.totalEarnings}
                    </p>
                    <p 
                      className="text-sm md:text-base"
                      style={{ color: '#718096' }}
                    >
                      Available balance
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 md:space-y-4"
            >
              {activityFeed.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-xl p-3 md:p-4 flex items-start gap-3 md:gap-4"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                  >
                    {(() => {
                      const IconComponent = activity.icon;
                      return <IconComponent className="text-lg md:text-xl" style={{ color: activity.color }} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 
                          className="font-semibold text-sm md:text-base mb-1"
                          style={{ color: '#2d3748' }}
                        >
                          {activity.title}
                        </h4>
                        <p 
                          className="text-xs md:text-sm mb-1"
                          style={{ color: '#718096' }}
                        >
                          {activity.description}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: '#a0aec0' }}
                        >
                          {activity.timestamp}
                        </p>
                      </div>
                      {activity.amount && (
                        <p 
                          className="font-bold text-sm md:text-base flex-shrink-0"
                          style={{ color: '#64946e' }}
                        >
                          {activity.amount}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Monthly Trend */}
              <div 
                className="rounded-2xl p-4 md:p-6"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine style={{ color: '#64946e' }} />
                  <h3 
                    className="font-bold text-base md:text-lg"
                    style={{ color: '#2d3748' }}
                  >
                    Monthly Trend
                  </h3>
                </div>
                <div className="space-y-3">
                  {monthlyData.map((data, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 text-sm font-medium" style={{ color: '#718096' }}>
                        {data.month}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: '#718096' }}>
                            {data.requests} requests
                          </span>
                          <span className="text-sm font-semibold" style={{ color: '#64946e' }}>
                            ₹{data.earnings}
                          </span>
                        </div>
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: 'rgba(100, 148, 110, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.earnings / 1000) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: '#64946e' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div 
                className="rounded-2xl p-4 md:p-6"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MdCategory style={{ color: '#64946e', fontSize: '20px' }} />
                  <h3 
                    className="font-bold text-base md:text-lg"
                    style={{ color: '#2d3748' }}
                  >
                    Category Distribution
                  </h3>
                </div>
                <div className="space-y-3">
                  {categoryDistribution.map((cat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-20 text-sm font-medium" style={{ color: '#718096' }}>
                        {cat.name}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: '#718096' }}>
                            {cat.value}%
                          </span>
                        </div>
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            backgroundColor: 'rgba(100, 148, 110, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.value}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'refer' && (
            <motion.div
              key="refer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ReferAndEarn />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full p-4 rounded-xl font-semibold transition-all duration-300 mt-6 mb-20 md:mb-8 flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <FaSignOutAlt />
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MyProfilePage;

