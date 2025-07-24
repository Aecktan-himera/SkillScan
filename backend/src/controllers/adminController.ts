import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { AdminService } from "../services/admin.service";
import logger from "../utils/logger";

// Константы для сообщений об ошибках
const ERRORS = {
    REQUIRED_FIELDS: "Все поля обязательны для заполнения",
    PASSWORD_LENGTH: "Пароль должен содержать минимум 6 символов",
    INVALID_EMAIL: "Некорректный формат email",
    USER_EXISTS: "Пользователь с такими данными уже существует",
    INTERNAL_ERROR: "Внутренняя ошибка сервера",
    USER_NOT_FOUND: "Пользователь не найден",
    LAST_ADMIN: "Невозможно удалить/деактивировать последнего администратора",
    SELF_ACTION: "Вы не можете выполнить это действие над своим аккаунтом"
};


export class AdminController {
  private static adminService = new AdminService();

  static async createUser(req: Request, res: Response) {
    const { username, email, password, role } = req.body;
    
    try {
      const user = await AdminController.adminService.createUser({ 
        username, 
        email, 
        password,
        role: role || "user" 
      });
      
      logger.info(`Создан пользователь: ${email}`);
      return sendSuccess(res, user, 201);
    } catch (error) {
      return AdminController.handleCreateError(res, error);
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await AdminController.adminService.getAllUsers();
      return sendSuccess(res, users);
    } catch (error) {
      return AdminController.handleGeneralError(res, error);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = parseInt(req.params.id);
    const currentUserId = (req as any).userId; // ID текущего пользователя
    
    if (isNaN(userId)) {
      return sendError(res, ApiError.BadRequest("Некорректный ID пользователя"));
    }
    
    try {
      await AdminController.adminService.deleteUser(userId, currentUserId);
      logger.info(`Пользователь удален: ID ${userId} | Инициатор: ${currentUserId}`);
      return sendSuccess(res, { message: "Пользователь успешно удален" });
    } catch (error) {
      return AdminController.handleDeleteError(res, error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response) {
    const userId = parseInt(req.params.id);
    const currentUserId = (req as any).userId; // ID текущего пользователя
    
    if (isNaN(userId)) {
      return sendError(res, ApiError.BadRequest("Некорректный ID пользователя"));
    }
    
    try {
      const user = await AdminController.adminService.toggleUserStatus(userId, currentUserId);
      const status = user.isActive ? "активирован" : "заблокирован";
      logger.info(`Статус пользователя изменен: ID ${userId} -> ${status} | Инициатор: ${currentUserId}`);
      return sendSuccess(res, user);
    } catch (error) {
      return AdminController.handleToggleError(res, error);
    }
  }

  private static handleCreateError(res: Response, error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes(ERRORS.USER_EXISTS)) {
        logger.warn(`Попытка создания дубликата пользователя: ${error.message}`);
        return sendError(res, ApiError.Conflict(error.message));
      }
      
      logger.error(`Ошибка создания пользователя: ${error.message}`);
      return sendError(res, ApiError.BadRequest(error.message));
    }
    
    logger.error(`Неизвестная ошибка при создании пользователя`);
    return sendError(res, ApiError.InternalServerError(ERRORS.INTERNAL_ERROR));
  }

  private static handleDeleteError(res: Response, error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes(ERRORS.USER_NOT_FOUND)) {
        logger.warn(`Попытка удаления несуществующего пользователя: ${error.message}`);
        return sendError(res, ApiError.NotFound(error.message));
      }
      
      if (error.message.includes("последнего администратора")) {
        logger.warn(`Попытка удаления последнего администратора: ${error.message}`);
        return sendError(res, ApiError.Forbidden(ERRORS.LAST_ADMIN));
      }
      
      if (error.message.includes("свой собственный")) {
        logger.warn(`Попытка удаления своего аккаунта: ${error.message}`);
        return sendError(res, ApiError.Forbidden(ERRORS.SELF_ACTION));
      }
      
      logger.error(`Ошибка удаления пользователя: ${error.message}`);
      return sendError(res, ApiError.InternalServerError(error.message));
    }
    
    logger.error(`Неизвестная ошибка при удалении пользователя`);
    return sendError(res, ApiError.InternalServerError(ERRORS.INTERNAL_ERROR));
  }

  private static handleToggleError(res: Response, error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes(ERRORS.USER_NOT_FOUND)) {
        logger.warn(`Попытка изменения статуса несуществующего пользователя: ${error.message}`);
        return sendError(res, ApiError.NotFound(error.message));
      }
      
      if (error.message.includes("последнего активного администратора")) {
        logger.warn(`Попытка деактивации последнего администратора: ${error.message}`);
        return sendError(res, ApiError.Forbidden(ERRORS.LAST_ADMIN));
      }
      
      if (error.message.includes("свой аккаунт")) {
        logger.warn(`Попытка изменения статуса своего аккаунта: ${error.message}`);
        return sendError(res, ApiError.Forbidden(ERRORS.SELF_ACTION));
      }
      
      logger.error(`Ошибка изменения статуса пользователя: ${error.message}`);
      return sendError(res, ApiError.InternalServerError(error.message));
    }
    
    logger.error(`Неизвестная ошибка при изменении статуса пользователя`);
    return sendError(res, ApiError.InternalServerError(ERRORS.INTERNAL_ERROR));
  }

  private static handleGeneralError(res: Response, error: unknown) {
    if (error instanceof ApiError) {
      logger.error(`API ошибка: ${error.message}`);
      return sendError(res, error);
    }
    
    if (error instanceof Error) {
      logger.error(`Ошибка в контроллере: ${error.message}`);
      return sendError(res, ApiError.InternalServerError(error.message));
    }
    
    logger.error(`Неизвестная ошибка в контроллере`);
    return sendError(res, ApiError.InternalServerError(ERRORS.INTERNAL_ERROR));
  }
}