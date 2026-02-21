import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { usePersonality } from './PersonalityContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentPersonalityId } = usePersonality();

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = storageService.getConversations();
    setConversations(savedConversations);
    
    // Set the most recent conversation as current
    if (savedConversations.length > 0) {
      const mostRecent = savedConversations.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      setCurrentConversationId(mostRecent.id);
    }
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const savedMessages = storageService.getMessages(currentConversationId);
      setMessages(savedMessages);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const createConversation = useCallback(() => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      personality: currentPersonalityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    storageService.saveConversations(updatedConversations);
    
    return newConversation;
  }, [conversations, currentPersonalityId]);

  const deleteConversation = useCallback((id) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    storageService.saveConversations(updatedConversations);
    storageService.deleteMessages(id);
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  }, [conversations, currentConversationId]);

  const selectConversation = useCallback((id) => {
    setCurrentConversationId(id);
  }, []);

  const updateConversationTitle = useCallback((id, title) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
      );
      storageService.saveConversations(updated);
      return updated;
    });
  }, []);

  const updateConversationTimestamp = useCallback((id) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, updatedAt: new Date().toISOString() } : c
      );
      storageService.saveConversations(updated);
      return updated;
    });
  }, []);

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString(),
      conversationId: currentConversationId,
      timestamp: new Date().toISOString(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
    storageService.saveMessage(currentConversationId, newMessage);
    
    // Update conversation title on first user message (may have greeting before)
    const hasUserMessages = messages.some(m => m.role === 'user');
    if (message.role === 'user' && !hasUserMessages) {
      const title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      updateConversationTitle(currentConversationId, title);
    }
    
    // Update conversation timestamp
    updateConversationTimestamp(currentConversationId);
    
    return newMessage;
  }, [currentConversationId, messages, updateConversationTitle, updateConversationTimestamp]);

  const updateLastMessage = useCallback((content) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content
        };
        storageService.saveMessages(currentConversationId, updated);
      }
      return updated;
    });
  }, [currentConversationId]);

  const value = {
    conversations,
    currentConversation,
    currentConversationId,
    messages,
    isLoading,
    setIsLoading,
    createConversation,
    deleteConversation,
    selectConversation,
    addMessage,
    updateLastMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
