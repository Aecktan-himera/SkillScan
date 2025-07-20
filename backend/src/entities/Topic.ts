import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Question } from "./Question";
import { TestHistory } from "./TestHistory";

@Entity("topics")
export class Topic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column("text", { nullable: true })
  description?: string;

  // Связь с вопросами
  @OneToMany(() => Question, (question) => question.topic)
  questions!: Question[];

  // Связь с историей тестов
  @OneToMany(() => TestHistory, (history) => history.topic, {
    onDelete: "SET NULL" // Согласовано с миграцией
  })
  testHistories!: TestHistory[];
}