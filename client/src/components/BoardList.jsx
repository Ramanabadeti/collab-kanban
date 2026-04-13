import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './BoardList.css';

const BOARD_COLORS = ['#5b5fcf','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

export default function BoardList({ onSelectBoard }) {
  const { token } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: BOARD_COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBoards(); }, []);

  async function fetchBoards() {
    setLoading(true);
    try {
      const res = await fetch('/api/boards', { headers: { Authorization: `Bearer ${token}` } });
      setBoards(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function createBoard(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const board = await res.json();
      setBoards(b => [board, ...b]);
      setShowForm(false);
      setForm({ title: '', description: '', color: BOARD_COLORS[0] });
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function deleteBoard(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this board and all its cards?')) return;
    await fetch(`/api/boards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setBoards(b => b.filter(x => x.id !== id));
  }

  if (loading) return <div className="boards-loading"><div className="spinner" /> Loading boards…</div>;

  return (
    <div className="board-list-page">
      <div className="boards-header">
        <h2>My Boards</h2>
        <button className="btn-new-board" onClick={() => setShowForm(v => !v)}>+ New Board</button>
      </div>

      {showForm && (
        <form onSubmit={createBoard} className="new-board-form">
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Board name" className="form-input" />
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="form-input" />
          <div className="color-picker">
            {BOARD_COLORS.map(c => (
              <button key={c} type="button" className={`color-swatch ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Creating…' : 'Create Board'}</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {boards.length === 0 && !showForm ? (
        <div className="boards-empty">
          <div className="empty-icon">📋</div>
          <h3>No boards yet</h3>
          <p>Create your first board to get started.</p>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <div key={board.id} className="board-card" onClick={() => onSelectBoard(board)}>
              <div className="board-card-top" style={{ background: board.color }} />
              <div className="board-card-body">
                <h3 className="board-card-title">{board.title}</h3>
                {board.description && <p className="board-card-desc">{board.description}</p>}
                <div className="board-card-footer">
                  <span className="board-date">{new Date(board.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <button className="btn-delete-board" onClick={e => deleteBoard(e, board.id)} title="Delete board">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
