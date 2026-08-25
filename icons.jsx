/* icons.jsx — small inline Lucide-style icon set, shared on window */
const I = (paths, extra = {}) => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.sw || 1.75}
       strokeLinecap="round" strokeLinejoin="round" {...extra} {...props}>
    {paths}
  </svg>
);

const IconMsg      = I(<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>);
const IconSend     = I(<><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></>);
const IconPhoneOff = I(<><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></>);
const IconCheck    = I(<><path d="M20 6 9 17l-5-5"/></>);
const IconCheckBig = I(<><path d="M20 6 9 17l-5-5"/></>, {});
const IconCar      = I(<><path d="M19 17h2l-.6-5.4A2 2 0 0 0 18.4 10H5.6a2 2 0 0 0-2 1.6L3 17h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17h2m10 0h-6"/><path d="M5 10 6.3 6.2A2 2 0 0 1 8.2 5h7.6a2 2 0 0 1 1.9 1.2L19 10"/></>);
const IconTruck    = I(<><path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l3 3v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>);
const IconKey      = I(<><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.6-8.6"/><path d="m16 5 3 3"/><path d="m18.5 7.5 1.7-1.7"/></>);
const IconShield   = I(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>);
const IconTag      = I(<><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></>);
const IconRepeat   = I(<><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></>);
const IconSpark    = I(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></>);
const IconBolt     = I(<><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></>);
const IconHeart    = I(<><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></>);
const IconX        = I(<><path d="M18 6 6 18M6 6l12 12"/></>);
const IconLock     = I(<><rect x="3.5" y="11" width="17" height="10" rx="2"/><path d="M7.5 11V7a4.5 4.5 0 0 1 9 0v4"/></>);
const IconUsers    = I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
const IconSearch   = I(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>);
const IconPhone    = I(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></>);
const IconMail     = I(<><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 6 9-6"/></>);
const IconNote     = I(<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>);
const IconCal      = I(<><rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>);
const IconLogout   = I(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>);
const IconChevDown = I(<><path d="m6 9 6 6 6-6"/></>);
const IconSort     = I(<><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></>);
const IconPlus     = I(<><path d="M12 5v14M5 12h14"/></>);
const IconClock    = I(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
const IconGrid     = I(<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>);
const IconList     = I(<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>);
const IconArrow    = I(<><path d="M5 12h14M13 6l6 6-6 6"/></>);
const IconFilter   = I(<><path d="M3 4h18l-7 8v6l-4 2v-8z"/></>);
const IconTrash    = I(<><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/></>);
const IconBug      = I(<><rect x="8" y="6" width="8" height="10" rx="4"/><path d="M8 6C8 3.8 9.8 2 12 2s4 1.8 4 4"/><path d="m19 5-2 1.8M5 5l2 1.8"/><path d="M20 11h-3M4 11h3M20 15.5h-3M4 15.5h3"/><path d="M10 20.5v-1.5M14 20.5v-1.5"/></>);
const IconBell     = I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>);

Object.assign(window, {
  IconMsg, IconSend, IconPhoneOff, IconCheck, IconCheckBig, IconCar, IconTruck,
  IconKey, IconShield, IconTag, IconRepeat, IconSpark, IconBolt, IconHeart,
  IconX, IconLock, IconUsers, IconSearch, IconPhone, IconMail, IconNote, IconCal,
  IconLogout, IconChevDown, IconSort, IconPlus, IconClock, IconGrid, IconList, IconArrow, IconFilter,
  IconTrash, IconBug, IconBell
});
