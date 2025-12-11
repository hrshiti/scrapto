import { useAuth } from '../shared/context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import LoginSignup from './components/LoginSignup';
import CategorySelectionPage from '../../components/AddScrapFlow/pages/CategorySelectionPage';
import ImageUploadPage from '../../components/AddScrapFlow/pages/ImageUploadPage';
import WeightInputPage from '../../components/AddScrapFlow/pages/WeightInputPage';
import MyProfilePage from './components/MyProfilePage';
import SavedAddressesPage from './components/SavedAddressesPage';
import MyRequestsPage from './components/MyRequestsPage';
import PriceConfirmationPage from '../../components/AddScrapFlow/pages/PriceConfirmationPage';
import RequestStatusPage from '../../components/AddScrapFlow/pages/RequestStatusPage';

const UserModule = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginSignup />;
  }

  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/add-scrap/category" element={<CategorySelectionPage />} />
      <Route path="/add-scrap/upload" element={<ImageUploadPage />} />
      <Route path="/add-scrap/weight" element={<WeightInputPage />} />
      <Route path="/add-scrap/confirm" element={<PriceConfirmationPage />} />
      <Route path="/request-status" element={<RequestStatusPage />} />
      <Route path="/my-profile" element={<MyProfilePage />} />
      <Route path="/saved-addresses" element={<SavedAddressesPage />} />
      <Route path="/my-requests" element={<MyRequestsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default UserModule;

