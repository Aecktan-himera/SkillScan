import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  CogIcon, 
  QuestionMarkCircleIcon, 
  TagIcon, 
  UserGroupIcon, 
  ChartPieIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SidebarItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  isActive: (path: string) => boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  to, 
  icon: Icon, 
  text, 
  isActive 
}) => (
  <NavLink
    to={to}
    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive(to)
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
    {text}
  </NavLink>
);

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            <SidebarItem 
              to="/admin/dashboard" 
              icon={ChartPieIcon} 
              text="Статистика" 
              isActive={isActive} 
            />
            
            <SidebarItem 
              to="/admin/questions" 
              icon={QuestionMarkCircleIcon} 
              text="Управление вопросами" 
              isActive={isActive} 
            />
            
            <SidebarItem 
              to="/admin/topics" 
              icon={TagIcon} 
              text="Управление темами" 
              isActive={isActive} 
            />
            
            <SidebarItem 
              to="/admin/users" 
              icon={UserGroupIcon} 
              text="Управление пользователями" 
              isActive={isActive} 
            />
            
            <SidebarItem 
              to="/admin/reports" 
              icon={DocumentTextIcon} 
              text="Отчеты" 
              isActive={isActive} 
            />
            
            <SidebarItem 
              to="/admin/settings" 
              icon={CogIcon} 
              text="Настройки системы" 
              isActive={isActive} 
            />
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Быстрые действия
          </div>
          <div className="space-y-1">
            <NavLink
              to="/admin/questions/new"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <span className="mr-2">+</span> Добавить вопрос
            </NavLink>
            <NavLink
              to="/admin/topics/new"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <span className="mr-2">+</span> Добавить тему
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;