import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path"; // Добавлен для работы с путями
import { initializeDB, AppDataSource } from "./config/data-source";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import topicRoutes from "./routes/topic.routes";
import questionRoutes from "./routes/question.routes";
import logger from "./utils/logger";
import morgan from "morgan";
import { ApiError } from "./utils/apiError";
import { sendError } from "./utils/response";
import { seedInitialData } from "./config/seed"; // Импорт функции для начального заполнения данных
import { runMigrations } from "./config/migrate"; // Импорт функции для запуска миграций

// Безопасная загрузка .env
dotenv.config();

// Проверка обязательных переменных окружения
const requiredEnvVars = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_SECRET', 'REFRESH_TOKEN_SECRET'
];

requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    logger.error(`Missing required environment variable: ${env}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Интерфейс и поток для Morgan
interface MorganStream {
  write: (message: string) => void;
}

// Кастомный токен для Morgan с фильтрацией чувствительных данных
morgan.token('redacted-body', (req: express.Request) => {
  if (!req.body) return '';

  const safeBody = { ...req.body };

  // Фильтрация чувствительных полей
  if (safeBody.password) safeBody.password = '***';
  if (safeBody.newPassword) safeBody.newPassword = '***';
  if (safeBody.currentPassword) safeBody.currentPassword = '***';
  if (safeBody.refreshToken) safeBody.refreshToken = '***';

  return JSON.stringify(safeBody);
});

const morganStream: MorganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Конфигурация CORS
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  credentials: true,
  maxAge: 86400, // 24 часа
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// ===== ИСПРАВЛЕННЫЙ ПОРЯДОК MIDDLEWARE =====
app.use(cors(corsOptions));// Должен быть ПЕРВЫМ!
app.options('*', cors(corsOptions));

// Настройка Helmet с учетом среды выполнения
if (process.env.NODE_ENV === 'development') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    noSniff: true // Явно включаем X-Content-Type-Options
  }));
} else {
  app.use(helmet({
    noSniff: true // Явно включаем в production
  }));
}

// Middleware для управления заголовками
app.use((_req, res, next) => {
  // Добавляем X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Удаляем устаревшие заголовки
  res.removeHeader('Expires');
  res.removeHeader('Pragma');

  // Устанавливаем современный Cache-Control
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  next();
});

app.use(express.json());
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms\nBody: :redacted-body',
  { stream: morganStream }
));

app.use(express.static('public', {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год для статики
  }
}));

// Health check
app.get('/health', async (req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({ status: 'unhealthy', error: "DB connection failed" });
  }
});

// Инициализация базы данных с миграциями и начальными данными
const startServer = async () => {
  try {
    // Инициализация подключения к БД
    await initializeDB();
    logger.info("Database connection established");

    // Запуск миграций
    await runMigrations();
    logger.info("Database migrations applied");

    // Заполнение начальных данных
    await seedInitialData();
    logger.info("Initial data seeding completed");

    // Дополнительная проверка активности БД
    try {
      await AppDataSource.query("SELECT 1");
      logger.info("Database ping successful");
    } catch (dbError) {
      logger.error("Database connection failed after initialization", dbError);
      throw new Error("DB connection not active");
    }

    // Маршруты
    app.use("/api/auth", authRoutes);
    app.use("/api/topics", topicRoutes);
    app.use("/api/tests", testRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/admin/questions", questionRoutes);

    // Обработка 404
    app.use((req, res, next) => {
      next(ApiError.NotFound("Resource not found"));
    });

    // Централизованный обработчик ошибок
    app.use((
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || '*');
      res.header("Access-Control-Allow-Credentials", "true");
      logger.error(`Unhandled error: ${err.message}`, {
        url: req.originalUrl,
        method: req.method,
        stack: err.stack
      });

      if (err instanceof ApiError) {
        sendError(res, err);
      } else {
        sendError(res, ApiError.InternalServerError(
          process.env.NODE_ENV === 'development'
            ? err.message
            : "Internal Server Error"
        ));
      }
    });

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS origin: ${corsOptions.origin}`);
    });

  } catch (error) {
    logger.error("Failed to start server:", error instanceof Error ? error.stack : error);
    process.exit(1);
  }
};

// Обработка неотловленных ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', error => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

startServer();