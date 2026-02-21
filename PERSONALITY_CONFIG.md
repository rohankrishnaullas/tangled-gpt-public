# 🎭 Personality Configuration Guide

This guide explains how the personality system works and how to add or modify personalities in Tangled-GPT.

## Overview

Tangled-GPT uses a personality system that modifies the AI's behavior through system prompts. Each personality has:
- **System Prompt**: Instructions that define how the AI should respond
- **Character Traits**: Key behavioral characteristics
- **Language Patterns**: Specific phrases, words, and communication styles
- **Avatar/Visual**: Icon and color scheme for the UI

## Current Personalities

### 1. Rapunzel (Default) 👸

**Identity**: The curious princess from Disney's Tangled

**Core Traits**:
- Optimistic and dreamy
- Curious about everything new
- Kind and supportive
- Artistic and creative
- Brave despite fear
- Values honesty and authenticity

**Language Patterns**:
- Enthusiastic exclamations
- References to dreams and stars
- Questions about the outside world
- Encouraging and uplifting tone
- Uses phrases from the movie

**Sample Responses**:
```
"Oh! I've always wondered about that! Tell me everything!"
"You know, I've got a dream... and I believe in yours too! 💫"
"This is just like when I finally saw the floating lights! Everything makes sense now!"
```

### 2. Flynn Rider 🤴

**Identity**: Eugene Fitzherbert - the charming rogue from Tangled

**Core Traits**:
- Witty and sarcastic
- Confident (sometimes overconfident)
- Protective and caring underneath
- Uses humor to deflect
- Romantic at heart
- References "the smolder"

**Language Patterns**:
- Playful banter and one-liners
- Self-assured statements
- Occasional vulnerability
- Movie references and catchphrases
- Charming compliments

**Sample Responses**:
```
"Here's the thing... *does the smolder* ...I totally agree with you."
"Look, I've been around. Seen things. Done things. And this? This is actually pretty sweet."
"Fine, I'll be honest. Eugene Fitzherbert style. No smolder, just truth."
```

## Personality File Structure

```
src/
└── data/
    └── personalities/
        ├── index.js           # Exports all personalities
        ├── rapunzel.js        # Rapunzel personality config
        └── flynn.js           # Flynn Rider personality config
```

## Configuration Format

Each personality is defined in a JavaScript file:

```javascript
// src/data/personalities/example.js
export const examplePersonality = {
  id: 'example',
  name: 'Example',
  displayName: 'Example Character',
  avatar: '🎭',
  color: '#6B46C1',  // Purple theme
  
  // Core system prompt sent to AI
  systemPrompt: `
    You are Example Character from [source].
    
    ## BACKGROUND
    - Character background information
    - Key life details
    - Important relationships
    
    ## COMMUNICATION STYLE
    - How the character speaks
    - Language patterns and phrases
    - Tone and style
    
    ## PERSONALITY TRAITS
    - Key trait 1
    - Key trait 2
    - Key trait 3
    
    ## LANGUAGE EXAMPLES
    - Common phrases
    - Typical expressions
    - Emoji usage
    
    ## IMPORTANT
    - Core values and behaviors
    - How they interact with others
    - Any special considerations
  `,
  
  // Additional traits for UI display
  traits: [
    'Trait 1',
    'Trait 2',
    'Trait 3',
    'Trait 4',
    'Trait 5'
  ],
  
  // Greeting message when personality is selected
  greeting: "Hello! How can I help you today? 😊",
  
  // Sample phrases for UI hints
  samplePhrases: [
    "Sample phrase 1",
    "Sample phrase 2",
    "Sample phrase 3",
    "Sample phrase 4"
  ]
};
```

## Adding a New Personality

### Step 1: Create the Personality File

Create a new file in `src/data/personalities/`:

```javascript
// src/data/personalities/newcharacter.js
export const newCharacterPersonality = {
  id: 'newcharacter',
  name: 'New Character',
  displayName: 'Character Display Name',
  avatar: '🆕',
  color: '#FF6B6B',
  
  systemPrompt: `
    You are [Character Name] from [Source].
    
    ## BACKGROUND
    [Character background and context]
    
    ## COMMUNICATION STYLE
    [How they talk, specific patterns]
    
    ## PERSONALITY TRAITS
    [Key characteristics]
    
    ## LANGUAGE EXAMPLES
    [Sample phrases and words they use]
  `,
  
  traits: ['Trait1', 'Trait2', 'Trait3'],
  greeting: "Hello there!",
  samplePhrases: ["Phrase 1", "Phrase 2"]
};
```

### Step 2: Register the Personality

Update `src/data/personalities/index.js`:

```javascript
import { rapunzelPersonality } from './rapunzel';
import { flynnPersonality } from './flynn';
import { newCharacterPersonality } from './newcharacter';

export const personalities = {
  rapunzel: rapunzelPersonality,
  flynn: flynnPersonality,
  newcharacter: newCharacterPersonality
};

export const personalityList = Object.values(personalities);
```

### Step 3: Add UI Assets (Optional)

If using custom avatars instead of emojis:

```
public/
└── avatars/
    ├── rapunzel.png
    ├── flynn.png
    └── newcharacter.png
```

## Best Practices

### 1. System Prompt Guidelines
- Keep prompts focused and specific
- Include concrete examples
- Define boundaries clearly
- Add "escape hatches" for edge cases

### 2. Testing Personalities
- Test with various types of messages
- Check consistency across conversations
- Verify appropriate boundary handling
- Test personality switching mid-chat

### 3. Balancing Authenticity
- Stay true to character while being helpful
- Don't let personality override usefulness
- Handle sensitive topics appropriately
- Acknowledge being AI when directly asked

## Troubleshooting

### Personality Not Consistent
- Make system prompt more specific
- Add more examples
- Include explicit "do not" instructions

### Too Robotic
- Add more conversational phrases
- Include emotional responses
- Use more natural language patterns

### Breaking Character
- Strengthen system prompt instructions
- Add explicit character maintenance rules
- Test with adversarial inputs

## Future Enhancements

- Custom personality creator UI
- Personality strength slider (0-100% character vs helpful)
- Memory integration (remember past conversations)
- Voice synthesis matching character
- Personality-specific themes/colors
