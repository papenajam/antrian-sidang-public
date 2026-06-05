// Inline SVG icon set for the mobile PWA — stroke-based, 1.5px, currentColor

const Icon = ({ d, size = 20, fill = "none", stroke = "currentColor", sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  home:   (p) => <Icon {...p} d="M3 11l9-8 9 8M5 9.5V20a1 1 0 001 1h4v-7h4v7h4a1 1 0 001-1V9.5" />,
  cal:    (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>} />,
  ticket: (p) => <Icon {...p} d={<><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V8z" /><path d="M10 6v12" strokeDasharray="2 2" /></>} />,
  user:   (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>} />,
  plus:   (p) => <Icon {...p} sw={2.4} d="M12 5v14M5 12h14" />,
  bell:   (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" /><path d="M10 21a2 2 0 004 0" /></>} />,
  search: (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>} />,
  chev:   (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
  close:  (p) => <Icon {...p} d="M6 6l12 12M18 6l-12 12" />,
  check:  (p) => <Icon {...p} d="M5 12l5 5L20 7" sw={2.2} />,
  copy:   (p) => <Icon {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>} />,
  share:  (p) => <Icon {...p} d={<><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M8.5 10.5L15.5 7M8.5 13.5L15.5 17" /></>} />,
  info:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></>} />,
  alert:  (p) => <Icon {...p} d={<><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 18h.01" /></>} />,
  refresh:(p) => <Icon {...p} d={<><path d="M3 12a9 9 0 0115-6.7L21 8M21 4v4h-4M21 12a9 9 0 01-15 6.7L3 16M3 20v-4h4" /></>} />,
  clock:  (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />,
  shield: (p) => <Icon {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
  notif:  (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>} />,
  lang:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>} />,
  help:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4M12 17h.01" /></>} />,
  logout: (p) => <Icon {...p} d={<><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l-5-5 5-5M5 12h12" /></>} />,
  scan:   (p) => <Icon {...p} d={<><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" /><path d="M7 12h10" sw={2.2} /></>} />,
  doc:    (p) => <Icon {...p} d={<><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" /><path d="M14 3v6h6M9 13h6M9 17h6" /></>} />,
  ban:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M5 5l14 14" /></>} />,
  rotate: (p) => <Icon {...p} d={<><path d="M3 12a9 9 0 1115 6.5" /><path d="M21 12v6h-6" /></>} />,
  star:   (p) => <Icon {...p} d="M12 3l2.6 5.6 6 .9-4.3 4.4 1 6.1L12 17l-5.3 3 1-6.1L3.4 9.5l6-.9z" />,
  chat:   (p) => <Icon {...p} d="M21 12a9 9 0 11-3.6-7.1L21 4l-1.2 3.6A9 9 0 0121 12z" />,
  pin:    (p) => <Icon {...p} d={<><path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>} />,
};

window.Icons = Icons;
window.Icon = Icon;
