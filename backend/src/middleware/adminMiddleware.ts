import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";

// Инициализируем репозиторий один раз при загрузке модуля
const userRepository = AppDataSource.getRepository(User);

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).userId;

  if (!userId) {
    return next(ApiError.Unauthorized());
  }

  try {
    const user = await userRepository.findOne({ 
      where: { id: userId },
      select: ["id", "role"] // Запрашиваем только необходимые поля
    });

    if (!user) {
      return next(ApiError.NotFound("Пользователь не найден"));
    }

    if (user.role !== "admin") {
      logger.warn(`Попытка доступа к админ-панели без прав: user ID ${userId}`);
      return next(ApiError.Forbidden());
    }

    next();
  } catch (error) {
    logger.error(`Ошибка в adminMiddleware: ${error instanceof Error ? error.message : error}`);
    next(ApiError.InternalServerError());
  }
};