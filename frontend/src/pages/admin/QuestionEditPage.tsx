import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { QuestionForm } from '../../components/test/QuestionForm';
import { testAPI } from '../../services/api';
import type { Topic } from '../../types/index';

const QuestionEditPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  // Загрузка тем при монтировании
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setIsLoading(true);
        const topicsResponse = await testAPI.getTopics();
        setTopics(topicsResponse);
      } catch (err) {
        setError('Ошибка загрузки тем');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, []);

  // Добавление новой темы
  const handleAddTopic = async () => {
    if (newTopic.trim()) {
      try {
        await testAPI.addTopic({ name: newTopic });
        const topicsResponse = await testAPI.getTopics();
        setTopics(topicsResponse);
        setNewTopic('');
        setIsTopicModalOpen(false);
      } catch (error) {
        console.error('Ошибка добавления темы:', error);
      }
    }
  };

  // Обработчик сохранения вопроса
  const handleAddQuestion = async (formData: {
    topic_id: string;
    text: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }) => {
    // Проверка обязательных полей
    if (!formData.topic_id || formData.text.trim() === '') {
      alert('Заполните текст вопроса и выберите тему');
      return;
    }

    // Фильтрация пустых вариантов
    const validOptions = formData.options.filter(opt => opt.text.trim() !== '');

    // Проверка количества вариантов
    if (validOptions.length < 2) {
      alert('Добавьте хотя бы 2 варианта ответа');
      return;
    }

    // Проверка правильных ответов
    const correctOptions = validOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      alert('Должен быть ровно один правильный ответ');
      return;
    }

    try {
      await testAPI.addQuestion({
        topic_id: Number(formData.topic_id),
        text: formData.text.trim(),
        // explanation необязательное поле - передаем как есть
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        options: validOptions
      });

      // Перенаправление после успешного сохранения
      navigate('/admin/questions');
    } catch (error) {
      console.error('Ошибка добавления вопроса:', error);
      alert('Ошибка при добавлении вопроса. Проверьте данные и повторите попытку.');
    }
  };

  if (isLoading) return <div>Загрузка данных...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Начальные данные для формы
  const initialFormData = {
    topic_id: topics.length > 0 ? topics[0].id.toString() : '',
    text: '',
    explanation: '', // Пустое значение по умолчанию
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold mb-6">Добавить новый вопрос</h2>
      <button
          onClick={() => setIsTopicModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Добавить тему
        </button>
      </div>
      <QuestionForm
        mode="create"
        initialData={initialFormData}
        topics={topics}
        onSave={handleAddQuestion}
        onCancel={() => navigate('/admin/questions')}
        onRequestAddTopic={() => setIsTopicModalOpen(true)}
        // Добавляем текст для кнопки сохранения вопроса
        saveButtonText="Добавить вопрос"/>

      {/* Модальное окно для добавления темы */ }
  <Modal
    isOpen={isTopicModalOpen}
    onClose={() => setIsTopicModalOpen(false)}
    title="Добавить новую тему"
  >
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название темы</label>
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Введите название темы"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsTopicModalOpen(false)}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Отмена
        </button>
        <button
          onClick={handleAddTopic}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Сохранить тему
        </button>
      </div>
    </div>
  </Modal>
    </Card >
  );
};

export default QuestionEditPage;