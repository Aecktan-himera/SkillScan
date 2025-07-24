import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import logger from "../utils/logger";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Важно: строка!
  database: process.env.DB_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [path.join(__dirname, '/../entities/*.js')],
  migrations: [path.join(__dirname, '/../migrations/*.js')],
  synchronize: false,
  logging: true
});

// Добавьте проверку переменных
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("Database configuration is incomplete");
}


// Инициализация подключения к базе данных
export const initializeDB = async () => {
  try {
    await AppDataSource.initialize();
    logger.info("Connected to PostgreSQL");
  } catch (error) {
    let errorMessage = "Unknown database connection error";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    logger.error(`Error connecting to PostgreSQL: ${errorMessage}`);
    throw new Error(`Database connection failed: ${errorMessage}`);
  }
};