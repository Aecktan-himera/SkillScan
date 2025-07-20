import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { testAPI } from '../../services/api';
import type { Topic } from '../../types/index';

const TopicEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTopic = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (id) {
          // Преобразуем id в число
          const topic_id = parseInt(id, 10);
          if (isNaN(topic_id)) {
            setError('Неверный ID темы');
            return;
          }
          
          const response = await testAPI.getTopicById(topic_id);
          setTopic(response.data);
        } else {
          setTopic({
            id: 0,
            name: '',
            // Описание необязательно - оставляем пустым
            description: '' 
          });
        }
      } catch (err) {
        setError('Ошибка загрузки темы');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTopic();
  }, [id]);

  const handleSave = async () => {
    if (!topic || !topic.name.trim()) {
      setError('Название темы обязательно');
      return;
    }
    
    try {
      if (id) {
        const topic_id = parseInt(id, 10);
        if (isNaN(topic_id)) {
          setError('Неверный ID темы');
          return;
        }
        
        // Отправляем описание как есть (может быть пустой строкой)
        await testAPI.updateTopic(topic_id, { 
          name: topic.name, 
          description: topic.description 
        });
      } else {
        const topicData = {
          name: topic.name,
          // Описание необязательно - отправляем как есть
          description: topic.description 
        };
        
        const response = await testAPI.addTopic(topicData);
        setTopic(response.data);
      }
      navigate('/admin/topics');
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Ошибка сохранения темы');
    }
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!topic) return <div>Тема не найдена</div>;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {id ? `Редактирование темы #${id}` : 'Создание новой темы'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Название темы *
          </label>
          <Input
            type="text"
            value={topic.name}
            onChange={e => setTopic({...topic, name: e.target.value})}
            className="w-full"
            placeholder="Введите название темы"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Описание
          </label>
          <textarea
            value={topic.description || ''}
            onChange={e => setTopic({...topic, description: e.target.value})}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Добавьте описание темы"
          />
        </div>
        
        {error && (
          <div className="text-red-500 mt-2">{error}</div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            onClick={() => navigate('/admin/topics')}
            variant="secondary"
          >
            Отмена
          </Button>
          <Button onClick={handleSave}>
            {id ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TopicEditPage;