import cors from "cors";

import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import expressSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import httpStatus from "http-status";
import morgan from "morgan";
import globalErrorHandler from "./middleware/globalErrorsHandler";
import { routes } from "./routes";

const app: Application = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "7mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(expressSanitize());
// app.use(xss());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hours
  max: 300, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour!",
});

app.use("/tawk", limiter);
app.use("/api/v1", routes);

//global error handler
app.use("*", (error: any, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(error, req, res, next);
});

//handle not found route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not found",
    errorMessage: [
      {
        path: req.originalUrl,
        message: "Api Not found",
      },
    ],
  });

  next();
});

export default app;
