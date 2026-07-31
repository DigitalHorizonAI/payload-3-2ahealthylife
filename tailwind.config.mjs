/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    // Matches digital-horizon.io's .container: 1280px max, 48px gutters
    // dropping to 24px under 768px.
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        md: '3rem',
      },
      screens: {
        '2xl': '80rem',
        lg: '80rem',
        md: '80rem',
        sm: '80rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      // Article prose, tuned to digital-horizon.io: 1.65 line-height, a ~58ch
      // measure and the same ultralight/tight headline treatment. The template
      // pointed these at `var(--text)`, a variable that is never defined.
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-quotes': 'var(--ink-soft)',
            '--tw-prose-quote-borders': 'var(--dusk)',
            // 60-70 characters is the zone Baymard, Smashing and WCAG 1.4.8
            // all overlap on; ch units self-correct for Urbanist's narrow set.
            maxWidth: '68ch',
            fontSize: '19px',
            lineHeight: '1.65',
            h1: {
              fontSize: 'clamp(38px, 5vw, 58px)',
              fontWeight: '200',
              letterSpacing: '-0.02em',
              lineHeight: '1.06',
              marginBottom: '0.25em',
            },
            h2: {
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              fontWeight: '200',
              letterSpacing: '-0.015em',
              lineHeight: '1.12',
            },
            h3: {
              fontSize: 'clamp(22px, 2.4vw, 28px)',
              fontWeight: '500',
              letterSpacing: '-0.015em',
            },
            'h1 strong, h2 strong, h3 strong': {
              fontWeight: '600',
            },
          },
        },
      }),
    },
  },
}
