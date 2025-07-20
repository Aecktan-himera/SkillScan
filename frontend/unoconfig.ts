import { defineConfig } from 'unocss'
import presetWind3 from '@unocss/preset-wind3'
import presetAttributify from '@unocss/preset-attributify'

export default defineConfig({
  presets: [
    presetWind3, // Замена presetUno
    presetAttributify(),
  ],
  theme: {
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
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    },
    animation: {
      keyframes: {
        float: `{
          0%, 100% { transform: translate(0); }
          25% { transform: translate(5px, 7px); }
          50% { transform: translate(-7px, 5px); }
          75% { transform: translate(3px, -5px); }
        }`,
        spin: '{0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}'
      },
      counts: {
        spin: 'infinite',
        float: 'infinite'
      },
      durations: {
        float: '18s',
        spin: '1s'
      },
      timingFns: {
        float: 'ease-in-out',
        spin: 'linear'
      },
    }
  },
  shortcuts: {
    'button-hover': 'transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]',
    'card': 'bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg',
    'input': 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
    'flex-center': 'flex items-center justify-center',
    'card-header': 'p-4 border-b border-gray-200 dark:border-gray-700',
    'card-title': 'text-lg font-semibold text-gray-900 dark:text-white',
    'btn-primary': 'bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded transition'
  },
  safelist: [
    'animate-float',
    'animate-delay-6000',
    'animate-delay-12000',
    'dark:bg-gray-800',
    'dark:border-gray-700',
    'dark:text-white',
    'dark:text-gray-300'
  ]
})
