/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        capyme: {
          blue:      '#1F4E9E',
          'blue-mid':'#2B5BA6',
          'blue-light': '#3A72C8',
          'blue-pale': '#EEF4FF',
          dark:      '#0F2A5A',
          accent:    '#4A9AFF',
        }
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '10px',
        'lg':  '14px',
        'xl':  '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'sm':   '0 1px 3px rgba(15,42,90,0.07), 0 1px 2px rgba(15,42,90,0.04)',
        'md':   '0 4px 12px rgba(15,42,90,0.10), 0 2px 6px rgba(15,42,90,0.06)',
        'lg':   '0 10px 30px rgba(15,42,90,0.14), 0 4px 12px rgba(15,42,90,0.08)',
        'xl':   '0 20px 50px rgba(15,42,90,0.18), 0 8px 20px rgba(15,42,90,0.10)',
      },
      animation: {
        'spin-slow': 'spin 700ms linear infinite',
      },
    },
  },
  plugins: [],
}