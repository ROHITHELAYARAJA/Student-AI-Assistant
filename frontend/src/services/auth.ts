export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  language: string;
  plan: 'Starter' | 'Pro';
  memberSince: string;
  isLoggedIn: boolean;
  accessCode: string;
}

const STORAGE_KEY = 'blast_user_profile';

const DEFAULT_USER: UserProfile = {
  id: '52d1e8f1-a83e-48ae-bc07-7b2c9a6f81e3',
  name: 'Rohith E',
  email: 'e.rohith3130@gmail.com',
  initials: 'RE',
  language: 'English',
  plan: 'Starter',
  memberSince: 'Sep 3, 2026',
  isLoggedIn: true,
  accessCode: 'Not assigned'
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER, ...parsed };
  } catch {
    return DEFAULT_USER;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    // Keep legacy blast_display_name in sync
    localStorage.setItem('blast_display_name', JSON.stringify(profile.name));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
}

export function logOutUser(): UserProfile {
  const updated: UserProfile = {
    ...getStoredProfile(),
    isLoggedIn: false
  };
  saveStoredProfile(updated);
  return updated;
}

export function logInUser(customName?: string, customEmail?: string): UserProfile {
  const current = getStoredProfile();
  const name = customName || 'Rohith E';
  const email = customEmail || 'e.rohith3130@gmail.com';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const updated: UserProfile = {
    ...current,
    name,
    email,
    initials,
    isLoggedIn: true
  };
  saveStoredProfile(updated);
  return updated;
}
