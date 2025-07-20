import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Token } from "../entities/Token"
import { JWT_SECRET } from "../config/constants";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Инициализация репозитория
  const userRepository = AppDataSource.getRepository(User);
  try {
    // Извлечение токена из заголовка
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1]; // Bearer <token>
    
    if (!token) throw ApiError.Unauthorized("Требуется аутентификация");

    // Только верификация JWT
    logger.debug(`Verifying token: ${token?.substring(0, 15)}...`)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    logger.debug(`Token valid for user: ${decoded.userId}`);

    // Поиск пользователя
    const user = await userRepository.findOneBy({ id: decoded.userId });
    if (!user) {
      throw ApiError.NotFound("Пользователь не найден");
    }
    
    // Проверка активности аккаунта
    if (!user.isActive) {
      throw ApiError.Forbidden("Аккаунт деактивирован");
    }

    // Добавление ID пользователя в запрос
    (req as any).userId = user.id;
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(
        error.name === "TokenExpiredError"
          ? ApiError.Unauthorized("Срок действия токена истек")
          : ApiError.Unauthorized("Неверный токен")
      );
    } else {
      next(ApiError.InternalServerError("Unknown error"));
    }
  }
};
    /*const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1]; // Bearer <token>

    if (!token) {
      throw ApiError.Unauthorized("Требуется аутентификация");
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      clockTolerance: 3600 * 3 // 3 часа коррекции
    }) as { userId: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.userId });

    if (!user) {
      throw ApiError.NotFound("Пользователь не найден");
    }

    const tokenEntity = await AppDataSource.getRepository(Token).findOne({
      where: { token, blacklisted: false }
    });

    if (!tokenEntity) {
      throw ApiError.Unauthorized("Token revoked");
    }

    (req as any).userId = user.id;
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(
        error.name === "TokenExpiredError"
          ? ApiError.Unauthorized("Срок действия токена истек")
          : ApiError.Unauthorized("Неверный токен")
      );
    } else {
      next(ApiError.InternalServerError("Unknown error"));
    }
  }
};*/