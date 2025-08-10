@echo off
echo 🚀 Starting Rivaayat Backend Server...
echo.

cd backend

echo 📦 Checking if node_modules exists...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo 🔧 Starting development server...
npm run dev

if errorlevel 1 (
    echo ❌ Failed to start server
    echo.
    echo 💡 Troubleshooting tips:
    echo 1. Make sure MongoDB is running
    echo 2. Check if port 5000 is available
    echo 3. Verify all environment variables are set
    pause
    exit /b 1
)

pause

