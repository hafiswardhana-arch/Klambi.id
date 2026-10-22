/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
          bg: 'var(--warning-bg)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          foreground: 'var(--danger-foreground)',
          bg: 'var(--danger-bg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          bg: 'var(--info-bg)',
        },
        coral: 'var(--coral)',
        mint: 'var(--mint)',
        'pink-pastel': 'var(--pink-pastel)',
        'tan-pastel': 'var(--tan-pastel)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 6px)',
        md: 'calc(var(--radius) - 4px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,43,92,0.08), 0 1px 2px rgba(26,43,92,0.04)',
        'card-hover': '0 4px 12px rgba(26,43,92,0.12), 0 2px 4px rgba(26,43,92,0.06)',
        'provider': '0 4px 16px rgba(26,43,92,0.15)',
        'listing': '0 6px 20px rgba(26,43,92,0.12)',
        'modal': '0 20px 60px rgba(26,29,59,0.2)',
      },
      transitionDuration: {
        'xs': '150ms',   // Motion/XS (100–180 ms)
        'sm': '250ms',   // Motion/SM (180–300 ms)
        'md': '380ms',   // Motion/MD (300–450 ms)
        'lg': '600ms',   // Motion/LG (450–700 ms)
        'xl': '1200ms',  // Motion/XL (800–1500 ms)
        'ai': '6000ms',  // Motion/AI (5–7 s)
      },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-soft': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'ease-in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};