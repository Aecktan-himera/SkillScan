import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { JWT_EXPIRES_IN } from "../config/constants";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(username: string, email: string, password: string) {
    // Проверка существующего пользователя
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }]
    });
    
    if (existingUser) {
      throw new Error("Пользователь с таким email или именем уже существует");
    }
    
    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создание пользователя
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    settings: { darkMode: false, testTimer: 30 }
    });
    
    return await this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new Error("Неверные учетные данные");
    
    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Неверные учетные данные");
    
    // Генерация JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return { user, token };
  }
}