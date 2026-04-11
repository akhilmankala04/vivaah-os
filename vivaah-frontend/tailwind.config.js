export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vivaah': {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          600: '#7C3AED',
          800: '#5B21B6',
          950: '#3B0764',
        },
        'success':  '#10B981',
        'warning':  '#F59E0B',
        'danger':   '#EF4444',
        'info':     '#3B82F6',
        'haldi': {
          bg:     '#FFFBEB',
          text:   '#92400E',
          border: '#FCD34D',
        },
        'mehendi': {
          bg:     '#F0FDF4',
          text:   '#14532D',
          border: '#86EFAC',
        },
        'sangeet': {
          bg:     '#FAF5FF',
          text:   '#581C87',
          border: '#C084FC',
        },
        'engagement': {
          bg:     '#FFF7ED',
          text:   '#7C2D12',
          border: '#FDBA74',
        },
        'wedding-event': {
          bg:     '#FFF1F2',
          text:   '#9F1239',
          border: '#FDA4AF',
        },
        'reception': {
          bg:     '#EFF6FF',
          text:   '#1E3A5F',
          border: '#93C5FD',
        },
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '10px',
        'lg':   '14px',
        'xl':   '20px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}