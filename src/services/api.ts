import axios from "axios";
import type { TestHistoryItem } from '../types/index'; 
import type { Question, Topic, TestSubmitResponse } from '../types/test.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Добавляем токен авторизации в заголовки
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API для аутентификации
export const authAPI = {
  register: (username: string, email: string, password: string) => 
    api.post("/auth/register", { username, email, password }),
  
  login: (email: string, password: string) => 
    api.post("/auth/login", { email, password }),
};

// API для работы с тестами
export const testAPI = {
  getQuestionsByTopic: (topic: string, count: number = 10) => 
    api.get<Question[]>("/tests", { params: { topic, count } }),
  
  submitTest: (topic: string, answers: { questionId: string; selectedOptionId: string }[]) => 
    api.post<TestSubmitResponse>("/tests/submit", { topic, answers }),
  
  getTestHistory: () => 
    api.get<TestHistoryItem[]>("/user/history"),

  getTopics: () => 
    api.get<Topic[]>('/topics'),
  
  addQuestion: (data: {
    topic_id: string; // Changed to string
    text: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{ text: string; is_correct: boolean }>;
  }) => api.post('/admin/questions', data),
  
  getQuestionsByTopicAdmin: (topicId: string) => // Changed to string
    api.get<Question[]>(`/admin/questions?topic_id=${topicId}`),
};

// API для работы с пользователем
export const userAPI = {
  updateSettings: (settings: { darkMode: boolean; testTimer: number | null }) => 
    api.patch("/user/settings", settings),
};

