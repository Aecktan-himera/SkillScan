
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AcademicCapIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const HomePage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const features = [
    {
      name: 'Разнообразные темы',
      description: 'Тесты по различным направлениям знаний',
      icon: BookOpenIcon,
    },
    {
      name: 'Отслеживание прогресса',
      description: 'История прохождения и статистика',
      icon: ChartBarIcon,
    },
    {
      name: 'Профессиональные вопросы',
      description: 'Вопросы, составленные экспертами',
      icon: AcademicCapIcon,
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-emerald-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className={`block ${darkMode ? 'text-white' : 'text-gray-900'}`}>Платформа для</span>
              <span className="block text-emerald-600 dark:text-emerald-400">тестирования знаний</span>
            </h1>
            <p className={`mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Проверьте свои знания, подготовьтесь к экзаменам или создайте собственные тесты
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {!user ? (
                <>
                  <div className="rounded-md shadow">
                    <Link to="/register">
                      <Button className="w-full px-8 py-3 text-base font-medium">
                        Начать сейчас
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link to="/login">
                      <Button variant="secondary" className="w-full px-8 py-3 text-base font-medium">
                        Войти
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-md shadow">
                  <Link to="/topics">
                    <Button className="w-full px-8 py-3 text-base font-medium">
                      Перейти к тестам
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base font-semibold tracking-wide uppercase ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              Возможности
            </h2>
            <p className={`mt-2 text-3xl font-extrabold leading-8 tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            } sm:text-4xl`}>
              Лучший способ проверить знания
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
                      darkMode ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-lg font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {feature.name}
                      </h3>
                      <p className={`mt-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base font-semibold tracking-wide uppercase ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              Отзывы
            </h2>
            <p className={`mt-2 text-3xl font-extrabold leading-8 tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            } sm:text-4xl`}>
              Что говорят наши пользователи
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Анна К.',
                role: 'Преподаватель',
                quote: 'Отличная платформа для создания тестов для студентов. Удобный интерфейс и полезная статистика.',
              },
              {
                name: 'Иван П.',
                role: 'Студент',
                quote: 'Помогло подготовиться к экзамену. Вопросы качественные, система запоминает прогресс.',
              },
              {
                name: 'Мария С.',
                role: 'HR-специалист',
                quote: 'Используем для тестирования кандидатов. Настраиваемые тесты и детальные отчеты.',
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="p-6">
                <div>
                  <p className={`text-base ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;