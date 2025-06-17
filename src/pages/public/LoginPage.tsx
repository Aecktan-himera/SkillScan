import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { darkMode } = useTheme(); // Используем хук useTheme
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Неверный email или пароль');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Цветовые классы в зависимости от темы
  const themeClasses = {
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBackground: darkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: darkMode ? 'text-emerald-400' : 'text-emerald-700',
    textSecondary: darkMode ? 'text-emerald-300' : 'text-emerald-600',
    inputBackground: darkMode ? 'bg-gray-900' : 'bg-white',
    inputBorder: darkMode ? 'border-gray-700' : 'border-gray-300',
    inputText: darkMode ? 'text-emerald-200' : 'text-emerald-700',
    inputPlaceholder: darkMode ? 'placeholder-gray-500' : 'placeholder-gray-400',
    iconColor: darkMode ? 'text-emerald-400' : 'text-emerald-500',
    buttonGradientFrom: darkMode ? 'from-emerald-500' : 'from-emerald-400',
    buttonGradientTo: darkMode ? 'to-emerald-600' : 'to-emerald-500',
    buttonHoverFrom: darkMode ? 'hover:from-emerald-600' : 'hover:from-emerald-500',
    buttonHoverTo: darkMode ? 'hover:to-emerald-700' : 'hover:to-emerald-600',
    ringOffset: darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white',
    userIconBg: darkMode ? 'bg-gray-700' : 'bg-gray-100',
    circleBg1: darkMode ? 'bg-emerald-500 opacity-20' : 'bg-emerald-400 opacity-10',
    circleBg2: darkMode ? 'bg-emerald-700 opacity-20' : 'bg-emerald-600 opacity-10',
    circleBg3: darkMode ? 'bg-emerald-400 opacity-20' : 'bg-emerald-300 opacity-10',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${themeClasses.background}`}>
      {/* Декоративные круги */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${themeClasses.circleBg1}`}></div>
        <div className={`absolute top-1/2 left-3/4 w-80 h-80 rounded-full ${themeClasses.circleBg2}`}></div>
        <div className={`absolute bottom-0 right-0 w-72 h-72 rounded-full ${themeClasses.circleBg3}`}></div>
      </div>

      <main className={`rounded-xl shadow-lg p-8 w-full max-w-md ${themeClasses.cardBackground}`}>
        {/* Иконка пользователя */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${themeClasses.userIconBg}`}>
            <UserIcon className={`w-12 h-12 ${themeClasses.textPrimary}`} />
          </div>
        </div>

        <h1 className={`text-2xl font-bold text-center mb-2 ${themeClasses.textPrimary}`}>
          Авторизация
        </h1>
        <p className={`text-center mb-8 ${themeClasses.textSecondary}`}>
          Войти с помощью почты
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Поле email */}
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconColor}`}>
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={`w-full pl-10 pr-3 py-3 rounded-lg border ${themeClasses.inputBackground} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition`}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Поле пароля */}
          <div>
            <label htmlFor="password" className="sr-only">Пароль</label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconColor}`}>
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${themeClasses.inputBackground} ${themeClasses.inputBorder} ${themeClasses.inputText} ${themeClasses.inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition`}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.iconColor} focus:outline-none`}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${themeClasses.buttonGradientFrom} ${themeClasses.buttonGradientTo} hover:${themeClasses.buttonHoverFrom} hover:${themeClasses.buttonHoverTo} focus:ring-emerald-500 ${themeClasses.ringOffset} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Вход...
              </div>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className={`mt-8 text-sm space-y-3 text-center ${themeClasses.textSecondary}`}>
          <p>
            Забыли пароль?{' '}
            <button 
              onClick={() => navigate('/reset-password')}
              className="font-semibold underline hover:text-emerald-500 transition"
            >
              Сбросить
            </button>
          </p>
          <p>
            Нет аккаунта?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="font-semibold underline hover:text-emerald-500 transition"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;