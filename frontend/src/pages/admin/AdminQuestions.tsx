import { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { testAPI } from '../../services/api';
import type { Question, Topic } from '../../types/index';


interface QuestionsState {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
}

const AdminQuestions = () => {
  const [notifications, setNotifications] = useState<{id: number; message: string; type: 'success' | 'error'}[]>([]);
  //const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [questionsState, setQuestionsState] = useState<QuestionsState>({
    questions: [],
    total: 0,
    page: 1,
    limit: 10
  });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Состояния для редактирования вопроса
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editFormData, setEditFormData] = useState({
    text: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    topic_id: '',
    options: [] as Array<{ text: string; isCorrect: boolean }>
  });

// Добавление уведомления
  const showNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Автоматическое закрытие через 3 секунды
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };


  // Состояние для нового вопроса
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  // Инициализация темы формы
  const [formTopic, setFormTopic] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Загрузка всех тем
        const topicsResponse = await testAPI.getTopics();
        setTopics(topicsResponse);

        // Загрузка всех вопросов
        const questionsResponse = await testAPI.getAllQuestions({
          limit: 100,
          page: 1
        });
        setAllQuestions(questionsResponse.data.data);

        // Установка первой темы по умолчанию
        if (topicsResponse.length > 0) {
          setFormTopic(topicsResponse[0].id.toString());
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Применение фильтров и пагинации
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allQuestions, filterTopic, selectedDifficulty, searchTerm, questionsState.page]);

  // Фильтрация и пагинация вопросов
  const applyFiltersAndPagination = () => {
    let filtered = [...allQuestions];

    // Фильтрация по теме
    if (filterTopic !== 'all') {
      filtered = filtered.filter(q =>
        q.topic?.id === Number(filterTopic)
      );
    }

    // Фильтрация по сложности
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q =>
        q.difficulty === selectedDifficulty
      );
    }

    // Поиск по тексту вопроса или теме
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.text.toLowerCase().includes(term) ||
        (q.topic?.name && q.topic.name.toLowerCase().includes(term))
      );
    }

    // Пагинация
    const total = filtered.length;
    const startIndex = (questionsState.page - 1) * questionsState.limit;
    const paginated = filtered.slice(startIndex, startIndex + questionsState.limit);

    setQuestionsState(prev => ({
      ...prev,
      questions: paginated,
      total
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuestionsState(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить вопрос?')) {
      try {
        await testAPI.deleteQuestion(id);
        // Обновляем список вопросов
        reloadQuestions();
        showNotification('Вопрос успешно удалён', 'success');
      } catch (err) {
        console.error('Ошибка удаления:', err);
        showNotification('Ошибка при обновлении вопроса', 'error');
      }
    }
  };

  // Функция для открытия модального окна редактирования
  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setEditFormData({
      text: question.text,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      topic_id: question.topic?.id?.toString() || '',
      options: question.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    });
    setIsEditModalOpen(true);
  };

  // Функция для сохранения изменений
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // Валидация данных
    if (!editFormData.text.trim()) {
      showNotification('Текст вопроса обязателен', 'error');
      return;
    }

    const validOptions = editFormData.options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      showNotification('Нужно хотя бы 2 варианта ответа', 'error');
    }

    const correctCount = validOptions.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      showNotification('Должен быть ровно один правильный ответ', 'error');
    
      return;
    }

    try {
      // Отправка PATCH-запроса
      await testAPI.changeQuestion(editingQuestion.id, {
        text: editFormData.text,
        explanation: editFormData.explanation,
        difficulty: editFormData.difficulty,
        topic_id: Number(editFormData.topic_id),
        options: validOptions as any
      });

      // Обновление UI
      reloadQuestions();
      setIsEditModalOpen(false);
      showNotification('Вопрос успешно обновлён', 'success');
    } catch (error) {
      showNotification('Ошибка при обновлении вопроса', 'error');
    }
  };

  // Обработчики изменений для формы редактирования
  const handleEditChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...editFormData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setEditFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  // Перезагрузка вопросов после изменений
  const reloadQuestions = async () => {
    try {
      const response = await testAPI.getAllQuestions({
        limit: 100,
        page: 1
      });
      setAllQuestions(response.data.data);
    } catch (err) {
      
      showNotification('Ошибка загрузки вопросов', 'error');
      
    }
  };

  // Обработчик изменений для вариантов ответов
  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Добавление новой темы
  const handleAddTopic = async () => {
    if (newTopic.trim()) {
      try {
        await testAPI.addTopic({ name: newTopic });
        // Обновление списка тем
        const topicsResponse = await testAPI.getTopics();
        setTopics(topicsResponse);

        // Установка новой темы как выбранной
        if (topicsResponse.length > 0) {
          setFormTopic(topicsResponse[topicsResponse.length - 1].id.toString());
        }

        setNewTopic('');
        setIsTopicModalOpen(false);
        showNotification('Тема успешно добавлена', 'success');
      } catch (error) {
        showNotification('Ошибка при добавлении темы', 'error');
        
      }
    }
  };

  // Добавление нового вопроса
  const handleAddQuestion = async () => {
    if (!formTopic || newQuestion.text.trim() === '') {
      showNotification('Заполните текст вопроса и выберите тему', 'error');
      return;
    }

    // Проверка вариантов ответа
    const validOptions = newQuestion.options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      showNotification('Добавьте хотя бы 2 варианта ответа', 'error');
      return;
    }

    // Проверка правильных ответов
    const correctOptions = validOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      showNotification('Должен быть ровно один правильный ответ', 'error');
      return;
    }

    try {
      await testAPI.addQuestion({
        topic_id: Number(formTopic),
        text: newQuestion.text.trim(),
        explanation: newQuestion.explanation.trim(),
        difficulty: newQuestion.difficulty,
        options: validOptions
      });

      // Обновление списка вопросов
      await reloadQuestions();

      // Сброс формы
      setNewQuestion({
        text: '',
        explanation: '',
        difficulty: 'medium',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      });

      setShowForm(false);
      showNotification('Вопрос успешно добавлен', 'success');
    } catch (error) {
      showNotification('Ошибка при добавлении вопроса', 'error');
    }
  };

  if (isLoading) return <div>Загрузка вопросов...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 relative dark:bg-gray-900 dark:text-gray-100">
      {/* Компонент уведомлений */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(({id, message, type}) => (
        <div 
          key={id}
          className={`p-4 rounded-md shadow-lg flex items-center ${
            type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'
          }`}
          >
            <div className="flex-1">{message}</div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold flex items-center dark:text-white">
          <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
          Управление вопросами
        </h1>

        {showForm ? (
          <Button onClick={() => setShowForm(false)}>
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к списку
          </Button>
        ) : (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Добавить вопрос
          </Button>
        )}
      </div>

      {showForm ? (
        // Форма добавления вопроса
        <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Добавить новый вопрос</h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Тема</label>
              <div className="flex gap-2">
                {topics.length === 0 ? (
                  <p className="text-red-500">Сначала создайте тему</p>
                ) : (
                  <>
                    <select
                      value={formTopic}
                      onChange={(e) => setFormTopic(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id.toString()}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={() => setIsTopicModalOpen(true)}>
                      <PlusIcon className="w-4 h-4 mr-1" /> Новая тема
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Текст вопроса</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Введите текст вопроса"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Объяснение
              </label>
              <textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                rows={2}
                placeholder="Объяснение ответа"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сложность</label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="easy">Легкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Варианты ответов</h3>
              {newQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
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
                      setNewQuestion({ ...newQuestion, options: updatedOptions });
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
                      options: [...newQuestion.options, { text: '', isCorrect: false }]
                    });
                  }
                }}
                className="mt-2 flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
              >
                <PlusIcon className="w-4 h-4 mr-1" /> Добавить вариант
              </button>
            </div>

            <Button onClick={handleAddQuestion} className="w-full py-3">
              Сохранить вопрос
            </Button>
          </div>
        </Card>
      ) : (
        // Список вопросов
        <>
          {/* Поиск и фильтры */}
          <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                  placeholder="Поиск вопросов по тексту или теме..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Все темы</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id.toString()}>
                      {topic.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Любая сложность</option>
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Список вопросов */}
           <Card className="p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-300">
                      Вопрос
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тема
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сложность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Варианты
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {questionsState.questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 dark:text-gray-300">
                      <div className="text-sm font-medium dark:text-white">
                        {question.text}
                      </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {question.topic?.name || 'Без темы'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty === 'easy' ? 'Легкий' :
                            question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {question.options.length}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(question)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Показано <span className="font-medium">{(questionsState.page - 1) * questionsState.limit + 1}</span> -{' '}
                    <span className="font-medium">
                      {Math.min(questionsState.page * questionsState.limit, questionsState.total)}
                    </span> из{' '}
                    <span className="font-medium">{questionsState.total}</span> вопросов
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    disabled={questionsState.page === 1}
                    onClick={() => handlePageChange(questionsState.page - 1)}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    Назад
                  </Button>
                  <Button
                    disabled={questionsState.page * questionsState.limit >= questionsState.total}
                    onClick={() => handlePageChange(questionsState.page + 1)}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Модальное окно для добавления темы */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Добавить новую тему"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название темы</label>
            <Input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Введите название темы"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsTopicModalOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleAddTopic}>
              Сохранить тему
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно для редактирования вопроса */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать вопрос"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Тема</label>
            <div className="flex gap-2">
              <select
                value={editFormData.topic_id}
                onChange={(e) => handleEditChange('topic_id', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
              >
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <Button onClick={() => setIsTopicModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" /> Новая тема
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Текст вопроса</label>
            <textarea
              value={editFormData.text}
              onChange={(e) => handleEditChange('text', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Объяснение</label>
            <textarea
              value={editFormData.explanation}
              onChange={(e) => handleEditChange('explanation', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Сложность</label>
            <select
              value={editFormData.difficulty}
              onChange={(e) => handleEditChange('difficulty', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Варианты ответов</h3>
            {editFormData.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  className="mr-2 h-5 w-5 text-emerald-600"
                  disabled // Чекбокс правильности отключен
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleEditOptionChange(index, 'text', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedOptions = [...editFormData.options];
                    updatedOptions.splice(index, 1);
                    setEditFormData(prev => ({ ...prev, options: updatedOptions }));
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
                if (editFormData.options.length < 6) {
                  setEditFormData(prev => ({
                    ...prev,
                    options: [...prev.options, { text: '', isCorrect: false }]
                  }));
                }
              }}
              className="mt-2 flex items-center text-emerald-600 hover:text-emerald-800"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Добавить вариант
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleUpdateQuestion}>
              Сохранить изменения
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuestions;