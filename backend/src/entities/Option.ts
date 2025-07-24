import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Question } from "./Question";

@Entity("options")
export class Option {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // number

  @Column("text")
  text!: string;

  @Column({ name: "is_correct" })  // Совместимость с фронтендом
  isCorrect!: boolean;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: "CASCADE"
  })
  question!: Question;
}