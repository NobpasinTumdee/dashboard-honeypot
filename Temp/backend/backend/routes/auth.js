import express from "express";
const router = express.Router();

// Controller
import { register, login } from "../controllers/authController.js";
import { loginSchema, registerSchema, validate } from "../utils/validator.js";

// ENDPOINT http://localhost:8000/auth/register
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;