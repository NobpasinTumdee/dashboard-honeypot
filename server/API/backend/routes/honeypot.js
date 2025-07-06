import express from "express";
const router = express.Router();

// Controller
import { cowrie, opencanary, cowrie10, opencanary10 } from "../controllers/honeypotController.js";

//verify token
import { verifyToken } from "../utils/verifyToken.js";

// ENDPOINT http://localhost:3000/get/cowrie
router.get("/cowrie", verifyToken, cowrie);
router.get("/cowrie-none-auth", cowrie10);
router.get("/open-canary", verifyToken, opencanary);
router.get("/open-canary-none-auth", opencanary10);

export default router;