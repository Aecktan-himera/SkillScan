import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>; // Добавлен новый метод
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch {
          logout();
        }
      }
    };
    verifyAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    navigate("/");
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authAPI.register(username, email, password);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setToken(response.data.token);
    setUser(response.data.user);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Реализация нового метода updateUser
  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error("User not authenticated");
    
    // Создаем обновленного пользователя, объединяя текущие данные с новыми
    const updatedUser = { ...user, ...userData };
    
    // Обновляем состояние и localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // В реальном приложении здесь должен быть вызов API:
    // await authAPI.updateUser(user.id, userData, token);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      updateUser // Добавляем метод в провайдер
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