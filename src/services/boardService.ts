import type { BoardRecord, CanvasElement } from '../types/whiteboard';
import { INITIAL_WELCOME_BOARD, TEMPLATES } from '../utils/templates';

const BOARDS_DATABASE_KEY = 'ziro_boards_database_v2';
const ACTIVE_BOARD_ID_KEY = 'ziro_active_board_id_v2';

export function getAllBoards(): BoardRecord[] {
  try {
    let raw = localStorage.getItem(BOARDS_DATABASE_KEY);
    // Auto-migrate from v1 if needed
    if (!raw) {
      const v1Raw = localStorage.getItem('miro_boards_database_v1');
      if (v1Raw) {
        raw = v1Raw
          .replace(/My Miro Whiteboard/g, 'My Ziro Whiteboard')
          .replace(/Miro Whiteboard/g, 'Ziro Whiteboard');
        localStorage.setItem(BOARDS_DATABASE_KEY, raw);
      }
    }

    if (!raw) {
      const seedBoards = getSeedBoards();
      localStorage.setItem(BOARDS_DATABASE_KEY, JSON.stringify(seedBoards));
      return seedBoards;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure any "Miro" title is renamed to "Ziro"
      return parsed.map((b: BoardRecord) => {
        if (b.metadata && b.metadata.title) {
          const newTitle = b.metadata.title
            .replace(/My Miro Whiteboard/g, 'My Ziro Whiteboard')
            .replace(/Miro Whiteboard/g, 'Ziro Whiteboard');
          return {
            ...b,
            metadata: { ...b.metadata, title: newTitle },
          };
        }
        return b;
      });
    }
    return getSeedBoards();
  } catch {
    return getSeedBoards();
  }
}

export function getActiveBoardId(): string {
  const stored = localStorage.getItem(ACTIVE_BOARD_ID_KEY) || localStorage.getItem('miro_active_board_id_v1');
  if (stored) return stored;
  const boards = getAllBoards();
  return boards[0]?.metadata.id || 'default-board';
}

export function setActiveBoardId(id: string): void {
  localStorage.setItem(ACTIVE_BOARD_ID_KEY, id);
}

export function getBoardById(id: string): BoardRecord | null {
  const boards = getAllBoards();
  return boards.find((b) => b.metadata.id === id) || null;
}

export function saveBoardRecord(board: BoardRecord): void {
  const boards = getAllBoards();
  const index = boards.findIndex((b) => b.metadata.id === board.metadata.id);

  const updatedBoard = {
    ...board,
    metadata: {
      ...board.metadata,
      lastModified: Date.now(),
    },
  };

  if (index >= 0) {
    boards[index] = updatedBoard;
  } else {
    boards.unshift(updatedBoard);
  }

  localStorage.setItem(BOARDS_DATABASE_KEY, JSON.stringify(boards));
}

export function createNewBoard(title = 'Untitled Board', initialElements: CanvasElement[] = []): BoardRecord {
  const boards = getAllBoards();
  const newId = `board-${Date.now()}`;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newBoard: BoardRecord = {
    metadata: {
      id: newId,
      title,
      lastModified: Date.now(),
      version: 1,
      thumbnailColor: randomColor,
    },
    elements: initialElements,
    viewport: { x: 100, y: 80, zoom: 1 },
  };

  boards.unshift(newBoard);
  localStorage.setItem(BOARDS_DATABASE_KEY, JSON.stringify(boards));
  setActiveBoardId(newId);
  return newBoard;
}

export function duplicateBoardRecord(id: string): BoardRecord | null {
  const target = getBoardById(id);
  if (!target) return null;

  return createNewBoard(`${target.metadata.title} (Copy)`, target.elements);
}

export function deleteBoardRecord(id: string): BoardRecord[] {
  let boards = getAllBoards();
  boards = boards.filter((b) => b.metadata.id !== id);

  if (boards.length === 0) {
    const fresh = createNewBoard('My Whiteboard', INITIAL_WELCOME_BOARD.elements);
    boards = [fresh];
  }

  localStorage.setItem(BOARDS_DATABASE_KEY, JSON.stringify(boards));
  setActiveBoardId(boards[0].metadata.id);
  return boards;
}

function getSeedBoards(): BoardRecord[] {
  return [
    {
      ...INITIAL_WELCOME_BOARD,
      metadata: {
        ...INITIAL_WELCOME_BOARD.metadata,
        thumbnailColor: '#3b82f6',
      },
    },
    {
      metadata: {
        id: 'board-kanban-seed',
        title: 'Q4 Sprint Workflow',
        lastModified: Date.now() - 3600000 * 24,
        version: 1,
        thumbnailColor: '#10b981',
      },
      elements: TEMPLATES[0].elements,
      viewport: { x: 50, y: 50, zoom: 0.9 },
    },
    {
      metadata: {
        id: 'board-brainstorm-seed',
        title: '2026 Product Vision Mind Map',
        lastModified: Date.now() - 3600000 * 48,
        version: 1,
        thumbnailColor: '#8b5cf6',
      },
      elements: TEMPLATES[1].elements,
      viewport: { x: 60, y: 40, zoom: 0.85 },
    },
  ];
}
