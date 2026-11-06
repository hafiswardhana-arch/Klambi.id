/**
 * Klámbi.id — Motion Design System Tokens
 * Compliant with PRD Section 4.1 & 7.3
 */

export const MOTION_DURATIONS = {
  fast: 150,     // 150ms: Press, micro-interactions
  normal: 250,   // 250ms: Chips, icons, toggles
  moderate: 350, // 350ms: Cards, dialogs, drawers
  slow: 500,     // 500ms: Hero reveals, major transitions
  counter: 1200, // 1200ms: Data reveals, score counters
  aiScan: 6000,  // 6000ms: Complete AI vision pipeline
} as const;

export const MOTION_EASINGS = {
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',       // Fast start, soft settle
  easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',        // Smooth exit
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',    // Interactive transitions
  springSubtle: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Selected cards, icon pops
} as const;

export const MOTION_DELAYS = {
  stagger1: 60,
  stagger2: 120,
  stagger3: 180,
  stagger4: 240,
  stagger5: 300,
  stagger6: 360,
} as const;
