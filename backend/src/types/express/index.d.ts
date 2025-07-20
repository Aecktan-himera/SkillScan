import { User } from "../../../src/entities/User";

declare global {
  namespace Express {
    interface Request {
      userId?: number; // ID авторизованного пользователя
      user?: User;     // Полный объект пользователя (опционально)
    }
  }
}
