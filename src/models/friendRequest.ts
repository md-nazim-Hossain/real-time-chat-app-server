import { Schema, model } from "mongoose";
import {
  FriendRequestModel,
  IFriendRequest,
} from "../interfaces/friendRequest.interface";
const friendRequestSchema = new Schema<
  IFriendRequest,
  Record<string, unknown>,
  unknown
>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receipt: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const FriendRequest = model<IFriendRequest, FriendRequestModel>(
  "FriendRequest",
  friendRequestSchema
);
