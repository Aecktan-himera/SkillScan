import express from "express";
import { getTopics, deleteTopic, addTopic, getTopicById, updateTopic, changeTopic } from "../controllers/topicController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { 
  createTopicSchema, idParamSchema     // Новая схема валидации
} from "../validators/testValidators";
import { validateRequest } from "../middleware/validationMiddleware";

const router = express.Router();

// Получение всех тем
router.get("/", authMiddleware, getTopics);

// Создание новой темы (только админ)
router.post("/", authMiddleware, adminMiddleware, validateRequest(createTopicSchema), addTopic);

// Удаление темы (только админ)
router.delete("/:id", 
  authMiddleware, 
  adminMiddleware,
  deleteTopic
);

//Получение темы по ID
router.get('/:id', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(idParamSchema, 'params'), 
  getTopicById);

//Обновление всех полей темы
router.put('/:id', 
  authMiddleware, 
  adminMiddleware,
  validateRequest(idParamSchema, 'params'), // Валидация параметра
  validateRequest(createTopicSchema, 'body'), // Валидация тела 
  updateTopic);

//Частичное обновление темы
router.patch('/:id', 
  authMiddleware, 
  adminMiddleware,
  validateRequest(idParamSchema, 'params'),
  validateRequest(createTopicSchema, 'body'),
  changeTopic
);

export default router;