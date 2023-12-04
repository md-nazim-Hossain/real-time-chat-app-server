import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import app from "./app";
import config from "./config/index";
import { ObjectId } from "mongodb";
import { IFriendRequest } from "./interfaces/friendRequest.interface";
import {
  IClientToServerEvents,
  IInterServerEvents,
  IServerToClientEvents,
  ISocketData,
} from "./interfaces/socketIo.interface";
import { FriendRequest } from "./models/friendRequest";
import { User } from "./models/user";
import { OneToOneMessage } from "./models/oneToOneMessage";
process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

let server: HttpServer;
let io: Server<
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
>;
async function main() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log("Database connected successfully!");
    server = app.listen(config.port, () => {
      console.log(`Server app listening on port ${config.port}`);
    });
    io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
  } catch (error: Error | unknown) {
    console.log(
      "Failed To connected database",
      error instanceof Error ? error.message : error
    );
  }

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    const socketId = socket.id;
    console.log("User Socket id Connected", socketId);
    if (!!userId) {
      await User.findByIdAndUpdate(userId, {
        socketId,
        status: "Online",
      });
    }

    socket.on("friendRequest", async (data, callback) => {
      const toUser = await User.findById(data.to).select("+socketId");
      const fromUser = await User.findById(data.from).select("+socketId");

      await FriendRequest.create({
        sender: data.from,
        receipt: data.to,
      });
      io.to(toUser?.socketId as string).emit("newFriendRequest", {
        message: "New Friend Request",
      });
      io.to(fromUser?.socketId as string).emit("requestSent", {
        message: "Request Sent Successfully",
      });
    });

    socket.on("acceptRequest", async (data, callback) => {
      const requestDoc = await FriendRequest.findOne({
        _id: data.requestId,
      });

      const sender = await User.findById(requestDoc!.sender);
      const receiver = await User.findById(requestDoc!.receipt);
      sender?.friends.push(requestDoc?.receipt as IFriendRequest | any);
      receiver?.friends.push(requestDoc?.sender as IFriendRequest | any);

      await receiver?.save({ validateModifiedOnly: true });
      await sender?.save({ validateModifiedOnly: true });

      await FriendRequest.findByIdAndDelete(data.requestId);

      io.to(sender?.socketId as string).emit("friendRequestAccepted", {
        message: "Friend Request Accepted",
      });
      io.to(receiver?.socketId as string).emit("friendRequestAccepted", {
        message: "Friend Request Accepted",
      });
    });

    socket.on("getDirectConversation", async ({ userId }, callback) => {
      const existingMessage = await OneToOneMessage.find({
        participants: {
          $all: [userId],
        },
      }).populate(
        "participants",
        "firstName lastName avatar status socketId _id email"
      );
      callback(existingMessage);
    });

    socket.on("startConversation", async (data) => {
      const { to, from }: { to: string; from: string } = data;

      const existingConversation = await OneToOneMessage.find({
        participants: { $all: [to, from] },
      }).populate(
        "participants",
        "firstName lastName avatar status socketId _id email"
      );

      if (!existingConversation.length) {
        let newChat: any = await OneToOneMessage.create({
          participants: [to, from],
        });

        newChat = await OneToOneMessage.findById(newChat?._id).populate(
          "participants",
          "firstName lastName avatar status socketId _id email"
        );
        socket.emit("startChat", newChat);
      } else {
        socket.emit("startChat", existingConversation[0]);
      }
    });

    socket.on("getMessages", async (data, callback) => {
      const { messages }: any = await OneToOneMessage.findById(
        data.conversationId
      ).select("messages");
      callback(messages);
    });

    socket.on("textMessage", async (data) => {
      const { conversationId, message, to, from, type } = data;
      const toUser = await User.findById(to);
      const fromUser = await User.findById(from);
      const newMessage = {
        to,
        from,
        type,
        text: message,
        created_at: Date.now(),
      };

      const chat = await OneToOneMessage.findById(conversationId);
      chat?.messages.push(newMessage);
      await chat?.save({});

      io.to(toUser?.socketId as string).emit("newMessage", {
        conversationId,
        message: newMessage,
      });
      io.to(fromUser?.socketId as string).emit("newMessage", {
        conversationId,
        message: newMessage,
      });
    });

    socket.on("fileMessage", (data) => {
      //get the file extension
      const extension = path.extname(data.file.name);

      //generate a unique file name
      const fileName = Date.now() + extension;

      //upload the file to AWS s3

      //create new message

      //save to db

      //emit incoming message

      // emit outgoing message
    });

    socket.on("end", async (data) => {
      if (data._id) {
        await User.findByIdAndUpdate(data._id, {
          status: "Offline",
        });
      }
      console.log("User Socket id Disconnected", socketId);
      socket.disconnect();
    });
  });

  process.on("unhandledRejection", (error: any) => {
    console.log(
      "Unhandled Rejection is detected we are closing server ....",
      error
    );
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}
//
main();

process.on("SIGTERM", () => {
  if (server) {
    server.close();
  }
});
