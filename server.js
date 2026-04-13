import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Make io accessible to route handlers
app.set('io', io);

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client joins a board room to receive real-time updates for that board
  socket.on('join-board', (boardId) => {
    const room = `board-${boardId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Patch routes to emit socket events ───────────────────────────────────────
// We wrap the cards router response to intercept and emit events.
// We use a middleware that patches res.json after route processing.

app.use((req, res, next) => {
  // This runs before routes — skip (routes already registered above).
  // Socket events are emitted directly inside route files via req.app.get('io').
  next();
});

// Override res.json in card and list routes to emit socket events.
// Approach: attach io emitter helper to req so routes can call it.
// The routes/cards.js and routes/lists.js already have access via req.app.get('io').
// We hook them here with a patch middleware BEFORE the route registrations.
// Since routes are already registered above, we instead attach a post-processing layer:

// Re-register route-level socket emitters using response interception middleware
// injected before the route handlers. We do this by layering an intercepting middleware.

// Clean approach: patch res.json at request time so socket events fire after DB write.
app.use('/api/cards', (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const io = req.app.get('io');
    if (res.statusCode < 400 && data && !data.error) {
      if (req.method === 'PUT' && data._boardId) {
        // Card moved or updated
        const room = `board-${data._boardId}`;
        io.to(room).emit('card-moved', {
          cardId: data.id,
          fromListId: data._fromListId,
          toListId: data.list_id,
          position: data.position,
          card: data,
        });
      } else if (req.method === 'POST' && data.list_id) {
        // Card created — need board_id; look it up asynchronously (fire-and-forget)
        (async () => {
          try {
            const { getDb } = await import('./db.js');
            const db = await getDb();
            const row = await db.get(
              'SELECT b.id as board_id FROM lists l JOIN boards b ON b.id = l.board_id WHERE l.id = ?',
              [data.list_id]
            );
            if (row) {
              io.to(`board-${row.board_id}`).emit('card-created', { card: data, listId: data.list_id });
            }
          } catch (_) {}
        })();
      } else if (req.method === 'DELETE' && data.cardId) {
        io.to(`board-${data.boardId}`).emit('card-deleted', {
          cardId: data.cardId,
          listId: data.listId,
        });
      }
    }
    // Strip internal fields before sending to client
    if (data && typeof data === 'object') {
      const { _fromListId, _boardId, ...clientData } = data;
      return originalJson(clientData);
    }
    return originalJson(data);
  };
  next();
});

app.use('/api/lists', (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const io = req.app.get('io');
    if (res.statusCode < 400 && req.method === 'POST' && data && data.board_id) {
      io.to(`board-${data.board_id}`).emit('list-created', { list: data });
    }
    return originalJson(data);
  };
  next();
});

const PORT = process.env.PORT || 5003;
httpServer.listen(PORT, () => {
  console.log(`CollabBoard server running on http://localhost:${PORT}`);
});
