import React from 'react';
import { useChat } from '../context/ChatContext';
import { usePersonality } from '../context/PersonalityContext';
import './ConversationSidebar.css';

function ConversationSidebar({ isOpen, onClose }) {
  const { 
    conversations, 
    currentConversationId, 
    createConversation, 
    selectConversation, 
    deleteConversation 
  } = useChat();
  const { allPersonalities } = usePersonality();

  const handleNewChat = () => {
    createConversation();
    onClose();
  };

  const handleSelectConversation = (id) => {
    selectConversation(id);
    onClose();
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const getPersonalityAvatar = (personalityId) => {
    const personality = allPersonalities.find(p => p.id === personalityId);
    return personality?.avatar || '💬';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const dateLabel = formatDate(conv.updatedAt);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(conv);
    return groups;
  }, {});

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={`conversation-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Chat History</h2>
          <button className="close-sidebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <span className="new-chat-icon">+</span>
          New Chat
        </button>

        <div className="conversations-list">
          {Object.keys(groupedConversations).length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p className="hint">Start a new chat to begin!</p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([dateLabel, convs]) => (
              <div key={dateLabel} className="conversation-group">
                <div className="date-label">{dateLabel}</div>
                {convs.map(conv => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <span className="conversation-avatar">
                      {getPersonalityAvatar(conv.personality)}
                    </span>
                    <div className="conversation-info">
                      <span className="conversation-title">{conv.title}</span>
                    </div>
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="clear-all-btn" onClick={() => {
            if (window.confirm('Clear all conversations? This cannot be undone.')) {
              conversations.forEach(c => deleteConversation(c.id));
            }
          }}>
            Clear All History
          </button>
        </div>
      </aside>
    </>
  );
}

export default ConversationSidebar;
