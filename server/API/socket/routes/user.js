import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

// GET all users
router.get("/all", async (req, res) => {
    try {
        const users = await prisma.users.findMany({});
        res.json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT update user status to 'user'
router.put("/:id/status", async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await prisma.users.update({
            where: {
                UserID: parseInt(id),
            },
            data: {
                Status: "Authenticated",
            },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error("❌ Error updating user status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;