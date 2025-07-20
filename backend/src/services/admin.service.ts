import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import { Repository, Not } from "typeorm";
import logger from "../utils/logger";

// Типы данных
export type AdminData = {
  username: string;
  email: string;
  password: string;
  role?: "user" | "admin";
};

export type CreateUserData = AdminData & {
  role: "user" | "admin";
};

export class AdminService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  private async validateUserData(data: AdminData) {
    const { username, email, password } = data;
    
    // Проверка обязательных полей
    if (!username || !email || !password) {
      throw new Error("Все поля обязательны для заполнения");
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Некорректный формат email");
    }

    // Проверка длины пароля
    if (password.length < 6) {
      throw new Error("Пароль должен содержать минимум 6 символов");
    }

    // Проверка существующего пользователя
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });
    
    if (existingUser) {
      throw new Error("Пользователь с такими данными уже существует");
    }
  }

  async createAdmin(adminData: AdminData) {
    await this.validateUserData(adminData);
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Создание администратора
    const admin = this.userRepository.create({
      ...adminData,
      password: hashedPassword,
      role: "admin",
      settings: { darkMode: false, testTimer: 30 },
      isActive: true
    });
    
    await this.userRepository.save(admin);
    
    // Возвращаем данные без пароля
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  async createUser(userData: CreateUserData) {
    await this.validateUserData(userData);
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Создание пользователя
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      settings: { darkMode: false, testTimer: 30 },
      isActive: true
    });
    
    await this.userRepository.save(user);
    
    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    return this.userRepository.find({
      select: [
        "id", 
        "username", 
        "email", 
        "role", 
        "settings", 
        "createdAt",
        "isActive"
      ]
    });
  }

  async deleteUser(id: number, currentUserId: number) {
    // Находим пользователя для удаления
    const userToDelete = await this.userRepository.findOneBy({ id });
    
    if (!userToDelete) {
      throw new Error("Пользователь не найден");
    }

    // Защита от удаления самого себя
    if (userToDelete.id === currentUserId) {
      throw new Error("Вы не можете удалить свой собственный аккаунт");
    }

    // Защита от удаления последнего администратора
    if (userToDelete.role === "admin") {
      const activeAdmins = await this.userRepository.find({
        where: { 
          role: "admin", 
          isActive: true,
          id: Not(id) // Исключаем текущего пользователя из подсчета
        }
      });
      
      if (activeAdmins.length === 0) {
        throw new Error("Невозможно удалить последнего администратора");
      }
    }

    // Выполняем удаление
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new Error("Пользователь не найден");
    }
  }

  async toggleUserStatus(id: number, currentUserId: number) {
    // Находим пользователя
    const user = await this.userRepository.findOneBy({ id });
    
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Защита от деактивации самого себя
    if (user.id === currentUserId) {
      throw new Error("Вы не можете изменить статус своего аккаунта");
    }

    // Защита от деактивации последнего администратора
    if (user.role === "admin" && user.isActive) {
      const activeAdmins = await this.userRepository.count({
        where: { 
          role: "admin", 
          isActive: true,
          id: Not(id) // Исключаем текущего пользователя из подсчета
        }
      });
      
      if (activeAdmins === 0) {
        throw new Error("Невозможно деактивировать последнего активного администратора");
      }
    }
    
    // Изменяем статус
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    
    return user;
  }
}