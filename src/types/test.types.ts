export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface Option {
  id: string;
  text: string;
  is_correct: boolean; // Made consistent with API usage
}

export interface Question {
  id: string; // Changed to string to match
  text: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: Option[];
  topic_id?: string;
  topic?: Topic; // Добавлено
  imageUrl?: string; // Добавлено
}

// For the test session
export interface TestSession {
  id: string;
  userId: string;
  topicId?: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// For the test-taking process
export interface TestState {
  currentQuestionIndex: number;
  questions: Question[];
  answers: UserAnswer[];
  timeLimit?: number; // in seconds
  timeStarted?: Date;
  isCompleted: boolean;
}

// API response types
export interface TestStartResponse {
  sessionId: string;
  questions: Question[];
  timeLimit?: number;
}

export interface TestSubmitRequest {
  sessionId: string;
  answers: UserAnswer[];
}

export interface TestSubmitResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  detailedResults: Array<{
    question: Question;
    selectedOption: Option;
    isCorrect: boolean;
    correctOption?: Option;
  }>;
}

// Props types for test-related components
export interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (selectedOptionId: string) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  selectedOptionId?: string;
  timeLeft?: number;
}

export interface TestResultsProps {
  results: TestSubmitResponse;
  onRetry?: () => void;
  onFinish?: () => void;
}

export interface TimerProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  pause?: boolean;
}

// For API requests
export interface StartTestParams {
  topicId?: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}