@echo off
chcp 65001
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo Программа запущена без прав администратора.	
    pause
    exit /B
)

schtasks /Change /TN "watcher_event" /DISABLE
cd /d %~dp0
echo > stopflag.flag
pause