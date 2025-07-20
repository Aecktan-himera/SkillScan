import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { TestHistory } from "./TestHistory";
import { Question } from "./Question";
import { Token } from "./Token";


@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column({ length: 100, select: false })
  password!: string;

  @Column({
    type: "varchar",
    length: 10,
    default: "user"
  })
  role!: "user" | "admin";

  @Column({
    type: "jsonb",
    default: { darkMode: false, testTimer: 30 }
  })
  settings!: {
    darkMode: boolean;
    testTimer: number | null;
  };

  @Column({
    name: 'is_active',
    default: true
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt!: Date;

  @OneToMany(() => TestHistory, (testHistory) => testHistory.user)
  testHistory!: TestHistory[];

  @OneToMany(() => Question, (question) => question.createdBy)
  questions!: Question[];

  @OneToMany(() => Token, token => token.user)
  tokens!: Token[];


}
