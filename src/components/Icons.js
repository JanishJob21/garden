// Lightweight inline SVG icon set to avoid external deps
import React from 'react';

const base = { width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconDashboard = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zM3 21h8v-6H3v6zm10-8h8V3h-8v10z" fill="currentColor" stroke="none"/></svg>
);
export const IconSessions = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M3 12h18M12 3v18"/></svg>
);
export const IconList = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
);
export const IconTools = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 011.4 0l1.6 1.6a1 1 0 010 1.4l-9.9 9.9a1 1 0 01-.7.3H5a1 1 0 01-1-1v-2.1a1 1 0 01.3-.7l9.9-9.9z"/></svg>
);
export const IconFeedback = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
);
export const IconUsers = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
);
export const IconSearch = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-3.5-3.5"/></svg>
);
export const IconRefresh = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7"/><path d="M21 3v6h-6"/></svg>
);
export const IconClear = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
);
export const IconCalendar = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
);
export const IconArrowRight = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
);
export const IconEye = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default {
  IconDashboard, IconSessions, IconList, IconTools, IconFeedback, IconUsers,
  IconSearch, IconRefresh, IconClear, IconCalendar, IconArrowRight,
  IconEye,
};
