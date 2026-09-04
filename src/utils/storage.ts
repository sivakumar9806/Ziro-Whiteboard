import type { BoardState } from '../types/whiteboard';
import { INITIAL_WELCOME_BOARD } from './templates';

const STORAGE_KEY = 'miro_whiteboard_state_v1';

/**
 * Loads the saved board from localStorage, or returns the initial welcome board if none exists.
 */
export function loadBoardFromStorage(): BoardState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return INITIAL_WELCOME_BOARD;
    }
    const parsed = JSON.parse(serialized) as BoardState;
    if (parsed && Array.isArray(parsed.elements)) {
      return parsed;
    }
    return INITIAL_WELCOME_BOARD;
  } catch (err) {
    console.error('Failed to parse board state from localStorage:', err);
    return INITIAL_WELCOME_BOARD;
  }
}

/**
 * Saves the current board state to localStorage.
 */
export function saveBoardToStorage(board: BoardState): boolean {
  try {
    const updatedBoard: BoardState = {
      ...board,
      metadata: {
        ...board.metadata,
        lastModified: Date.now(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBoard));
    return true;
  } catch (err) {
    console.error('Failed to save board state to localStorage:', err);
    return false;
  }
}

/**
 * Clears the stored board and resets back to empty or initial template.
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear board state from localStorage:', err);
  }
}
