import { Router, Request, Response } from 'express';
import { loadDatabase, saveDatabase, BoardRecord } from '../db.js';

const router = Router();

// GET /api/boards
router.get('/', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const userId = req.query.userId as string;

    const boards = userId
      ? db.boards.filter((b) => b.userId === userId || b.userId === 'user-alex')
      : db.boards;

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// POST /api/boards
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, userId, elements, viewport } = req.body;
    const db = loadDatabase();

    const newBoard: BoardRecord = {
      id: `board-${Date.now()}`,
      userId: userId || 'user-alex',
      title: title?.trim() || 'Untitled Board',
      isStarred: false,
      elements: elements || [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.boards.unshift(newBoard);
    saveDatabase(db);

    res.status(201).json({ board: newBoard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET /api/boards/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const board = db.boards.find((b) => b.id === id);

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    res.json({ board });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load board' });
  }
});

// PUT /api/boards/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const index = db.boards.findIndex((b) => b.id === id);

    if (index === -1) {
      // Auto-create if doesn't exist
      const newBoard: BoardRecord = {
        id,
        userId: req.body.userId || 'user-alex',
        title: req.body.title || 'Untitled Board',
        isStarred: req.body.isStarred || false,
        elements: req.body.elements || [],
        viewport: req.body.viewport || { x: 0, y: 0, zoom: 1 },
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      db.boards.push(newBoard);
      saveDatabase(db);
      res.json({ board: newBoard });
      return;
    }

    db.boards[index] = {
      ...db.boards[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    res.json({ board: db.boards[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// DELETE /api/boards/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = loadDatabase();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const index = db.boards.findIndex((b) => b.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    const deleted = db.boards.splice(index, 1)[0];
    saveDatabase(db);

    res.json({ message: 'Board deleted successfully', board: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;
