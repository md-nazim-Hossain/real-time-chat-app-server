import express from "express";
import { authController } from "../controllers/auth";
import { userController } from "../controllers/user";
import { verifyToken } from "../middleware/verifyToken";
const router = express.Router();

router.patch("/update-me", verifyToken, userController.updateMe);
router.get("/get-users", verifyToken, userController.getUsers);
router.get("/get-friends", verifyToken, userController.getFiends);
router.get(
  "/get-friend-requests",
  verifyToken,
  userController.getFriendRequests
);
router.get("/profile", verifyToken, userController.profile);
export const userRoutes = router;
