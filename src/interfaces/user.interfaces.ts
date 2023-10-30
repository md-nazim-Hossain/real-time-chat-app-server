import { Model, Types } from "mongoose";
import { IFriendRequest } from "./friendRequest.interface";

export type IUser = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
  about?: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordChangeAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date | number;
  verified: boolean;
  otp: string | undefined;
  otpExpiredAt: Date | undefined;
  socketId?: string;
  friends: Array<Types.ObjectId | IFriendRequest>;
};

export type IUserMethods = {
  isPasswordMatch: (
    givenPass: string,
    savePassword: string
  ) => Promise<boolean>;
  isCorrectOtp: (canOtp: string, userOtp: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  isUserExist: (
    email: string
  ) => Promise<Pick<
    IUser,
    "_id" | "password" | "email" | "firstName" | "verified"
  > | null>;
};
export type UserModel = Model<IUser, Record<string, unknown>, IUserMethods>;
