import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { PersonalityProvider } from './context/PersonalityContext';
import AppContent from './components/AppContent';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PersonalityProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </PersonalityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
