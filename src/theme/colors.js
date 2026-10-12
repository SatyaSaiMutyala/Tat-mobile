/**
 * Design tokens — locked to the TrustLab palette from the reference design.
 */
export const colors = {
  teal: '#00B49A',
  tealDark: '#008972',
  tealDeep: '#006652',

  yellow: '#F0B429',
  yellowDark: '#C8941E',

  green: '#1A3A2A',
  greenDeep: '#0F2419',

  /** Flat background for the pre-dashboard screens (splash, sign in). */
  authBg: '#265C50',

  ink: '#0B1410',
  ink2: '#1F2D26',
  ink3: '#4A5A52',
  ink4: '#7A8A82',

  line: '#E4EAE7',
  line2: '#F0F3F1',

  paper: '#FAFBFA',
  paper2: '#F2F5F3',
  white: '#FFFFFF',

  ok: '#2E8F5F',
  okTint: '#E6F4ED',
  warn: '#D97706',
  warnTint: '#FEF3E2',
  crit: '#C8362A',
  critTint: '#FCE9E7',

  transparent: 'transparent',
};

/** Multi-stop gradients used by the hero / status cards. */
export const gradients = {
  signin: ['#0F2419', '#1A3A2A', '#244A34'],
  crit: ['#C8362A', '#7A1F17'],
  warn: ['#D97706', '#A85B03'],
  ok: [colors.tealDeep, colors.green],
  released: ['#2E8F5F', '#1E6B47'],
  avatar: [colors.teal, colors.tealDeep],
  user: [colors.tealDeep, colors.green],
};

/** Alpha helpers for the translucent surfaces in the dark screens. */
export const alpha = {
  white04: 'rgba(255,255,255,0.04)',
  white06: 'rgba(255,255,255,0.06)',
  white14: 'rgba(255,255,255,0.14)',
  white15: 'rgba(255,255,255,0.15)',
  white16: 'rgba(255,255,255,0.16)',
  white32: 'rgba(255,255,255,0.32)',
  white35: 'rgba(255,255,255,0.35)',
  white55: 'rgba(255,255,255,0.55)',
  white70: 'rgba(255,255,255,0.70)',
  white85: 'rgba(255,255,255,0.85)',
  white88: 'rgba(255,255,255,0.88)',
  white90: 'rgba(255,255,255,0.90)',
  tealTint: 'rgba(0,180,154,0.14)',
  tealFaint: 'rgba(0,180,154,0.03)',
  tealField: 'rgba(0,180,154,0.08)',
  yellowNote: 'rgba(240,180,41,0.12)',
  yellowNoteLine: 'rgba(240,180,41,0.30)',
};

export default colors;
