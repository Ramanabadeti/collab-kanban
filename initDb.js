import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

async function init() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#5b5fcf',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      due_date TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );
  `);

  // Check if demo user already exists
  const existing = await db.get('SELECT id FROM users WHERE username = ?', ['demo']);
  if (existing) {
    console.log('Database already seeded. Skipping seed step.');
    await db.close();
    return;
  }

  // Seed demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const userResult = await db.run(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    ['demo', 'demo@collabboard.dev', passwordHash]
  );
  const userId = userResult.lastID;

  // Seed demo board
  const boardResult = await db.run(
    'INSERT INTO boards (user_id, title, description, color) VALUES (?, ?, ?, ?)',
    [userId, 'My First Board', 'A sample Kanban board to get you started.', '#5b5fcf']
  );
  const boardId = boardResult.lastID;

  // Seed lists
  const listTitles = ['To Do', 'In Progress', 'Done'];
  const listIds = [];
  for (let i = 0; i < listTitles.length; i++) {
    const r = await db.run(
      'INSERT INTO lists (board_id, title, position) VALUES (?, ?, ?)',
      [boardId, listTitles[i], i]
    );
    listIds.push(r.lastID);
  }

  // Seed cards
  const todoCards = [
    { title: 'Design wireframes', description: 'Create low-fi wireframes for the main screens.', color: '#f59e0b', due_date: '2026-04-20' },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', color: '', due_date: null },
    { title: 'Write API documentation', description: 'Document all REST endpoints using OpenAPI 3.0.', color: '#10b981', due_date: '2026-04-25' },
  ];
  const inProgressCards = [
    { title: 'Implement authentication', description: 'JWT-based login and registration flow.', color: '#5b5fcf', due_date: '2026-04-15' },
    { title: 'Build Kanban board UI', description: 'Drag-and-drop card management with real-time sync.', color: '', due_date: null },
  ];
  const doneCards = [
    { title: 'Project setup', description: 'Initialize repo, install dependencies, configure ESLint.', color: '#10b981', due_date: null },
    { title: 'Database schema design', description: 'Design tables for users, boards, lists, and cards.', color: '', due_date: null },
  ];

  const allCardGroups = [todoCards, inProgressCards, doneCards];
  for (let g = 0; g < allCardGroups.length; g++) {
    const group = allCardGroups[g];
    for (let i = 0; i < group.length; i++) {
      const c = group[i];
      await db.run(
        'INSERT INTO cards (list_id, title, description, color, position, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [listIds[g], c.title, c.description, c.color, i, c.due_date]
      );
    }
  }

  console.log('Database initialized and seeded successfully.');
  console.log('Demo credentials → username: demo  |  password: demo123');
  await db.close();
}

init().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
