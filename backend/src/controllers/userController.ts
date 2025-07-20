import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { TestHistory } from "../entities/TestHistory";
import * as bcrypt from 'bcryptjs';
import { sendSuccess, sendError } from "../utils/response";
import { ApiError } from "../utils/apiError";

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: userId },
        select: ["id", "username", "email", "role", "settings", "createdAt"]
      });

      if (!user) {
        return sendError(res, new ApiError(404, "Пользователь не найден"));
      }

      sendSuccess(res, user);
    } catch (error) {
      sendError(res, ApiError.InternalServerError("Неизвестная ошибка"));
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { username, email, currentPassword, newPassword } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      // Проверка на пустой запрос
      const isEmptyRequest = 
        username === undefined && 
        email === undefined && 
        currentPassword === undefined && 
        newPassword === undefined;
      
      if (isEmptyRequest) {
        return sendError(res, new ApiError(400, "Не указаны данные для обновления"));
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return sendError(res, new ApiError(404, "Пользователь не найден"));
      }

      // Обновление username
      if (username) {
        // Проверка длины имени пользователя
        if (username.length < 3 || username.length > 30) {
          return sendError(res, new ApiError(400, "Имя пользователя должно быть от 3 до 30 символов"));
        }
        
        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser && existingUser.id !== userId) {
          return sendError(res, new ApiError(400, "Имя пользователя уже занято"));
        }
        user.username = username;
      }

      // Обновление email
      if (email) {
        // Базовая проверка формата email
        if (!/\S+@\S+\.\S+/.test(email)) {
          return sendError(res, new ApiError(400, "Неверный формат email"));
        }
        
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser && existingUser.id !== userId) {
          return sendError(res, new ApiError(400, "Email уже используется"));
        }
        user.email = email;
      }

      // Обновление пароля
      if (newPassword) {
        // Проверка наличия текущего пароля
        if (!currentPassword) {
          return sendError(res, new ApiError(400, "Текущий пароль обязателен"));
        }
        
        // Проверка длины нового пароля
        if (newPassword.length < 6) {
          return sendError(res, new ApiError(400, "Пароль должен содержать минимум 6 символов"));
        }
        
        // Проверка совпадения текущего и нового пароля
        if (newPassword === currentPassword) {
          return sendError(res, new ApiError(400, "Новый пароль должен отличаться от текущего"));
        }
        
        // Проверка текущего пароля
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return sendError(res, new ApiError(401, "Неверный текущий пароль"));
        }

        // Хеширование нового пароля
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }

      await userRepository.save(user);
      
      // Возвращаем обновленные данные без пароля
      const updatedUser = { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        settings: user.settings,
        createdAt: user.createdAt
      };
      
      sendSuccess(res, { 
        message: "Профиль успешно обновлен",
        user: updatedUser
      });
    } catch (error) {
      sendError(res, ApiError.InternalServerError("Ошибка обновления профиля"));
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const userRepository = AppDataSource.getRepository(User);

      await userRepository.delete(userId);
      sendSuccess(res, { message: "Аккаунт успешно удален" });
    } catch (error) {
      sendError(res, ApiError.InternalServerError("Ошибка удаления аккаунта"));
    }
  }

  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const testHistoryRepository = AppDataSource.getRepository(TestHistory);

      const history = await testHistoryRepository.find({
        where: { user: { id: userId } },
        relations: ["topic"],
        order: { completedAt: "DESC" },
      });

      const stats = {
        totalTests: history.length,
        averageScore: 0,
        topics: {} as Record<string, { count: number; average: number }>,
      };

      if (history.length > 0) {
        const totalScore = history.reduce((sum, attempt) => sum + attempt.score, 0);
        stats.averageScore = totalScore / history.length;

        history.forEach(attempt => {
          const topicName = attempt.topic?.name || "Без темы";

          if (!stats.topics[topicName]) {
            stats.topics[topicName] = { count: 0, average: 0 };
          }
          stats.topics[topicName].count++;
          stats.topics[topicName].average += attempt.score;
        });

        Object.keys(stats.topics).forEach(topic => {
          stats.topics[topic].average = stats.topics[topic].average / stats.topics[topic].count;
        });
      }

      sendSuccess(res, stats);
    } catch (error) {
      sendError(res, ApiError.InternalServerError("Ошибка получения статистики"));
    }
  }

  static async updateSettings(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const settingsUpdate = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return sendError(res, new ApiError(404, "Пользователь не найден"));
    }

    // Обновляем только переданные поля
    const updatedSettings = { 
      ...user.settings, 
      ...settingsUpdate 
    };

    // Проверка типов
    if (typeof updatedSettings.darkMode !== 'boolean') {
      return sendError(res, new ApiError(400, "Неверный параметр darkMode"));
    }
    
    if (updatedSettings.testTimer !== null && 
        (typeof updatedSettings.testTimer !== 'number' || updatedSettings.testTimer < 0)) {
      return sendError(res, new ApiError(400, "Неверный параметр testTimer"));
    }

    // Сохраняем обновленные настройки
    user.settings = updatedSettings;
    await userRepository.save(user);

    sendSuccess(res, {
      message: "Настройки обновлены",
      settings: updatedSettings
    });
  } catch (error) {
    sendError(res, ApiError.InternalServerError("Ошибка обновления настроек"));
  }
}

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      // Проверка обязательных полей
      if (!currentPassword) {
        return sendError(res, new ApiError(400, "Текущий пароль обязателен"));
      }
      
      if (!newPassword) {
        return sendError(res, new ApiError(400, "Новый пароль обязателен"));
      }
      
      if (!confirmPassword) {
        return sendError(res, new ApiError(400, "Подтверждение пароля обязательно"));
      }

      // Проверка длины пароля
      if (newPassword.length < 6) {
        return sendError(res, new ApiError(400, "Пароль должен содержать минимум 6 символов"));
      }
      
      // Проверка совпадения паролей
      //if (newPassword !== confirmPassword) {
        //return sendError(res, new ApiError(400, "Пароли не совпадают"));
      //}

      const user = await userRepository.findOne({ 
        where: { id: userId },
        select: ["id", "password"]
      });

      if (!user) {
        return sendError(res, new ApiError(404, "Пользователь не найден"));
      }

      // Проверка текущего пароля
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendError(res, new ApiError(401, "Неверный текущий пароль"));
      }

      // Проверка совпадения нового и текущего паролей
     // if (newPassword === currentPassword) {
      //  return sendError(res, new ApiError(400, "Новый пароль должен отличаться от текущего"));
     // }

      // Хеширование нового пароля
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await userRepository.save(user);
      sendSuccess(res, { message: "Пароль успешно изменен" });
    } catch (error) {
      sendError(res, ApiError.InternalServerError("Ошибка смены пароля"));
    }
  }
}

export default new UserController();