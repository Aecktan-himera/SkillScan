import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI } from "../services/api";
import type { User } from "../types/index";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserSettings: (settings: Partial<User['settings']>) => Promise<void>; // Добавлено
  refreshAccessToken: () => Promise<string>;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const navigate = useNavigate();

  const isValidUser = (data: any): data is User => {
  return data &&
    typeof data.id === 'number' &&
    typeof data.username === 'string' &&
    typeof data.email === 'string' &&
    typeof data.role === 'string' &&
    typeof data.isActive === 'boolean' &&
    data.settings &&
    typeof data.settings.darkMode === 'boolean' &&
    (data.settings.testTimer === null || typeof data.settings.testTimer === 'number');
};

  const saveAuthData = useCallback((accessToken: string, refreshToken: string, userData: User | null) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setAccessToken(accessToken);

    if (userData && isValidUser(userData)) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // Обновляем тему при входе
      if (userData.settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken || storedRefreshToken === "undefined" || storedRefreshToken === "null") {
      clearAuthData();
      throw new Error("Invalid refresh token");
    }

    try {
    const response = await authAPI.refreshToken(storedRefreshToken);
    const { accessToken, refreshToken, user } = response.data.data;

    if (!accessToken || !refreshToken) {
      throw new Error("Invalid token response");
    }

      saveAuthData(accessToken, refreshToken, user || null);
    return accessToken;
  } catch (error) {
      clearAuthData();
      throw new Error("Refresh token expired or invalid");
    }
  }, [saveAuthData, clearAuthData]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        ['accessToken', 'refreshToken', 'user'].forEach(key => {
          const value = localStorage.getItem(key);
          if (value === "undefined" || value === "null") {
            localStorage.removeItem(key);
          }
        });

        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (!storedAccessToken || !storedRefreshToken) {
          clearAuthData();
          setIsInitializing(false);
          return;
        }
        
        try {
          const response = await authAPI.validateToken();
        const { isValid, user: responseUser } = response.data.data;
        
        if (isValid && responseUser && isValidUser(responseUser)) {
          saveAuthData(storedAccessToken, storedRefreshToken, responseUser);
          return;
          }
        } catch (error) {
          console.log("Token validation failed, trying to refresh...", error);
        }

        try {
          await refreshAccessToken();
        } catch (refreshError) {
          console.log("Token refresh failed", refreshError);
        }
      } catch (error) {
        console.error("Authentication initialization failed", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [refreshAccessToken, saveAuthData, clearAuthData]);

  const login = useCallback(async (email: string, password: string) => {
  const response = await authAPI.login(email, password);
  console.log('Server response:', response.data);
  
  const { accessToken, refreshToken, user } = response.data.data;
  
  saveAuthData(accessToken, refreshToken, user);
  
  if (user.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/topics');
  }
}, [saveAuthData, navigate]);

  const register = useCallback(async (username: string, email: string, password: string) => {
  const response = await authAPI.register(username, email, password);
  console.log('Server response:', response.data);
  
  const { accessToken, refreshToken, user } = response.data.data;
  
  saveAuthData(accessToken, refreshToken, user);
  
  if (user.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/topics');
  }
}, [saveAuthData, navigate]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authAPI.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Logout API error", error);
    } finally {
      clearAuthData();
      navigate("/login");
    }
  }, [clearAuthData, navigate]);

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const response = await userAPI.updateProfile({
        username: userData.username || user.username,
        email: userData.email || user.email
      });

      const updatedUser = {
        ...user,
        ...userData,
        ...response.data.user,
      };

      if (isValidUser(updatedUser)) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error) {
      console.error("Update user failed", error);
      throw error;
    }
  };

  // Добавляем новую функцию для обновления настроек
  const updateUserSettings = useCallback(async (settings: Partial<User['settings']>) => {
  if (!user) throw new Error("User not authenticated");

  try {
    // Создаем полный объект настроек для отправки
    const fullSettings = {
      darkMode: settings.darkMode ?? user.settings.darkMode,
      testTimer: settings.testTimer ?? user.settings.testTimer
    };
    
    // Отправляем запрос с полным объектом
    await userAPI.updateSettings(fullSettings);
      
      // Обновляем локальное состояние пользователя
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          ...settings
        }
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Обновляем тему в реальном времени
      if (settings.darkMode !== undefined) {
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error("Update settings failed", error);
      throw error;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      register,
      logout,
      updateUser,
      updateUserSettings,
      refreshAccessToken,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};