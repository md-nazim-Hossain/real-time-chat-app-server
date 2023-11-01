import { Model, Types } from "mongoose";
import { IUser } from "./user.interfaces";

export type IFriendRequest = {
  sender: Types.ObjectId | IUser;
  receipt: Types.ObjectId | IUser;
};
export type FriendRequestModel = Model<
  IFriendRequest,
  Record<string, unknown>,
  unknown
>;
