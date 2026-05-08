# Start-Project.ps1
# This script starts both the backend and frontend servers for the Crop Disease Detection project.

Write-Host "🚀 Starting Crop Disease Detection System..." -ForegroundColor Cyan

# Check for Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit
}

# 1. Start Backend
Write-Host "📡 Starting Backend Server on http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 3

# 2. Start Frontend
Write-Host "Γ₧£ Starting Frontend Development Server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nΓ£à Both servers are starting in new windows." -ForegroundColor Yellow
Write-Host "Γä╣ Please use http://localhost:3000 to access the application." -ForegroundColor Gray
Write-Host "Γä╣ Do NOT use VS Code 'Go Live' (Live Server) for this project." -ForegroundColor Red
