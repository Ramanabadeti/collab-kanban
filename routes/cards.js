import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../db.js';

const router = Router();
router.use(authMiddleware);

// POST /api/cards — create a new card
router.post('/', async (req, res) => {
  const { list_id, title, description = '', color = '', due_date = null } = req.body;
  if (!list_id || !title) {
    return res.status(400).json({ error: 'list_id and title are required' });
  }

  try {
    const db = await getDb();

    // Verify the list belongs to a board owned by the user
    const list = await db.get(
      `SELECT l.* FROM lists l
       JOIN boards b ON b.id = l.board_id
       WHERE l.id = ? AND b.user_id = ?`,
      [list_id, req.user.id]
    );
    if (!list) return res.status(404).json({ error: 'List not found' });

    // Position = max position + 1 in this list
    const maxPos = await db.get(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM cards WHERE list_id = ?',
      [list_id]
    );
    const position = maxPos.maxPos + 1;

    const result = await db.run(
      'INSERT INTO cards (list_id, title, description, color, position, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [list_id, title, description, color, position, due_date]
    );
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [result.lastID]);
    return res.status(201).json(card);
  } catch (err) {
    console.error('POST /cards error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/cards/:id — update card (title, description, color, due_date, list_id, position)
router.put('/:id', async (req, res) => {
  const { title, description, color, due_date, list_id, position } = req.body;

  try {
    const db = await getDb();

    const card = await db.get(
      `SELECT c.*, l.board_id FROM cards c
       JOIN lists l ON l.id = c.list_id
       JOIN boards b ON b.id = l.board_id
       WHERE c.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const fromListId = card.list_id;
    const newTitle = title ?? card.title;
    const newDesc = description !== undefined ? description : card.description;
    const newColor = color !== undefined ? color : card.color;
    const newDueDate = due_date !== undefined ? due_date : card.due_date;
    const newListId = list_id ?? card.list_id;
    const newPosition = position !== undefined ? position : card.position;

    await db.run(
      `UPDATE cards
       SET title = ?, description = ?, color = ?, due_date = ?, list_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newTitle, newDesc, newColor, newDueDate, newListId, newPosition, card.id]
    );

    const updated = await db.get('SELECT * FROM cards WHERE id = ?', [card.id]);

    // Attach move metadata so server.js can emit socket event
    updated._fromListId = fromListId;
    updated._boardId = card.board_id;

    return res.json(updated);
  } catch (err) {
    console.error('PUT /cards/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/cards/:id — delete card
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();

    const card = await db.get(
      `SELECT c.*, l.board_id FROM cards c
       JOIN lists l ON l.id = c.list_id
       JOIN boards b ON b.id = l.board_id
       WHERE c.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!card) return res.status(404).json({ error: 'Card not found' });

    await db.run('DELETE FROM cards WHERE id = ?', [card.id]);
    return res.json({ message: 'Card deleted', cardId: card.id, listId: card.list_id, boardId: card.board_id });
  } catch (err) {
    console.error('DELETE /cards/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
