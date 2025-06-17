import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { UserIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

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
      // В реальном приложении здесь будет вызов API
      if (updateUser) {
        await updateUser(formData);
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
      // В реальном приложении здесь будет вызов API
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <UserIcon className="w-6 h-6 mr-2" />
        Профиль пользователя
      </h1>

      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'profile' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon className="w-5 h-5 inline mr-2" />
          Профиль
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'security' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('security')}
        >
          <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
          Безопасность
        </button>
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

      {activeTab === 'profile' ? (
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
                onChange={toggleTheme}
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
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 mb-6">
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
            </div>

            <Button type="submit">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Изменить пароль
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;