import { AppDataSource } from "../config/data-source";
import { Question } from "../entities/Question";
import { TestHistory } from "../entities/TestHistory";
import { User } from "../entities/User";
import { QUESTIONS_PER_TEST } from "../config/constants";
import { Topic } from "../entities/Topic";
import { In } from "typeorm";

export class TestService {
  private questionRepository = AppDataSource.getRepository(Question);
  private testHistoryRepository = AppDataSource.getRepository(TestHistory);

  async calculateTestResults(
    questions: Question[],
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ) {
    let correctCount = 0;
    const results = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);

// Всегда гарантируем булево значение
    let isCorrect = false;

    if (question) {
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      // Сравнение с приведением к строке
      if (correctOption && answer.selectedOptionId) {
        isCorrect = correctOption.id.toString() === answer.selectedOptionId.toString();
      }
    }
    
    if (isCorrect) correctCount++;
    return { ...answer, isCorrect };
  });
    
    return {
      score: (correctCount / answers.length) * 100,
      correct: correctCount,
      total: answers.length,
      detailedResults: results
    };
  }

  async getRandomQuestions(topic_id: number, count: number) {
  // 1. Проверка количества вопросов
  const totalQuestions = await this.questionRepository.count({
    where: { topic: { id: topic_id } },
  });

  if (totalQuestions < count) {
    throw new Error(`Not enough questions. Required: ${count}, available: ${totalQuestions}`);
  }

  // 2. Получаем случайные ID вопросов
  const randomIds = await this.questionRepository
    .createQueryBuilder("question")
    .select("question.id")
    .where("question.topic_id = :topic_id", { topic_id })
    .orderBy("RANDOM()")
    .take(count)
    .getRawMany();

  const ids = randomIds.map(item => item.question_id);

  // 3. Получаем полные вопросы с опциями
  return await this.questionRepository
    .createQueryBuilder("question")
    .leftJoinAndSelect("question.options", "options")
    .where("question.id IN (:...ids)", { ids })
    .getMany();
}

  async getAnswerStatistics() {
    const allTests = await this.testHistoryRepository.find({
      relations: ["topic"]
    });
    
    const stats = {
      overall: { correct: 0, incorrect: 0 },
      byTopic: new Map<string, { correct: number; incorrect: number }>()
    };
    
    allTests.forEach(test => {
      test.answers.forEach((answer: any) => {
        if (answer.isCorrect) {
          stats.overall.correct++;
        } else {
          stats.overall.incorrect++;
        }
        
        const topicName = test.topic?.name || "Unknown Topic";
        if (!stats.byTopic.has(topicName)) {
          stats.byTopic.set(topicName, { correct: 0, incorrect: 0 });
        }
        
        const topicStats = stats.byTopic.get(topicName)!;
        if (answer.isCorrect) {
          topicStats.correct++;
        } else {
          topicStats.incorrect++;
        }
      });
    });
    
    // Преобразование в проценты
    const total = stats.overall.correct + stats.overall.incorrect;
    if (total > 0) {
      stats.overall.correct = Math.round((stats.overall.correct / total) * 100);
      stats.overall.incorrect = 100 - stats.overall.correct;
    }
    
    const byTopicArray = Array.from(stats.byTopic.entries()).map(([topic, counts]) => {
      const totalTopic = counts.correct + counts.incorrect;
      return {
        topic,
        correct: totalTopic > 0 ? Math.round((counts.correct / totalTopic) * 100) : 0,
        incorrect: totalTopic > 0 ? 100 - Math.round((counts.correct / totalTopic) * 100) : 0
      };
    });
    
    return {
      overall: stats.overall,
      byTopicArray
    };
  }
}