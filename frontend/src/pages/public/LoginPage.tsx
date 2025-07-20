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
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      let errorMessage = 'Неверный email или пароль';
      
      if (err.response?.data?.data?.message) {
      errorMessage = err.response.data.data.message;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
  } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${darkMode ? 'bg-primary-800/20' : 'bg-primary-200/20'} animate-float`}></div>
        <div className={`absolute top-1/2 left-3/4 w-80 h-80 rounded-full ${darkMode ? 'bg-primary-700/20' : 'bg-primary-300/20'} animate-float animate-delay-6000`}></div>
        <div className={`absolute bottom-0 right-0 w-72 h-72 rounded-full ${darkMode ? 'bg-primary-600/20' : 'bg-primary-400/20'} animate-float animate-delay-12000`}></div>
      </div>

      <main className={`rounded-xl shadow-lg p-8 w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <UserIcon className={`w-12 h-12 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
          </div>
        </div>

        <h1 className={`text-2xl font-bold text-center mb-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
          Авторизация
        </h1>
        <p className={`text-center mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`}>
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="input pl-10"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Пароль</label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-primary-400' : 'text-primary-500'}`}>
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="input pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-primary-400' : 'text-primary-500'} focus:outline-none`}
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
            className={`w-full py-3.5 rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:ring-offset-gray-800' 
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 focus:ring-offset-white'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} button-hover`}
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

        <div className={`mt-8 text-sm space-y-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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