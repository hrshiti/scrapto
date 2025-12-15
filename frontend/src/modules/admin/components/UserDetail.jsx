import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaRupeeSign, 
  FaFileInvoice, FaClock, FaCheckCircle, FaTimesCircle, FaUserCheck, FaUserTimes 
} from 'react-icons/fa';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = () => {
    // Load user data (mock for now)
    const mockUser = {
      id: userId,
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
      status: 'active',
      walletBalance: 3450,
      totalRequests: 12,
      completedRequests: 10,
      pendingRequests: 1,
      cancelledRequests: 1,
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      addresses: [
        { id: 1, label: 'Home', address: '123 Main Street, Sector 5, New Delhi', isDefault: true },
        { id: 2, label: 'Office', address: '456 Business Park, Gurgaon', isDefault: false }
      ]
    };

    const mockRequests = [
      {
        id: 'req_001',
        requestId: 'REQ-2024-001',
        categories: ['Metal', 'Plastic'],
        weight: 25.5,
        estimatedPrice: 1250,
        status: 'completed',
        createdAt: '2024-01-15T10:30:00',
        completedAt: '2024-01-15T14:20:00',
        scrapperName: 'Rajesh Kumar',
        address: '123 Main Street, Sector 5, New Delhi'
      },
      {
        id: 'req_002',
        requestId: 'REQ-2024-002',
        categories: ['Electronics'],
        weight: 8.2,
        estimatedPrice: 680,
        status: 'in_progress',
        createdAt: '2024-01-18T09:15:00',
        scrapperName: 'Amit Sharma',
        address: '456 Business Park, Gurgaon'
      },
      {
        id: 'req_003',
        requestId: 'REQ-2024-003',
        categories: ['Paper'],
        weight: 15.0,
        estimatedPrice: 180,
        status: 'pending',
        createdAt: '2024-01-20T11:00:00',
        address: '123 Main Street, Sector 5, New Delhi'
      }
    ];

    setUser(mockUser);
    setRequests(mockRequests);
    setLoading(false);
  };

  const handleToggleBlock = () => {
    if (window.confirm(`Are you sure you want to ${user.status === 'blocked' ? 'unblock' : 'block'} this user?`)) {
      setUser(prev => ({
        ...prev,
        status: prev.status === 'blocked' ? 'active' : 'blocked',
        ...(prev.status === 'active' && { 
          blockedAt: new Date().toISOString(),
          blockReason: 'Admin action'
        })
      }));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
          <FaCheckCircle className="text-xs" />
          Completed
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
          <FaClock className="text-xs" />
          In Progress
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
          <FaClock className="text-xs" />
          Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
        <FaTimesCircle className="text-xs" />
        Cancelled
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p style={{ color: '#718096' }}>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>User not found</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="text-sm" style={{ color: '#64946e' }}
        >
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: '#64946e' }}
      >
        <FaArrowLeft />
        Back to Users
      </motion.button>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0"
            style={{ backgroundColor: '#f7fafc' }}
          >
            <span className="text-4xl font-bold" style={{ color: '#64946e' }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2d3748' }}>
                {user.name}
              </h1>
              {user.status === 'active' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                  <FaUserCheck className="text-xs" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <FaUserTimes className="text-xs" />
                  Blocked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <FaPhone style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Phone</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Email</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaRupeeSign style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Wallet Balance</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>₹{user.walletBalance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaFileInvoice style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Total Requests</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{user.totalRequests}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleBlock}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                  user.status === 'blocked' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {user.status === 'blocked' ? <FaUserCheck /> : <FaUserTimes />}
                {user.status === 'blocked' ? 'Unblock User' : 'Block User'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: user.completedRequests, color: '#10b981', bg: '#d1fae5' },
          { label: 'Pending', value: user.pendingRequests, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Cancelled', value: user.cancelledRequests, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Total', value: user.totalRequests, color: '#3b82f6', bg: '#dbeafe' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-white rounded-2xl shadow-lg p-4 text-center"
          >
            <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: '#718096' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Request History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
          Request History
        </h2>
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="p-4 rounded-xl border-2" style={{ borderColor: '#e2e8f0' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{ color: '#2d3748' }}>{request.requestId}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="space-y-1 text-sm" style={{ color: '#718096' }}>
                    <p>Categories: {request.categories.join(', ')}</p>
                    <p>Weight: {request.weight} kg • Price: ₹{request.estimatedPrice}</p>
                    <p className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" />
                      {request.address}
                    </p>
                    {request.scrapperName && (
                      <p>Scrapper: {request.scrapperName}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetail;

