import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaFilter, FaUserCheck, FaUserTimes, FaEye, FaPhone, FaMapMarkerAlt, FaRupeeSign } from 'react-icons/fa';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, blocked
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = () => {
    // Aggregate user data from localStorage
    const userAuth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    const userList = [];

    // If there's a user, add it
    if (userAuth === 'true' && userData) {
      const user = JSON.parse(userData);
      userList.push({
        id: 'user_001',
        name: user.name || 'User',
        phone: user.phone || 'N/A',
        email: user.email || 'N/A',
        status: 'active',
        totalRequests: 5,
        walletBalance: 1250,
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString()
      });
    }

    // Add mock data
    const mockUsers = [
      {
        id: 'user_002',
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        email: 'rahul@example.com',
        status: 'active',
        totalRequests: 12,
        walletBalance: 3450,
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_003',
        name: 'Priya Patel',
        phone: '+91 98765 43211',
        email: 'priya@example.com',
        status: 'active',
        totalRequests: 8,
        walletBalance: 2100,
        joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_004',
        name: 'Amit Kumar',
        phone: '+91 98765 43212',
        email: 'amit@example.com',
        status: 'blocked',
        totalRequests: 3,
        walletBalance: 0,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        blockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        blockReason: 'Violation of terms'
      },
      {
        id: 'user_005',
        name: 'Sneha Reddy',
        phone: '+91 98765 43213',
        email: 'sneha@example.com',
        status: 'active',
        totalRequests: 15,
        walletBalance: 5200,
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    setUsers([...userList, ...mockUsers]);
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleToggleBlock = (userId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: newStatus,
            ...(newStatus === 'blocked' && { 
              blockedAt: new Date().toISOString(),
              blockReason: 'Admin action'
            })
          }
        : user
    ));
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
          <FaUserCheck className="text-xs" />
          <span className="hidden sm:inline">Active</span>
          <span className="sm:hidden">A</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
        <FaUserTimes className="text-xs" />
        <span className="hidden sm:inline">Blocked</span>
        <span className="sm:hidden">B</span>
      </span>
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#2d3748' }}>
              User Management
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              Manage all registered users on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                {users.length} Total Users
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-3 md:p-6"
      >
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-xs md:text-base" style={{ color: '#718096' }} />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
              style={{
                borderColor: '#e2e8f0',
                focusBorderColor: '#64946e',
                focusRingColor: '#64946e'
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {['all', 'active', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  filter === status ? 'shadow-md' : ''
                }`}
                style={{
                  backgroundColor: filter === status ? '#64946e' : '#f7fafc',
                  color: filter === status ? '#ffffff' : '#2d3748'
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaUsers className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No users found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'No users registered yet'}
              </p>
            </motion.div>
          ) : (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredUsers.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div
                        className="w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f7fafc' }}
                      >
                        <span className="text-base md:text-2xl font-bold" style={{ color: '#64946e' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2 flex-wrap">
                          <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                            {user.name}
                          </h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2 text-xs md:text-sm" style={{ color: '#718096' }}>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaPhone className="text-xs" />
                            <span className="truncate">{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaMapMarkerAlt className="text-xs" />
                            <span>{user.totalRequests} Requests</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <FaRupeeSign className="text-xs" />
                            <span>₹{user.walletBalance}</span>
                          </div>
                          <div className="text-xs">
                            Last active: {getTimeAgo(user.lastActive)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(user.id)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      <FaEye className="text-xs md:text-sm" />
                      <span className="hidden sm:inline">View</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleBlock(user.id, user.status)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                        user.status === 'blocked' ? 'hidden' : ''
                      }`}
                      style={{ 
                        backgroundColor: user.status === 'blocked' ? '#fee2e2' : '#fee2e2',
                        color: '#dc2626'
                      }}
                    >
                      <FaUserTimes />
                      <span className="hidden sm:inline">Block</span>
                    </motion.button>
                    {user.status === 'blocked' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleBlock(user.id, user.status)}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                        style={{ backgroundColor: '#d1fae5', color: '#10b981' }}
                      >
                        <FaUserCheck className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">Unblock</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UsersList;

