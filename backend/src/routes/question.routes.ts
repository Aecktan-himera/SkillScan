import express from 'express';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { addQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
changeQuestion } from '../controllers/questionController';
import { createQuestionSchema, testQuestionsQuerySchema, adminQuestionsQuerySchema, updateQuestionSchema } from "../validators/testValidators";
import { validateRequest } from "../middleware/validationMiddleware";


const router = express.Router();

// Только администратор может добавлять вопросы
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(createQuestionSchema),
  addQuestion
);

// Получение всех вопросов (только для админов)
router.get('/',
  authMiddleware,
  adminMiddleware,
  validateRequest(adminQuestionsQuerySchema, 'query'),
  getAllQuestions
);

// Получение вопроса по ID (только для админов)
router.get('/:id',
  authMiddleware,
  adminMiddleware,
  getQuestionById
);

// Обновление вопроса (только для админов)
router.put('/:id',
  authMiddleware,
  adminMiddleware,
  updateQuestion
);

// Удаление вопроса (только для админов)
router.delete('/:id',
  authMiddleware,
  adminMiddleware,
  deleteQuestion
);

router.patch('/:id',
  authMiddleware,
  adminMiddleware,
  validateRequest(updateQuestionSchema),
  changeQuestion
);

export default router;