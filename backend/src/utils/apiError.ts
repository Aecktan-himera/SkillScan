export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public originalError?: Error // Сохраняем оригинальную ошибку
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    
    // Сохраняем стек оригинальной ошибки
    if (originalError) {
      this.stack = `${this.stack}\nOriginal: ${originalError.stack}`;
    }
  }

  static NotFound(message: string = "Ресурс не найден", error?: Error) {
    return new ApiError(404, message, true, error);
  }

  static Unauthorized(message: string = "Не авторизован", error?: Error) {
    return new ApiError(401, message, true, error);
  }

  static Forbidden(message: string = "Доступ запрещен", error?: Error) {
    return new ApiError(403, message, true, error);
  }

  static BadRequest(message: string = "Некорректный запрос", error?: Error) {
    return new ApiError(400, message, true, error);
  }

  static InternalServerError(message: string = "Внутренняя ошибка сервера", error?: Error) {
    return new ApiError(500, message, true, error);
  }

  static Conflict(message: string = "Конфликт данных", error?: Error) {
    return new ApiError(409, message, true, error);
  }
}