import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

function MessageInput({ onSend, onStop, isLoading, placeholder }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-area">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="message-textarea"
            rows={1}
            disabled={isLoading}
          />
          
          {isLoading ? (
            <button 
              type="button" 
              className="stop-button"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <span className="stop-icon">■</span>
            </button>
          ) : (
            <button 
              type="submit" 
              className="send-button"
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" className="send-icon">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          )}
        </div>
        
        <p className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

export default MessageInput;
