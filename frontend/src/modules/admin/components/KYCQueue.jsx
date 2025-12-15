import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaUserShield, FaCheckCircle, FaTimesCircle, FaEye, FaClock, FaFilter } from 'react-icons/fa';
import KYCDetailModal from './KYCDetailModal';

const KYCQueue = () => {
  const [kycList, setKycList] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadKYCData();
  }, []);

  const loadKYCData = () => {
    // Aggregate KYC data from localStorage
    // In real app, this would come from API
    const kycStatus = localStorage.getItem('scrapperKYCStatus');
    const kycData = localStorage.getItem('scrapperKYC');
    const scrapperUser = localStorage.getItem('scrapperUser');

    const kycItems = [];

    // If there's a KYC submission, add it
    if (kycData && scrapperUser) {
      const kyc = JSON.parse(kycData);
      const user = JSON.parse(scrapperUser);
      kycItems.push({
        id: 'kyc_001',
        scrapperId: 'scrapper_001',
        scrapperName: user.name || 'Scrapper',
        scrapperPhone: user.phone || 'N/A',
        aadhaarNumber: kyc.aadhaarNumber || 'N/A',
        aadhaarPhotoUrl: kyc.aadhaarPhotoUrl,
        selfieUrl: kyc.selfieUrl,
        status: kycStatus || 'pending',
        submittedAt: kyc.submittedAt || new Date().toISOString(),
        vehicleInfo: user.vehicleInfo || 'Not provided'
      });
    }

    // Add mock data for demonstration
    const mockKYCs = [
      {
        id: 'kyc_002',
        scrapperId: 'scrapper_002',
        scrapperName: 'Rajesh Kumar',
        scrapperPhone: '+91 98765 43210',
        aadhaarNumber: '1234-****-5678',
        aadhaarPhotoUrl: 'https://via.placeholder.com/400x300?text=Aadhaar+Card',
        selfieUrl: 'https://via.placeholder.com/400x400?text=Selfie',
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        vehicleInfo: 'Truck - MH-01-AB-1234'
      },
      {
        id: 'kyc_003',
        scrapperId: 'scrapper_003',
        scrapperName: 'Amit Sharma',
        scrapperPhone: '+91 98765 43211',
        aadhaarNumber: '2345-****-6789',
        aadhaarPhotoUrl: 'https://via.placeholder.com/400x300?text=Aadhaar+Card',
        selfieUrl: 'https://via.placeholder.com/400x400?text=Selfie',
        status: 'pending',
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        vehicleInfo: 'Auto Rickshaw - DL-01-CD-5678'
      },
      {
        id: 'kyc_004',
        scrapperId: 'scrapper_004',
        scrapperName: 'Priya Patel',
        scrapperPhone: '+91 98765 43212',
        aadhaarNumber: '3456-****-7890',
        aadhaarPhotoUrl: 'https://via.placeholder.com/400x300?text=Aadhaar+Card',
        selfieUrl: 'https://via.placeholder.com/400x400?text=Selfie',
        status: 'verified',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        verifiedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        vehicleInfo: 'Van - GJ-01-EF-9012'
      },
      {
        id: 'kyc_005',
        scrapperId: 'scrapper_005',
        scrapperName: 'Suresh Reddy',
        scrapperPhone: '+91 98765 43213',
        aadhaarNumber: '4567-****-8901',
        aadhaarPhotoUrl: 'https://via.placeholder.com/400x300?text=Aadhaar+Card',
        selfieUrl: 'https://via.placeholder.com/400x400?text=Selfie',
        status: 'rejected',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason: 'Aadhaar photo unclear',
        vehicleInfo: 'Truck - KA-01-GH-3456'
      }
    ];

    setKycList([...kycItems, ...mockKYCs]);
  };

  const filteredKYCs = kycList.filter(kyc => {
    const matchesFilter = filter === 'all' || kyc.status === filter;
    const matchesSearch = 
      kyc.scrapperName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kyc.scrapperPhone.includes(searchQuery) ||
      kyc.aadhaarNumber.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (kyc) => {
    setSelectedKYC(kyc);
    setShowModal(true);
  };

  const handleKYCUpdate = (kycId, newStatus, reason = '') => {
    // Update KYC status
    setKycList(prev => prev.map(kyc => 
      kyc.id === kycId 
        ? { 
            ...kyc, 
            status: newStatus,
            ...(newStatus === 'verified' && { verifiedAt: new Date().toISOString() }),
            ...(newStatus === 'rejected' && { rejectedAt: new Date().toISOString(), rejectionReason: reason })
          }
        : kyc
    ));

    // Update localStorage if it's the current scrapper's KYC
    if (kycId === 'kyc_001') {
      localStorage.setItem('scrapperKYCStatus', newStatus);
      const kycData = JSON.parse(localStorage.getItem('scrapperKYC') || '{}');
      kycData.status = newStatus;
      if (newStatus === 'verified') {
        kycData.verifiedAt = new Date().toISOString();
      } else if (newStatus === 'rejected') {
        kycData.rejectedAt = new Date().toISOString();
        kycData.rejectionReason = reason;
      }
      localStorage.setItem('scrapperKYC', JSON.stringify(kycData));
    }

    setShowModal(false);
    setSelectedKYC(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#f59e0b', icon: FaClock },
      verified: { bg: '#d1fae5', color: '#10b981', icon: FaCheckCircle },
      rejected: { bg: '#fee2e2', color: '#ef4444', icon: FaTimesCircle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span
        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        <Icon className="text-xs" />
        <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
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
              KYC Verification Queue
            </h1>
            <p className="text-xs md:text-base" style={{ color: '#718096' }}>
              Review and verify scrapper KYC submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl" style={{ backgroundColor: '#f7fafc' }}>
              <span className="text-xs md:text-sm font-semibold" style={{ color: '#2d3748' }}>
                {filteredKYCs.filter(k => k.status === 'pending').length} Pending
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
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, or Aadhaar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
              style={{
                borderColor: '#e2e8f0',
                focusBorderColor: '#64946e',
                focusRingColor: '#64946e'
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
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

      {/* KYC List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <AnimatePresence>
          {filteredKYCs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FaUserShield className="mx-auto mb-4" style={{ color: '#cbd5e0', fontSize: '48px' }} />
              <p className="text-lg font-semibold mb-2" style={{ color: '#2d3748' }}>
                No KYC submissions found
              </p>
              <p className="text-sm" style={{ color: '#718096' }}>
                {searchQuery ? 'Try a different search term' : 'All KYC submissions have been processed'}
              </p>
            </motion.div>
          ) : (
            filteredKYCs.map((kyc, index) => (
              <motion.div
                key={kyc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 md:p-6 hover:bg-gray-50 transition-all ${
                  index !== filteredKYCs.length - 1 ? 'border-b' : ''
                }`}
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  {/* Scrapper Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div
                        className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f7fafc' }}
                      >
                        <FaUserShield style={{ color: '#64946e' }} className="text-lg md:text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2 flex-wrap">
                          <h3 className="text-base md:text-xl font-bold" style={{ color: '#2d3748' }}>
                            {kyc.scrapperName}
                          </h3>
                          {getStatusBadge(kyc.status)}
                        </div>
                        <div className="space-y-0.5 md:space-y-1 text-xs md:text-sm" style={{ color: '#718096' }}>
                          <p>📱 {kyc.scrapperPhone}</p>
                          <p>🆔 Aadhaar: {kyc.aadhaarNumber}</p>
                          <p>🚗 {kyc.vehicleInfo}</p>
                          <p className="text-xs">Submitted {getTimeAgo(kyc.submittedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(kyc)}
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-all"
                      style={{ backgroundColor: '#64946e', color: '#ffffff' }}
                    >
                      <FaEye className="text-xs md:text-sm" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* KYC Detail Modal */}
      <AnimatePresence>
        {showModal && selectedKYC && (
          <KYCDetailModal
            kyc={selectedKYC}
            onClose={() => {
              setShowModal(false);
              setSelectedKYC(null);
            }}
            onApprove={(kycId) => handleKYCUpdate(kycId, 'verified')}
            onReject={(kycId, reason) => handleKYCUpdate(kycId, 'rejected', reason)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYCQueue;

