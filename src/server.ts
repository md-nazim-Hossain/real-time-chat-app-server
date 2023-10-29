import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config/index";

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

let server: Server;
async function main() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log("Database connected successfully!");
    server = app.listen(config.port, () => {
      console.log(`Server app listening on port ${config.port}`);
    });
  } catch (error: Error | unknown) {
    console.log(
      "Failed To connected database",
      error instanceof Error ? error.message : error
    );
  }

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
