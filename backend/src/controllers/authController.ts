import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { JWT_SECRET, REFRESH_TOKEN_SECRET, JWT_EXPIRES_IN } from "../config/constants";
import { ApiError } from "../utils/apiError";
import { sendSuccess, sendError } from "../utils/response";
import tokenService from "../services/token.service";

// Генерация JWT токенов с jti
const generateTokens = (userId: number) => {
  const jti = uuidv4(); // Уникальный идентификатор токена
  
  const accessToken = jwt.sign({ 
    userId 
  }, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
  
  const refreshToken = jwt.sign({ 
    userId,
    jti // Добавляем jti в payload
  }, REFRESH_TOKEN_SECRET, { 
    expiresIn: '7d' 
  });
  
  return { accessToken, refreshToken, jti };
};

export default {
  // Регистрация пользователя
  register: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      const userRepository = AppDataSource.getRepository(User);
      
      // Проверка существования пользователя
      const existingUser = await userRepository.findOne({ 
        where: [{ username }, { email }] 
      });
      
      if (existingUser) {
        throw ApiError.Conflict("Пользователь с таким именем или email уже существует");
      }
      
      // Хеширование пароля
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Создание пользователя
      const user = userRepository.create({
        username,
        email,
        password: hashedPassword,
        role: "user",
        settings: { darkMode: false, testTimer: 30 },
        isActive: true
      });
      
      await userRepository.save(user);
      
      // Генерация токенов
      const { accessToken, refreshToken, jti } = generateTokens(user.id);
      
      // Сохранение refresh токена в базе
      await tokenService.saveRefreshToken(user.id, refreshToken, jti);
      
      // Формируем ответ с полным объектом пользователя
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        settings: user.settings,
        isActive: user.isActive,
        createdAt: user.createdAt
      };
      
      sendSuccess(res, { 
        message: "Регистрация прошла успешно", 
        accessToken,
        refreshToken,
        user: userResponse
      }, 201);
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error);
      } else if (error instanceof Error) {
        sendError(res, new ApiError(500, error.message));
      } else {
        sendError(res, new ApiError(500, "Unknown error"));
      }
    }
  },

  // Вход в систему
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const userRepository = AppDataSource.getRepository(User);
      
      // Поиск пользователя
      const user = await userRepository.findOne({ 
        where: { email },
        select: ["id", "password", "role", "isActive", "username", "email", "settings", "createdAt"]
      });
      
      if (!user) {
        throw ApiError.Unauthorized("Неверные учетные данные");
      }
      
      if (!user.isActive) {
        throw ApiError.Forbidden("Аккаунт деактивирован");
      }
      
      // Проверка пароля
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw ApiError.Unauthorized("Неверные учетные данные");
      }
      
      // Генерация токенов
      const { accessToken, refreshToken, jti } = generateTokens(user.id);
      
      // Сохранение refresh токена в базе
      await tokenService.saveRefreshToken(user.id, refreshToken, jti);
      
      // Формируем ответ с полным объектом пользователя
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        settings: user.settings,
        isActive: user.isActive,
        createdAt: user.createdAt
      };
      
      sendSuccess(res, { 
        message: "Вход выполнен успешно", 
        accessToken,
        refreshToken,
        user: userResponse
      });
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error);
      } else if (error instanceof Error) {
        sendError(res, new ApiError(500, error.message));
      } else {
        sendError(res, new ApiError(500, "Unknown error"));
      }
    }
  },

  // Обновление токена доступа
refreshToken: async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    // Добавлена проверка на валидность токена
    if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
      throw ApiError.BadRequest("Invalid refresh token");
    }

    // Проверка в чёрном списке
    if (await tokenService.isTokenBlacklisted(refreshToken)) {
      throw ApiError.Unauthorized("Токен отозван");
    }

      // Верификация токена
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { 
        userId: number;
        jti: string;
        exp: number;
      };
      
      // Проверка срока действия
      if (decoded.exp * 1000 < Date.now()) {
        throw ApiError.Unauthorized("Срок действия refresh token истек");
      }
      
      // Проверка jti в базе
      const isValid = await tokenService.isValidTokenId(decoded.userId, decoded.jti);
      if (!isValid) {
        throw ApiError.Unauthorized("Недействительный токен");
      }
      
      // Проверка пользователя
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ 
        where: { id: decoded.userId },
        select: ["id", "username", "email", "role", "settings", "isActive", "createdAt"]
      });
      
      if (!user) {
        throw ApiError.NotFound("Пользователь не найден");
      }
      
      if (!user.isActive) {
        throw ApiError.Forbidden("Аккаунт деактивирован");
      }
      
      // Генерация новых токенов
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, jti: newJti } = generateTokens(decoded.userId);
      
      // Инвалидация старого токена
      await tokenService.blacklistToken(refreshToken);
      
      // Сохранение нового refresh токена
      await tokenService.saveRefreshToken(decoded.userId, newRefreshToken, newJti);
      
      // Формируем ответ с полным объектом пользователя
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        settings: user.settings,
        isActive: user.isActive,
        createdAt: user.createdAt
      };
      
      sendSuccess(res, { 
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userResponse
      });
      
    } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        sendError(res, ApiError.Unauthorized("Срок действия refresh token истек"));
      } else if (error.message.includes("Invalid refresh token")) {
        sendError(res, ApiError.BadRequest("Недопустимый refresh token"));
      } else {
        sendError(res, ApiError.Unauthorized("Недействительный refresh token"));
      }
    } else {
      sendError(res, ApiError.InternalServerError("Неизвестная ошибка при обработке токена"));
    }
  }
},

// Выход из системы
logout: async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    // Добавлена проверка на валидность токена
    if (!refreshToken || refreshToken === "undefined" || refreshToken === "null") {
      throw ApiError.BadRequest("Invalid refresh token");
    }
    
    // Инвалидация токена
    await tokenService.blacklistToken(refreshToken);
    
    sendSuccess(res, { message: "Выход выполнен успешно" });
  } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error);
      } else if (error instanceof Error) {
        sendError(res, new ApiError(500, error.message));
      } else {
        sendError(res, new ApiError(500, "Unknown error"));
      }
    }
  },

  // Проверка аутентификации
  checkAuth: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({ 
        where: { id: userId },
        select: ["id", "username", "email", "role", "settings", "createdAt", "isActive"]
      });

      if (!user) {
        throw ApiError.NotFound("User not found");
      }

      sendSuccess(res, { 
        isValid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          settings: user.settings,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        sendError(res, error);
      } else if (error instanceof Error) {
        sendError(res, new ApiError(500, error.message));
      } else {
        sendError(res, new ApiError(500, "Unknown error"));
      }
    }
  }
};