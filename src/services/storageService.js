const STORAGE_KEYS = {
  CONVERSATIONS: 'tangled-gpt-conversations',
  MESSAGES_PREFIX: 'tangled-gpt-messages-',
  THEME: 'tangled-gpt-theme',
  AUTH: 'tangled-gpt-auth'
};

export const storageService = {
  // Authentication
  isAuthenticated: () => {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  setAuthenticated: (value) => {
    if (value) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },

  // Theme
  getTheme: () => {
    return localStorage.getItem(STORAGE_KEYS.THEME);
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Conversations
  getConversations: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  },

  saveConversations: (conversations) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  },

  // Messages
  getMessages: (conversationId) => {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  },

  saveMessage: (conversationId, message) => {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      const messages = storageService.getMessages(conversationId);
      messages.push(message);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  },

  saveMessages: (conversationId, messages) => {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  },

  deleteMessages: (conversationId) => {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key.includes('PREFIX')) {
        // Clear all prefixed items
        const prefix = key;
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith(prefix)) {
            localStorage.removeItem(k);
          }
        });
      } else {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};
