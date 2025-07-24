import * as express from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { updateProfileSchema, 
  settingsSchema,
  changePasswordSchema } from "../validators/userValidators";

const router = express.Router();

// Получение профиля текущего пользователя
router.get(
  "/profile", 
  authMiddleware, 
  UserController.getProfile
);

// Обновление профиля пользователя
router.patch("/profile", 
  authMiddleware, 
  validateRequest(updateProfileSchema, "body"), 
  UserController.updateProfile
);

// Настройки
router.patch("/settings", 
  authMiddleware, 
  validateRequest(settingsSchema, "body"), 
  UserController.updateSettings
);

// Смена пароля
router.patch("/password", 
  authMiddleware, 
  validateRequest(changePasswordSchema, "body"), 
  UserController.changePassword
);

// Статистика
router.get("/stats", 
  authMiddleware, 
  UserController.getUserStats
);

// Удаление аккаунта
router.delete("/account", 
  authMiddleware, 
  UserController.deleteAccount
);

export default router;