export interface Topic {
  id: number;
  name: string;
  description?: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean; // is_correct
}

export interface Question {
  id: string; // Changed to string to match
  text: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: Option[];
  topic_id?: number;//string
  topic?: Topic; // Добавлено
  imageUrl?: string; // Добавлено
}


export interface TestSubmitResponse {
  score: number;
  total: number;
  correct: number;
}


export interface TestResult {
  score: number;
  total: number;
  correct: number;
}


export interface TestHistoryItem {
  id: number; //string
  user: {
    id: number; //string
    username: string;
  };
  topic: {
    id: string;
    name: string;
  } | null;
  completedAt: string;
  timeSpent: number;
  score: number;
  answers?: Array<{ // Добавить опционально
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    questionText: string;
    explanation?: string;
    options: Option[];
    correctOption?: Option;
  }>;
}

export interface UserTestHistoryItem {
  id: number;
  topic: {
    id: number;
    name: string;
  } | null;
  completedAt: string;
  timeSpent: number;
  score: number;
}

export interface User {
  id: number; // Changed to string to match other files
  username: string;
  email: string;
  role: string; // Added role property
  isActive: boolean;
  settings: {
    darkMode: boolean;
    testTimer: number | null;
  };
  createdAt?: string;
}

export interface AdminStats {
  id: number;
  name: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative';
}

export interface AnswerStats {
  overall: {
    correct: number;
    incorrect: number;
  };
  byTopic: Array<{
    topic: string;
    correct: number;
    incorrect: number;
  }>;
}

export interface AdminTestHistoryItem {
  id: number;
  user: {
    id: number;
    username: string;
  };
  topic: {
    id: number;
    name: string;
  };
  completedAt: string;
  timeSpent: number; // в секундах
  score: number; // процент
}

// Типы для управления пользователями
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface UserStatusChange {
  id: number;
  isActive: boolean;
}

// Типы для API ответов
export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface SuccessMessageResponse {
  message: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
