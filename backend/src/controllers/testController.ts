import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Question } from "../entities/Question";
import { TestHistory } from "../entities/TestHistory";
import { User } from "../entities/User";
import { Topic } from "../entities/Topic";
import { In, MoreThanOrEqual, Not } from "typeorm";
import { ApiError } from "../utils/apiError";
import { sendSuccess, sendError } from "../utils/response";
import { TestService } from "../services/test.service";
import { Option } from "../entities/Option";

const testService = new TestService();

export const getQuestionsByTopic = async (req: Request, res: Response) => {
  try {
    const { topic_id, count = 10 } = req.query;

    if (!topic_id || isNaN(Number(topic_id))) {
      return sendError(res, new ApiError(400, "Неверный ID темы"));
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    const topicEntity = await topicRepository.findOne({
      where: { id: parseInt(topic_id as string) }
    });

    if (!topicEntity) {
      return sendError(res, new ApiError(404, "Тема не найдена"));
    }

    const questionCount = parseInt(count as string);
    const questions = await testService.getRandomQuestions(topicEntity.id, questionCount);

    // Добавляем проверку на пустой результат
    if (questions.length === 0) {
      return sendError(res, new ApiError(404, "Вопросы по теме не найдены"));
    }

    // Преобразование ID в строки для фронтенда
    const transformedQuestions = questions.map((q: Question) => {
      if (!q.options) q.options = [];

      return {
        ...q,
        id: q.id.toString(),
        options: q.options.map(opt => ({
          ...opt,
          id: opt.id.toString(),
        })),
      };
    });

    sendSuccess(res, transformedQuestions);
  } catch (error) {
    if (error instanceof ApiError) {
      sendError(res, error);
    } else if (error instanceof Error) {
      sendError(res, new ApiError(500, error.message));
    } else {
      sendError(res, new ApiError(500, "Ошибка сервера"));
    }
  }
};

// Сохранение результатов теста
export const submitTest = async (req: Request, res: Response) => {
  try {
    const { topic_id, answers, timeSpent } = req.body;
    const userId = (req as any).userId;

    if (!topic_id || isNaN(Number(topic_id))) {
      return sendError(res, new ApiError(400, "Неверный ID темы"));
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    const topicEntity = await topicRepository.findOne({
      where: { id: parseInt(topic_id as string) }
    });

    if (!topicEntity) {
      return sendError(res, new ApiError(404, "Тема не найдена"));
    }

    // Добавьте проверку формата answers
    if (!Array.isArray(answers)) {
      return sendError(res, new ApiError(400, "Неверный формат ответов"));
    }

    for (const answer of answers) {
      if (typeof answer.questionId !== 'string' ||
        typeof answer.selectedOptionId !== 'string') {
        return sendError(res, new ApiError(400, "Неверный формат ответа"));
      }
    }

    // Используем ID вопросов из запроса
    const questionIds = answers.map(a => a.questionId);

    // Получение вопросов через сервис
    const questionRepository = AppDataSource.getRepository(Question);
    const questions = await questionRepository.find({
      where: { id: In(questionIds) },
      relations: ["options"]
    });

    // Расчет результатов через сервис
    const { score, correct, total, detailedResults } =
      await testService.calculateTestResults(questions, answers);

    // Сохранение истории
    const testAttemptRepository = AppDataSource.getRepository(TestHistory);
    const testAttempt = testAttemptRepository.create({
      topic: topicEntity,
      score,
      answers: detailedResults,
      user: { id: userId },
      timeSpent
    });

    await testAttemptRepository.save(testAttempt);
    sendSuccess(res, { score, total, correct });
  } catch (error) {
    if (error instanceof ApiError) {
      sendError(res, error);
    } else if (error instanceof Error) {
      sendError(res, new ApiError(500, error.message));
    } else {
      sendError(res, new ApiError(500, "Неизвестная ошибка"));
    }
  }
};

// Получение истории тестов
export const getUserTestHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const testAttemptRepository = AppDataSource.getRepository(TestHistory);
    const history = await testAttemptRepository.find({
      where: { user: { id: userId } },
      relations: ["topic"],
      select: ["id", "topic", "completedAt", "timeSpent", "score"],
      order: { completedAt: "DESC" }
    });

    // Преобразование данных для фронтенда
    const transformedHistory = history.map(item => ({
      id: item.id,
      topic: item.topic ? {
        id: item.topic.id,
        name: item.topic.name
      } : null,
      completedAt: item.completedAt.toISOString(),
      timeSpent: item.timeSpent,
      score: item.score
    }));

    sendSuccess(res, transformedHistory);
  } catch (error) {
    sendError(res, new ApiError(500, "Ошибка получения истории тестов"));
  }
};

// Получение теста по ID
export const getTestById = async (req: Request, res: Response) => {
  try {
    const testId = parseInt(req.params.id);
    const userId = (req as any).userId;

    if (isNaN(testId)) {
      return sendError(res, new ApiError(400, "Неверный ID теста"));
    }

    const testHistoryRepository = AppDataSource.getRepository(TestHistory);
    const testHistory = await testHistoryRepository.findOne({
      where: { id: testId },
      relations: ["topic", "user"]
    });

    if (!testHistory) {
      return sendError(res, new ApiError(404, "Тест не найден"));
    }

    // Проверка прав доступа
    if (testHistory.user.id !== userId) {
      const userRepository = AppDataSource.getRepository(User);
      const currentUser = await userRepository.findOne({ where: { id: userId } });

      if (!currentUser || currentUser.role !== 'admin') {
        return sendError(res, new ApiError(403, "Доступ запрещен"));
      }
    }

    // Загружаем вопросы с опциями
    const questionIds = testHistory.answers.map(a => a.questionId);
    const questionRepository = AppDataSource.getRepository(Question);
    const questions = await questionRepository.find({
      where: { id: In(questionIds) },
      relations: ["options"]
    });

    // Формируем детализированные ответы
    const detailedAnswers = testHistory.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        return {
          ...answer,
          isCorrect: false,
          questionText: "Вопрос не найден",
          options: []
        };
      }

      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption
        ? correctOption.id === answer.selectedOptionId
        : false;

      return {
        ...answer,
        isCorrect,
        questionText: question.text,
        explanation: question.explanation,
        options: question.options.map(opt => ({
          ...opt,
          id: opt.id.toString() // Гарантируем строковый формат
        })),
        correctOption: correctOption ? {
          ...correctOption,
          id: correctOption.id.toString()
        } : undefined
      };
    });

    // Формируем результат
    const result = {
      id: testHistory.id,
      score: testHistory.score,
      timeSpent: testHistory.timeSpent,
      completedAt: testHistory.completedAt,
      topic: testHistory.topic,
      answers: detailedAnswers
    };

    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof ApiError) {
      sendError(res, error);
    } else if (error instanceof Error) {
      sendError(res, new ApiError(500, error.message));
    } else {
      sendError(res, new ApiError(500, "Неизвестная ошибка"));
    }
  }
};

export const getTestDetails = async (req: Request, res: Response) => {
  try {
    const testId = parseInt(req.params.id);
    const userId = (req as any).userId;

    if (isNaN(testId)) {
      return sendError(res, new ApiError(400, "Неверный ID теста"));
    }

    const testHistoryRepository = AppDataSource.getRepository(TestHistory);
    const testHistory = await testHistoryRepository.findOne({
      where: { id: testId },
      relations: ["topic", "user"]
    });

    if (!testHistory) {
      return sendError(res, new ApiError(404, "Тест не найден"));
    }

    // Проверка прав доступа
    if (testHistory.user.id !== userId) {
      const userRepository = AppDataSource.getRepository(User);
      const currentUser = await userRepository.findOne({ where: { id: userId } });

      // Если пользователь не администратор - запрещаем доступ
      if (!currentUser || currentUser.role !== 'admin') {
        return sendError(res, new ApiError(403, "Доступ запрещен"));
      }
    }

    // Загружаем вопросы с опциями
    const questionIds = testHistory.answers.map(a => a.questionId);
    const questionRepository = AppDataSource.getRepository(Question);
    const questions = await questionRepository.find({
      where: { id: In(questionIds) },
      relations: ["options", "topic"]
    });

    // Формируем детализированные ответы
    const detailedAnswers = testHistory.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        return {
          ...answer,
          questionText: "Вопрос не найден",
          options: [],
          explanation: "",
          topic: null
        };
      }

      return {
        ...answer,
        questionText: question.text,
        explanation: question.explanation,
        options: question.options,
        correctOption: question.options.find(opt => opt.isCorrect),
        topic: {
          id: question.topic.id,
          name: question.topic.name
        }
      };
    });

    // Формируем результат
    const result = {
      id: testHistory.id,
      score: testHistory.score,
      timeSpent: testHistory.timeSpent,
      completedAt: testHistory.completedAt.toISOString(),
      topic: testHistory.topic ? {
        id: testHistory.topic.id,
        name: testHistory.topic.name
      } : null,
      answers: detailedAnswers
    };

    sendSuccess(res, result);
  } catch (error) {
    sendError(res, new ApiError(500, "Ошибка получения деталей теста"));
  }
};

//Добавление нового вопроса
/*export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { topicId, text, explanation, difficulty, options } = req.body;
    const userId = (req as any).userId;

    const userRepository = AppDataSource.getRepository(User);
    const topicRepository = AppDataSource.getRepository(Topic);
    const questionRepository = AppDataSource.getRepository(Question);
    
    // Проверка существования пользователя
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Проверка существования темы
    const topic = await topicRepository.findOne({ where: { id: topicId } });
    if (!topic) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    // Проверка наличия правильного ответа
    const hasCorrectAnswer = options.some((opt: any) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      res.status(400).json({ error: "At least one correct option is required" });
      return;
    }

    // Создание вопроса
    const question = questionRepository.create({
      text,
      explanation,
      difficulty,
      topic,
      createdBy: user,
      options: options.map((opt: any) => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    });

    await questionRepository.save(question);
    res.status(201).json(question);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};


// Добавляем метод для получения всех тем
export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topicRepository = AppDataSource.getRepository(Topic);
    const topics = await topicRepository.find();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Обновление настроек пользователя
/*export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const { darkMode, testTimer } = req.body;
    const userId = (req as any).userId;
    
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.update(userId, {
      settings: { darkMode, testTimer }
    });
    
    const updatedUser = await userRepository.findOne({ where: { id: userId } });
    
    res.json({
      message: "Settings updated",
      settings: updatedUser?.settings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  } 
}; */

// Получение истории тестов для админ-панели
export const getAdminTestHistory = async (req: Request, res: Response) => {
  try {
    const testHistoryRepository = AppDataSource.getRepository(TestHistory);
    const history = await testHistoryRepository.find({
      relations: ["user", "topic"],
      select: ["id", "completedAt", "timeSpent", "score"], // Исключаем answers
      order: { completedAt: "DESC" },
      take: 100
    });

    // Преобразование ID в строки
    const transformedHistory = history.map(item => ({
      id: item.id.toString(),
      user: {
        id: item.user.id.toString(),
        username: item.user.username
      },
      topic: item.topic ? {
        id: item.topic.id.toString(),
        name: item.topic.name
      } : null,
      completedAt: item.completedAt,
      timeSpent: item.timeSpent,
      score: item.score
    }));

    sendSuccess(res, transformedHistory);
  } catch (error) {
    sendError(res, new ApiError(500, "Ошибка получения истории тестов"));
  }
};

// Получение статистики для админ-панели
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const questionRepository = AppDataSource.getRepository(Question);
    const testHistoryRepository = AppDataSource.getRepository(TestHistory);
    const topicRepository = AppDataSource.getRepository(Topic);

    const totalUsers = await userRepository.count({
      where: {
        role: Not("admin")
      }
    });
    const totalQuestions = await questionRepository.count();
    const totalTopics = await topicRepository.count();

    // Активные тесты: за последние 30 минут
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000);
    const activeTests = await testHistoryRepository.count({
      where: {
        completedAt: MoreThanOrEqual(thirtyMinutesAgo)
      }
    });

    const completedTests = await testHistoryRepository.count();

    // Формируем статистику
    const stats = [
      { id: 1, name: 'Всего пользователей', value: totalUsers, change: '+12%', changeType: 'positive' },
      { id: 2, name: 'Всего вопросов', value: totalQuestions, change: '+8%', changeType: 'positive' },
      { id: 3, name: 'Активных тестов (за последние 30 минут)', value: activeTests, change: '-2%', changeType: 'negative' },
      { id: 4, name: 'Завершенных тестов', value: completedTests, change: '+24%', changeType: 'positive' },
    ];

    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, new ApiError(500, "Ошибка получения статистики"));
  }
};

// Получение статистики ответов
export const getAnswerStats = async (req: Request, res: Response) => {
  try {
    const testService = new TestService();
    const stats = await testService.getAnswerStatistics();

    sendSuccess(res, {
      overall: {
        correct: stats.overall.correct,
        incorrect: stats.overall.incorrect
      },
      byTopic: stats.byTopicArray
    });
  } catch (error) {
    sendError(res, new ApiError(500, "Ошибка получения статистики ответов"));
  }
};