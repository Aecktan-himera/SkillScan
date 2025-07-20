import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("tokens")
export class Token {
  @PrimaryGeneratedColumn()
  id!: number; // Добавляем оператор утверждения !

  @Column({ unique: true })
  token!: string;

  @Column({ unique: true })
  jti!: string; // Добавляем оператор утверждения !

  @Index() // Для быстрой очистки
  @Column({ name: 'expires_at' })
  expiresAt!: Date; // Добавляем оператор утверждения !

  @Column({ default: false })
  blacklisted!: boolean; // Добавляем оператор утверждения !

  @ManyToOne(() => User, user => user.tokens)
  @JoinColumn({ name: "user_id" })
  user!: User; // Добавляем оператор утверждения !

  @Index() // Для оптимизации поиска
  @Column({ name: 'user_id' })
  userId!: number;

}