# 🏗️ Tangled-GPT Architecture

## Overview

Tangled-GPT is a mobile-first React application that provides a ChatGPT-like interface with customizable personality modes. It's designed for a single user and leverages Azure OpenAI for intelligent responses.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Login     │  │   Chat      │  │    Sidebar              │ │
│  │   Screen    │  │   Screen    │  │  (Conversations)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│         │               │                    │                  │
│         └───────────────┼────────────────────┘                  │
│                         │                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    App Context                           │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────────┐  │   │
│  │  │  Auth   │  │  Theme  │  │  Chat   │  │ Personality│  │   │
│  │  │ Context │  │ Context │  │ Context │  │  Context   │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                        │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │  OpenAI Service │  │     Storage Service         │   │   │
│  │  │  (Azure API)    │  │     (LocalStorage)          │   │   │
│  │  └─────────────────┘  └─────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE CLOUD                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │  Azure Static Web   │  │       Azure OpenAI              │  │
│  │       Apps          │  │       (GPT-4o)                  │  │
│  │  (Hosting + CI/CD)  │  │                                 │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── ThemeProvider
│       └── ChatProvider
│           └── PersonalityProvider
│               ├── Login (when not authenticated)
│               └── MainLayout (when authenticated)
│                   ├── Header
│                   │   ├── Logo
│                   │   ├── PersonalitySelector
│                   │   └── ThemeToggle
│                   ├── Sidebar (mobile: drawer)
│                   │   ├── NewChatButton
│                   │   └── ConversationList
│                   │       └── ConversationItem
│                   └── ChatContainer
│                       ├── MessageList
│                       │   └── Message
│                       │       ├── Avatar
│                       │       ├── Content
│                       │       └── Timestamp
│                       ├── TypingIndicator
│                       └── MessageInput
│                           ├── TextArea
│                           └── SendButton
```

### Component Descriptions

| Component | Responsibility |
|-----------|----------------|
| `App` | Root component, wraps providers |
| `Login` | Authentication form |
| `MainLayout` | Main app structure with header, sidebar, chat |
| `Header` | Top bar with logo, personality selector, theme toggle |
| `Sidebar` | Conversation list and new chat button |
| `ChatContainer` | Main chat area |
| `MessageList` | Renders all messages in conversation |
| `Message` | Individual message bubble |
| `MessageInput` | Text input with send functionality |
| `TypingIndicator` | Shows when AI is "thinking" |
| `PersonalitySelector` | Dropdown to switch between modes |
| `ThemeToggle` | Dark/Light mode switch |

## State Management

### Context Structure

```javascript
// AuthContext
{
  isAuthenticated: boolean,
  login: (username, password) => Promise<boolean>,
  logout: () => void
}

// ThemeContext
{
  theme: 'light' | 'dark',
  toggleTheme: () => void
}

// ChatContext
{
  conversations: Conversation[],
  currentConversation: Conversation | null,
  messages: Message[],
  isLoading: boolean,
  createConversation: () => void,
  deleteConversation: (id) => void,
  selectConversation: (id) => void,
  sendMessage: (content) => Promise<void>
}

// PersonalityContext
{
  currentPersonality: 'rapunzel' | 'flynn',
  setPersonality: (personality) => void,
  getSystemPrompt: () => string
}
```

### Data Models

```typescript
interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  personality: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  personality?: string;  // Track which personality responded
}

interface Personality {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  systemPrompt: string;
  traits: string[];
}
```

## Services Layer

### OpenAI Service

```javascript
// services/openaiService.js
export const openaiService = {
  // Stream chat completion from Azure OpenAI
  async streamChat(messages, personality, onChunk) {
    const systemPrompt = getPersonalityPrompt(personality);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { ... },
      body: JSON.stringify({
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true
      })
    });
    // Handle streaming response
  }
};
```

### Storage Service

```javascript
// services/storageService.js
export const storageService = {
  // Conversations
  getConversations: () => JSON.parse(localStorage.getItem('conversations') || '[]'),
  saveConversation: (conversation) => { ... },
  deleteConversation: (id) => { ... },
  
  // Messages
  getMessages: (conversationId) => { ... },
  saveMessage: (message) => { ... },
  
  // Settings
  getTheme: () => localStorage.getItem('theme') || 'dark',
  setTheme: (theme) => localStorage.setItem('theme', theme),
  
  // Auth
  isAuthenticated: () => sessionStorage.getItem('authenticated') === 'true',
  setAuthenticated: (value) => sessionStorage.setItem('authenticated', value)
};
```

## Personality System

### System Prompt Structure

Each personality has a system prompt that defines behavior:

```javascript
const personalities = {
  rapunzel: {
    id: 'rapunzel',
    name: 'Rapunzel',
    systemPrompt: `You are Rapunzel from Disney's Tangled...
    
    CHARACTER TRAITS:
    - Curious and excited about everything
    - Optimistic and dreamy
    - Kind and supportive
    - Uses phrases like "I've got a dream..."
    ...`
  },
  flynn: {
    id: 'flynn',
    name: 'Flynn Rider',
    systemPrompt: `You are Flynn Rider (Eugene Fitzherbert) from Disney's Tangled...
    
    CHARACTER TRAITS:
    - Charming and witty
    - Uses playful sarcasm
    - References "the smolder"
    - Caring underneath the bravado
    ...`
  }
};
```

### Personality Switching Logic

When switching personalities mid-conversation:
1. The new personality's system prompt is used
2. Previous messages are retained in context
3. A visual indicator shows the personality change
4. The AI is aware of the switch and can reference it naturally

## Mobile-First Design

### Responsive Breakpoints

```css
/* Mobile first approach */
.container {
  width: 100%;
  padding: 0 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

### Mobile Considerations

- Touch-friendly tap targets (min 44px)
- Swipe gestures for sidebar
- Safe area insets for notched devices
- Virtual keyboard handling
- Efficient scrolling for message lists

## Security Considerations

### Authentication
- Simple username/password check against environment variables
- Session stored in sessionStorage (cleared on tab close)
- No sensitive data stored in localStorage

### API Keys
- Azure OpenAI keys stored in environment variables
- Not exposed in client-side code
- Calls made directly to Azure (no backend proxy needed for personal use)

### Data Privacy
- All chat history stored locally in browser
- No data sent to external servers except Azure OpenAI
- No analytics or tracking

## Performance Optimizations

1. **Message Virtualization** - Only render visible messages for long conversations
2. **Streaming Responses** - Show AI response as it's generated
3. **Lazy Loading** - Components loaded on demand
4. **Debounced Saving** - Batch localStorage writes
5. **Memoization** - Prevent unnecessary re-renders

## Deployment Architecture

```
GitHub Repository
       │
       ▼ (Push to main)
GitHub Actions
       │
       ├── Build React App
       ├── Run Tests
       └── Deploy to Azure
             │
             ▼
Azure Static Web Apps
       │
       ├── CDN Distribution
       ├── SSL Certificate
       └── Custom Domain (optional)
```

## Future Considerations

- Voice input/output integration
- Multiple user support
- Backend service for enhanced security
- Export/import conversations
- Custom personality creation UI
