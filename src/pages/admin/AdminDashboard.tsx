import { Card } from '../../components/common/Card';
import { 
  UserGroupIcon, 
  QuestionMarkCircleIcon, 
  ChartBarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Статистика (в реальном приложении будет загружаться с сервера)
  const stats = [
    { id: 1, name: 'Всего пользователей', value: 1245, icon: UserGroupIcon, change: '+12%', changeType: 'positive' },
    { id: 2, name: 'Всего вопросов', value: 8562, icon: QuestionMarkCircleIcon, change: '+8%', changeType: 'positive' },
    { id: 3, name: 'Активных тестов', value: 32, icon: AcademicCapIcon, change: '-2%', changeType: 'negative' },
    { id: 4, name: 'Завершенных тестов', value: 12458, icon: ChartBarIcon, change: '+24%', changeType: 'positive' },
  ];

  // Последние действия
  const recentActivity = [
    { id: 1, user: 'Алексей Петров', action: 'добавил новый вопрос', topic: 'JavaScript', time: '2 мин назад' },
    { id: 2, user: 'Мария Иванова', action: 'создала новую тему', topic: 'React Hooks', time: '15 мин назад' },
    { id: 3, user: 'Иван Сидоров', action: 'обновил настройки', topic: 'Система', time: '1 час назад' },
    { id: 4, user: 'Елена Васильева', action: 'удалила вопрос', topic: 'CSS Grid', time: '3 часа назад' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Админ-панель: Статистика</h1>
      
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} за последний месяц
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Графики и диаграммы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Активность пользователей</h2>
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500">
            График активности
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Распределение по темам</h2>
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500">
            Круговая диаграмма
          </div>
        </Card>
      </div>

      {/* Последние действия */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Последние действия</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действие
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тема
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activity.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.topic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;