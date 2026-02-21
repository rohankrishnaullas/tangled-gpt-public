import React, { useEffect, useRef } from 'react';
import Message from './Message';
import './MessageList.css';

function MessageList({ messages, streamingMessage, isLoading, currentPersonality }) {
  const listRef = useRef(null);
  const bottomRef = useRef(null);

  // Debug log
  console.log('🖼️ MessageList render:', { 
    messagesCount: messages.length, 
    streamingMessage, 
    isLoading 
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  return (
    <div className="message-list" ref={listRef}>
      <div className="messages-wrapper">
        {messages.map((message) => (
          <Message 
            key={message.id} 
            message={message}
            personality={message.role === 'assistant' ? currentPersonality : null}
          />
        ))}
        
        {/* Streaming message */}
        {streamingMessage && (
          <Message 
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingMessage,
              timestamp: new Date().toISOString()
            }}
            personality={currentPersonality}
            isStreaming={true}
          />
        )}
        
        {/* Loading indicator when waiting for first token */}
        {isLoading && !streamingMessage && (
          <div className="typing-indicator-container">
            <div className="typing-indicator">
              <span className="typing-avatar">{currentPersonality?.avatar || '🤖'}</span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="scroll-anchor" />
      </div>
    </div>
  );
}

export default MessageList;
