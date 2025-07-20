import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { testAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import type { Topic } from "../../types/index";

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();

  // Редирект для администратора
  useEffect(() => {
    if (!isInitializing && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, isInitializing, navigate]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const topicsData = await testAPI.getTopics();
        setTopics(topicsData);
      } catch (err) {
        setError("Не удалось загрузить список тем. Попробуйте позже.");
        console.error("Error fetching topics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleStartTest = (topic_id: number) => {
    navigate(`/test/${topic_id}`);
  };

  if (isInitializing || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Выберите тему для тестирования</h1>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Доступные темы отсутствуют</p>
          {user?.role === "admin" && (
            <Button onClick={() => navigate("/admin/topics")}>
              Создать тему
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {topic.description && (
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                )}
                <Button
                  variant="primary"
                  onClick={() => handleStartTest(topic.id)}
                  className="w-full"
                >
                  Начать тест
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsPage;