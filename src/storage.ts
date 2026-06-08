import { Profile, Settings } from './types';
import { INITIAL_HABITS } from './initialData';

const PROFILES_KEY = 'unbroken_profiles';
const ACTIVE_PROFILE_ID_KEY = 'unbroken_active_profile_id';
const SETTINGS_KEY = 'unbroken_settings';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'classic-indigo',
  soundEnabled: true,
};

export const loadProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Profile[];
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading profiles from localStorage:', e);
  }

  // Fallback to default initial profile
  const defaultProfile: Profile = {
    id: 'default-profile',
    name: 'My Habits',
    habits: INITIAL_HABITS,
  };
  return [defaultProfile];
};

export const saveProfiles = (profiles: Profile[]): void => {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving profiles to localStorage:', e);
  }
};

export const loadActiveProfileId = (profiles: Profile[]): string => {
  try {
    const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    if (activeId && profiles.some(p => p.id === activeId)) {
      return activeId;
    }
  } catch (e) {
    console.error('Error loading active profile ID:', e);
  }
  return profiles[0]?.id || 'default-profile';
};

export const saveActiveProfileId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  } catch (e) {
    console.error('Error saving active profile ID:', e);
  }
};

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};
