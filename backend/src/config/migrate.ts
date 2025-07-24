import { AppDataSource } from "./data-source";
import { FinalSchema } from "../migrations/1234567890-FinalSchema";
import logger from "../utils/logger";

export async function runMigrations() {
  try {
    // Проверка наличия таблицы миграций
    const hasMigrationTable = await AppDataSource.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables 
       WHERE table_name = 'migrations')`
    );

    // Если миграции уже были применены
    if (hasMigrationTable[0].exists) {
      logger.info("Migrations already applied, skipping");
      return;
    }

    // Применение финальной схемы
    const migration = new FinalSchema();
    await migration.up(AppDataSource.createQueryRunner());
    
    logger.info("Database schema initialized");
  } catch (error) {
    logger.error("Migration failed", error);
    throw error;
  }
}