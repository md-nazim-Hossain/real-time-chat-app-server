import { ErrorRequestHandler, Request, Response } from "express";
import config from "../config";
import { IGenericErrorMessage } from "../interfaces/error";
import ApiError from "../shared/ApiError";

//global error handler
const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response
) => {
  // config.env === "development" ? console.log("GlobalErrorHandler", error) : "";
  let statusCode = 500;
  let message = "Something went wrong";
  let errorMessages: IGenericErrorMessage[] = [];

  if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: "",
            message: error?.message,
          },
        ]
      : [];
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: "",
            message: error?.message,
          },
        ]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env !== "production" ? error.stack : undefined,
  });
};

export default globalErrorHandler;
