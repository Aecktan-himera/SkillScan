import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { testAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ChartBarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface TestHistoryItem {
  id: string;
  topic: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // в секундах
  passed: boolean;
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // В реальном приложении будет использоваться testAPI.getTestHistory()
        const mockData: TestHistoryItem[] = [
          {
            id: '1',
            topic: 'JavaScript Basics',
            date: '2023-05-15T14:30:00Z',
            score: 8,
            totalQuestions: 10,
            timeSpent: 720,
            passed: true
          },
          {
            id: '2',
            topic: 'React Advanced',
            date: '2023-05-10T09:15:00Z',
            score: 5,
            totalQuestions: 10,
            timeSpent: 900,
            passed: false
          }
        ];
        setHistory(mockData);
      } catch (err) {
        setError('Не удалось загрузить историю тестов');
        console.error('Error fetching test history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ChartBarIcon className="w-6 h-6 mr-2" />
        История тестов
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : history.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">У вас пока нет пройденных тестов</p>
          <Button className="mt-4" onClick={() => window.location.href = '/topics'}>
            Пройти тест
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold">{test.topic}</h2>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatDate(test.date)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                  <div className="flex items-center mb-2 sm:mb-0">
                    {test.passed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                    )}
                    <span className={`font-medium ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {test.score}/{test.totalQuestions} ({Math.round((test.score / test.totalQuestions) * 100)}%)
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    Время: {formatTime(test.timeSpent)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;