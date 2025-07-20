import express from "express";
import { 
  getQuestionsByTopic, 
  submitTest, 
  getUserTestHistory,
  getTestDetails,
  getAdminTestHistory,
  getAdminStats,
  getAnswerStats
} from "../controllers/testController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { 
  testAttemptSchema,
} from "../validators/testValidators";
import { testQuestionsQuerySchema, testIdSchema } from "../validators/testValidators";

const router = express.Router();

// Получение вопросов по ID темы
router.get("/questions", 
  authMiddleware, 
  validateRequest(testQuestionsQuerySchema), //validateQuery
  getQuestionsByTopic);

// Прохождение теста POST /tests/attempt (Отправка результатов теста)
router.post("/attempt", 
  authMiddleware, 
  validateRequest(testAttemptSchema), 
  submitTest
);

// История тестов пользователя
router.get("/history", authMiddleware, getUserTestHistory);

router.get("/:id", 
  authMiddleware, 
  validateRequest(testIdSchema, 'params'),
  getTestDetails
);

// Админ-роуты
router.get("/admin/test-history", 
  authMiddleware, 
  adminMiddleware,
  getAdminTestHistory
);

router.get("/admin/stats", 
  authMiddleware, 
  adminMiddleware,
  getAdminStats
);

router.get("/admin/answer-stats", 
  authMiddleware, 
  adminMiddleware,
  getAnswerStats
);


export default router;