@echo off
cd /d "%~dp0"
echo Starting Interactive Widgets library at http://localhost:8090 ...
echo Close this window to stop the server.
start "Interactive Widgets Server" cmd /k python -m http.server 8090
timeout /t 2 /nobreak >nul
start "" http://localhost:8090
