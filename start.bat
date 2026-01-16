@echo off
echo Starting WebRTC P2P Video Room...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .next exists
if not exist ".next\" (
    echo Building project...
    call npm run build
    echo.
)

REM Create data directory if not exists
if not exist "data\" (
    mkdir data
)

REM Create logs directory if not exists
if not exist "logs\" (
    mkdir logs
)

echo Starting server...
call npm run dev
