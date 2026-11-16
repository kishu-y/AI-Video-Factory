@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Kokoro Natural Voice - Download-free Preview
where py >nul 2>nul
if errorlevel 1 (
 echo Python launcher py not found. Install Python 3.13 and retry.
 pause
 exit /b 1
)
if not exist ".venv\Scripts\python.exe" (
 echo Creating local virtual environment...
 py -m venv .venv
 if errorlevel 1 goto failed
)
echo Installing Kokoro CPU voice dependencies if needed...
".venv\Scripts\python.exe" -m pip install "kokoro-onnx>=0.6,<1" "onnxruntime>=1.19,<2" "numpy>=1.26,<3" "soundfile>=0.12,<1" "phonemizer>=3.0,<4"
if errorlevel 1 goto failed
echo.
echo Generating fresh preview. The first run downloads model weights from GitHub.
".venv\Scripts\python.exe" preview_voice.py
if errorlevel 1 goto failed
echo.
echo Voice preview saved as LISTEN_FIRST_kokoro_neural.wav
echo Listen before proceeding with any video rendering.
pause
exit /b 0
:failed
echo.
echo Voice setup failed. Copy the exact error message from above.
pause
exit /b 1
