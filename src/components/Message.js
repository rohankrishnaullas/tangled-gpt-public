import React from 'react';
import './Message.css';

function Message({ message, personality, isStreaming }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'} ${isError ? 'message-error' : ''}`}>
      {!isUser && (
        <div className="message-avatar">
          {personality?.avatar || '🤖'}
        </div>
      )}
      
      <div className="message-content-wrapper">
        {!isUser && (
          <div className="message-header">
            <span className="message-sender">{personality?.displayName || 'AI'}</span>
            <span className="message-time">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          <div className="message-text">
            {message.content}
            {isStreaming && <span className="cursor">▋</span>}
          </div>
        </div>
        
        {isUser && (
          <div className="message-time user-time">{formatTime(message.timestamp)}</div>
        )}
      </div>
    </div>
  );
}

export default Message;
