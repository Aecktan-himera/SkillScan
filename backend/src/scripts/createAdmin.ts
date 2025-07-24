import { AppDataSource } from '../config/data-source';
import { AdminService } from '../services/admin.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function initializeAdmin() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  const adminService = new AdminService();
  
  const adminData = {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'securePassword123'
  };
  
  try {
    const admin = await adminService.createAdmin(adminData);
    console.log('Администратор создан:', admin);
  } catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.log('Ошибка:', errorMessage);
} finally {
    await AppDataSource.destroy();
  }
}

initializeAdmin().catch(error => {
  console.error('Ошибка инициализации администратора:', error);
});
 