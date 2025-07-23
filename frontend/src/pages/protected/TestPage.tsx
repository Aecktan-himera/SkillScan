import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { testAPI } from "../../services/api";
import type { TestSubmitResponse, Question, Topic } from "../../types/index";
import Timer from "../../components/test/Timer";
import { QuestionCard } from "../../components/test/QuestionCard";
import { Button } from "../../components/common/Button";

const TestPage: React.FC = () => {
  const [startTime] = useState(Date.now());
  const { topic_id: topicIdParam } = useParams<{ topic_id?: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [timeUp, setTimeUp] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [results, setResults] = useState<TestSubmitResponse | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Преобразуем строковый параметр в число
  const topic_id = topicIdParam ? parseInt(topicIdParam, 10) : null;

  useEffect(() => {
   const abortController = new AbortController(); 
    const fetchData = async () => {
      try {
        setLoading(true);
        if (topic_id === null || isNaN(topic_id)) {
          throw new Error("Неверный ID темы");
        }

        // Загрузка тем
        const topicsResponse = await testAPI.getTopics();
        const currentTopic = topicsResponse.find(t => t.id === topic_id);

        if (!currentTopic) {
          throw new Error("Тема не найдена");
        }

        setTopic(currentTopic);

        // Загрузка вопросов (убираем проверку длины)
      const response = await testAPI.getQuestionsByTopic(topic_id, 10, { 
        signal: abortController.signal 
      });
      
// Проверка отмены запроса
      if (abortController.signal.aborted) return;

      // Проверка на наличие опций
      if (response.some(q => !q.options || q.options.length === 0)) {
        const invalidQuestions = response
          .filter(q => !q.options || q.options.length === 0)
          .map(q => q.id);
        throw new Error(
          `Некоторые вопросы без вариантов ответа (IDs: ${invalidQuestions.join(", ")})`
        );
      }

      setQuestions(response);
      setUserAnswers(new Array(response.length).fill(null));
    } catch (err) {
        console.error("Ошибка загрузки вопросов:", err);
        setError(err instanceof Error ? err.message : "Не удалось загрузить вопросы");
      } finally {
        setLoading(false);
      }
    };

    if (topic_id !== null) {
      fetchData();
    }
  }, [topic_id]);

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionId;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      if (!topic) {
        throw new Error("Тема не загружена");
      }

      // Проверяем, что на все вопросы есть ответы
      const unansweredQuestions = userAnswers.filter(answer => answer === null).length;
      if (unansweredQuestions > 0 && !window.confirm(
        `У вас есть ${unansweredQuestions} без ответа. Вы уверены, что хотите завершить тест?`
      )) {
        return;
      }
      
      const answers = questions.map((question, index) => ({
        questionId: question.id.toString(), // Добавьте .toString()
        selectedOptionId: (userAnswers[index] || "").toString() // И здесь
      }));

      const response = await testAPI.submitTest(
      topic.id,
      answers,
      timeSpent
    );

      setResults(response.data.data);
      setTestSubmitted(true);
    } catch (error) {
      console.error("Ошибка отправки результатов:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Ошибка отправки результатов"
      );
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  // Обработка ошибок загрузки
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <Button
          onClick={() => navigate("/topics")}
          variant="primary"
        >
          Вернуться к темам
        </Button>
      </div>
    );
  }

  // Обработка ошибок отправки
  if (submitError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{submitError}</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={testSubmitted}
          >
            Попробовать снова
          </Button>
          <Button
            onClick={() => navigate("/topics")}
            variant="secondary"
          >
            Вернуться к темам
          </Button>
        </div>
      </div>
    );
  }

  // Результаты теста
  if (testSubmitted && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Тест завершен!</h2>
        <p className="mb-4">
          Ваш результат: {results.score.toFixed(1)}%
          ({results.correct} из {results.total})
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/history")}
            variant="primary"
          >
            Посмотреть историю
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="secondary"
          >
            На главную
          </Button>
        </div>
      </div>
    );
  }

  // Время вышло
  if (timeUp) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Время вышло!</h2>
        <Button
          onClick={handleSubmit}
          variant="primary"
        >
          Посмотреть результаты
        </Button>
      </div>
    );
  }

  // Загрузка вопросов
  if (loading || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Загрузка вопросов...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Тест по теме {topic?.name || "Без названия"}
        </h2>
        {user?.settings.testTimer !== null && (
          <Timer
            initialMinutes={user?.settings.testTimer || 30}
            onTimeUp={() => setTimeUp(true)}
          />
        )}
      </div>

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedOptionId={userAnswers[currentQuestionIndex] || undefined}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={goToNextQuestion}
        onPreviousQuestion={goToPreviousQuestion}
        topicName={topic?.name}
        isLastQuestion={isLastQuestion}
        onFinish={handleSubmit}
      />
    </div>
  );
};

export default TestPage;