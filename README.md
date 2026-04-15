# CollabBoard — Real-Time Collaborative Kanban Board

**Create boards, add cards, drag them between lists — every connected user sees changes instantly.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%E2%96%B6%20Visit-black?style=for-the-badge&logo=vercel)](https://github.com/Ramanabadeti/collab-kanban)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite)](https://sqlite.org)

> Demo credentials: `demo` / `demo123`

---

## Overview

Most Kanban apps are single-user. CollabBoard uses Socket.io rooms scoped per board — so multiple users on the same board see card movements, additions, and deletions in real time with zero polling and no page refresh needed.

---

## Features

- **Real-time sync** — Socket.io rooms per board; all users see changes the moment they happen
- **Multiple boards** — Create, color-code, and switch between project boards
- **Drag & drop** — Native HTML5 drag events to move cards between lists
- **Card details** — Title, description, due date, and color labels via click-to-open modal
- **List management** — Add and delete lists dynamically within any board
- **JWT authentication** — Secure per-user boards with login/register
- **Pre-seeded demo board** — Sample board with To Do / In Progress / Done lists ready to go

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, socket.io-client |
| Backend | Node.js, Express 4, Socket.io 4 |
| Auth | JWT + bcryptjs |
| Database | SQLite (`sqlite` / `sqlite3`) |
| Real-time | WebSocket rooms scoped per board |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
React + socket.io-client (Vite)
        │
        ├── REST API   → boards, lists, cards CRUD
        └── WebSocket  → real-time card/list events
        ▼
Express + Socket.io Server (Render)
        │  emits: card-moved | card-created | card-deleted | list-created
        ▼
SQLite Database
   ├── users
   ├── boards
   ├── lists
   └── cards
```

Socket.io rooms are keyed as `board-{id}` — events only reach users currently viewing that board.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Register |
| `GET` | `/api/boards` | List user's boards |
| `POST` | `/api/boards` | Create board |
| `GET` | `/api/boards/:id` | Board with nested lists + cards |
| `POST` | `/api/lists` | Add list to board |
| `POST` | `/api/cards` | Add card to list |
| `PUT` | `/api/cards/:id` | Move / update card |
| `DELETE` | `/api/cards/:id` | Delete card |

---

## Local Setup

```bash
git clone https://github.com/Ramanabadeti/collab-kanban.git
cd collab-kanban

npm install
cp .env.example .env        # add JWT_SECRET
node initDb.js              # creates DB + seeds demo board

cd client && npm install && cd ..

node server.js              # API + WS → http://localhost:5003
cd client && npm run dev    # UI       → http://localhost:5173
```

---

## Author

**Raman Abadeti** — Full-Stack Developer
[GitHub](https://github.com/Ramanabadeti)
