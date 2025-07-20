import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import unocss from '@unocss/eslint-plugin'; // Добавлен импорт unocss

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...unocss.configs.flat // Теперь unocss определен
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node // Добавляет Node.js глобалы для конфиг-файлов
      },
      parserOptions: {
        jsx: true,
        project: './tsconfig.app.json', // Используем основной tsconfig
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@unocss': unocss // Зарегистрирован плагин
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@unocss/order': 'warn',
      '@unocss/blocklist': 'error',
      
      // Добавьте базовые правила React
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
  },
  // Отдельная конфигурация для конфигурационных файлов
  {
    files: ['*.config.{js,ts}', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node, // Только Node.js глобалы
      parserOptions: {
        project: './tsconfig.node.json',
      }
    }
  }
);