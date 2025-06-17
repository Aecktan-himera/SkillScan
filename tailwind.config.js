module.exports = {
  mode: 'jit',
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        dark: {
          700: '#1f2937',
          800: '#111827',
          900: '#0d131e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'emerald': '0 4px 14px 0 rgba(16, 185, 129, 0.2)',
        'dark-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark', 'dark-hover'],
      borderColor: ['dark', 'dark-focus'],
      textColor: ['dark', 'dark-hover'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      animation: ['hover', 'focus'],
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.md'),
          padding: theme('spacing.6'),
          transitionProperty: 'box-shadow',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease',
          '@apply dark:bg-gray-800': {},
        },
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          transitionProperty: 'all',
          transitionDuration: '200ms',
          transitionTimingFunction: 'ease',
          '&:focus': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
          },
          '&:disabled': {
            opacity: theme('opacity.75'),
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.600'),
          },
          '@apply dark:bg-primary-600 dark:hover:bg-primary-700': {},
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.200'),
          color: theme('colors.gray.800'),
          '&:hover': {
            backgroundColor: theme('colors.gray.300'),
          },
          '@apply dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600': {},
        },
        '.input': {
          borderWidth: theme('borderWidth.DEFAULT'),
          borderRadius: theme('borderRadius.md'),
          padding: `${theme('spacing.2')} ${theme('spacing.3')}`,
          transitionProperty: 'border-color',
          transitionDuration: '200ms',
          '&:focus': {
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px rgba(16, 185, 129, 0.2)`,
          },
          '@apply dark:bg-gray-700 dark:border-gray-600 dark:text-white': {},
        },
      })
    }
  ],
}