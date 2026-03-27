@echo off
echo Starting SustainX Backend on all interfaces...
powershell -Command "Stop-Process -Name python -Force" 2>nul
powershell -Command "Stop-Process -Name uvicorn -Force" 2>nul
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
