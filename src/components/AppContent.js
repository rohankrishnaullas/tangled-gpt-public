import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import Login from './Login';
import MainLayout from './MainLayout';

function AppContent() {
  // const { isAuthenticated, isLoading } = useAuth();

  // Skip login for easier debugging/testing
  return <MainLayout />;

  // Uncomment below to enable login:
  // if (isLoading) {
  //   return (
  //     <div className="app-loading">
  //       <div className="loading-spinner"></div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <Login />;
  // }

  // return <MainLayout />;
}

export default AppContent;
