import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarColor: string;
  roleTitle: string;
  createdAt: string;
}

export interface BoardRecord {
  id: string;
  userId: string;
  title: string;
  isStarred?: boolean;
  elements: any[];
  viewport: { x: number; y: number; zoom: number };
  updatedAt: string;
  createdAt: string;
}

export interface FormSubmissionRecord {
  id: string;
  userId?: string;
  formType: 'feedback' | 'feature_request' | 'survey' | 'bug_report' | 'contact';
  name?: string;
  email?: string;
  title: string;
  rating?: number;
  category?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  boards: BoardRecord[];
  formSubmissions: FormSubmissionRecord[];
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialDatabase(): DatabaseSchema {
  const defaultPassword = 'password123';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(defaultPassword, salt);

  return {
    users: [
      {
        id: 'user-alex',
        name: 'Alex Morgan',
        email: 'alex@miro.design',
        passwordHash,
        avatarColor: '#3b82f6',
        roleTitle: 'Product Designer',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-sarah',
        name: 'Sarah Chen',
        email: 'sarah@product.co',
        passwordHash,
        avatarColor: '#10b981',
        roleTitle: 'Tech Lead',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-jordan',
        name: 'Jordan Lee',
        email: 'jordan@agile.team',
        passwordHash,
        avatarColor: '#f59e0b',
        roleTitle: 'Scrum Master',
        createdAt: new Date().toISOString(),
      },
    ],
    boards: [
      {
        id: 'board-default',
        userId: 'user-alex',
        title: 'Ziro Product Roadmap',
        isStarred: true,
        elements: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'board-sprint-planning',
        userId: 'user-alex',
        title: 'Sprint 24 Planning & Retrospective',
        isStarred: false,
        elements: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    formSubmissions: [
      {
        id: 'sub-welcome',
        userId: 'user-alex',
        formType: 'feedback',
        name: 'Alex Morgan',
        email: 'alex@miro.design',
        title: 'Initial Workspace Feedback',
        rating: 5,
        category: 'UI & Usability',
        message: 'The new responsive header and bottom right toolbar dock are super slick!',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file, resetting to initial state:', error);
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}
