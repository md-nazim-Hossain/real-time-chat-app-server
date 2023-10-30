import { Request, Response } from "express";
import httpStatus from "http-status";
import { IFriendRequest } from "../interfaces/friendRequest.interface";
import { IUser } from "../interfaces/user.interfaces";
import { FriendRequest } from "../models/friendRequest";
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

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const allUsers = await User.find({
    verified: true,
  }).select("firstName lastName _id");
  const thisUser = req.user;
  const remainingUsers = allUsers.filter(
    (user: IUser) =>
      !thisUser.friends.includes(user._id) &&
      user._id.toString() !== thisUser._id.toString()
  );
  return sendResponse<IUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Found Successfully",
    data: remainingUsers,
  });
});

const getFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const friendRequests = await FriendRequest.find({
    receipt: req.user._id,
  })
    .populate("sender", "_id firstName lastName avatar")
    .lean();
  return sendResponse<IFriendRequest[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend Requests Found Successfully",
    data: friendRequests,
  });
});

const getFiends = catchAsync(async (req: Request, res: Response) => {
  const friends = await User.findById(req.user._id)
    .populate("friends", "_id firstName lastName avatar")
    .lean();
  return sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friends Found Successfully",
    data: friends,
  });
});

export const userController = {
  updateMe,
  getUsers,
  getFiends,
  getFriendRequests,
};
