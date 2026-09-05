import type { User } from '../types/whiteboard';
import { apiRequest, setAuthToken, getAuthToken } from './apiClient';

const USERS_STORAGE_KEY = 'miro_accounts_db_v1';
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
    const defaultUser = DEMO_USERS[0];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  } catch {
    return DEMO_USERS[0];
  }
}

export async function loginUserApi(email: string, password?: string): Promise<User> {
  try {
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'password123' }),
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.user));
    return res.user;
  } catch {
    // Local fallback
    return loginUser(email);
  }
}

export async function signupUserApi(
  name: string,
  email: string,
  password?: string,
  roleTitle?: string,
  avatarColor?: string
): Promise<User> {
  try {
    const res = await apiRequest<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
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
  } catch {
    // Local fallback
    return signupUser(name, email);
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

export function loginUser(email: string): User {
  const users = getAllUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: `user-${Date.now()}`,
      name: formattedName,
      email,
      avatarColor: getRandomAvatarColor(),
      roleTitle: 'Team Member',
    };
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function signupUser(name: string, email: string): User {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing));
    return existing;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    avatarColor: getRandomAvatarColor(),
    roleTitle: 'Team Member',
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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
