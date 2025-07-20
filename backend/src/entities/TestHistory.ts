import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Topic } from "./Topic";

@Entity({ name: "test_history" })
export class TestHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.testHistory, {
    onDelete: "CASCADE",
    nullable: false
  })

  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Topic, (topic) => topic.testHistories, {
    onDelete: "SET NULL",
    nullable: true
  })
  @JoinColumn({ name: "topic_id" })
  topic!: Topic | null;

  @Column("int")
  score!: number;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    name: "completed_at"
  })
  completedAt!: Date;

  @Column("jsonb", { nullable: false })
  answers!: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;

  @Column("int", { name: "time_spent", nullable: false })
  timeSpent!: number;



}