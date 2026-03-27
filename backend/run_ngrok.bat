@echo off
echo Starting ngrok tunnel for SustainX Backend (Port 8000)...
echo Make sure you have installed ngrok and added your authtoken!
ngrok http 8000
pause
