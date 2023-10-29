import express from "express";
import { authController } from "../controllers/auth";
import { userController } from "../controllers/user";
const router = express.Router();

router.patch("/update-me", authController.protect, userController.updateMe);
export const userRoutes = router;
