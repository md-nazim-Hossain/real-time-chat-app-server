import { Schema, model } from "mongoose";

const oneToOneMessageSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        to: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        from: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: ["Text", "Media", "Document", "Link"],
        },
        text: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const OneToOneMessage = model("OneToOneMessage", oneToOneMessageSchema);
