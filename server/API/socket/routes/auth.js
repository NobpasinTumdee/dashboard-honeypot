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
        const hashedPassword = await bcrypt.hash(req.body.Password, 10); // Hash password

        const newUser = await prisma.users.create({
            data: {
                Email: req.body.Email,
                UserName: req.body.UserName,
                Password: hashedPassword,
            },
            select: {
                UserID: true,
                Email: true,
                UserName: true,
                createdAt: true,
            },
        });
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json("Error registering user.");
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
            return res.status(401).json("Wrong credentials!");
        }

        const isPasswordCorrect = await bcrypt.compare(
            Password,
            user.Password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json("Wrong credentials!");
        }

        // สร้าง JWT Token
        const payload = {
            UserID: user.UserID,
            UserName: user.UserName,
        };
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SEC,
            { expiresIn: "1d" } // Token หมดอายุใน 1 วัน
        );

        res.json({
            message: "Login Success!!!",
            payload: payload,
            token: accessToken,
            token_type: "Bearer",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("Error logging in.");
    }
});

export default router;