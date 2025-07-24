import Joi from "joi";

// Схема для регистрации
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Имя пользователя должно содержать минимум 3 символа",
    "string.max": "Имя пользователя должно содержать максимум 30 символов",
    "any.required": "Имя пользователя обязательно для заполнения",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Некорректный формат email",
    "any.required": "Email обязателен для заполнения",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Пароль должен содержать минимум 6 символов",
    "any.required": "Пароль обязателен для заполнения",
  }),
});

// Схема для входа
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Некорректный формат email",
    "any.required": "Email обязателен для заполнения",
  }),
  password: Joi.string().required().messages({
    "any.required": "Пароль обязателен для заполнения",
  }),
});

// Схема для обновления токена
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .invalid("undefined", "null") // Запрещаем значения "undefined" и "null"
    .messages({
      "any.required": "Refresh token обязателен",
      "any.invalid": "Недопустимое значение refresh token"
    }),
});