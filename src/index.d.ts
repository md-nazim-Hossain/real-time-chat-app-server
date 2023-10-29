import { Types } from "mongoose";
import { IUser } from "./interfaces/user.interfaces";

declare module "express-serve-static-core" {
  export interface Request {
    userId: Types.ObjectId;
    user: IUser;
  }
}
