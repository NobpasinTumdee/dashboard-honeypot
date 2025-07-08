import express from "express";
import cors from "cors";
import morgan from "morgan";
import https from "https";
import path from "path"
import fs from "fs";

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

const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert' ,'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)

sslServer.listen(port, () => {
  console.log(`🚀 Server running at https://localhost:${port}`);
});
