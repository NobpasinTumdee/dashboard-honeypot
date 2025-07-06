import express from "express";
import cors from "cors";
import morgan from "morgan";
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Middlewares
app.use(cors()); // Allows Cross Domains
app.use(morgan("dev")); // Show Logs
app.use(express.json()); // For read JSON
import { PrismaClient } from "@prisma/client";

// Routing
import authRoute from "./routes/auth.js"
import honeypotRoute from './routes/honeypot.js'

app.use("/auth", authRoute);
app.use("/get", honeypotRoute);


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
