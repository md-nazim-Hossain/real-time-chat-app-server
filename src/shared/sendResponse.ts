import { Response } from "express";

type IApiResponse<T> = {
  success: boolean;
  message?: string | null;
  statusCode: number;
  data?: T | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  } | null;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const { message, statusCode, success } = data;
  const responseData: IApiResponse<T> = {
    statusCode,
    success,
    message: message || null,
    meta: data?.meta || null,
    data: data?.data || null,
  };
  res.status(statusCode).json(responseData);
};

export default sendResponse;
