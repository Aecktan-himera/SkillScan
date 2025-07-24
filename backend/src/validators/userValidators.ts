import Joi from "joi";

// Схема для обновления профиля
export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional().messages({
    "string.min": "Имя пользователя должно содержать минимум 3 символа",
    "string.max": "Имя пользователя должно содержать максимум 30 символов",
  }),
  email: Joi.string().email().normalize().optional().messages({
    "string.email": "Некорректный формат email",
  }),
  currentPassword: Joi.string().optional().messages({
    "any.required": "Текущий пароль обязателен при смене пароля" // Сообщение будет через custom
  }),
  newPassword: Joi.string()
    .min(6)
    .invalid(Joi.ref("currentPassword"))
    .optional()
    .messages({
      "string.min": "Новый пароль должен содержать минимум 6 символов",
      "any.invalid": "Новый пароль должен отличаться от текущего"
    }),
})
.min(1)
.custom((value, helpers) => {
  // Кастомная проверка зависимости паролей
  if (value.newPassword && !value.currentPassword) {
    return helpers.error("any.invalid", {
      message: "Текущий пароль обязателен при смене пароля"
    });
  }
  return value;
})
.messages({
  "object.min": "Хотя бы одно поле должно быть указано для обновления",
  "any.invalid": "Текущий пароль обязателен при смене пароля"
});

// Схема для настроек пользователя
export const settingsSchema = Joi.object({
  darkMode: Joi.boolean().required().messages({
    "any.required": "Параметр darkMode обязателен",
  }),
  testTimer: Joi.number().integer().min(0).allow(null).required().messages({
    "any.required": "Параметр testTimer обязателен",
    "number.base": "Таймер должен быть числом",
    "number.min": "Таймер не может быть отрицательным"
  }),
});

// Схема для смены пароля
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Текущий пароль обязателен",
  }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Новый пароль должен содержать минимум 6 символов",
      "any.required": "Новый пароль обязателен",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword")) // Основная проверка совпадения
    .required()
    .messages({
      "any.only": "Пароли не совпадают",
      "any.required": "Подтверждение пароля обязательно"
    })
});

//export const updateProfileSchema = Joi.any();
//export const changePasswordSchema = Joi.any();