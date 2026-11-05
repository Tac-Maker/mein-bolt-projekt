/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          white: '#FFFFFF',
          off: '#F9FAFB',
        },
        hairline: '#E4E4E7',
        carbon: '#18181B',
        technical: '#71717A',
        signal: '#EA580C',
        verified: {
          DEFAULT: '#16A34A',
          bg: '#DCFCE7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.9rem' }],
      },
    },
  },
  plugins: [],
};
