import { useAuth } from '../shared/context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrapperLogin from './components/ScrapperLogin';
import ScrapperDashboard from './components/ScrapperDashboard';
import KYCUploadPage from './components/KYCUploadPage';
import KYCStatusPage from './components/KYCStatusPage';
import SubscriptionPlanPage from './components/SubscriptionPlanPage';
import ActiveRequestsPage from './components/ActiveRequestsPage';
import ActiveRequestDetailsPage from './components/ActiveRequestDetailsPage';
import ReferAndEarn from './components/ReferAndEarn';
import ScrapperHelpSupport from './components/ScrapperHelpSupport';
import ScrapperProfile from './components/ScrapperProfile';

// Helper function to check KYC status
const getKYCStatus = () => {
  const kycStatus = localStorage.getItem('scrapperKYCStatus');
  const kycData = localStorage.getItem('scrapperKYC');
  
  if (!kycData) return 'not_submitted';
  if (kycStatus === 'verified') return 'verified';
  if (kycStatus === 'pending') return 'pending';
  if (kycStatus === 'rejected') return 'rejected';
  return 'not_submitted';
};

// Helper function to check subscription status
const getSubscriptionStatus = () => {
  const subscriptionStatus = localStorage.getItem('scrapperSubscriptionStatus');
  const subscriptionData = localStorage.getItem('scrapperSubscription');
  
  if (!subscriptionData || !subscriptionStatus) return 'not_subscribed';
  if (subscriptionStatus === 'active') {
    const sub = JSON.parse(subscriptionData);
    const expiryDate = new Date(sub.expiryDate);
    const now = new Date();
    if (expiryDate > now) {
      return 'active';
    } else {
      return 'expired';
    }
  }
  return 'not_subscribed';
};

const ScrapperModule = () => {
  const { isAuthenticated } = useAuth();
  
  // Check if user is specifically authenticated as scrapper
  const isScrapperAuthenticated = () => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    const scrapperStatus = localStorage.getItem('scrapperStatus') || 'active';
    return scrapperAuth === 'true' && scrapperUser !== null && scrapperStatus !== 'blocked';
  };
  
  const scrapperIsAuthenticated = isScrapperAuthenticated();
  const kycStatus = scrapperIsAuthenticated ? getKYCStatus() : 'not_submitted';
  const subscriptionStatus = scrapperIsAuthenticated && kycStatus === 'verified' ? getSubscriptionStatus() : 'not_subscribed';

  // If not authenticated as scrapper, show login
  if (!scrapperIsAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<ScrapperLogin />} />
        <Route path="/" element={<Navigate to="/scrapper/login" replace />} />
        <Route path="*" element={<Navigate to="/scrapper/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, check KYC status and route accordingly
  // Always register all routes, but use Navigate for redirects
  return (
    <Routes>
      {/* KYC Upload Route */}
      <Route path="/kyc" element={<KYCUploadPage />} />
      
      {/* KYC Status Route */}
      <Route path="/kyc-status" element={<KYCStatusPage />} />
      
      {/* Subscription Plan Route */}
      <Route path="/subscription" element={<SubscriptionPlanPage />} />
      
      {/* Dashboard Route */}
      <Route path="/" element={<ScrapperDashboard />} />
      <Route path="/dashboard" element={<ScrapperDashboard />} />
      
      {/* Active Requests Route - for when scrapper is online */}
      <Route path="/active-requests" element={<ActiveRequestsPage />} />
      
      {/* Active Request Details Route - after accepting a request */}
      <Route path="/active-request/:requestId" element={<ActiveRequestDetailsPage />} />
      
      {/* Help & Support */}
      <Route path="/help" element={<ScrapperHelpSupport />} />
      
      {/* Profile */}
      <Route path="/profile" element={<ScrapperProfile />} />
      
      {/* Refer & Earn Route */}
      <Route path="/refer" element={<ReferAndEarn />} />
      
      {/* Redirect logic based on KYC and Subscription status */}
      <Route path="*" element={
        kycStatus === 'not_submitted' ? (
          <Navigate to="/scrapper/kyc" replace />
        ) : kycStatus === 'rejected' ? (
          <Navigate to="/scrapper/kyc" replace />
        ) : kycStatus === 'pending' ? (
          <Navigate to="/scrapper/kyc-status" replace />
        ) : kycStatus === 'verified' && subscriptionStatus !== 'active' ? (
          <Navigate to="/scrapper/subscription" replace />
        ) : kycStatus === 'verified' && subscriptionStatus === 'active' ? (
          <Navigate to="/scrapper" replace />
        ) : (
          <Navigate to="/scrapper/kyc" replace />
        )
      } />
    </Routes>
  );
};

export default ScrapperModule;

