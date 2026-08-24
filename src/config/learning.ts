export const LEARNING_CONFIG = {
  // Learning day cycle configuration:
  // Starts at 6:00 PM (18:00) and ends at 5:59 PM (17:59:59) the next day.
  DAILY_RESET_HOUR: 18, // 18:00 = 6:00 PM
  DAILY_RESET_MINUTE: 0,
  
  // Progression rules
  MAX_MODULES_PER_LEARNING_DAY: 1,
  SEQUENTIAL_ENFORCEMENT: true,
  
  // App Defaults
  INITIAL_MODULE_ID: 'day-01',
  
  // Storage keys
  STORAGE_KEY: 'sql_mastery_progress_v1',
  THEME_STORAGE_KEY: 'sql_mastery_theme_v1',
};
