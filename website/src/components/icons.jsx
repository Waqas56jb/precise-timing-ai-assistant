/* Inline SVG icon set — stroke inherits currentColor */

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const PhoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const MapPinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const ArrowRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const ShieldIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TruckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

export const BoxIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const BuildingIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 6h.01M12 10h.01M12 14h.01" />
  </svg>
);

export const MuscleIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6.5 6.5 8 5l4 1 2.5-2.5L18 5v6l-2 2-4.5 1L8 16l-4-2V9z" />
    <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
  </svg>
);

export const UserIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const StairsIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 20h4v-4h4v-4h4V8h4V4" />
    <path d="M3 20h18" />
  </svg>
);

export const PaperclipIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M14.54 22.35a.5.5 0 0 0 .93-.04l6.5-19a.5.5 0 0 0-.63-.63l-19 6.5a.5.5 0 0 0-.04.93l7.66 3.4a1 1 0 0 1 .51.51z" />
    <path d="m21.85 2.15-11.4 11.4" />
  </svg>
);

export const StarIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" strokeWidth="0">
    <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.35L18.18 20 12 16.6 5.82 20l1.43-6.38L2.5 9.27l6.6-1.01z" />
  </svg>
);

/* Social — filled glyph style */
const social = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' };

export const FacebookIcon = (p) => (
  <svg {...social} {...p}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

export const TikTokIcon = (p) => (
  <svg {...social} {...p}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.77a5.76 5.76 0 0 0-.78-.06 5.69 5.69 0 1 0 5.69 5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.34 4.34 0 0 1-3.25-1.48Z" />
  </svg>
);

export const YelpIcon = (p) => (
  <svg {...social} {...p}>
    <path d="M12.9 2.5c.4-.7 1.5-.5 1.6.3l.6 6.6c.1.8-.9 1.3-1.5.7L9.7 6.3c-.5-.5-.4-1.3.2-1.6l3-2.2zM8.1 10.6c.8-.1 1.3.9.8 1.5l-3.2 3.6c-.5.6-1.5.3-1.6-.5l-.4-3.2c-.1-.7.5-1.2 1.2-1.2l3.2-.2zm1.7 4.6c.6-.5 1.6-.1 1.6.7l.1 4.9c0 .8-.9 1.2-1.5.8l-2.7-1.9c-.6-.4-.6-1.3 0-1.7l2.5-2.8zm4.3-1c-.3-.7.4-1.5 1.2-1.3l4.7 1.3c.8.2.9 1.3.2 1.7l-2.8 1.6c-.6.3-1.4 0-1.6-.6l-1.7-2.7zm1.2-3.4c-.8.2-1.5-.6-1.1-1.3l2.2-4.4c.4-.7 1.4-.6 1.7.1l1.1 3c.2.7-.2 1.4-.9 1.5l-3 .8-0 .3z" />
  </svg>
);

export const YouTubeIcon = (p) => (
  <svg {...social} {...p}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4L15.83 12 9.6 15.6Z" />
  </svg>
);
