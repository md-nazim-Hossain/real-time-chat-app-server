import express from "express";
import { authController } from "../controllers/auth";
import { userController } from "../controllers/user";
const router = express.Router();

router.patch("/update-me", authController.protect, userController.updateMe);
router.get("/get-users", authController.protect, userController.getUsers);
router.get("/get-friends", authController.protect, userController.getFiends);
router.get(
  "/get-friend-requests",
  authController.protect,
  userController.getFriendRequests
);
router.get("/profile", authController.protect, userController.profile);
export const userRoutes = router;
