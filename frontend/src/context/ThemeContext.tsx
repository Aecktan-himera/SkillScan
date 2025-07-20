import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode, FC } from 'react';
import { useAuth } from '../context/AuthContext'; // Добавляем импорт AuthContext

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { user, updateUserSettings } = useAuth(); // Получаем пользователя и метод обновления настроек

  // Инициализация темы при загрузке и при изменении пользователя
  useEffect(() => {
    if (user) {
      // Приоритет: настройки пользователя из бэкенда
      const userDarkMode = user.settings.darkMode;
      setDarkMode(userDarkMode);
      localStorage.setItem('darkMode', String(userDarkMode));
      updateDocumentClass(userDarkMode);
    } else {
      // Для гостя: локальные настройки или системные
      const localDarkMode = localStorage.getItem('darkMode');
      const isDark = localDarkMode !== null 
        ? localDarkMode === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setDarkMode(isDark);
      localStorage.setItem('darkMode', String(isDark));
      updateDocumentClass(isDark);
    }
  }, [user]);

  const updateDocumentClass = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    const newMode = !darkMode;
    
    // Мгновенное локальное обновление
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    updateDocumentClass(newMode);

    // Синхронизация с бэкендом для авторизованных пользователей
    if (user) {
      try {
        await updateUserSettings({ darkMode: newMode });
      } catch (error) {
        console.error('Ошибка синхронизации темы с сервером', error);
        // Откат при ошибке
        setDarkMode(!newMode);
        localStorage.setItem('darkMode', String(!newMode));
        updateDocumentClass(!newMode);
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};