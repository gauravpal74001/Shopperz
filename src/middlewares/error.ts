import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { controllerType } from "../types/types.js";

export const errorMiddleware = (
    err: ErrorHandler,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};

export const Trycatch = (func: controllerType): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};