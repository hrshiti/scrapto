import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSearch, FaDownload, FaCalendarAlt, FaUser, FaTruck, FaRupeeSign, FaEye } from 'react-icons/fa';

const CompletedOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, week, month
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // Load completed orders from localStorage
    const completedOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
    
    // Add mock data
    const mockOrders = [
      {
        id: 'order_001',
        orderId: 'ORD-2024-001',
        userId: 'user_001',
        userName: 'Rahul Sharma',
        scrapperId: 'scrapper_001',
        scrapperName: 'Rajesh Kumar',
        categories: ['Metal', 'Plastic'],
        weight: 25.5,
        paidAmount: 4500,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: '123 Main Street, Mumbai'
      },
      {
        id: 'order_002',
        orderId: 'ORD-2024-002',
        userId: 'user_002',
        userName: 'Priya Patel',
        scrapperId: 'scrapper_002',
        scrapperName: 'Amit Sharma',
        categories: ['Electronics'],
        weight: 8.2,
        paidAmount: 2800,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: '456 Business Park, Delhi'
      },
      {
        id: 'order_003',
        orderId: 'ORD-2024-003',
        userId: 'user_003',
        userName: 'Amit Kumar',
        scrapperId: 'scrapper_003',
        scrapperName: 'Suresh Reddy',
        categories: ['Paper'],
        weight: 15.0,
        paidAmount: 1800,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: '789 Residential Area, Gurgaon'
      }
    ];

    // Merge localStorage orders with mock data
    const allOrders = [...completedOrders.map(order => ({
      ...order,
      orderId: order.orderId || order.id,
      userName: order.userName || 'User',
      scrapperName: order.scrapperName || 'Scrapper',
      location: order.location || 'N/A'
    })), ...mockOrders];

    setOrders(allOrders);
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.completedAt || order.pickedUpAt);
    const now = new Date();
    const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

    let matchesFilter = true;
    if (filter === 'today') {
      matchesFilter = diffDays === 0;
    } else if (filter === 'week') {
      matchesFilter = diffDays <= 7;
    } else if (filter === 'month') {
      matchesFilter = diffDays <= 30;
    }

    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.scrapperName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (order) => {
    // Navigate to user detail page to see order details
    if (order.userId) {
      navigate(`/admin/users/${order.userId}`);
    } else {
      // Show alert with order details if no userId
      alert(`Order Details:\n\nOrder ID: ${order.orderId || order.id}\nUser: ${order.userName}\nScrapper: ${order.scrapperName}\nAmount: ₹${order.paidAmount}\nWeight: ${order.weight} kg`);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Order ID', 'User', 'Scrapper', 'Categories', 'Weight (kg)', 'Amount Paid (₹)', 'Location', 'Completed Date'],
      ...filteredOrders.map(order => [
        order.orderId || order.id,
        order.userName || 'N/A',
        order.scrapperName || 'N/A',
        order.categories?.join(', ') || 'N/A',
        order.weight || 'N/A',
        order.paidAmount || 0,
        order.location || 'N/A',
        new Date(order.completedAt || order.pickedUpAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (parseFloat(order.paidAmount) || 0), 0);

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
              Completed Orders
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              View all completed pickup orders
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                Total Revenue: ₹{totalRevenue.toLocaleString()}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
              style={{ backgroundColor: '#64946e', color: '#ffffff' }}
            >
              <FaDownload className="text-xs md:text-sm" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </motion.button>
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
              placeholder="Search by order ID, user, or scrapper..."
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
            {['all', 'today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`px-2.5 py-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all ${
                  filter === period ? 'shadow-md' : ''
                }`}
                style={{
                  backgroundColor: filter === period ? '#64946e' : '#f7fafc',
                  color: filter === period ? '#ffffff' : '#2d3748'
                }}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaCheckCircle className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No completed orders found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'No orders have been completed yet'}
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredOrders.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
                      <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                        {order.orderId || order.id}
                      </h3>
                      <span className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                        <FaCheckCircle className="text-xs" />
                        <span className="hidden sm:inline">Completed</span>
                        <span className="sm:hidden">C</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-3 text-xs md:text-sm" style={{ color: '#718096' }}>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaUser className="text-xs" />
                        <span className="truncate">User: {order.userName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaTruck className="text-xs" />
                        <span className="truncate">Scrapper: {order.scrapperName || 'N/A'}</span>
                      </div>
                      <div>
                        Categories: {order.categories?.join(', ') || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaRupeeSign className="text-xs" />
                        <span className="font-semibold" style={{ color: '#2d3748' }}>
                          ₹{order.paidAmount || 0}
                        </span>
                      </div>
                      <div>
                        Weight: {order.weight || 'N/A'} kg
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <FaCalendarAlt className="text-xs" />
                        <span className="text-xs">
                          {new Date(order.completedAt || order.pickedUpAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(order)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      <FaEye className="text-xs md:text-sm" />
                      <span className="hidden sm:inline">View</span>
                    </motion.button>
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

export default CompletedOrders;

