import { NextFunction, Request, Response } from "express";

const catchAsync =
  (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

export default catchAsync;
