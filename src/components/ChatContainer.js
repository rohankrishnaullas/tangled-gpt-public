import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { usePersonality } from '../context/PersonalityContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatContainer.css';

function ChatContainer() {
  const { 
    currentConversation, 
    messages,
    addMessage, 
    createConversation 
  } = useChat();
  const { currentPersonality, currentPersonalityId, getSystemPrompt } = usePersonality();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const abortControllerRef = useRef(null);

  // Show welcome screen if no messages
  const showWelcome = messages.length === 0 && !isLoading && hasGreeted;

  // Send default greeting when conversation starts
  useEffect(() => {
    if (messages.length === 0 && !hasGreeted && currentPersonality?.defaultMessage) {
      setHasGreeted(true);
      // Create conversation if needed
      if (!currentConversation) {
        createConversation(currentPersonalityId);
      }
      // Add the default greeting from the personality
      const greetingMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentPersonality.defaultMessage,
        timestamp: new Date().toISOString(),
        personality: currentPersonalityId
      };
      addMessage(greetingMessage);
    }
  }, [messages.length, hasGreeted, currentPersonality, currentConversation, currentPersonalityId, createConversation, addMessage]);

  // Reset greeting flag when personality changes
  useEffect(() => {
    setHasGreeted(false);
  }, [currentPersonalityId]);

  // Reset greeting flag when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      // If conversation already has messages, mark as greeted
      setHasGreeted(messages.length > 0);
    }
  }, [currentConversation?.id, messages.length]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    // Create conversation if needed
    if (!currentConversation) {
      createConversation(currentPersonalityId);
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    addMessage(userMessage);

    // Start assistant response
    setIsLoading(true);
    setStreamingMessage('');

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages for API
      const systemPrompt = getSystemPrompt();
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: content.trim() }
      ];

      // Import and call OpenAI service
      const { streamChatCompletion } = await import('../services/openaiService');
      
      let fullResponse = '';
      console.log('🚀 Starting stream...');
      
      await streamChatCompletion(
        apiMessages,
        (chunk) => {
          fullResponse += chunk;
          console.log('📨 Received chunk:', chunk, 'Total length:', fullResponse.length);
          setStreamingMessage(fullResponse);
        },
        abortControllerRef.current.signal
      );

      console.log('✅ Stream complete. Full response:', fullResponse);

      // Add complete assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
        personality: currentPersonalityId
      };
      addMessage(assistantMessage);
      setStreamingMessage('');

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('❌ Chat error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        // Add error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please check your Azure OpenAI configuration and browser console for details.`,
          timestamp: new Date().toISOString(),
          personality: currentPersonalityId,
          isError: true
        };
        addMessage(errorMessage);
      }
      setStreamingMessage('');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="chat-container">
      <MessageList 
        messages={messages} 
        streamingMessage={streamingMessage}
        isLoading={isLoading}
        currentPersonality={currentPersonality}
        showWelcome={showWelcome}
      />
      <MessageInput 
        onSend={handleSendMessage}
        onStop={handleStopGeneration}
        isLoading={isLoading}
        placeholder={`Message ${currentPersonality?.displayName || 'AI'}...`}
      />
    </div>
  );
}

export default ChatContainer;
