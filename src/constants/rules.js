// Business rules and game mechanics constants
export const PET_LEVELS = [
  { level: 1, name: '幼年态', threshold: 0, form: 'baby', scale: 0.7, effect: 'none' },
  { level: 2, name: '成长态', threshold: 50, form: 'child', scale: 0.85, effect: 'none' },
  { level: 3, name: '觉醒态', threshold: 150, form: 'teen', scale: 1.0, effect: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))' },
  { level: 4, name: '幻化态', threshold: 300, form: 'adult', scale: 1.15, effect: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))' },
  { level: 5, name: '究极态', threshold: 700, form: 'legendary', scale: 1.3, effect: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.8)) hue-rotate(15deg)' },
];

export const PET_INTERACTIONS = {
  feed: { cost: 10, fullness: 20, intimacy: 5, mood: 5 },
  wash: { cost: 15, cleanliness: 30, intimacy: 8, mood: -5 },
  play: { cost: 20, mood: 30, fullness: -10, intimacy: 12 },
  sleep: { cost: 8, mood: 10, fullness: -5, intimacy: 3 }
};

export const HABIT_POINTS = {
  DAILY_SUCCESS: 10,
  DAILY_MULTIPLE_SUCCESS: 5,
};
