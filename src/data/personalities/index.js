import { rapunzelPersonality } from './rapunzel';
import { flynnPersonality } from './flynn';

export const personalities = {
  rapunzel: rapunzelPersonality,
  flynn: flynnPersonality
};

export const personalityList = Object.values(personalities);

export const getPersonalityById = (id) => {
  return personalities[id] || personalities.rapunzel;
};

export default personalities;
