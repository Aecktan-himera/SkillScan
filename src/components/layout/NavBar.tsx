import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  HomeIcon, 
  UserIcon, 
  SunIcon, 
  MoonIcon, 
  ChartBarIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Обновленный интерфейс пользователя
interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin'; // Добавляем поле role
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 shadow-md transition-all duration-300 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Логотип и основные ссылки */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <AcademicCapIcon className={`h-8 w-8 mr-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className="text-xl font-bold">TestMaster</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? darkMode 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
                }`}
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Главная
              </Link>
              
              <Link 
                to="/topics" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/topics') 
                    ? darkMode 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookOpenIcon className="h-5 w-5 mr-1" />
                Темы тестов
              </Link>
              
              {user && (user as AppUser).role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-md ${
                    darkMode 
                      ? 'bg-emerald-700 text-white hover:bg-emerald-600' 
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  } transition`}
                >
                  Админ-панель
                </Link>
              )}

              {user && (
                <Link 
                  to="/history" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/history') 
                      ? darkMode 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-emerald-600 text-emerald-700'
                      : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-1" />
                  История тестов
                </Link>
              )}
              
              {user && (user as AppUser).role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/admin') 
                      ? darkMode 
                        ? 'border-emerald-500 text-emerald-400' 
                        : 'border-emerald-600 text-emerald-700'
                      : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CogIcon className="h-5 w-5 mr-1" />
                  Администрирование
                </Link>
              )}
            </div>
          </div>
          
          {/* Правая часть: Профиль и настройки */}
          <div className="flex items-center">
            {/* Переключение темы */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full mr-3 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition`}
              aria-label={darkMode ? "Переключить на светлую тему" : "Переключить на темную тему"}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-700" />
              )}
            </button>
            
            {/* Профиль пользователя */}
            {user ? (
              <div className="ml-4 relative flex items-center group">
                <button className="flex text-sm rounded-full focus:outline-none">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-emerald-700' : 'bg-emerald-100'
                  }`}>
                    <UserIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                </button>
                
                {/* Выпадающее меню профиля */}
                <div className={`origin-top-right absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className={`block px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Настройки профиля
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Выйти
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    darkMode 
                      ? 'text-emerald-300 hover:text-emerald-200' 
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  Войти
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    darkMode 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      <div className="md:hidden">
        <div className={`pt-2 pb-3 space-y-1 px-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <Link 
            to="/" 
            className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? darkMode 
                  ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                  : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-transparent hover:border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Главная
          </Link>
          
          <Link 
            to="/topics" 
            className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/topics') 
                ? darkMode 
                  ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                  : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-transparent hover:border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Темы тестов
          </Link>
          
          {user && (
            <Link 
              to="/history" 
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/history') 
                  ? darkMode 
                    ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                    : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-transparent hover:border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              История тестов
            </Link>
          )}
          
          {user && (user as AppUser).role === 'admin' && (
            <Link 
              to="/admin" 
              className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/admin') 
                  ? darkMode 
                    ? 'border-emerald-500 bg-emerald-900/20 text-emerald-300' 
                    : 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-transparent hover:border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Администрирование
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;