import { Ban, Eye, Pencil, Trash2, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isBlocked } from '../source.js';

export default function LeadActions({ lead, onBlock, onDelete, busy }) {
  if (!lead?.id) return null;
  const blocked = isBlocked(lead);
  const stop = (e) => e.stopPropagation();

  return (
    <div className="row-actions" onClick={stop}>
      <Link to={`/leads/${lead.id}`} className="icon-btn" title="View" onClick={stop}>
        <Eye size={15} />
      </Link>
      <Link to={`/leads/${lead.id}`} className="icon-btn" title="Edit" onClick={stop}>
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        className="icon-btn"
        title={blocked ? 'Unblock' : 'Block'}
        disabled={busy}
        onClick={(e) => {
          stop(e);
          onBlock?.(lead, !blocked);
        }}
      >
        {blocked ? <Unlock size={15} /> : <Ban size={15} />}
      </button>
      <button
        type="button"
        className="icon-btn icon-btn--danger"
        title="Delete"
        disabled={busy}
        onClick={(e) => {
          stop(e);
          onDelete?.(lead);
        }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
