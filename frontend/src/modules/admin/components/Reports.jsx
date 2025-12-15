import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  FaChartBar, FaDownload, FaCalendarAlt, FaRupeeSign, FaUsers, 
  FaTruck, FaFileInvoice, FaCheckCircle, FaCreditCard
} from 'react-icons/fa';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalUsers: 0,
    totalScrappers: 0,
    totalRequests: 0,
    completedOrders: 0,
    totalRevenue: 0,
    subscriptionRevenue: 0
  });
  const [dateRange, setDateRange] = useState('month'); // today, week, month, year

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = () => {
    // Aggregate data from localStorage
    const completedOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
    const subscriptions = JSON.parse(localStorage.getItem('scrapperSubscription') || '{}');
    
    // Mock data
    const mockData = {
      totalUsers: 156,
      totalScrappers: 48,
      totalRequests: 234,
      completedOrders: completedOrders.length + 180,
      totalRevenue: completedOrders.reduce((sum, order) => sum + (parseFloat(order.paidAmount) || 0), 0) + 125000,
      subscriptionRevenue: subscriptions.price ? subscriptions.price * 45 : 4455
    };

    setReportData(mockData);
  };

  const handleExportReport = (type) => {
    // Generate CSV report
    const csvContent = generateCSVReport(type);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (type) => {
    // Mock CSV generation
    const headers = {
      users: ['User ID', 'Name', 'Phone', 'Total Requests', 'Wallet Balance', 'Joined Date'],
      scrappers: ['Scrapper ID', 'Name', 'Phone', 'KYC Status', 'Subscription', 'Total Pickups', 'Earnings'],
      orders: ['Order ID', 'User', 'Scrapper', 'Amount', 'Date', 'Status'],
      revenue: ['Date', 'Revenue Type', 'Amount', 'Description']
    };

    const data = {
      users: [['user_001', 'Rahul Sharma', '+91 98765 43210', '12', '₹3450', '2024-01-01']],
      scrappers: [['scrapper_001', 'Rajesh Kumar', '+91 98765 43210', 'Verified', 'Active', '45', '₹125000']],
      orders: [['ORD-001', 'Rahul Sharma', 'Rajesh Kumar', '₹4500', '2024-01-15', 'Completed']],
      revenue: [['2024-01-15', 'Order Payment', '₹4500', 'Completed pickup order']]
    };

    return [headers[type].join(','), ...data[type].map(row => row.join(','))].join('\n');
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: reportData.totalUsers,
      icon: FaUsers,
      color: '#3b82f6',
      bg: '#dbeafe'
    },
    {
      title: 'Total Scrappers',
      value: reportData.totalScrappers,
      icon: FaTruck,
      color: '#10b981',
      bg: '#d1fae5'
    },
    {
      title: 'Total Requests',
      value: reportData.totalRequests,
      icon: FaFileInvoice,
      color: '#f59e0b',
      bg: '#fef3c7'
    },
    {
      title: 'Completed Orders',
      value: reportData.completedOrders,
      icon: FaCheckCircle,
      color: '#8b5cf6',
      bg: '#ede9fe'
    },
    {
      title: 'Total Revenue',
      value: `₹${(reportData.totalRevenue / 1000).toFixed(1)}k`,
      icon: FaRupeeSign,
      color: '#06b6d4',
      bg: '#cffafe'
    },
    {
      title: 'Subscription Revenue',
      value: `₹${reportData.subscriptionRevenue}`,
      icon: FaCreditCard,
      color: '#ef4444',
      bg: '#fee2e2'
    }
  ];

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
              Reports & Analytics
            </h1>
            <p className="text-xs md:text-sm lg:text-base" style={{ color: '#718096' }}>
              View platform statistics and generate reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2"
              style={{
                borderColor: '#e2e8f0',
                focusBorderColor: '#64946e'
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6"
            >
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div
                  className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.bg }}
                >
                  <Icon style={{ color: card.color, fontSize: '16px' }} className="md:text-2xl" />
                </div>
              </div>
              <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-0.5 md:mb-1" style={{ color: '#2d3748' }}>
                {card.value}
              </h3>
              <p className="text-[10px] md:text-sm lg:text-base leading-tight" style={{ color: '#718096' }}>
                {card.title}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Export Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
          Export Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Users Report', type: 'users', icon: FaUsers },
            { label: 'Scrappers Report', type: 'scrappers', icon: FaTruck },
            { label: 'Orders Report', type: 'orders', icon: FaFileInvoice },
            { label: 'Revenue Report', type: 'revenue', icon: FaRupeeSign }
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.button
                key={report.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExportReport(report.type)}
                className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                style={{ backgroundColor: '#f7fafc' }}
              >
                <Icon style={{ color: '#64946e', fontSize: '24px' }} />
                <span className="text-sm font-medium" style={{ color: '#2d3748' }}>
                  {report.label}
                </span>
                <FaDownload className="text-xs" style={{ color: '#718096' }} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
          Revenue Trends
        </h2>
        <div className="h-64 flex items-center justify-center" style={{ backgroundColor: '#f7fafc', borderRadius: '12px' }}>
          <p className="text-sm" style={{ color: '#718096' }}>
            Chart visualization will be added here (Chart.js / Recharts)
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;

