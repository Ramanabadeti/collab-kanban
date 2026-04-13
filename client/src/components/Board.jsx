import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import KanbanList from './KanbanList.jsx';
import './Board.css';

export default function Board({ board }) {
  const { token } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [draggingCard, setDraggingCard] = useState(null); // { cardId, fromListId }

  useEffect(() => { fetchBoard(); }, [board.id]);

  async function fetchBoard() {
    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${board.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLists(data.lists || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function addList(e) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ boardId: board.id, title: newListTitle, position: lists.length }),
      });
      const list = await res.json();
      setLists(l => [...l, { ...list, cards: [] }]);
      setNewListTitle('');
      setAddingList(false);
    } catch (e) { console.error(e); }
  }

  async function deleteList(listId) {
    await fetch(`/api/lists/${listId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLists(l => l.filter(x => x.id !== listId));
  }

  async function addCard(listId, title) {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ listId, title, position: 0 }),
    });
    const card = await res.json();
    setLists(l => l.map(list => list.id === listId ? { ...list, cards: [card, ...(list.cards || [])] } : list));
  }

  async function deleteCard(cardId, listId) {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLists(l => l.map(list => list.id === listId ? { ...list, cards: list.cards.filter(c => c.id !== cardId) } : list));
  }

  async function moveCard(cardId, fromListId, toListId) {
    if (fromListId === toListId) return;
    setLists(prev => {
      const card = prev.find(l => l.id === fromListId)?.cards?.find(c => c.id === cardId);
      if (!card) return prev;
      return prev.map(list => {
        if (list.id === fromListId) return { ...list, cards: list.cards.filter(c => c.id !== cardId) };
        if (list.id === toListId) return { ...list, cards: [{ ...card, list_id: toListId }, ...(list.cards || [])] };
        return list;
      });
    });
    await fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ listId: toListId, position: 0 }),
    });
  }

  if (loading) return <div className="board-loading"><div className="spinner" /> Loading board…</div>;

  return (
    <div className="board-view">
      <div className="kanban-scroll">
        {lists.map(list => (
          <KanbanList
            key={list.id}
            list={list}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onDeleteList={deleteList}
            onDragStart={(cardId) => setDraggingCard({ cardId, fromListId: list.id })}
            onDrop={() => { if (draggingCard) { moveCard(draggingCard.cardId, draggingCard.fromListId, list.id); setDraggingCard(null); } }}
          />
        ))}

        <div className="add-list-col">
          {addingList ? (
            <form onSubmit={addList} className="add-list-form">
              <input autoFocus type="text" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} placeholder="List name…" className="add-list-input" />
              <div className="add-list-actions">
                <button type="submit" className="btn-add-list">Add List</button>
                <button type="button" className="btn-cancel-list" onClick={() => { setAddingList(false); setNewListTitle(''); }}>✕</button>
              </div>
            </form>
          ) : (
            <button className="btn-new-list" onClick={() => setAddingList(true)}>+ Add a list</button>
          )}
        </div>
      </div>
    </div>
  );
}
