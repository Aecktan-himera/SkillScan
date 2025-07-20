import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Question } from "../entities/Question";
import { Option } from "../entities/Option";
import { Topic } from "../entities/Topic";
import { User } from "../entities/User";
import { ILike } from "typeorm"

export const addQuestion = async (req: Request, res: Response) => {
  const { topic_id, text, explanation, difficulty, options } = req.body;//topicId
  const userId = (req as any).userId; // Получаем ID пользователя из middleware

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const topicRepository = AppDataSource.getRepository(Topic);
    const userRepository = AppDataSource.getRepository(User);

    // Находим тему и пользователя
    const topic = await topicRepository.findOne({ where: { id: topic_id } });//topicId
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Создаем вопрос со связями
    const question = questionRepository.create({
      topic,
      text,
      explanation,
      difficulty,
      createdBy: user,
      options: options.map((opt: any) => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    });

    await questionRepository.save(question);

    res.status(201).json({
      message: 'Вопрос успешно добавлен',
      questionId: question.id
    });
  } catch (error) {
    console.error('Ошибка добавления вопроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение всех вопросов с пагинацией и фильтрацией
export const getAllQuestions = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    topic_id,
    difficulty,
    search
  } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const where: any = {};

    if (topic_id && topic_id !== 'all') {
      where.topic = { id: topic_id };
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    if (search) {
      where.text = ILike(`%${search}%`);
    }

    const [questions, total] = await questionRepository.findAndCount({
      where,
      relations: ['topic', 'options'],
      skip,
      take: limitNum,
      order: { createdAt: 'DESC' }
    });

    res.json({
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Ошибка получения вопросов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};


// Получение вопроса по ID
export const getQuestionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const question = await questionRepository.findOne({
      where: { id },
      relations: ['topic', 'options']
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error('Ошибка получения вопроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление вопроса
export const updateQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, explanation, difficulty, options, topic_id } = req.body;//topicId

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const optionRepository = AppDataSource.getRepository(Option);
    const topicRepository = AppDataSource.getRepository(Topic);

    // Найти вопрос
    const question = await questionRepository.findOne({
      where: { id },
      relations: ['options', 'topic']
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Обновить тему если изменилась
    if (topic_id && question.topic?.id !== topic_id) {//topicId
      const topic = await topicRepository.findOne({ where: { id: topic_id } });//topicId
      if (!topic) return res.status(400).json({ error: "Topic not found" });
      question.topic = topic;
    }

    // Обновить основные поля
    question.text = text || question.text;
    question.explanation = explanation || question.explanation;
    question.difficulty = difficulty || question.difficulty;

    // Обновить варианты ответов
    if (options && Array.isArray(options)) {
      // Удалить старые варианты
      await optionRepository.delete({ question: { id } });

      // Создать новые варианты
      question.options = options.map((opt: any) =>
        optionRepository.create({
          text: opt.text,
          isCorrect: opt.isCorrect
        })
      );
    }

    // Сохранить обновленный вопрос
    await questionRepository.save(question);

    res.json({
      message: 'Вопрос успешно обновлен',
      questionId: question.id
    });
  } catch (error) {
    console.error('Ошибка обновления вопроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление вопроса
export const deleteQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const question = await questionRepository.findOne({ where: { id } });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    await questionRepository.remove(question);

    res.json({
      message: 'Вопрос успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления вопроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const changeQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const questionRepository = AppDataSource.getRepository(Question);
    const optionRepository = AppDataSource.getRepository(Option);
    
    // Найти вопрос
    const question = await questionRepository.findOne({
      where: { id },
      relations: ['options']
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Частичное обновление основных полей
    if (updateData.text) question.text = updateData.text;
    if (updateData.explanation) question.explanation = updateData.explanation;
    if (updateData.difficulty) question.difficulty = updateData.difficulty;
    
    // Обновление темы при наличии
    if (updateData.topic_id) {
      const topicRepository = AppDataSource.getRepository(Topic);
      const topic = await topicRepository.findOne({ 
        where: { id: updateData.topic_id } 
      });
      if (!topic) return res.status(400).json({ error: "Topic not found" });
      question.topic = topic;
    }

    // Обновление вариантов ответов
    if (updateData.options) {
      // Удалить существующие варианты
      await optionRepository.delete({ question: { id } });
      
      // Создать новые варианты
      const newOptions = updateData.options.map((opt: any) => 
        optionRepository.create({
          text: opt.text,
          isCorrect: opt.isCorrect,
          question: question
        })
      );
      
      // Сохранить новые варианты
      question.options = await optionRepository.save(newOptions);
    }

    // Сохранить обновленный вопрос
    const updatedQuestion = await questionRepository.save(question);

    res.json({
      message: 'Вопрос успешно обновлён',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Ошибка обновления вопроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
