import  { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Input} from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const AdminQuestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Заглушка для вопросов
  const questions = [
    { id: 1, text: 'Что такое замыкание в JavaScript?', topic: 'JavaScript', difficulty: 'medium', options: 4 },
    { id: 2, text: 'Как создать компонент в React?', topic: 'React', difficulty: 'easy', options: 3 },
    { id: 3, text: 'Разница между let, const и var', topic: 'JavaScript', difficulty: 'easy', options: 4 },
    { id: 4, text: 'Что такое виртуальный DOM?', topic: 'React', difficulty: 'hard', options: 4 },
    { id: 5, text: 'Как работает event loop в JavaScript?', topic: 'JavaScript', difficulty: 'hard', options: 4 },
  ];

  // Фильтрация вопросов по поисковому запросу
  const filteredQuestions = questions.filter(question => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
          Управление вопросами
        </h1>
        <Button>
          <PlusIcon className="w-5 h-5 mr-2" />
          Добавить вопрос
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card className="p-4">
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
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Все темы</option>
              <option>JavaScript</option>
              <option>React</option>
              <option>TypeScript</option>
            </select>
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Любая сложность</option>
              <option>Легкий</option>
              <option>Средний</option>
              <option>Сложный</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Список вопросов */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Вопрос
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тема
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сложность
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Варианты
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{question.text}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{question.topic}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty === 'easy' ? 'Легкий' : 
                       question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {question.options}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
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
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Назад
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Вперед
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">1</span> - <span className="font-medium">5</span> из{' '}
                <span className="font-medium">{questions.length}</span> вопросов
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Назад</span>
                  &larr;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Вперед</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminQuestions;