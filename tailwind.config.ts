import type { Config } from 'tailwindcss'

/**
 * Paleta copiada do Diamond CRM (tailwind.config.js de lá) — o pedido é que o
 * Auxiliar pareça irmão do CRM: mesmo azul Diamond (#00b4d8), mesmos navys de
 * fundo. O app é ESCURO por padrão (classe `dark` fixa no <html>).
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00b4d8', // Diamond Blue
          dark: '#0077b6',
          light: '#90e0ef',
          glass: 'rgba(0, 180, 216, 0.15)',
          foreground: '#02040a',
        },
        navy: {
          950: '#02040a',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        success: { DEFAULT: '#22c55e', dark: '#16a34a' },
        danger: { DEFAULT: '#ef4444', dark: '#dc2626' },
        warning: { DEFAULT: '#f59e0b', dark: '#d97706' },
        // tokens que os componentes shadcn esperam
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '.55' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
