import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Topic } from "../entities/Topic";
import { Not } from "typeorm";

export const getTopics = async (req: Request, res: Response) => {
  try {
    const topicRepository = AppDataSource.getRepository(Topic);
    const topics = await topicRepository.find({
      select: ["id", "name", "description"],
      order: { name: "ASC" }
    });
    
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
// Создание новой темы
export const addTopic = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({ error: "Topic name is required" });
      return;
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    
    // Проверка на существование темы
    const existingTopic = await topicRepository.findOne({ where: { name } });
    if (existingTopic) {
      res.status(400).json({ error: "Topic with this name already exists" });
      return;
    }

    // Создание темы
    const topic = topicRepository.create({ name, description });
    await topicRepository.save(topic);
    
    res.status(201).json(topic);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

// Добавляем метод для удаления темы
export const deleteTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const topicRepository = AppDataSource.getRepository(Topic);
    const topic = await topicRepository.findOne({ where: { id: parseInt(id) } });
    
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    
    // Каскадное удаление вопросов и истории тестов
    await topicRepository.remove(topic);
    
    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getTopicById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const topic_id = parseInt(id);//topicId
    if (isNaN(topic_id)) {//topicId
      return res.status(400).json({ error: "Invalid topic ID" });
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    const topic = await topicRepository.findOne({ 
      where: { id: topic_id },//topicId
      select: ["id", "name", "description"]
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Обновление темы
export const updateTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const topic_id = parseInt(id);//
    if (isNaN(topic_id)) {//topicId
      return res.status(400).json({ error: "Invalid topic ID" });
    }

    if (!name) {
      return res.status(400).json({ error: "Topic name is required" });
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    
    // Проверка существования темы
    const topic = await topicRepository.findOne({ where: { id: topic_id } });//
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Проверка уникальности названия
    const existingTopic = await topicRepository.findOne({ 
      where: { name, id: Not(topic_id) } //topicId
    });
    if (existingTopic) {
      return res.status(409).json({ error: "Topic with this name already exists" });
    }

    // Обновление данных
    topic.name = name;
    topic.description = description || topic.description;

    await topicRepository.save(topic);
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const changeTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  
  try {
    const topicId = parseInt(id);
    if (isNaN(topicId)) {
      return res.status(400).json({ error: "Invalid topic ID" });
    }

    const topicRepository = AppDataSource.getRepository(Topic);
    const topic = await topicRepository.findOneBy({ id: topicId });
    
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Обновление данных
    topic.name = name;
    await topicRepository.save(topic);
    
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};