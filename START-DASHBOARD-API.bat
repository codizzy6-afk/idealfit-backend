@echo off
title IdealFit Dashboard API Server
color 0A
echo.
echo ========================================
echo  IdealFit Dashboard API Server
echo ========================================
echo.
echo Starting API server for merchant dashboard...
echo.
cd /d "%~dp0"
node dashboard-api-server.js
pause








