import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import UserModule from './modules/user';
import AdminModule from './modules/admin';
import ScrapperModule from './modules/scrapper';
import './App.css';

function App() {
  // For now, default to user module. Later this can be based on authentication/role
  const [currentModule, setCurrentModule] = useState('user');

  const renderModule = () => {
    switch (currentModule) {
      case 'admin':
        return <AdminModule />;
      case 'scrapper':
        return <ScrapperModule />;
      case 'user':
      default:
        return <UserModule />;
    }
  };

  return (
    <BrowserRouter>
      {renderModule()}
    </BrowserRouter>
  );
}

export default App;
