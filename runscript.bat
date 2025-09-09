@echo off
start "Node.js Server" cmd /k "cd "server\API\socket\" & npm run dev"
start "React App" cmd /k "cd "DashboardV3" & npm run dev"
start "ngrok Tunnel" cmd /k "ngrok http 3000"