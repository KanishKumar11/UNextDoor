import express from "express";
import * as authController from "../controllers/authController.js";
import {
  authenticate,
  validateRequest,
  authorize,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post(
  "/check-email",
  validateRequest(["email"]),
  authController.checkEmail
);

router.post("/send-otp", validateRequest(["email"]), authController.sendOTP);

router.post(
  "/verify-otp",
  validateRequest(["email", "otp"]),
  authController.verifyOTP
);

router.post(
  "/register",
  (req, res, next) => {
    // Skip validation if we're debugging
    if (!req.body) {
      console.log("Creating empty body object");
      req.body = {};
    }
    next();
  },
  authController.register
);

// Token management
router.post(
  "/refresh-token",
  validateRequest(["refreshToken"]),
  authController.refreshToken
);

// Social authentication routes
router.post("/google", validateRequest(["token"]), authController.googleAuth);

router.post("/apple", validateRequest(["token"]), authController.appleAuth);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);

router.put("/profile", authenticate, authController.updateProfile);

router.post("/logout", authenticate, authController.logout);

// Admin routes
router.get(
  "/users",
  authenticate,
  authorize("admin"),
  authController.getAllUsers
);

export default router;
