@echo off
echo =========================================
echo Starting 5 AI Agents Pipeline ^& Chatbot
echo =========================================

echo.
echo [1/2] Starting FastAPI Backend Pipeline...
start cmd /k "call .venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Starting React Vite Frontend...
start cmd /k "cd ai-chatbot && npm run dev"

echo.
echo Application is starting up! 
echo ^> Backend will run at: http://localhost:8000
echo ^> Chatbot UI should automatically open in your browser, or you can go to: http://localhost:5173
echo.
echo Keep both terminal windows open to use the chatbot. Close them to stop the app.
