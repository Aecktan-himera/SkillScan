import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../components/common/Card';
import {
  UserGroupIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { adminStatsAPI, testAPI } from '../../services/api';
import { AdminStats, TestHistoryItem, AnswerStats } from '../../types/index';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Добавлен импорт

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [answerStats, setAnswerStats] = useState<AnswerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workbookRef = useRef<ExcelJS.Workbook | null>(null);

  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testDetails, setTestDetails] = useState<TestHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Получаем текущую тему

  // Редирект для не-админов
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/topics');
    }
  }, [user, navigate]);

  // Функция для подготовки Excel-книги
  const prepareExcelWorkbook = useCallback((data: TestHistoryItem[]): ExcelJS.Workbook => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('История тестов');

    // Заголовки столбцов
    worksheet.columns = [
      { header: 'Пользователь', key: 'user', width: 25 },
      { header: 'Тема', key: 'topic', width: 25 },
      { header: 'Дата прохождения', key: 'date', width: 15 },
      { header: 'Время прохождения (мин:сек)', key: 'duration', width: 20 },
      { header: 'Результат (%)', key: 'result', width: 15 }
    ];

    // Стиль для заголовков
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Добавление данных
    data.forEach(test => {
      const row = worksheet.addRow({
        user: test.user.username,
        topic: test.topic ? test.topic.name : 'Без темы',
        date: new Date(test.completedAt).toLocaleDateString(),
        duration: `${Math.floor(test.timeSpent / 60)}:${(test.timeSpent % 60).toString().padStart(2, '0')}`,
        result: test.score
      });

      // Цвет для результата
      const resultCell = row.getCell('result');
      if (test.score > 80) {
        resultCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        };
      } else if (test.score > 60) {
        resultCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB9C' }
        };
      } else {
        resultCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' }
        };
      }
    });

    // Заморозка заголовка
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    return workbook;
  }, []);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные напрямую
        const statsData = await adminStatsAPI.getStats();
        setStats(statsData);

        const historyData = await adminStatsAPI.getTestHistory();

        const transformedHistory = historyData.map(item => ({
          ...item,
          topic: item.topic ? {
            ...item.topic,
            id: item.topic.id.toString()
          } : null,
          completedAt: new Date(item.completedAt).toISOString()
        }));

        setTestHistory(transformedHistory);

        const answerStatsData = await adminStatsAPI.getAnswerStats();
        setAnswerStats(answerStatsData);

        const workbook = prepareExcelWorkbook(transformedHistory);
        workbookRef.current = workbook;

      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prepareExcelWorkbook]);

  // Функция для выгрузки в Excel
  const handleExport = useCallback(async () => {
    // Проверка наличия данных
    if (!testHistory.length) {
      setError('Нет данных для экспорта');
      return;
    }

    if (!workbookRef.current) {
      console.error('Workbook not prepared');
      return;
    }

    try {
      const buffer = await workbookRef.current.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, `История_тестов_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err);
      setError('Произошла ошибка при экспорте данных');
    }
  }, [testHistory]);

  // Функция для загрузки деталей теста
  const loadTestDetails = useCallback(async (testId: number) => {
    setLoadingDetails(true);
    try {
      const details = await testAPI.getTestDetails(testId);
      setTestDetails(details);
    } catch (err) {
      console.error('Ошибка загрузки деталей теста:', err);
      setError('Произошла ошибка при загрузке деталей теста');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Обработчик открытия деталей теста
  const handleOpenTestDetails = useCallback((testId: number) => {
    setSelectedTestId(testId);
    setIsModalOpen(true);
    loadTestDetails(testId);
  }, [loadTestDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-center p-4 rounded-lg ${
        darkMode ? 'bg-red-900/30' : 'bg-red-50'
      }`}>
        {error}
        <button
          className={`mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'} hover:underline`}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
     <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Админ-панель: Статистика
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.id} 
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                darkMode 
                  ? 'bg-emerald-400/10 text-emerald-400' 
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {stat.id === 1 && <UserGroupIcon className="h-6 w-6" />}
                {stat.id === 2 && <QuestionMarkCircleIcon className="h-6 w-6" />}
                {stat.id === 3 && <AcademicCapIcon className="h-6 w-6" />}
                {stat.id === 4 && <ChartBarIcon className="h-6 w-6" />}
              </div>
              <div className="ml-4">
                <h3 className={`text-sm font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.name}
                </h3>
                <p className={`text-2xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* История тестов */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            История тестов
          </h2>
          <button
            onClick={handleExport}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
              darkMode 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Выгрузить в Excel</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Пользователь
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Тема
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Дата прохождения
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Время прохождения
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Результат
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Действия
                </th>
              </tr>
            </thead>
             <tbody className={`divide-y ${
              darkMode ? 'divide-gray-700 bg-gray-900' : 'divide-gray-200 bg-white'
            }`}>
              {testHistory.map((test) => (
                <tr 
                  key={test.id} 
                  className={darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {test.user.username}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {test.topic ? test.topic.name : 'Без темы'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {new Date(test.completedAt).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {Math.floor(test.timeSpent / 60)} мин {test.timeSpent % 60} сек
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${test.score > 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        test.score > 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {test.score}%
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <button
                      onClick={() => handleOpenTestDetails(test.id)}
                      className="flex items-center hover:underline"
                    >
                      <DocumentMagnifyingGlassIcon className="h-4 w-4 mr-1" />
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Статистика ответов */}
      {answerStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Общая статистика */}
          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : ''}`}>
              Общая статистика ответов
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64">
                {/* Правильные ответы - зеленый сегмент */}
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: `conic-gradient(
                      green 0 ${answerStats.overall.correct * 3.6}deg,
                      red ${answerStats.overall.correct * 3.6}deg 360deg
                    )`
                  }}
                ></div>

                {/* Белый круг по центру */}
                <div className="absolute inset-0 rounded-full"
                  style={{
                    width: '60%',
                    height: '60%',
                    top: '20%',
                    left: '20%',
                    backgroundColor: darkMode ? '#1f2937' : '#fff'
                  }}>
                </div>

                {/* Центральный текст */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>
                      {answerStats.overall.correct}%
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      правильных
                    </div>
                  </div>
                </div>
              </div>

              {/* Легенда - вынесена из круга */}
              <div className="flex mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                    Правильные: {answerStats.overall.correct}%
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                    Неправильные: {answerStats.overall.incorrect}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Статистика по темам */}
          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : ''}`}>
              Статистика по темам
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {answerStats.byTopic.map((topicStat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : ''}`}>
                    {topicStat.topic}
                  </h3>
                  <div className="relative w-32 h-32">
                    {/* Сегменты для темы */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(
                          green 0 ${topicStat.correct * 3.6}deg,
                          red ${topicStat.correct * 3.6}deg 360deg
                        )`
                      }}
                    ></div>

                    {/* Центральный белый круг */}
                    <div className="absolute inset-0 rounded-full"
                      style={{
                        width: '60%',
                        height: '60%',
                        top: '20%',
                        left: '20%',
                        backgroundColor: darkMode ? '#1f2937' : '#fff'
                      }}>
                    </div>

                    {/* Центральный процент */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : ''}`}>
                        {topicStat.correct}%
                      </div>
                    </div>
                  </div>

                  {/* Легенда для темы */}
                  <div className={`mt-2 text-center ${darkMode ? 'text-gray-300' : ''}`}>
                    <div className="flex justify-center mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs">
                        Правильные: {topicStat.correct}%
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-xs">
                        Неправильные: {topicStat.incorrect}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно с деталями теста */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Детали теста #${selectedTestId}`}
      >
        {loadingDetails ? (
          <div className="flex justify-center items-center h-40">
            <Loader />
          </div>
        ) : testDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Тема</p>
                <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                  {testDetails.topic ? testDetails.topic.name : 'Без темы'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Дата прохождения</p>
                <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>
                  {new Date(testDetails.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Результат</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    testDetails.score > 80 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : testDetails.score > 60 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {testDetails.score}%
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : ''}`}>
                Ответы на вопросы:
              </h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {testDetails.answers?.map((answer, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'border border-gray-200'
                    }`}
                  >
                    <p className={`font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>
                      Вопрос {index + 1}:
                    </p>
                    <p className={`mb-2 ${darkMode ? 'text-gray-300' : ''}`}>
                      {answer.questionText}
                    </p>

                    <div className="mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Правильный ответ:</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {answer.correctOption?.text}
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Выбранный ответ:</p>
                      <p className={`font-medium ${
                        answer.isCorrect 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {answer.selectedOptionId &&
                          answer.options?.find(opt => opt.id === answer.selectedOptionId)?.text}
                      </p>
                    </div>

                    {answer.explanation && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Объяснение:</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                          {answer.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className={`text-center py-4 ${darkMode ? 'text-gray-300' : ''}`}>
            Данные теста не найдены
          </p>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;