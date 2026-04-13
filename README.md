# CollabBoard — Real-Time Collaborative Kanban Board

**Create boards, add cards, move them between lists — and every connected user sees the change instantly.** Built with React, Socket.io, and JWT authentication.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite)](https://sqlite.org)

---

## What Makes It Different

Most Kanban apps are single-user. CollabBoard uses WebSocket rooms so multiple users on the same board see card movements, additions, and deletions in real time — no polling, no page refresh.

---

## Screenshots

> _Add screenshots — board list, kanban view with drag-and-drop, card modal_

---

## Features

- **Real-time sync** — Socket.io rooms per board; all users see changes instantly
- **Multiple boards** — Create, color-code, and manage separate project boards
- **Drag & drop** — Native HTML5 drag events to move cards between lists
- **Card details** — Title, description, due date, color labels
- **JWT auth** — Secure per-user boards with login/register
- **Demo account** — Try without registering

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Socket.io Client |
| Backend | Node.js, Express 4, Socket.io 4 |
| Auth | JWT + bcryptjs |
| Database | SQLite |
| Real-time | WebSocket rooms (Socket.io) |

---

## Architecture

```
React + Socket.io Client (port 5173)
      │  REST API (boards, cards)
      │  WebSocket (real-time events)
      ▼
Express + Socket.io Server (port 5003)
      │
      ▼
SQLite (kanban.db)
```

Socket.io rooms are scoped per board (`board-{id}`), so events only reach users viewing that specific board.

---

## Demo Credentials

```
Email:    demo@collabboard.com
Password: demo123
```

---

## Setup & Installation

```bash
git clone https://github.com/Ramanabadeti/collab-kanban.git
cd collab-kanban

npm install
cp .env.example .env   # set JWT_SECRET
node initDb.js

cd client && npm install && cd ..
```

**Run:**
```bash
node server.js            # http://localhost:5003
cd client && npm run dev  # http://localhost:5173
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Register |
| `GET` | `/api/boards` | List user's boards |
| `POST` | `/api/boards` | Create board |
| `GET` | `/api/boards/:id` | Get board with lists + cards |
| `POST` | `/api/lists` | Add list to board |
| `POST` | `/api/cards` | Add card to list |
| `PUT` | `/api/cards/:id` | Move/update card |
| `DELETE` | `/api/cards/:id` | Delete card |

---

## Author

**Raman Abadeti** — Full-Stack Developer | [GitHub](https://github.com/Ramanabadeti)
