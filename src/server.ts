import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app";
import config from "./config/index";
import {
  IClientToServerEvents,
  IInterServerEvents,
  IServerToClientEvents,
  ISocketData,
} from "./interfaces/socketIo.interface";
import { User } from "./models/user";
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
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        socketId,
      });
    }

    socket.on("friendRequest", async (data) => {
      const to = await User.findById(data.to);
      // io.to(to?.socketId as string).emit("newFriendRequest", {
      //   from: data.from,
      // });
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
