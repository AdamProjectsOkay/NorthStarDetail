/* crm-data.jsx — CRM config (stages, account).
   Real leads + activity are loaded at runtime from crm-leads.php;
   the arrays below start empty on purpose (no filler data). */

const STAGES = [
  { key: 'new',       label: 'New',       color: 'var(--blue)' },
  { key: 'contacted', label: 'Contacted', color: 'var(--amber)' },
  { key: 'scheduled', label: 'Scheduled', color: 'var(--accent)' },
  { key: 'completed', label: 'Completed', color: 'var(--teal)' },
  { key: 'dead',       label: 'Dead',      color: 'var(--red)' },
];
const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]));

// single account — it's just one person's dashboard
const USERS = [
  { id: 'owner', name: 'NorthStar', title: 'Owner/Operator', role: 'owner', initials: 'NS', color: '#2F6FED' },
];
const USER_MAP = Object.fromEntries(USERS.map((u) => [u.id, u]));

// Populated from the backend (crm-leads.php) — no mock data here.
const LEADS = [];
const ACTIVITY = [];

Object.assign(window, { STAGES, STAGE_MAP, USERS, USER_MAP, LEADS, ACTIVITY });
