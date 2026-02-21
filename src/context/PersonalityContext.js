import React, { createContext, useContext, useState } from 'react';
import { personalities, getPersonalityById } from '../data/personalities';

const PersonalityContext = createContext(null);

export function PersonalityProvider({ children }) {
  const [currentPersonalityId, setCurrentPersonalityId] = useState('rapunzel');

  const currentPersonality = getPersonalityById(currentPersonalityId);

  const setPersonality = (personalityId) => {
    if (personalities[personalityId]) {
      setCurrentPersonalityId(personalityId);
    }
  };

  const getSystemPrompt = () => {
    return currentPersonality?.systemPrompt || '';
  };

  const value = {
    currentPersonality,
    currentPersonalityId,
    setPersonality,
    getSystemPrompt,
    allPersonalities: Object.values(personalities)
  };

  return (
    <PersonalityContext.Provider value={value}>
      {children}
    </PersonalityContext.Provider>
  );
}

export function usePersonality() {
  const context = useContext(PersonalityContext);
  if (!context) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
}
