@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   FlowGPS 日報系統啟動中...
echo ========================================
echo.

REM 切換到腳本所在目錄
cd /d "%~dp0"

REM 步驟 1：執行 Claude 日報 workflow（約 30-60 秒）
echo [1/3] 執行 Claude 日報整理...
call claude -p "日報"
echo.

REM 步驟 2：啟動 server
echo [2/3] 啟動日報伺服器...
start /b node server.js

REM 等待 server 啟動
timeout /t 2 /nobreak >nul

REM 步驟 3：開啟瀏覽器
echo [3/3] 開啟瀏覽器...
start http://localhost:3001

echo.
echo ========================================
echo   日報已就緒！瀏覽器應該已經開啟。
echo   按 Ctrl+C 關閉伺服器。
echo ========================================
echo.

REM 保持視窗開啟（讓 server 持續運行）
pause
