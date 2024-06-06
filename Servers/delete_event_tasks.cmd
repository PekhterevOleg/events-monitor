@echo off
chcp 65001
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo Программа запущена без прав администратора.	
    pause
    exit /B
)
schtasks /End /TN "watcher_event"
schtasks /End /TN "eventAccessToPC"
schtasks /Change /TN "watcher_event" /DISABLE
schtasks /Change /TN "eventAccessToPC" /DISABLE
schtasks /Delete /TN "watcher_event" /F
schtasks /Delete /TN "eventAccessToPC" /F
pause