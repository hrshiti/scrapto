import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaTruck, FaPhone, FaIdCard, FaStar, FaRupeeSign, 
  FaCheckCircle, FaClock, FaUserTimes, FaCar, FaCreditCard, FaChartLine 
} from 'react-icons/fa';

const ScrapperDetail = () => {
  const { scrapperId } = useParams();
  const navigate = useNavigate();
  const [scrapper, setScrapper] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrapperData();
  }, [scrapperId]);

  const loadScrapperData = () => {
    // Load scrapper data
    const mockScrapper = {
      id: scrapperId,
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      kycStatus: 'verified',
      kycData: {
        aadhaarNumber: '1234-****-5678',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        verifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      subscription: {
        status: 'active',
        plan: 'Pro Plan',
        price: 199,
        subscribedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      rating: 4.9,
      totalPickups: 45,
      totalEarnings: 125000,
      vehicleInfo: 'Truck - MH-01-AB-1234',
      joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      earnings: {
        today: 2500,
        week: 15000,
        month: 45000,
        total: 125000
      }
    };

    const mockOrders = JSON.parse(localStorage.getItem('scrapperCompletedOrders') || '[]');
    
    // Add more mock orders if needed
    if (mockOrders.length === 0) {
      const additionalOrders = [
        {
          id: 'order_001',
          orderId: 'ORD-2024-001',
          userName: 'Rahul Sharma',
          categories: ['Metal', 'Plastic'],
          weight: 25.5,
          paidAmount: 4500,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: '123 Main Street, Mumbai'
        },
        {
          id: 'order_002',
          orderId: 'ORD-2024-002',
          userName: 'Priya Patel',
          categories: ['Electronics'],
          weight: 8.2,
          paidAmount: 2800,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: '456 Business Park, Delhi'
        }
      ];
      setOrders(additionalOrders);
    } else {
      setOrders(mockOrders);
    }

    setScrapper(mockScrapper);
    setLoading(false);
  };

  const getKYCStatusBadge = (status) => {
    if (status === 'verified') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
          <FaCheckCircle className="text-xs" />
          Verified
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
          <FaClock className="text-xs" />
          Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
        <FaUserTimes className="text-xs" />
        Rejected
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p style={{ color: '#718096' }}>Loading scrapper details...</p>
      </div>
    );
  }

  if (!scrapper) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>Scrapper not found</p>
        <button
          onClick={() => navigate('/admin/scrappers')}
          className="text-sm" style={{ color: '#64946e' }}
        >
          Back to Scrappers List
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
        onClick={() => navigate('/admin/scrappers')}
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: '#64946e' }}
      >
        <FaArrowLeft />
        Back to Scrappers
      </motion.button>

      {/* Scrapper Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0"
            style={{ backgroundColor: '#f7fafc' }}
          >
            <FaTruck style={{ color: '#64946e', fontSize: '48px' }} />
          </div>

          {/* Scrapper Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2d3748' }}>
                {scrapper.name}
              </h1>
              {getKYCStatusBadge(scrapper.kycStatus)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <FaPhone style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Phone</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaIdCard style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Aadhaar</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.kycData?.aadhaarNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaStar style={{ color: '#fbbf24' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Rating</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.rating.toFixed(1)} ⭐</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaCar style={{ color: '#64946e' }} />
                <div>
                  <p className="text-xs" style={{ color: '#718096' }}>Vehicle</p>
                  <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.vehicleInfo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pickups', value: scrapper.totalPickups, icon: FaCheckCircle, color: '#10b981' },
          { label: 'Total Earnings', value: `₹${(scrapper.totalEarnings / 1000).toFixed(0)}k`, icon: FaRupeeSign, color: '#8b5cf6' },
          { label: 'Rating', value: scrapper.rating.toFixed(1), icon: FaStar, color: '#fbbf24' },
          { label: 'This Month', value: `₹${(scrapper.earnings.month / 1000).toFixed(0)}k`, icon: FaChartLine, color: '#06b6d4' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                  <Icon style={{ color: stat.color, fontSize: '20px' }} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold" style={{ color: '#2d3748' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: '#718096' }}>{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* KYC Information */}
      {scrapper.kycStatus === 'verified' && scrapper.kycData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
            KYC Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Aadhaar Number</p>
              <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.kycData.aadhaarNumber}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Verified On</p>
              <p className="font-semibold" style={{ color: '#2d3748' }}>
                {new Date(scrapper.kycData.verifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Subscription Information */}
      {scrapper.subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
            Subscription Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Plan</p>
              <p className="font-semibold" style={{ color: '#2d3748' }}>{scrapper.subscription.plan}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Status</p>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold inline-block" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                <FaCheckCircle className="text-xs" />
                {scrapper.subscription.status.charAt(0).toUpperCase() + scrapper.subscription.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Price</p>
              <p className="font-semibold" style={{ color: '#2d3748' }}>₹{scrapper.subscription.price}/month</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#718096' }}>Expires On</p>
              <p className="font-semibold" style={{ color: '#2d3748' }}>
                {new Date(scrapper.subscription.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Order History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#2d3748' }}>
          Completed Orders ({orders.length})
        </h2>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: '#718096' }}>
              No completed orders yet
            </p>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="p-4 rounded-xl border-2" style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold" style={{ color: '#2d3748' }}>{order.orderId || order.id}</span>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: '#718096' }}>
                      <p>User: {order.userName || 'User'}</p>
                      <p>Categories: {order.categories?.join(', ') || 'N/A'}</p>
                      <p>Weight: {order.weight || 'N/A'} kg • Amount Paid: ₹{order.paidAmount || 0}</p>
                      <p>Location: {order.location || 'N/A'}</p>
                      {order.completedAt && (
                        <p className="text-xs">
                          Completed: {new Date(order.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScrapperDetail;

