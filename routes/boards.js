import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../db.js';

const router = Router();
router.use(authMiddleware);

// GET /api/boards — list all boards for authenticated user
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const boards = await db.all(
      'SELECT * FROM boards WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json(boards);
  } catch (err) {
    console.error('GET /boards error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/boards — create a new board
router.post('/', async (req, res) => {
  const { title, description = '', color = '#5b5fcf' } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO boards (user_id, title, description, color) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description, color]
    );
    const board = await db.get('SELECT * FROM boards WHERE id = ?', [result.lastID]);
    return res.status(201).json(board);
  } catch (err) {
    console.error('POST /boards error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/:id — get board with all lists and cards nested
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const board = await db.get(
      'SELECT * FROM boards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const lists = await db.all(
      'SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC, id ASC',
      [board.id]
    );

    for (const list of lists) {
      list.cards = await db.all(
        'SELECT * FROM cards WHERE list_id = ? ORDER BY position ASC, id ASC',
        [list.id]
      );
    }

    board.lists = lists;
    return res.json(board);
  } catch (err) {
    console.error('GET /boards/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/boards/:id — update board
router.put('/:id', async (req, res) => {
  const { title, description, color } = req.body;
  try {
    const db = await getDb();
    const board = await db.get(
      'SELECT * FROM boards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const newTitle = title ?? board.title;
    const newDesc = description ?? board.description;
    const newColor = color ?? board.color;

    await db.run(
      'UPDATE boards SET title = ?, description = ?, color = ? WHERE id = ?',
      [newTitle, newDesc, newColor, board.id]
    );
    const updated = await db.get('SELECT * FROM boards WHERE id = ?', [board.id]);
    return res.json(updated);
  } catch (err) {
    console.error('PUT /boards/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/boards/:id — delete board (cascades to lists and cards via FK)
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const board = await db.get(
      'SELECT * FROM boards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!board) return res.status(404).json({ error: 'Board not found' });

    await db.run('DELETE FROM boards WHERE id = ?', [board.id]);
    return res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error('DELETE /boards/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
