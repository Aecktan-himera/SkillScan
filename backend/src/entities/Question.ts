import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, 
  CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Option } from "./Option";
import { Topic } from "./Topic";
import {User} from "./User"

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string; //number

  @Column("text")
  text!: string;

  @ManyToOne(() => Topic, topic => topic.questions, { onDelete: "CASCADE" })
  @JoinColumn()
  topic!: Topic;

  @Column("text", { nullable: true })
  explanation?: string;

  @Column({
    type: "enum",
    enum: ["easy", "medium", "hard"],
    default: "medium"
  })
  difficulty!: "easy" | "medium" | "hard";

  @OneToMany(() => Option, option => option.question, { 
    cascade: true,
    eager: true
  })
  options!: Option[];

  @CreateDateColumn({ name: "created_at" })
createdAt!: Date;

@ManyToOne(() => User, user => user.questions)
  @JoinColumn({ name: "created_by" })
  createdBy!: User;

}