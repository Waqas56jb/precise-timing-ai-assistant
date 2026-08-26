import {
  Globe,
  MessageCircle,
  Star,
  Pin,
  Mail,
  HelpCircle,
} from 'lucide-react';

export const SOURCES = [
  { id: 'website_form', label: 'Website', short: 'Form', icon: Globe, tone: 'blue' },
  { id: 'chatbot', label: 'Chatbot', short: 'Chat', icon: MessageCircle, tone: 'gold' },
  { id: 'yelp', label: 'Yelp', short: 'Yelp', icon: Star, tone: 'red' },
  { id: 'thumbtack', label: 'Thumbtack', short: 'TT', icon: Pin, tone: 'green' },
];

export function normalizeSource(source) {
  if (source === 'website' || source === 'chatbot') return 'chatbot';
  return source || 'unknown';
}

export function sourceMeta(source) {
  const id = normalizeSource(source);
  return (
    SOURCES.find((s) => s.id === id) || {
      id,
      label: source || 'Other',
      short: 'Other',
      icon: id === 'email' ? Mail : HelpCircle,
      tone: 'muted',
    }
  );
}

export const STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quoted', label: 'Quoted' },
  { id: 'booked', label: 'Booked' },
  { id: 'closed', label: 'Closed' },
  { id: 'archived', label: 'Archived' },
];

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMoney(n) {
  if (n == null || n === '') return '—';
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
