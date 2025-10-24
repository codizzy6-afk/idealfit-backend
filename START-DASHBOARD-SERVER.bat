@echo off
title IdealFit Dashboard Server
color 0A
echo.
echo ========================================
echo  IdealFit Dashboard Server
echo ========================================
echo.
echo Starting HTTP server for dashboard...
echo.
cd /d "%~dp0"
node dashboard-server.js
pause
