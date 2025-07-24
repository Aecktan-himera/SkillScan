import { Response } from "express";
import { ApiError } from "./apiError";

// Тип для успешного ответа
type SuccessResponse = {
    success: true;
    data?: any;
    meta?: Record<string, any>;
};

// Тип для ответа с ошибкой
type ErrorResponse = {
    success: false;
    error: {
        code: number;
        message: string;
        stack?: string;
        original?: {
            message: string;
            stack?: string;
        };
    };
};

export const sendSuccess = (
    res: Response,
    data: any,
    statusCode: number = 200,
    meta?: Record<string, any>
) => {
    const response: SuccessResponse = {
        success: true,
        data,
        meta
    };

    res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: ApiError) => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const response: ErrorResponse = {
        success: false,
        error: {
            code: error.statusCode,
            message: error.message
        }
    };

    // Добавляем отладочную информацию только в режиме разработки
    if (isDevelopment) {
        // Добавляем стек текущей ошибки
        if (error.stack) {
            response.error.stack = error.stack;
        }

        // Добавляем информацию об оригинальной ошибке
        if (error.originalError) {
            response.error.original = {
                message: error.originalError.message
            };

            if (error.originalError.stack) {
                response.error.original.stack = error.originalError.stack;
            }
        }
    }

    res.status(error.statusCode).json(response);
};