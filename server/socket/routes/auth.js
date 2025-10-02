import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const existingUser = await prisma.users.findFirst({
            where: {
                Email: req.body.Email,
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(req.body.Password, 10); // Hash password

        const newUser = await prisma.users.create({
            data: {
                Email: req.body.Email,
                UserName: req.body.UserName,
                Password: hashedPassword,
                Status: "Unauthenticated",
            },
            select: {
                UserID: true,
                Email: true,
                UserName: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            message: "Registration completed. Your status is " + newUser.Status + ". Please inform the administrator.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error registering user." });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await prisma.users.findFirst({
            where: {
                Email: Email,
                deletedAt: null,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "This account does not exist for registration." });
        }

        const isPasswordCorrect = await bcrypt.compare(
            Password,
            user.Password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Password or Email is incorrect!" });
        }

        // สร้าง JWT Token
        const payload = {
            UserID: user.UserID,
            UserName: user.UserName,
            Status: user.Status,
        };
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SEC,
            { expiresIn: "1d" } // Token หมดอายุใน 1 วัน
        );

        res.json({
            message: "Welcome " + user.UserName + " Your token has a lifespan of only 1 day.",
            payload: payload,
            token: accessToken,
            token_type: "Bearer",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed - Internal Server Error" });
    }
});

export default router;