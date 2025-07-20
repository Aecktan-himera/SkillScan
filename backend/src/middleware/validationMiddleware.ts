import { Request, Response, NextFunction } from "express";
import { AnySchema } from "joi";

export const validateRequest = (schema: AnySchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const options = {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: property === 'params'
    };
    
    const { error, value } = schema.validate(req[property], options);
    
    if (error) {
      const errors = error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }));
      
      res.status(400).json({ 
        message: "Ошибка валидации",
        errors 
      });
      return; // Важно: return после отправки ответа
    }
    // Заменяем исходные данные очищенными
    req[property] = value;
    next();
  };
};
    
export const validateQuery = (schema: AnySchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true // Преобразовываем строки в числа
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ errors });
      return;
    }

    req.query = value;
    next();
  };
};
