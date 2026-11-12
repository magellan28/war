// Visual system — single source of truth for colours, type and timing.
export const C = {
  bg: '#05090d',
  us: '#4aa3ff', // American forces
  usGlow: 'rgba(74,163,255,0.55)',
  jp: '#ff3b45', // Japanese forces
  jpGlow: 'rgba(255,59,69,0.55)',
  label: '#f2f5f7', // geographic labels
  labelDim: 'rgba(225,235,240,0.62)',
  infra: '#8a969c', // infrastructure / relief
  alert: '#ffc53d', // attacks, critical events
  alertGlow: 'rgba(255,197,61,0.6)',
  route: '#3ff0dc', // movement & navigation
  routeGlow: 'rgba(63,240,220,0.55)',
  coast: 'rgba(235,245,248,0.92)',
  coastGlow: 'rgba(120,230,225,0.22)',
  hud: 'rgba(210,235,240,0.78)',
  hudDim: 'rgba(210,235,240,0.38)',
};

export const F = {
  label: "'Inter', sans-serif",
  title: "'Barlow Condensed', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const FPS = 30;
