import { useState } from 'react';
import Card from './Card.jsx';
import './KanbanList.css';

export default function KanbanList({ list, onAddCard, onDeleteCard, onDeleteList, onDragStart, onDrop }) {
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleAddCard(e) {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    onAddCard(list.id, cardTitle.trim());
    setCardTitle('');
    setAddingCard(false);
  }

  return (
    <div
      className={`kanban-list ${dragOver ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(); }}
    >
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <div className="list-header-right">
          <span className="card-count">{list.cards?.length || 0}</span>
          <button className="btn-delete-list" onClick={() => onDeleteList(list.id)} title="Delete list">✕</button>
        </div>
      </div>

      <div className="list-cards">
        {(list.cards || []).map(card => (
          <Card key={card.id} card={card} onDelete={() => onDeleteCard(card.id, list.id)} onDragStart={() => onDragStart(card.id)} />
        ))}
      </div>

      {addingCard ? (
        <form onSubmit={handleAddCard} className="add-card-form">
          <textarea autoFocus value={cardTitle} onChange={e => setCardTitle(e.target.value)} placeholder="Card title…" className="add-card-input" rows={2} />
          <div className="add-card-actions">
            <button type="submit" className="btn-add-card">Add Card</button>
            <button type="button" className="btn-cancel-card" onClick={() => { setAddingCard(false); setCardTitle(''); }}>✕</button>
          </div>
        </form>
      ) : (
        <button className="btn-new-card" onClick={() => setAddingCard(true)}>+ Add a card</button>
      )}
    </div>
  );
}
