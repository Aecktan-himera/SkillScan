import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import type { Question } from '../../types/index';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (selectedOptionId: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  selectedOptionId?: string;
  timeLeft?: number;
  topicName?: string;
  isLastQuestion: boolean;
  onFinish: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion,
  selectedOptionId,
  timeLeft,
  topicName,
  isLastQuestion,
  onFinish
}) => {
  const [localSelectedOption, setLocalSelectedOption] = useState<string | undefined>(selectedOptionId);

  const handleOptionSelect = (optionId: string) => {
    setLocalSelectedOption(optionId);
    onAnswerSelect(optionId);
  };

  if (!question || !question.options) {
    return (
      <div className="question-card p-6 rounded-lg bg-white shadow-md">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p className="font-medium">Question data is incomplete or corrupted</p>
          <Button 
            onClick={onPreviousQuestion} 
            variant="secondary"
            className="mt-3"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Таймер */}
      {timeLeft !== undefined && (
        <div className="bg-blue-50 py-2 px-4 text-center font-semibold text-blue-700">
          Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}

      {/* Заголовок */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Вопрос {questionNumber} из {totalQuestions}
          </h3>
          {topicName && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {topicName}
            </span>
          )}
        </div>
      </div>

      {/* Контент вопроса */}
      <div className="p-6">
        <p className="question-card__text text-lg font-medium text-gray-800 mb-6">
          {question.text}
        </p>

        {question.imageUrl && (
          <div className="question-card__image-container mb-6 rounded-lg overflow-hidden border">
            <img 
              src={question.imageUrl} 
              alt="Question illustration" 
              className="w-full h-auto max-h-64 object-contain" 
            />
          </div>
        )}

        {/* Варианты ответов */}
        <div className="question-card__options space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`question-card__option p-4 rounded-lg border transition-all cursor-pointer
                ${localSelectedOption === option.id 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name="question-option"
                    checked={localSelectedOption === option.id}
                    onChange={() => handleOptionSelect(option.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <label 
                  htmlFor={`option-${option.id}`} 
                  className="ml-3 block text-gray-700 cursor-pointer select-none"
                >
                  {option.text}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Навигация */}
      <div className="question-card__navigation bg-gray-50 px-6 py-4 flex justify-between">
        <Button
          onClick={onPreviousQuestion}
          disabled={questionNumber <= 1}
          variant="secondary"
          className="min-w-[120px]"
        >
          ← Previous
        </Button>

        {isLastQuestion ? (
          <Button 
            onClick={onFinish}
            className="min-w-[120px] bg-green-600 hover:bg-green-700"
          >
            Finish ✓
          </Button>
        ) : (
          <Button
            onClick={onNextQuestion}
            disabled={questionNumber >= totalQuestions}
            className="min-w-[120px]"
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
};