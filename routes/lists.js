import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../db.js';

const router = Router();
router.use(authMiddleware);

// POST /api/lists — create a new list
router.post('/', async (req, res) => {
  const { board_id, title, position = 0 } = req.body;
  if (!board_id || !title) {
    return res.status(400).json({ error: 'board_id and title are required' });
  }

  try {
    const db = await getDb();

    // Verify the board belongs to the authenticated user
    const board = await db.get(
      'SELECT id FROM boards WHERE id = ? AND user_id = ?',
      [board_id, req.user.id]
    );
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const result = await db.run(
      'INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)',
      [board_id, title, position]
    );
    const list = await db.get('SELECT * FROM lists WHERE id = ?', [result.lastID]);
    list.cards = [];
    return res.status(201).json(list);
  } catch (err) {
    console.error('POST /lists error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lists/:id — update list title or position
router.put('/:id', async (req, res) => {
  const { title, position } = req.body;
  try {
    const db = await getDb();

    // Ensure the list belongs to a board owned by the user
    const list = await db.get(
      `SELECT l.* FROM lists l
       JOIN boards b ON b.id = l.board_id
       WHERE l.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!list) return res.status(404).json({ error: 'List not found' });

    const newTitle = title ?? list.title;
    const newPosition = position !== undefined ? position : list.position;

    await db.run(
      'UPDATE lists SET title = ?, position = ? WHERE id = ?',
      [newTitle, newPosition, list.id]
    );
    const updated = await db.get('SELECT * FROM lists WHERE id = ?', [list.id]);
    return res.json(updated);
  } catch (err) {
    console.error('PUT /lists/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/lists/:id — delete list (cascades to cards)
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();

    const list = await db.get(
      `SELECT l.* FROM lists l
       JOIN boards b ON b.id = l.board_id
       WHERE l.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!list) return res.status(404).json({ error: 'List not found' });

    await db.run('DELETE FROM lists WHERE id = ?', [list.id]);
    return res.json({ message: 'List deleted' });
  } catch (err) {
    console.error('DELETE /lists/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
