import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const { darkMode } = useTheme();
  if (location.pathname === '/') return null;
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-white"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Главная
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = value.charAt(0).toUpperCase() + value.slice(1);

          return last ? (
            <li key={to} aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 text-gray-400">/</span>
                <span className={`ml-1 text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                  {name}
                </span>
              </div>
            </li>
          ) : (
            <li key={to}>
              <div className="flex items-center">
                <span className="mx-1 text-gray-400">/</span>
                <Link
                  to={to}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-white"
                >
                  {name}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;