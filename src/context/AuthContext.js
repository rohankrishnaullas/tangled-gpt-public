import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = storageService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    const validUsername = process.env.REACT_APP_AUTH_USERNAME;
    const validPassword = process.env.REACT_APP_AUTH_PASSWORD;

    if (username === validUsername && password === validPassword) {
      storageService.setAuthenticated(true);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    storageService.setAuthenticated(false);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
