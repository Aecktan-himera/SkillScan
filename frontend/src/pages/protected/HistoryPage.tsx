import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { testAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { UserTestHistoryItem,  TestHistoryItem} from '../../types/index';
import Modal from '../../components/common/Modal';

const HistoryPage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [history, setHistory] = useState<UserTestHistoryItem[]>([]); // Изменено на UserTestHistoryItem[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workbookRef = useRef<ExcelJS.Workbook | null>(null);

  // Состояния для управления модальным окном
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testDetails, setTestDetails] = useState<TestHistoryItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Подготовка Excel-книги с правильным типом
  const prepareExcelWorkbook = useCallback((data: UserTestHistoryItem[]): ExcelJS.Workbook => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('История тестов');
    
    // Заголовки столбцов
    worksheet.columns = [
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
    });
    
    // Добавление данных
    data.forEach(test => {
      const row = worksheet.addRow({
        topic: test.topic ? test.topic.name : 'Без темы',
        date: new Date(test.completedAt).toLocaleDateString(),
        duration: `${Math.floor(test.timeSpent / 60)}:${(test.timeSpent % 60).toString().padStart(2, '0')}`,
        result: test.score
      });
      
      // Цвет для результата с правильным типом заливки
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
    
    return workbook;
  }, []);

  // Загрузка истории тестов
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const historyData = await testAPI.getUserTestHistory();
        
        // Подготовка книги Excel
        const workbook = prepareExcelWorkbook(historyData);
        workbookRef.current = workbook;
        
        setHistory(historyData);
      } catch (err) {
        setError('Не удалось загрузить историю тестов');
        console.error('Error fetching test history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user, prepareExcelWorkbook]);

  // Экспорт в Excel
  const handleExport = useCallback(async () => {
    if (!history.length || !workbookRef.current) {
      setError('Нет данных для экспорта');
      return;
    }
    
    try {
      const buffer = await workbookRef.current.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, `История_тестов_${user?.username}.xlsx`);
    } catch (err) {
      console.error('Ошибка экспорта:', err);
      setError('Ошибка при экспорте данных');
    }
  }, [history, user]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

// Функция для открытия деталей теста
  const openTestDetails = async (testId: number) => {
    setSelectedTestId(testId);
    setLoadingDetails(true);
    setIsModalOpen(true);
    
    try {
      const details = await testAPI.getTestDetails(testId);
      setTestDetails(details);
    } catch (err) {
      console.error('Ошибка загрузки деталей теста:', err);
      setError('Не удалось загрузить детали теста');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Функция для закрытия модального окна
  const closeTestDetails = () => {
    setIsModalOpen(false);
    setSelectedTestId(null);
    setTestDetails(null);
  };


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <ChartBarIcon className="w-6 h-6 mr-2" />
          История тестов
        </h1>
        
        <Button 
          onClick={handleExport}
          className="flex items-center gap-1"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Экспорт в Excel</span>
        </Button>
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">У вас пока нет пройденных тестов</p>
          <Button onClick={() => window.location.href = '/topics'}>
            Пройти первый тест
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тема
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата прохождения
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время прохождения
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Результат
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {test.topic ? test.topic.name : 'Без темы'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(test.completedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(test.timeSpent / 60)} мин {test.timeSpent % 60} сек
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${test.score > 80 ? 'bg-green-100 text-green-800' : 
                          test.score > 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {test.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        onClick={() => openTestDetails(test.id)}
                      >
                        <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Модальное окно с деталями теста */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeTestDetails}
        title={`Детали теста #${selectedTestId}`}
      >
        {loadingDetails ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : testDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Тема</p>
                <p className="font-medium">
                  {testDetails.topic ? testDetails.topic.name : 'Без темы'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Дата прохождения</p>
                <p className="font-medium">
                  {new Date(testDetails.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Результат</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${testDetails.score > 80 ? 'bg-green-100 text-green-800' :
                    testDetails.score > 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {testDetails.score}%
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Ответы на вопросы:</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {testDetails.answers?.map((answer, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium mb-1">Вопрос {index + 1}:</p>
                    <p className="mb-2">{answer.questionText}</p>

                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Правильный ответ:</p>
                      <p className="font-medium text-green-600">
                        {answer.correctOption?.text}
                      </p>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Выбранный ответ:</p>
                      <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {answer.options.find(opt => opt.id === answer.selectedOptionId)?.text}
                      </p>
                    </div>

                    {answer.explanation && (
                      <div>
                        <p className="text-sm text-gray-500">Объяснение:</p>
                        <p className="text-sm">{answer.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4">Данные теста не найдены</p>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;