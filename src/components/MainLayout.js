import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePersonality } from '../context/PersonalityContext';
// import { useAuth } from '../context/AuthContext';
import ChatContainer from './ChatContainer';
import ConversationSidebar from './ConversationSidebar';
import './MainLayout.css';

function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { currentPersonalityId, setPersonality, allPersonalities } = usePersonality();
  // const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="main-layout">
      {/* Conversation Sidebar */}
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Header */}
      <header className="app-header">
        <button 
          className="menu-btn" 
          onClick={() => setSidebarOpen(true)}
          title="Chat History"
        >
          ☰
        </button>
        
        <div className="header-center">
          <div className="app-title">
            <span className="app-avatar">☀️</span>
            <h1 className="app-name">Tangled GPT</h1>
          </div>
          
          <div className="personality-selector-chips">
            {allPersonalities.map(p => (
              <button
                key={p.id}
                className={`personality-chip ${p.id === currentPersonalityId ? 'active' : ''}`}
                onClick={() => setPersonality(p.id)}
              >
                <span className="chip-avatar">{p.avatar}</span>
                <span className="chip-name">{p.displayName}</span>
              </button>
            ))}
          </div>
          
          <div className="mode-tabs">
            <button 
              className={`mode-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button 
              className={`mode-tab ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveTab('voice')}
            >
              Voice
            </button>
          </div>
        </div>

        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Chat Area */}
      {activeTab === 'chat' && <ChatContainer />}
      {activeTab === 'voice' && (
        <div className="voice-container">
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem'}}>Voice mode coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
