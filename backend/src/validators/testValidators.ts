import Joi from "joi";

// Схема для запроса вопросов
export const testQuestionsQuerySchema = Joi.object({
  topic_id: Joi.alternatives()
    .try(
      Joi.number().integer().required(),
      Joi.string().pattern(/^\d+$/).required()
    )
    .messages({
      "any.required": "ID темы обязателен",
      "alternatives.match": "ID темы должен быть числом"
    })
    .custom((value) => parseInt(value, 10), "Преобразование в число"), // Исправлено
    
  count: Joi.alternatives()
    .try(
      Joi.number().integer().min(1).max(50),
      Joi.string().pattern(/^\d+$/)
    )
    .default(10)
    .messages({
      "number.base": "Количество должно быть числом",
      "number.min": "Минимальное количество - 1",
      "number.max": "Максимальное количество - 50"
    })
    .custom((value) => parseInt(value, 10), "Преобразование в число") // Исправлено
});

// Схема для прохождения теста
export const testAttemptSchema = Joi.object({
  topic_id: Joi.number().integer().required().messages({ // Изменено с topic на topicId/topicId
    "any.required": "ID темы обязательно",
    "number.base": "ID темы должен быть числом"
  }),
  
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required().messages({
          "any.required": "ID вопроса обязательно",
        }),
        selectedOptionId: Joi.string().required().messages({ // исправлено с answerIndex на optionId/на selectedOptionId
          "any.required": "ID варианта ответа обязателен",
          "number.base": "ID варианта должен быть числом",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Тест должен содержать хотя бы один вопрос",
      "any.required": "Ответы на вопросы обязательны",
    }),
    
  timeSpent: Joi.number() // добавлено новое поле
    .integer()
    .min(0)
    .required()
    .messages({
      "any.required": "Время прохождения обязательно",
      "number.base": "Время должно быть числом",
      "number.integer": "Время должно быть целым числом",
      "number.min": "Время не может быть отрицательным",
    }),
});

// Схема для создания вопроса
export const createQuestionSchema = Joi.object({
  topic_id: Joi.number().required().messages({//topicId
    "any.required": "Topic ID is required",
    "number.base": "Topic ID must be a number"
  }),
  text: Joi.string().required().messages({
    "any.required": "Question text is required"
  }),
  explanation: Joi.string().optional(),
  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .default("medium")
    .messages({
      "any.only": "Difficulty must be easy, medium or hard"
    }),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          "any.required": "Option text is required"
        }),
        isCorrect: Joi.boolean().required().messages({
          "any.required": "Option correctness flag is required"
        })
      })
    )
    .min(2)
    .max(6)
    .required()
    .messages({
      "array.min": "At least 2 options are required",
      "array.max": "Maximum 6 options allowed",
      "any.required": "Options are required"
    })
});

// Схема для создания темы
export const createTopicSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Topic name must be at least 3 characters",
    "string.max": "Topic name must be less than 100 characters",
    "any.required": "Topic name is required"
  }),
  description: Joi.string().max(500).optional().messages({
    "string.max": "Description must be less than 500 characters"
  })
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "ID должен быть числом",
    "number.integer": "ID должен быть целым числом",
    "number.min": "ID должен быть положительным числом",
    "any.required": "ID обязателен"
  })
});

export const testIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "ID теста должен быть числом",
    "number.integer": "ID теста должен быть целым числом",
    "number.min": "ID теста должен быть положительным числом",
    "any.required": "ID теста обязателен"
  })
});

export const adminQuestionsQuerySchema = Joi.object({
  topic_id: Joi.number().integer().optional().messages({
    "number.base": "ID темы должен быть числом"
  }),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional().messages({
    "any.only": "Сложность должна быть easy, medium или hard"
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Номер страницы должен быть числом",
    "number.min": "Номер страницы должен быть не менее 1"
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Лимит должен быть числом",
    "number.min": "Лимит должен быть не менее 1",
    "number.max": "Лимит должен быть не более 100"
  }),
  search: Joi.string().optional().allow("")
});

export const updateQuestionSchema = Joi.object({
  topic_id: Joi.number().optional().messages({
    "any.required": "Topic ID is required",
    "number.base": "Topic ID must be a number"
  }),
  text: Joi.string().optional().messages({
    "any.required": "Question text is required"
  }),
  explanation: Joi.string().optional().allow(''),
  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .optional()
    .messages({
      "any.only": "Difficulty must be easy, medium or hard"
    }),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          "any.required": "Option text is required"
        }),
        isCorrect: Joi.boolean().required().messages({
          "any.required": "Option correctness flag is required"
        })
      })
    )
    .min(2)
    .max(6)
    .optional()
    .messages({
      "array.min": "At least 2 options are required",
      "array.max": "Maximum 6 options allowed",
      "any.required": "Options are required"
    })
});

export const updateTopicSchema = createTopicSchema;