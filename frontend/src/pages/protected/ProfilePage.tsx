import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { 
  UserIcon, 
  CogIcon, 
  ShieldCheckIcon, 
} from '@heroicons/react/24/outline';
import { userAPI } from '../../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats'>('profile');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'stats') {
      loadUserStats();
    }
  }, [activeTab]);

  const loadUserStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      const testHistory = response.data.data; // Получаем массив истории тестов
      
      // Вычисляем статистику на основе истории тестов
      const totalTests = testHistory.length;
      
      // Вычисляем средний балл (в процентах)
      const averageScore = totalTests > 0 
        ? testHistory.reduce(
            (sum: number, test: any) => sum + test.score, 
            0
          ) / totalTests
        : 0;
      
      // Группируем статистику по темам
      const topicsStats: Record<string, { count: number; totalScore: number; average: number }> = {};
      
      testHistory.forEach((test: any) => {
        const topicName = test.topic.name;
        
        if (!topicsStats[topicName]) {
          topicsStats[topicName] = {
            count: 0,
            totalScore: 0,
            average: 0
          };
        }
        
        topicsStats[topicName].count++;
        topicsStats[topicName].totalScore += test.score;
      });
      
      // Рассчитываем средний балл для каждой темы
      Object.keys(topicsStats).forEach(topic => {
        topicsStats[topic].average = topicsStats[topic].totalScore / topicsStats[topic].count;
      });
      
      setStats({
        totalTests,
        averageScore,
        topics: topicsStats
      });
    } catch (error) {
      setErrors({ form: 'Ошибка загрузки статистики' });
    }
  };

  const renderStatsTab = () => (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Статистика тестирования</h2>
      {stats ? (
        <div>
          <p className="mb-2">
            <strong>Всего тестов:</strong> {stats.totalTests}
          </p>
          <p className="mb-4">
            <strong>Средний балл:</strong> 
            {stats.averageScore ? stats.averageScore.toFixed(2) : '0.00'}%
          </p>
          
          <h3 className="font-medium text-lg mb-3">Статистика по темам:</h3>
          <div className="space-y-4">
            {Object.entries(stats.topics).map(([topic, data]: any) => (
              <div key={topic} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-emerald-600">{topic}</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <span>Тестов:</span>
                  <span className="font-medium">{data.count}</span>
                  <span>Средний балл:</span>
                  <span className="font-medium">
                    {data.average.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Загрузка статистики...</p>
      )}
    </Card>
  );

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Имя пользователя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Некорректный email';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Текущий пароль обязателен';
    if (!passwordData.newPassword) newErrors.newPassword = 'Новый пароль обязателен';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Минимум 6 символов';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try { 
      const response = await userAPI.updateProfile({
        username: formData.username,
        email: formData.email
      });
      
      // Исправляем получение данных пользователя
      const updatedUser = response.data.data.user;
      
      if (updateUser) {
        await updateUser(updatedUser);
      }
      setSuccess('Профиль успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setErrors({ form: 'Ошибка при обновлении профиля' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await userAPI.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword // Добавлено
    });

      setSuccess('Пароль успешно изменен');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setErrors({ form: 'Ошибка при изменении пароля' });
    }
  };

  /*const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      try {
        await userAPI.deleteAccount();
        logout();
      } catch (err) {
        setErrors({ form: 'Ошибка при удалении аккаунта' });
      }
    }
  };*/

  const handleThemeToggle = () => {
    toggleTheme();
    // Сохраняем настройки темы на сервере
    userAPI.updateSettings({
      darkMode: !darkMode,
      testTimer: user?.settings.testTimer || 30
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <UserIcon className="w-6 h-6 mr-2" />
        Профиль пользователя
      </h1>

      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'profile' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Профиль
        </button>
        <button
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'security' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheckIcon className="w-5 h-5 mr-2" />
          Безопасность
        </button>
         {/*<button
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'stats' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stats')}
        >
         <ChartBarIcon className="w-5 h-5 mr-2" />
          Статистика
        </button>*/}
      </div>

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{success}</p>
        </div>
      )}

      {errors.form && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{errors.form}</p>
        </div>
      )}

      {activeTab === 'stats' ? renderStatsTab() : (
        activeTab === 'profile' ? (
          <Card className="p-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Имя пользователя"
                  name="username"
                  value={formData.username}
                  onChange={handleProfileChange}
                  error={errors.username}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  error={errors.email}
                  required
                />
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={darkMode}
                  onChange={handleThemeToggle}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Темная тема
                </label>
              </div>

              <Button type="submit">
                <CogIcon className="w-5 h-5 mr-2" />
                Сохранить изменения
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Текущий пароль"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={errors.currentPassword}
                required
              />
              <Input
                label="Новый пароль"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={errors.newPassword}
                required
              />
              <Input
                label="Подтвердите новый пароль"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={errors.confirmPassword}
                required
              />

              <Button type="submit" className="w-full">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Изменить пароль
              </Button>
            </form>

            {/*<div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600 mb-3 flex items-center">
                <TrashIcon className="w-5 h-5 mr-2" />
                Удаление аккаунта
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Удаление аккаунта приведет к безвозвратной потере всех ваших данных. 
                Это действие нельзя отменить.
              </p>
              <Button 
                variant="danger"
                onClick={handleDeleteAccount}
                className="w-full"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Удалить аккаунт
              </Button>
            </div>*/}
          </Card>
        )
      )}
    </div>
  );
};

export default ProfilePage;