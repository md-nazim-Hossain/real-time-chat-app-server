import { Model, ObjectId } from "mongoose";
import { IUser } from "./user.interfaces";

export type IFriendRequest = {
  sender: ObjectId | IUser;
  receipt: ObjectId | IUser;
};
export type FriendRequestModel = Model<
  IFriendRequest,
  Record<string, unknown>,
  unknown
>;
