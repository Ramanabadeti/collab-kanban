import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Auth from './components/Auth.jsx';
import BoardList from './components/BoardList.jsx';
import Board from './components/Board.jsx';
import './App.css';

function AppShell() {
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState(null);

  if (!isAuthenticated) return <Auth />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {selectedBoard && (
            <button className="btn-back" onClick={() => setSelectedBoard(null)}>← Boards</button>
          )}
          <div className="logo">
            <span className="logo-icon">📋</span>
            <span className="logo-name">CollabBoard</span>
          </div>
          {selectedBoard && <span className="board-title-header">{selectedBoard.title}</span>}
        </div>
        <div className="header-right">
          <span className="user-chip">{user?.username?.[0]?.toUpperCase()}</span>
          <span className="user-name">{user?.username}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="app-main">
        {selectedBoard
          ? <Board board={selectedBoard} onBack={() => setSelectedBoard(null)} />
          : <BoardList onSelectBoard={setSelectedBoard} />
        }
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppShell /></AuthProvider>;
}
