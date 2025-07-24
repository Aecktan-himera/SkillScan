import { AppDataSource } from "../config/data-source";
import { Token } from "../entities/Token";
import { Repository, MoreThanOrEqual } from "typeorm";

class TokenService {
  private tokenRepository: Repository<Token>;

  constructor() {
    this.tokenRepository = AppDataSource.getRepository(Token);
  }

  // Сохранение токена в базу
  async saveRefreshToken(userId: number, token: string, jti: string): Promise<Token> {
    const tokenRecord = this.tokenRepository.create({
      user: { id: userId },
      token,
      jti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
    });
    
    return await this.tokenRepository.save(tokenRecord);
  }

  // Проверка нахождения токена в чёрном списке
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { token, blacklisted: true }
    });
    return !!tokenRecord;
  }

  // Проверка валидности jti
  async isValidTokenId(userId: number, jti: string): Promise<boolean> {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { 
        user: { id: userId }, 
        jti, 
        blacklisted: false,
        expiresAt: MoreThanOrEqual(new Date()) // Проверка срока действия
      }
    });
    return !!tokenRecord;
  }

  // Добавление токена в чёрный список по значению токена
  async blacklistToken(token: string): Promise<void> {
    await this.tokenRepository.update(
      { token },
      { blacklisted: true }
    );
  }

  // Безопасная инвалидация по jti (предпочтительный метод)
  async blacklistTokenByJti(jti: string): Promise<void> {
    await this.tokenRepository.update(
      { jti },
      { blacklisted: true }
    );
  }

  // Очистка просроченных токенов
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("expiresAt < :now", { now: new Date() })
      .execute();
  }

  // Безопасная инвалидация всех токенов пользователя
  async blacklistAllUserTokens(userId: number): Promise<void> {
    await this.tokenRepository.update(
      { user: { id: userId } },
      { blacklisted: true }
    );
  }
}

export default new TokenService();