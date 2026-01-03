@echo off
echo Stopping services...
taskkill /F /IM node.exe >nul 2>nul
echo Services stopped.
timeout /t 2 >nul
