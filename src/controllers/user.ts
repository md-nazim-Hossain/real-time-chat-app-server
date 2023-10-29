import { Request, Response } from "express";
import httpStatus from "http-status";
import { IUser } from "../interfaces/user.interfaces";
import { User } from "../models/user";
import catchAsync from "../shared/catchAsync";
import filterObj from "../shared/filterObj";
import sendResponse from "../shared/sendResponse";

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const filterBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );
  const updatedUser = await User.findByIdAndUpdate(user._id, filterBody, {
    new: true,
    runValidators: true,
  });
  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: updatedUser,
  });
});

export const userController = {
  updateMe,
};
