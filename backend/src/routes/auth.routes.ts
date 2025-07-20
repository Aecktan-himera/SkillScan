import * as express from "express";
import AuthController from "../controllers/authController";
import { validateRequest } from "../middleware/validationMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";
import { loginSchema, registerSchema, refreshTokenSchema } from "../validators/authValidators";

const router = express.Router();

// Регистрация нового пользователя
router.post("/register", validateRequest(registerSchema), AuthController.register);

// Вход в систему
router.post("/login", validateRequest(loginSchema), AuthController.login);

// Обновление токена доступа с валидацией
router.post("/refresh", validateRequest(refreshTokenSchema), AuthController.refreshToken);

// Выход из системы
router.post("/logout", AuthController.logout); 

// Проверка аутентификации
router.get("/check", authMiddleware, AuthController.checkAuth); 




export default router;