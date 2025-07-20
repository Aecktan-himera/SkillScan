import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { Topic } from '../../types/index';
import { testAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';


type AdminTopicsProps = {
  mode?: 'default' | 'create';
};

const AdminTopics = ({ mode = 'default' }: AdminTopicsProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null); // Добавлен useRef
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editName, setEditName] = useState('');

  // Загрузка тем при монтировании компонента
  useEffect(() => {
    fetchTopics();
  }, []);

  // Автофокус на поле при создании
  useEffect(() => {
    if (mode === 'create' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await testAPI.getTopics();
      setTopics(response);
    } catch (err) {
      setError('Ошибка загрузки тем');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim()) {
      setError('Введите название темы');
      return;
    }

    // Проверка на уникальность темы
    const topicExists = topics.some(
      topic => topic.name.toLowerCase() === newTopic.trim().toLowerCase()
    );

    if (topicExists) {
      setError('Тема с таким названием уже существует');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await testAPI.addTopic({ name: newTopic.trim() });

      setTopics(prevTopics => [...prevTopics, response.data]);
      setNewTopic('');

      if (mode === 'create') {
        navigate('/admin/topics');
      }
    } catch (err: any) {
      let errorMessage = 'Ошибка при добавлении темы';

      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = 'Некорректные данные темы';
        } else if (err.response.status === 409) {
          errorMessage = 'Тема с таким названием уже существует';
        } else {
          errorMessage = `Ошибка сервера: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'Нет ответа от сервера';
      }

      setError(errorMessage);
      console.error('Ошибка добавления темы:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!window.confirm('Удалить тему? Все связанные вопросы также будут удалены!')) return;

    try {
      setLoading(true);
      await testAPI.deleteTopic(id);
      await fetchTopics();
    } catch (err) {
      setError('Ошибка при удалении темы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

// Открытие модального окна для редактирования темы
  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setEditName(topic.name);
    setIsEditModalOpen(true);
    setError('');
  };

  // Сохранение изменений темы
  const handleSaveTopic = async () => {
    if (!editingTopic || !editName.trim()) {
      setError('Название темы не может быть пустым');
      return;
    }

    // Проверка на уникальность (исключая текущую тему)
    const topicExists = topics.some(
      t => t.id !== editingTopic.id && 
           t.name.toLowerCase() === editName.trim().toLowerCase()
    );
    
    if (topicExists) {
      setError('Тема с таким названием уже существует');
      return;
    }

    try {
      setLoading(true);
      await testAPI.changeTopic(editingTopic.id, { name: editName.trim() });
      await fetchTopics(); // Обновляем список тем
      setIsEditModalOpen(false);
      setError('');
    } catch (err: any) {
      let errorMessage = 'Ошибка при обновлении темы';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = 'Некорректные данные';
        } else if (err.response.status === 409) {
          errorMessage = 'Тема с таким названием уже существует';
        } else {
          errorMessage = `Ошибка сервера: ${err.response.status}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {mode === 'create' ? 'Добавление новой темы' : 'Управление темами'}
        </h2>
        
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newTopic}
            onChange={(e) => {
              setNewTopic(e.target.value);
              setError('');
            }}
            placeholder="Новая тема"
            className={`px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white ${
              error ? 'border-red-500' : ''
            }`}
            disabled={loading}
          />
          <Button onClick={handleAddTopic} disabled={loading}>
            <PlusIcon className="h-5 w-5 mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Скрываем список тем в режиме создания */}
      {mode !== 'create' && (
        <>
          {loading ? (
            <div className="text-center py-4">Загрузка...</div>
          ) : (
            <div className="space-y-3">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <span>{topic.name}</span>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-blue-500 hover:text-blue-700"
                      onClick={() => openEditModal(topic)}
                      disabled={loading}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteTopic(topic.id)}
                      disabled={loading}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Модальное окно для редактирования темы */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Редактирование темы"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Название темы"
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSaveTopic}
              disabled={loading}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default AdminTopics;