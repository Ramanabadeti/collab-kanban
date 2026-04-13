import { useState } from 'react';
import './Card.css';

const CARD_COLORS = ['', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Card({ card, onDelete, onDragStart }) {
  const [expanded, setExpanded] = useState(false);

  const colorStrip = card.color && card.color !== '' ? card.color : null;

  return (
    <>
      <div
        className="kanban-card"
        draggable
        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
        onClick={() => setExpanded(true)}
      >
        {colorStrip && <div className="card-color-strip" style={{ background: colorStrip }} />}
        <div className="card-body">
          <p className="card-title">{card.title}</p>
          {card.due_date && (
            <span className="card-due">📅 {new Date(card.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="card-modal-backdrop" onClick={() => setExpanded(false)}>
          <div className="card-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{card.title}</h3>
              <button className="modal-close" onClick={() => setExpanded(false)}>✕</button>
            </div>
            {card.description && <p className="modal-desc">{card.description}</p>}
            <div className="modal-meta">
              {card.due_date && <span className="modal-due">📅 Due: {new Date(card.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
            </div>
            <div className="modal-colors">
              <span className="modal-label">Label color:</span>
              {CARD_COLORS.map(c => (
                <div key={c} className={`modal-swatch ${card.color === c ? 'active' : ''}`} style={{ background: c || '#e2e8f0' }} title={c || 'None'} />
              ))}
            </div>
            <button className="btn-delete-card" onClick={() => { onDelete(); setExpanded(false); }}>🗑 Delete Card</button>
          </div>
        </div>
      )}
    </>
  );
}
