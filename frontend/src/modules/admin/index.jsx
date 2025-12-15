import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../shared/context/AdminAuthContext';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import KYCQueue from './components/KYCQueue';
import UsersList from './components/UsersList';
import UserDetail from './components/UserDetail';
import ScrappersList from './components/ScrappersList';
import ScrapperDetail from './components/ScrapperDetail';
import PriceFeedEditor from './components/PriceFeedEditor';
import ActiveRequests from './components/ActiveRequests';
import CompletedOrders from './components/CompletedOrders';
import SubscriptionsList from './components/SubscriptionsList';
import Reports from './components/Reports';
import AdminProfile from './components/AdminProfile';
import ReferralsList from './components/ReferralsList';
import ReferralSettings from './components/ReferralSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Admin Module Routes
const AdminModuleRoutes = () => {
  const { isAuthenticated } = useAdminAuth();

  // If not authenticated, show login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show protected routes
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        {/* KYC Management */}
        <Route path="kyc" element={<KYCQueue />} />
        {/* User Management */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/:userId" element={<UserDetail />} />
        {/* Scrapper Management */}
        <Route path="scrappers" element={<ScrappersList />} />
        <Route path="scrappers/:scrapperId" element={<ScrapperDetail />} />
        {/* Price Feed Management */}
        <Route path="prices" element={<PriceFeedEditor />} />
        {/* Request Management */}
        <Route path="requests" element={<ActiveRequests />} />
        <Route path="orders" element={<CompletedOrders />} />
        {/* Subscription Management */}
        <Route path="subscriptions" element={<SubscriptionsList />} />
        {/* Referral Management */}
        <Route path="referrals" element={<ReferralsList />} />
        <Route path="referrals/settings" element={<ReferralSettings />} />
        {/* Reports & Analytics */}
        <Route path="reports" element={<Reports />} />
        {/* Profile */}
        <Route path="profile" element={<AdminProfile />} />
        {/* Placeholder routes for future pages */}
        <Route path="settings" element={<div className="p-6 text-center">App Settings - Coming Soon</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="/login" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

// Main Admin Module Component
const AdminModule = () => {
  return (
    <AdminAuthProvider>
      <AdminModuleRoutes />
    </AdminAuthProvider>
  );
};

export default AdminModule;
