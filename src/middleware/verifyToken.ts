import { NextFunction, Request, Response } from "express";
import catchAsync from "../shared/catchAsync";
import ApiError from "../shared/ApiError";
import httpStatus from "http-status";
import { jwtTokenHelpers } from "../helpers/jwtHelpers";
import config from "../config";
import { User } from "../models/user";

export const verifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in, please login to get access"
      );
    }

    // verify token
    const decoded = jwtTokenHelpers.verifyToken(token, config.jwt.secret!);

    const userExist = await User.findById(decoded._id);
    if (!userExist) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Error in decoding token, please login again"
      );
    }
    if (userExist.changedPasswordAfter(decoded.iat!)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User recently changed password! Please login again"
      );
    }
    req.user = userExist;
    next();
  }
);
