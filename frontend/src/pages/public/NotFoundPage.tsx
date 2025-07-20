
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <ExclamationTriangleIcon className={`h-12 w-12 ${
            darkMode ? 'text-yellow-400' : 'text-yellow-500'
          }`} />
        </div>
        <h1 className={`mt-3 text-4xl font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          404
        </h1>
        <h2 className={`mt-2 text-xl ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Страница не найдена
        </h2>
        <p className={`mt-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;