import axios from "axios";
import type {
  TestHistoryItem,
  UserTestHistoryItem,
  Question,
  Topic,
  User,
  TestSubmitResponse,
  AdminStats,
  AnswerStats,
  AdminTestHistoryItem,
  ChangePasswordData
} from '../types/index';

// Используем правильный способ доступа к переменным окружения в Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Интерцептор для автоматической подстановки токена в заголовки
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Пропускать auth-запросы
    if (originalRequest.url.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Обновляем глобальные настройки axios
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Интерцептор для обработки 401 ошибки (истекший токен)
/*api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Добавлена проверка на валидность токена
        if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
          throw new Error('Invalid refresh token');
        }
        
        const response = await authAPI.refreshToken(refreshToken)
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);*/

// Обновим интерцептор
/*api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Добавляем получение refreshToken из localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
          throw new Error('Invalid refresh token');
        }
        
        const response = await authAPI.refreshToken(refreshToken);
        // Исправляем получение токенов
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

//Типизация для API
/*interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    settings: {
      darkMode: boolean;
      testTimer: number | null;
    };
  };
}*/

// Исправляем интерфейсы ответов
interface AuthAPIResponse {
  success: boolean;
  data: {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

interface TokenValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    user?: User;
  };
}

/*interface TokenValidationResponse {
  isValid: boolean;
  user?: User; // Используем полный тип User
}

interface TokenValidationResponse {
  isValid: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}*/

// API для аутентификации
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthAPIResponse>("/auth/register", { username, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthAPIResponse>("/auth/login", { email, password }),

  refreshToken: (refreshToken: string) =>
    api.post<AuthAPIResponse>("/auth/refresh", { refreshToken }),

  logout: (data: { refreshToken: string }) =>
    api.post("/auth/logout", data),

  validateToken: () => api.get<TokenValidationResponse>("/auth/check"),
};



// API для работы с тестами
export const testAPI = {
  getAllQuestions: (params?: any) =>
    api.get<{
      data: Question[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    }>('/admin/questions', { params }),

  getQuestionById: (id: string) =>
    api.get<Question>(`/admin/questions/${id}`),

  updateQuestion: (id: string, data: Partial<Question>) =>
    api.put(`/admin/questions/${id}`, data),

  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`),

  addQuestion: (data: {
    topic_id: number;
    text: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{ text: string; isCorrect: boolean }>;
  }) => api.post('/admin/questions', data),

  getQuestionsByTopic: (topic_id: number | string, count: number = 10, options = {}) => {
  return api.get<{ data: Question[] }>("/tests/questions", {
    params: { topic_id, count },
    ...options
  }).then(response => response.data.data);
},
  
  changeQuestion: (id: string, data: Partial<Question>) =>
    api.patch(`/admin/questions/${id}`, data),

  submitTest: (topic_id: number, answers: any, timeSpent: number) =>
    api.post<{ data: TestSubmitResponse }>("/tests/attempt", {  // [!] Указание типа
      topic_id,
      answers,
      timeSpent
    }),

  // Обновленный метод для получения истории тестов пользователя
  getUserTestHistory: () =>
    api.get<{ data: UserTestHistoryItem[] }>("/tests/history")
    .then(response => response.data.data),

  // Новый метод для получения детальной информации о тесте
  getTestDetails: (testId: number) =>
    api.get<{ data: TestHistoryItem }>(`/tests/${testId}`)
      .then(response => response.data.data),

  getTopics: () =>
    api.get<Topic[]>('/topics').then(response => response.data),

  /*addQuestion: (data: {
    topic_id: number;
    text: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: Array<{ text: string; isCorrect: boolean }>;
  }) => api.post('/admin/questions', data),

  /*getQuestionsByTopicAdmin: (topic_id: number) =>
    api.get<Question[]>("/admin/questions", { params: { topic_id: topic_id } }),*/

  getTopicById: (id: number) => api.get<Topic>(`/topics/${id}`),

  updateTopic: (id: number, data: { name: string; description?: string }) =>
    api.put<Topic>(`/topics/${id}`, data),


  addTopic: (data: { name: string }) =>
    api.post<Topic>('/topics', data),

  deleteTopic: (id: number) =>
    api.delete(`/topics/${id}`),

  changeTopic: (id: number, data: { name: string }) => 
    api.patch<Topic>(`/topics/${id}`, data),
};

// API для работы с пользователем
export const userAPI = {
  /*updateSettings: (settings: { darkMode: boolean; testTimer: number | null }) =>
    api.patch<{
      success: boolean;
      settings: {
        darkMode: boolean;
        testTimer: number | null
      }
    }>("/user/settings", settings),*/

  updateSettings: (settings: Partial<{ darkMode: boolean; testTimer: number | null }>) =>
    api.patch("/user/settings", settings),

  updateProfile: (data: {
    username: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
  }) => api.patch("/user/profile", data),

  changePassword: (data: ChangePasswordData) =>
    api.patch("/user/password", data),

  getProfile: () => api.get<User>("/user/profile"),

  getUserStats: () => 
    api.get<{ 
      data: Array<{
        id: number;
        topic: { id: number; name: string };
        completedAt: string;
        timeSpent: number;
        score: number;
      }> 
    }>("/user/stats"),

  deleteAccount: () => api.delete("/user/account"),
};

// API для работы со статистикой админ-панели
export const adminStatsAPI = {
  getStats: () => 
    api.get<{ data: AdminStats[] }>('/tests/admin/stats')
      .then(response => response.data.data),
  
  getTestHistory: () => 
    api.get<{ data: AdminTestHistoryItem[] }>('/tests/admin/test-history')
      .then(response => response.data.data),
  
  getAnswerStats: () => 
    api.get<{ data: AnswerStats }>('/tests/admin/answer-stats')
      .then(response => response.data.data),
};

//API для управления пользователями
export const adminUsersAPI = {
  /*getUsers: () => api.get<User[]>('/admin/users')
    .catch(err => {
      if (!err.response) {
        throw new Error("Сервер не отвечает. Проверьте подключение.");
      }
      throw err;
    }),
  createUser: (userData: {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin'
  }) => api.post<User>('/admin/users', userData),*/
  getUsers: () =>
    api.get<{ data: User[] }>('/admin/users')
      .then(response => response.data.data)
      .catch(err => {
        if (!err.response) {
          throw new Error("Сервер не отвечает. Проверьте подключение.");
        }
        throw err;
      }),

  createUser: (userData: { // Добавлен тип
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin'
  }) => 
    api.post<{ data: User }>('/admin/users', userData)
      .then(response => response.data.data),

  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  toggleUserStatus: (id: number) => 
    api.patch<{ data: User }>(`/admin/users/${id}/status`)
      .then(response => response.data.data), //  Добавлена обработка
};
