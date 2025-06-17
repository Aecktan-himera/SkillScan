import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import type { Question } from '../../types/test.types.ts';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (selectedOptionId: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  selectedOptionId?: string;
  timeLeft?: number;
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
}) => {
  const [localSelectedOption, setLocalSelectedOption] = useState<string | undefined>(selectedOptionId);

  const handleOptionSelect = (optionId: string) => {
    setLocalSelectedOption(optionId);
    onAnswerSelect(optionId);
  };

  return (
    <div className="question-card">
      {timeLeft !== undefined && (
        <div className="question-card__timer">
          Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      
      <div className="question-card__header">
        <h3>Question {questionNumber} of {totalQuestions}</h3>
        {question.topic && <span className="question-card__topic">{question.topic.name}</span>}
      </div>

      <div className="question-card__content">
        <p className="question-card__text">{question.text}</p>
        
        {question.imageUrl && (
          <div className="question-card__image-container">
            <img src={question.imageUrl} alt="Question illustration" className="question-card__image" />
          </div>
        )}

        <div className="question-card__options">
          {question.options.map((option) => (
            <div 
              key={option.id}
              className={`question-card__option ${localSelectedOption === option.id ? 'question-card__option--selected' : ''}`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <input
                type="radio"
                id={`option-${option.id}`}
                name="question-option"
                checked={localSelectedOption === option.id}
                onChange={() => handleOptionSelect(option.id)}
                className="question-card__radio"
              />
              <label htmlFor={`option-${option.id}`} className="question-card__option-label">
                {option.text}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="question-card__navigation">
        <Button 
          onClick={onPreviousQuestion}
          disabled={questionNumber <= 1}
          variant="secondary"
        >
          Previous
        </Button>
        
        <Button 
          onClick={onNextQuestion}
          disabled={questionNumber >= totalQuestions}
        >
          {questionNumber >= totalQuestions ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};