import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { User } from '../../types/index';
import { adminUsersAPI } from '../../services/api';
import {
  UserIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckCircleIcon,
  PlusIcon,
  NoSymbolIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../../components/common/Loader';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });
  const { darkMode } = useTheme();

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await adminUsersAPI.getUsers();
        setUsers(usersData);
      } catch (err: any) {
        if (err.message.includes("Сервер не отвечает")) {
          setError("Ошибка сети: невозможно подключиться к серверу");
        } else {
          setError(err.response?.data?.error?.message || 'Ошибка загрузки пользователей');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Фильтрация пользователей
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Функции для стилей
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Валидация email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Добавление пользователя
  const handleAddUser = async () => {
    // Сброс ошибок
    setError('');

    // Валидация
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (newUser.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!isValidEmail(newUser.email)) {
      setError('Некорректный формат email');
      return;
    }

    try {
      const createdUser = await adminUsersAPI.createUser(newUser);
      setUsers([...users, createdUser]);
      setIsAddModalOpen(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка создания пользователя');
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await adminUsersAPI.deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Ошибка удаления пользователя');
      }
    }
  };

  // Блокировка/разблокировка
  const handleToggleStatus = async (id: number) => {
    try {
      // Исправлено: используем результат вызова API
      const updatedUser = await adminUsersAPI.toggleUserStatus(id);
      setUsers(users.map(user =>
        user.id === id ? updatedUser : user
      ));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка изменения статуса');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Модальное окно для добавления пользователя */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setError('');
        }}
        title="Добавить пользователя"
      >
        {error && (
          <div className="flex items-center text-red-500 mb-4 p-2 bg-red-50 rounded-md">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Имя пользователя"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            minLength={3}
            maxLength={30}
            required
          />

          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <Input
            label="Пароль"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            minLength={6}
            required
          />

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({
                ...newUser,
                role: e.target.value as 'user' | 'admin'
              })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddModalOpen(false);
              setError('');
            }}
          >
            Отмена
          </Button>
          <Button onClick={handleAddUser}>Добавить</Button>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <UserIcon className="w-6 h-6 mr-2" />
          Управление пользователями
        </h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Отображение ошибок */}
      {error && (
        <div className="flex items-center bg-red-100 text-red-700 p-4 rounded-md">
          <ExclamationCircleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Поиск */}
      <Card className="p-4">
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Поиск пользователей по имени или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Список пользователей */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Пользователь
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Email
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Роль
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Статус
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Дата регистрации
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              darkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'
            }`}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'Активен' : 'Заблокирован'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`mr-3 ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={user.isActive ? "Заблокировать" : "Активировать"}
                    >
                      {user.isActive ?
                        <NoSymbolIcon className="w-5 h-5" /> :
                        <CheckCircleIcon className="w-5 h-5" />
                      }
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Удалить"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Пользователи не найдены
          </div>
        )}

        {/* Пагинация */}
        {filteredUsers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Показано <span className="font-medium">1</span> - <span className="font-medium">{filteredUsers.length}</span> из{' '}
                  <span className="font-medium">{filteredUsers.length}</span> пользователей
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;