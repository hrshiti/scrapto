import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFileInvoice, FaSearch, FaClock, FaCheckCircle, FaTimesCircle, 
  FaMapMarkerAlt, FaUser, FaTruck, FaEye, FaBan 
} from 'react-icons/fa';

const ActiveRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, in_progress
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const list = [];

    // 1) Load real user requests created from frontend flow
    const storedUserRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    storedUserRequests.forEach((req) => {
      list.push({
        id: req.id,
        requestId: req.id,
        userId: req.userId,
        userName: req.userName || 'User',
        userPhone: req.userPhone || (req.userId ? `+91 ${req.userId}` : ''),
        categories: (req.categories || []).map((c) => (typeof c === 'string' ? c : c.name)),
        weight: req.weight,
        estimatedPrice: req.estimatedPayout,
        status: req.status || 'pending',
        location: req.location || { address: req.address || 'N/A' },
        images: req.images || [],
        createdAt: req.createdAt || req.timestamp,
        assignmentStatus: req.assignmentStatus || 'unassigned',
        assignedScrapperId: req.assignedScrapperId || null,
        assignedScrapperName: req.assignedScrapperName || null
      });
    });

    // 2) Load any single activeRequest (legacy demo data)
    const activeRequest = localStorage.getItem('activeRequest');
    if (activeRequest) {
      const request = JSON.parse(activeRequest);
      list.push({
        id: request.id || 'req_001',
        requestId: request.requestId || 'REQ-2024-001',
        userId: request.userId || 'user_001',
        userName: request.userName || 'User',
        userPhone: request.userPhone || '+91 98765 43210',
        categories: request.categories || ['Metal', 'Plastic'],
        weight: request.weight || 25.5,
        estimatedPrice: request.estimatedPrice || 1250,
        status: request.status || 'accepted',
        location: request.location || { lat: 19.0760, lng: 72.8777, address: '123, MG Road, Mumbai' },
        images: request.images || [],
        createdAt: request.createdAt || new Date().toISOString(),
        acceptedAt: request.acceptedAt,
        scrapperId: request.scrapperId,
        scrapperName: request.scrapperName,
        assignmentStatus: request.assignmentStatus || (request.scrapperId ? 'admin_assigned' : 'unassigned'),
        assignedScrapperId: request.scrapperId || null,
        assignedScrapperName: request.scrapperName || null
      });
    }

    // 3) Add mock data (for demo)
    const mockRequests = [
      {
        id: 'req_002',
        requestId: 'REQ-2024-002',
        userId: 'user_002',
        userName: 'Rahul Sharma',
        userPhone: '+91 98765 43210',
        categories: ['Electronics'],
        weight: 8.2,
        estimatedPrice: 680,
        status: 'pending',
        location: { lat: 19.0760, lng: 72.8777, address: '456 Business Park, Gurgaon' },
        images: [],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'req_003',
        requestId: 'REQ-2024-003',
        userId: 'user_003',
        userName: 'Priya Patel',
        userPhone: '+91 98765 43211',
        categories: ['Paper'],
        weight: 15.0,
        estimatedPrice: 180,
        status: 'accepted',
        location: { lat: 19.0760, lng: 72.8777, address: '789 Residential Area, Delhi' },
        images: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        scrapperId: 'scrapper_002',
        scrapperName: 'Rajesh Kumar'
      },
      {
        id: 'req_004',
        requestId: 'REQ-2024-004',
        userId: 'user_004',
        userName: 'Amit Kumar',
        userPhone: '+91 98765 43212',
        categories: ['Metal', 'Plastic'],
        weight: 30.5,
        estimatedPrice: 1500,
        status: 'in_progress',
        location: { lat: 19.0760, lng: 72.8777, address: '321 Industrial Area, Mumbai' },
        images: [],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        acceptedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        scrapperId: 'scrapper_003',
        scrapperName: 'Amit Sharma'
      }
    ];

    setRequests([...list, ...mockRequests]);
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (request) => {
    // Navigate to user detail page to see request details
    if (request.userId) {
      navigate(`/admin/users/${request.userId}`);
    } else {
      // Show alert with request details if no userId
      alert(`Request Details:\n\nRequest ID: ${request.requestId}\nUser: ${request.userName}\nStatus: ${request.status}\nWeight: ${request.weight} kg\nEstimated Price: ₹${request.estimatedPrice}`);
    }
  };

  const handleAssignRequest = (request) => {
    const scrapperName = window.prompt('Assign to scrapper (enter name):');
    if (!scrapperName) return;

    // Update in userRequests storage
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const index = userRequests.findIndex((r) => r.id === request.id);
    if (index !== -1) {
      const scrapperId = `scrapper_manual_${scrapperName.replace(/\s+/g, '_').toLowerCase()}`;
      const historyEntry = {
        scrapperId,
        scrapperName,
        assignedBy: 'admin',
        assignedAt: new Date().toISOString(),
        status: 'admin_assigned'
      };

      const existing = userRequests[index];
      const history = Array.isArray(existing.assignmentHistory)
        ? existing.assignmentHistory
        : [];

      userRequests[index] = {
        ...existing,
        assignedScrapperId: scrapperId,
        assignedScrapperName: scrapperName,
        assignmentStatus: 'admin_assigned',
        assignmentHistory: [...history, historyEntry]
      };

      localStorage.setItem('userRequests', JSON.stringify(userRequests));
    }

    loadRequests();
  };

  const handleCancelRequest = (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      if (requestId === 'req_001') {
        localStorage.removeItem('activeRequest');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#dbeafe', color: '#3b82f6', icon: FaClock, label: 'Pending' },
      accepted: { bg: '#fef3c7', color: '#f59e0b', icon: FaCheckCircle, label: 'Accepted' },
      in_progress: { bg: '#d1fae5', color: '#10b981', icon: FaTruck, label: 'In Progress' },
      completed: { bg: '#d1fae5', color: '#10b981', icon: FaCheckCircle, label: 'Completed' },
      cancelled: { bg: '#fee2e2', color: '#dc2626', icon: FaTimesCircle, label: 'Cancelled' }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{style.label}</span>
        <span className="sm:hidden">{style.label.charAt(0)}</span>
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
              Active Requests
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              Monitor and manage all pickup requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                {requests.length} Total Requests
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
              placeholder="Search by request ID, user name, or phone..."
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
            {['all', 'pending', 'accepted', 'in_progress'].map((status) => (
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
                {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaFileInvoice className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No requests found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'No active requests at the moment'}
              </p>
            </motion.div>
          ) : (
            filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredRequests.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
                      <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                        {request.requestId}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 md:gap-3 text-xs md:text-sm" style={{ color: '#718096' }}>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaUser className="text-xs" />
                        <span className="truncate">{request.userName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaMapMarkerAlt className="text-xs" />
                        <span className="truncate">{request.location?.address || 'N/A'}</span>
                      </div>
                      <div>
                        Categories: {request.categories?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        Weight: {request.weight} kg
                      </div>
                      <div>
                        Estimated: ₹{request.estimatedPrice}
                      </div>
                      {request.assignmentStatus && (
                        <div>
                          Assignment:{' '}
                          <span className="font-semibold">
                            {request.assignmentStatus === 'unassigned'
                              ? 'Unassigned'
                              : request.assignmentStatus === 'admin_assigned'
                              ? 'Admin Assigned'
                              : request.assignmentStatus}
                          </span>
                        </div>
                      )}
                      <div className="text-xs">
                        Created: {getTimeAgo(request.createdAt)}
                      </div>
                    </div>
                    {request.assignedScrapperName && (
                      <div className="mt-1 md:mt-2 text-xs md:text-sm" style={{ color: '#718096' }}>
                        <span className="font-semibold">Assigned Scrapper:</span> {request.scrapperName}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(request)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      <FaEye className="text-xs md:text-sm" />
                      <span className="hidden sm:inline">View</span>
                    </motion.button>
                    {(!request.assignmentStatus || request.assignmentStatus === 'unassigned') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAssignRequest(request)}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                        style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                      >
                        <FaTruck className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">Assign</span>
                      </motion.button>
                    )}
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancelRequest(request.id)}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                      >
                        <FaBan className="text-xs md:text-sm" />
                        <span className="hidden sm:inline">Cancel</span>
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

export default ActiveRequests;

