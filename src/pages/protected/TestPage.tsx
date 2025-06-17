import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { testAPI } from "../../services/api";
import type { TestSubmitResponse } from "../../types/test.types"; // Изменён импорт
import type { Question } from "../../types/test.types";
import Timer from "../../components/test/Timer";
import { QuestionCard } from "../../components/test/QuestionCard";

const TestPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [timeUp, setTimeUp] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [results, setResults] = useState<TestSubmitResponse | null>(null); // Изменено название
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await testAPI.getQuestionsByTopic(topic!);
        setQuestions(response.data);
        setUserAnswers(new Array(response.data.length).fill(null));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    
    if (topic) {
      fetchQuestions();
    }
  }, [topic]);

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionId;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const answers = questions.map((question, index) => ({
        questionId: question.id,
        selectedOptionId: userAnswers[index] || ""
      }));
      
      const response = await testAPI.submitTest(topic!, answers);
      setResults(response.data); // Изменено название
      setTestSubmitted(true);
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  if (testSubmitted && results) {
    return (
      <div className="test-result">
        <h2>Тест завершен!</h2>
        <p>Ваш результат: {results.score.toFixed(1)}% ({results.correctAnswers} out of {results.totalQuestions})</p>
        <button onClick={() => navigate("/history")}>Посмотреть историю</button>
        <button onClick={() => navigate("/")}>Назад на главную страницу</button>
      </div>
    );
  }

  if (timeUp) {
    return (
      <div className="time-up">
        <h2>Время вышло!</h2>
        <button onClick={handleSubmit}>View Results</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="test-container">
      <div className="test-header">
        <h2> Тест по теме {topic}</h2>
        <Timer 
          initialMinutes={user?.settings.testTimer || 30} 
          onTimeUp={() => setTimeUp(true)} 
        />
      </div>
      
      <QuestionCard 
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedOptionId={userAnswers[currentQuestionIndex] || undefined}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={goToNextQuestion}
        onPreviousQuestion={goToPreviousQuestion}
      />
    </div>
  );
};

export default TestPage;