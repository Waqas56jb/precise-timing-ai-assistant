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

export const CHANNELS = {
  website_form: {
    kicker: 'Website form',
    title: 'Website',
    blurb: 'Quote requests submitted from the Precise Timing website.',
  },
  chatbot: {
    kicker: 'AI assistant',
    title: 'Chatbot',
    blurb: 'Conversations started in the live chat widget.',
  },
  yelp: {
    kicker: 'Marketplace',
    title: 'Yelp',
    blurb: 'Leads parsed from Yelp messages in Gmail.',
  },
  thumbtack: {
    kicker: 'Marketplace',
    title: 'Thumbtack',
    blurb: 'Leads parsed from Thumbtack messages in Gmail.',
  },
};

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

export function displayName(lead) {
  if (lead?.name && String(lead.name).trim()) return String(lead.name).trim();
  const hay = `${lead?.pickup_address || ''} ${lead?.notes || ''}`;
  const zip = hay.match(/\b\d{5}\b/);
  if (zip) return `ZIP ${zip[0]}`;
  return 'Unknown visitor';
}

export function parseMeta(lead) {
  const m = lead?.metadata;
  if (!m) return {};
  if (typeof m === 'string') {
    try {
      return JSON.parse(m) || {};
    } catch {
      return {};
    }
  }
  return typeof m === 'object' ? m : {};
}

export function isBlocked(lead) {
  return Boolean(parseMeta(lead).blocked);
}

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

export function fillDaily(rows = [], days = 14) {
  const map = Object.fromEntries((rows || []).map((r) => [r.day, Number(r.count) || 0]));
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    out.push({ day: key, count: map[key] || 0 });
  }
  return out;
}
