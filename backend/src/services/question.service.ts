import { AppDataSource } from "../config/data-source";
import { Question } from "../entities/Question";
import { Option } from "../entities/Option";
import { Topic } from "../entities/Topic";
import {User} from "../entities/User"

export class QuestionService {
  private questionRepository = AppDataSource.getRepository(Question);
  private optionRepository = AppDataSource.getRepository(Option);
  private topicRepository = AppDataSource.getRepository(Topic);
  private userRepository = AppDataSource.getRepository(User); // Добавляем репозиторий пользователей

  async addQuestion(
    topic_id: number,//topicId
    text: string,
    explanation: string,
    difficulty: "easy" | "medium" | "hard",
    options: Array<{ text: string; isCorrect: boolean }>,
    createdById: number
  ) {
  // Проверка темы
  const topic = await this.topicRepository.findOne({ where: { id: topic_id } });//topicId
  if (!topic) throw new Error("Topic not found");

  // Проверка создателя
  const createdBy = await this.userRepository.findOne({ where: { id: createdById } });
  if (!createdBy) throw new Error("User not found");

  // Проверка вариантов
  const correctOptions = options.filter(opt => opt.isCorrect);
  if (correctOptions.length !== 1) {
    throw new Error("Должен быть ровно один правильный вариант");
  }

  // Создание вопроса
  const question = this.questionRepository.create({
    topic,
    text,
    explanation,
    difficulty,
    createdBy // Устанавливаем создателя
  });

  await this.questionRepository.save(question);

  // Создание вариантов
  const optionEntities = options.map(opt => 
    this.optionRepository.create({
      ...opt,
      question
    })
  );

  await this.optionRepository.save(optionEntities);

  return question;
}

  async getTopics() {
    return this.topicRepository.find();
  }
}