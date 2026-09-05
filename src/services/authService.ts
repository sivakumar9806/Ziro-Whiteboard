import type { User } from '../types/whiteboard';
import { apiRequest, setAuthToken, getAuthToken } from './apiClient';

const USERS_STORAGE_KEY = 'miro_accounts_db_v1';
const PASSWORDS_STORAGE_KEY = 'miro_accounts_passwords_v1';
const SESSION_STORAGE_KEY = 'miro_active_session_v1';

export const DEMO_USERS: User[] = [
  {
    id: 'user-alex',
    name: 'Alex Morgan',
    email: 'alex@miro.design',
    avatarColor: '#3b82f6',
    roleTitle: 'Product Designer',
  },
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    email: 'sarah@product.co',
    avatarColor: '#10b981',
    roleTitle: 'Tech Lead',
  },
  {
    id: 'user-jordan',
    name: 'Jordan Lee',
    email: 'jordan@agile.team',
    avatarColor: '#f59e0b',
    roleTitle: 'Scrum Master',
  },
];

export const GUEST_USER: User = {
  id: 'user-guest',
  name: 'Guest Creator',
  email: 'guest@whiteboard.local',
  avatarColor: '#6366f1',
  roleTitle: 'Collaborator',
};

export function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEMO_USERS));
      return DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_USERS;
  }
}

export function getCurrentUser(): User {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(GUEST_USER));
    return GUEST_USER;
  } catch {
    return GUEST_USER;
  }
}

export async function loginUserApi(email: string, password?: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password: password || '' }),
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.user));
    return res.user;
  } catch (err: any) {
    const isNetworkError =
      !err.message ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('Network request failed');

    // If server responded with an actual 400/401/404 error, throw that error to the user!
    if (!isNetworkError) {
      throw err;
    }

    // Offline / client-only fallback: check local accounts strictly
    return loginUser(normalizedEmail, password);
  }
}

export async function signupUserApi(
  name: string,
  email: string,
  password?: string,
  roleTitle?: string,
  avatarColor?: string
): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();

  if (password && password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  try {
    const res = await apiRequest<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: normalizedEmail,
        password: password || 'password123',
        roleTitle,
        avatarColor,
      }),
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.user));
    return res.user;
  } catch (err: any) {
    const isNetworkError =
      !err.message ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('Network request failed');

    if (!isNetworkError) {
      throw err;
    }

    // Offline / client-only fallback: sign up in local accounts strictly
    return signupUser(name, normalizedEmail, password, roleTitle);
  }
}

export async function checkSessionApi(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await apiRequest<{ user: User }>('/auth/me');
    if (res.user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.user));
      return res.user;
    }
    return null;
  } catch {
    return null;
  }
}

export function loginUser(email: string, password?: string): User {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No account found with this email. Please click "Create Account" to sign up first.');
  }

  // Check demo user or password map
  if (password) {
    try {
      const passwordsMap: Record<string, string> = JSON.parse(
        localStorage.getItem(PASSWORDS_STORAGE_KEY) || '{}'
      );
      const isDemo = DEMO_USERS.some((d) => d.email.toLowerCase() === normalizedEmail);
      if (!isDemo && passwordsMap[normalizedEmail] && passwordsMap[normalizedEmail] !== password) {
        throw new Error('Incorrect password. Please verify your password and try again.');
      }
    } catch (err: any) {
      if (err.message.includes('Incorrect password')) throw err;
    }
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function signupUser(name: string, email: string, password?: string, roleTitle?: string): User {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    throw new Error('An account with this email already exists. Please click "Sign In" instead.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    avatarColor: getRandomAvatarColor(),
    roleTitle: roleTitle || 'Product Designer',
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  if (password) {
    try {
      const passwordsMap: Record<string, string> = JSON.parse(
        localStorage.getItem(PASSWORDS_STORAGE_KEY) || '{}'
      );
      passwordsMap[normalizedEmail] = password;
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwordsMap));
    } catch (e) {
      console.error('Failed to save password locally:', e);
    }
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function logoutUser(): User {
  setAuthToken(null);
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(GUEST_USER));
  return GUEST_USER;
}

function getRandomAvatarColor(): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];
  return colors[Math.floor(Math.random() * colors.length)];
}
