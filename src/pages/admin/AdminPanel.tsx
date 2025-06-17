import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Topic } from '../../types/test.types';
import { testAPI } from '../../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsResponse = await testAPI.getTopics();
        setTopics(topicsResponse.data);
        
        if (topicsResponse.data.length > 0) {
          setSelectedTopic(topicsResponse.data[0].id);
        }
      } catch (error) {
        console.error('Ошибка загрузки тем:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { 
      ...updatedOptions[index], 
      [field]: value 
    };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleAddQuestion = async () => {
    if (!selectedTopic || newQuestion.text.trim() === '') {
      alert('Заполните текст вопроса и выберите тему');
      return;
    }
    
    const hasCorrectAnswer = newQuestion.options.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      alert('Должен быть хотя бы один правильный ответ');
      return;
    }
    
    try {
      await testAPI.addQuestion({
        topic_id: selectedTopic,
        text: newQuestion.text,
        explanation: newQuestion.explanation,
        difficulty: newQuestion.difficulty,
        options: newQuestion.options
      });
      
      setNewQuestion({
        text: '',
        explanation: '',
        difficulty: 'medium',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      });
      
      alert('Вопрос успешно добавлен!');
    } catch (error) {
      console.error('Ошибка добавления вопроса:', error);
      alert('Не удалось добавить вопрос');
    }
  };

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-8">
        <h2 className="text-2xl font-bold text-center text-red-500 mb-6">
          Доступ запрещен
        </h2>
        <p className="text-center text-gray-700 dark:text-gray-300">
          У вас недостаточно прав для просмотра этой страницы
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-emerald-700 dark:text-emerald-400">
        Панель администратора
      </h1>
      
      <div className="grid grid-cols-1">
        {/* Левая колонка: Форма добавления вопроса */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-600 dark:text-emerald-300">
            Добавить новый вопрос
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Тема
            </label>
            <select
              value={selectedTopic || ''}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Текст вопроса
            </label>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Введите текст вопроса"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Объяснение (опционально)
            </label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
              rows={2}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Объяснение ответа"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Сложность
            </label>
            <select
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 dark:text-gray-300">Варианты ответов</h3>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                  className="mr-2 h-5 w-5 text-emerald-600"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  placeholder={`Вариант ответа ${index + 1}`}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedOptions = [...newQuestion.options];
                    updatedOptions.splice(index, 1);
                    setNewQuestion({...newQuestion, options: updatedOptions});
                  }}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                if (newQuestion.options.length < 6) {
                  setNewQuestion({
                    ...newQuestion,
                    options: [...newQuestion.options, { text: '', is_correct: false }]
                  });
                }
              }}
              className="mt-2 flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Добавить вариант
            </button>
          </div>
          
          <button
            onClick={handleAddQuestion}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md transition"
          >
            Добавить вопрос
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;