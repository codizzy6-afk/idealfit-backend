@echo off
title IdealFit Company Admin Dashboard
color 0D
echo.
echo ========================================
echo  IdealFit Company Admin Dashboard
echo ========================================
echo.
echo Starting company dashboard server...
echo.
cd /d "%~dp0"
start http://localhost:8081/company-admin-dashboard.html
node company-dashboard-server.js
pause







