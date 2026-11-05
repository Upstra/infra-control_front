/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const full = (name) => `var(--c-${name})`;

const channelTokens = [
  'page',
  'surface',
  'surface-raised',
  'surface-modal',
  'surface-sunken',
  'border-strong',
  'border-control',
  'text-strong',
  'text-muted',
  'text-faint',
  'primary-hover',
  'primary-text',
  'on-primary',
  'success-text',
  'success-border',
  'warning',
  'warning-text',
  'danger-solid',
  'danger-text',
  'danger-strong',
  'danger-border',
  'toggle-off',
  'status-unknown',
];

const fullTokens = ['success-surface', 'warning-surface', 'danger-surface'];

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(channelTokens.map((t) => [t, channel(t)])),
        ...Object.fromEntries(fullTokens.map((t) => [t, full(t)])),
        border: channel('border'),
        text: channel('text'),
        primary: {
          DEFAULT: channel('primary'),
          dark: channel('primary-dark'),
        },
        neutral: {
          light: '#F3F4F6',
          dark: '#1F2937',
          darker: '#111827',
        },
        success: channel('success'),
        danger: channel('danger'),
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: [
          '32px',
          { lineHeight: '38px', letterSpacing: '-0.025em', fontWeight: '500' },
        ],
        title: [
          '22px',
          { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '500' },
        ],
        'card-title': [
          '16px',
          { lineHeight: '22px', letterSpacing: '-0.01em', fontWeight: '500' },
        ],
        body: ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],
        'metric-lg': [
          '64px',
          { lineHeight: '64px', letterSpacing: '-0.04em', fontWeight: '300' },
        ],
        metric: [
          '36px',
          { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '300' },
        ],
        code: ['14px', { lineHeight: '20px' }],
        overline: ['11px', { lineHeight: '16px', letterSpacing: '0.06em' }],
      },
      borderColor: {
        DEFAULT: channel('border'),
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'glow-brand': 'var(--glow-brand)',
        'glow-danger': 'var(--glow-danger)',
        'glow-warning': 'var(--glow-warning)',
        'glow-dot': 'var(--glow-dot)',
      },
      transitionTimingFunction: {
        pulse: 'var(--ease-pulse)',
      },
    },
  },
  plugins: [],
};
