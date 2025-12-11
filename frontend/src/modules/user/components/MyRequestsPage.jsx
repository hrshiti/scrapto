import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaImage,
  FaWeight,
  FaRupeeSign
} from 'react-icons/fa';
import { HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { MdPending, MdLocalShipping, MdDone } from 'react-icons/md';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, pending, accepted, completed, cancelled

  // Mock requests data
  const [requests] = useState([
    {
      id: 1,
      requestId: 'REQ-2024-001',
      categories: ['Metal', 'Plastic'],
      images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      weight: 25.5,
      estimatedPrice: 1250,
      status: 'completed',
      createdAt: '2024-01-15T10:30:00',
      completedAt: '2024-01-15T14:20:00',
      scrapperName: 'Rajesh Kumar',
      scrapperPhone: '+91 98765 43210',
      address: '123 Main Street, Sector 5, New Delhi',
      notes: 'Mixed metal and plastic scrap',
    },
    {
      id: 2,
      requestId: 'REQ-2024-002',
      categories: ['Electronics'],
      images: ['https://via.placeholder.com/150'],
      weight: 8.2,
      estimatedPrice: 680,
      status: 'in_progress',
      createdAt: '2024-01-18T09:15:00',
      scrapperName: 'Amit Sharma',
      scrapperPhone: '+91 98765 43211',
      address: '456 Business Park, Gurgaon',
      notes: 'Old mobile phones and laptops',
    },
    {
      id: 3,
      requestId: 'REQ-2024-003',
      categories: ['Paper'],
      images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
      weight: 45.0,
      estimatedPrice: 540,
      status: 'accepted',
      createdAt: '2024-01-20T11:00:00',
      scrapperName: 'Priya Singh',
      scrapperPhone: '+91 98765 43212',
      address: '789 Residential Area, Noida',
      notes: 'Office paper waste',
    },
    {
      id: 4,
      requestId: 'REQ-2024-004',
      categories: ['Metal'],
      images: ['https://via.placeholder.com/150'],
      weight: 15.0,
      estimatedPrice: 2700,
      status: 'pending',
      createdAt: '2024-01-22T08:45:00',
      address: '321 Street, Mumbai',
      notes: 'Copper and aluminium scrap',
    },
    {
      id: 5,
      requestId: 'REQ-2024-005',
      categories: ['Plastic'],
      images: ['https://via.placeholder.com/150'],
      weight: 12.5,
      estimatedPrice: 562,
      status: 'cancelled',
      createdAt: '2024-01-10T14:20:00',
      cancelledAt: '2024-01-10T15:30:00',
      address: '654 Avenue, Bangalore',
      notes: 'Plastic bottles and containers',
    },
  ]);

  const statusConfig = {
    pending: {
      label: 'Pending',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: MdPending,
    },
    accepted: {
      label: 'Accepted',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: HiCheckCircle,
    },
    in_progress: {
      label: 'In Progress',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      icon: MdLocalShipping,
    },
    completed: {
      label: 'Completed',
      color: '#64946e',
      bgColor: 'rgba(100, 148, 110, 0.1)',
      icon: FaCheckCircle,
    },
    cancelled: {
      label: 'Cancelled',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      icon: FaTimesCircle,
    },
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredRequests = selectedFilter === 'all' 
    ? requests 
    : requests.filter(req => req.status === selectedFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:opacity-70 transition-opacity"
              style={{ color: '#64946e' }}
            >
              <FaTimes size={20} />
            </button>
            <h1 
              className="text-xl md:text-2xl font-bold"
              style={{ color: '#2d3748' }}
            >
              My Requests
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Stats Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-4 md:mb-6"
        >
          <div 
            className="rounded-2xl p-4 md:p-6"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Total', value: requests.length, color: '#2d3748' },
                { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: '#f59e0b' },
                { label: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length, color: '#8b5cf6' },
                { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, color: '#64946e' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="text-center"
                >
                  <p 
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: stat.color }}
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
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 md:mb-6"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                  selectedFilter === filter.id ? 'text-white' : 'text-gray-600'
                }`}
                style={{
                  backgroundColor: selectedFilter === filter.id ? '#64946e' : '#ffffff',
                  border: selectedFilter === filter.id ? 'none' : '1px solid rgba(100, 148, 110, 0.15)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-3 md:space-y-4">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 md:p-12 text-center"
              style={{ backgroundColor: '#ffffff' }}
            >
              <FaTruck 
                size={48} 
                className="mx-auto mb-4"
                style={{ color: '#a0aec0' }}
              />
              <h3 
                className="text-lg md:text-xl font-bold mb-2"
                style={{ color: '#2d3748' }}
              >
                No requests found
              </h3>
              <p 
                className="text-sm md:text-base"
                style={{ color: '#718096' }}
              >
                {selectedFilter === 'all' 
                  ? 'You haven\'t created any pickup requests yet'
                  : `No ${filters.find(f => f.id === selectedFilter)?.label.toLowerCase()} requests`
                }
              </p>
            </motion.div>
          ) : (
            filteredRequests.map((request, index) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-xl p-4 md:p-6"
                  style={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(100, 148, 110, 0.15)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 
                          className="font-bold text-base md:text-lg"
                          style={{ color: '#2d3748' }}
                        >
                          {request.requestId}
                        </h3>
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{ 
                            backgroundColor: status.bgColor,
                            color: status.color
                          }}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: '#718096' }}>
                        <FaCalendarAlt size={12} />
                        <span>{formatDate(request.createdAt)} at {formatTime(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {request.categories.map((category, catIndex) => (
                      <span
                        key={catIndex}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: 'rgba(100, 148, 110, 0.1)',
                          color: '#64946e'
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Images Preview */}
                  {request.images && request.images.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                      {request.images.slice(0, 3).map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 relative"
                          style={{ backgroundColor: '#e5ddd4' }}
                        >
                          <img
                            src={img}
                            alt={`Request ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {request.images.length > 3 && (
                        <div 
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
                        >
                          <span className="text-xs font-bold" style={{ color: '#64946e' }}>
                            +{request.images.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <FaWeight size={14} style={{ color: '#64946e' }} />
                      <div>
                        <p className="text-xs" style={{ color: '#718096' }}>Weight</p>
                        <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                          {request.weight} kg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaRupeeSign size={14} style={{ color: '#64946e' }} />
                      <div>
                        <p className="text-xs" style={{ color: '#718096' }}>Est. Price</p>
                        <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
                          ₹{request.estimatedPrice}
                        </p>
                      </div>
                    </div>
                    {request.scrapperName && (
                      <div className="flex items-center gap-2">
                        <FaTruck size={14} style={{ color: '#64946e' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#718096' }}>Scrapper</p>
                          <p className="text-sm font-semibold truncate" style={{ color: '#2d3748' }}>
                            {request.scrapperName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {request.address && (
                    <div className="flex items-start gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 148, 110, 0.05)' }}>
                      <FaMapMarkerAlt size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#64946e' }} />
                      <p className="text-xs md:text-sm flex-1" style={{ color: '#4a5568' }}>
                        {request.address}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {request.notes && (
                    <div className="mb-3">
                      <p className="text-xs md:text-sm" style={{ color: '#718096' }}>
                        <span className="font-medium">Notes: </span>
                        {request.notes}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  {request.status === 'completed' && request.completedAt && (
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.15)' }}>
                      <p className="text-xs" style={{ color: '#718096' }}>
                        Completed on {formatDate(request.completedAt)} at {formatTime(request.completedAt)}
                      </p>
                    </div>
                  )}

                  {request.status === 'cancelled' && request.cancelledAt && (
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.15)' }}>
                      <p className="text-xs" style={{ color: '#ef4444' }}>
                        Cancelled on {formatDate(request.cancelledAt)} at {formatTime(request.cancelledAt)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.15)' }}>
                      <button
                        className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                        style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}

                  {request.status === 'accepted' && request.scrapperPhone && (
                    <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.15)' }}>
                      <a
                        href={`tel:${request.scrapperPhone}`}
                        className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold text-white text-center transition-all"
                        style={{ backgroundColor: '#64946e' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#5a8263';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#64946e';
                        }}
                      >
                        Call Scrapper
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyRequestsPage;

