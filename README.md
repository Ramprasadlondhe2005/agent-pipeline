# NexGen Agentic Pipeline & Chatbot

Welcome to my full-stack AI application! This project processes user requests through a sequence of 5 specialized AI agents (powered by Google Gemini 2.5 Flash) and displays their internal reasoning in a modern, glassmorphic React chat interface.

## 🌟 Overview
Unlike a standard chatbot where a single prompt goes to a single model, I built this application using an **Agentic Pipeline**. When you send a message, it is processed through 5 distinct "personas", each adding value, refining, or critiquing the output before presenting the final result.

To ensure lightning-fast responses and bypass rate limits, the backend uses **Structured JSON Outputs (via Pydantic)** to simulate all 5 agents in a **single, highly optimized API call**.

### The 5 Agents:
1.  **🔀 Router Agent:** Analyzes your request, classifies intent, and sets a high-level direction.
2.  **🔍 Research Agent:** Takes the direction and expands it into a detailed outline or architectural plan.
3.  **✍️ Drafting Agent:** Writes the primary content (e.g., code, essay, summary) based on the research outline.
4.  **⚖️ Reviewer Agent:** Critically analyzes the draft against the original prompt, identifying flaws or missing pieces, and corrects them.
5.  **✨ Polisher Agent:** Takes the reviewed draft and formats it beautifully for the final UI using Markdown styling.

## 🚀 Features
*   **Sequential AI Pipeline:** Watch the thought process of 5 AI agents instantly.
*   **Pipeline Trace:** The UI displays a collapsible "trace" showing exactly what the Router, Researcher, Drafter, and Reviewer generated before the final output.
*   **Premium Modern UI:** A stunning, responsive chat interface built with React, featuring a dynamic animated background, dark mode glassmorphism (`backdrop-filter`), and Lucide React glowing icons.
*   **Lightning Fast Backend:** A lightweight Python FastAPI backend that orchestrates the Gemini API perfectly via a single structured prompt.

## 🛠️ Tech Stack
*   **Backend:** Python, FastAPI, Pydantic, `google-genai` (Gemini 2.5 Flash)
*   **Frontend:** React (Vite), plain CSS (custom design system, `Outfit` font), Lucide React

---

## 💻 Getting Started

### Prerequisites
1.  **Python 3.8+** installed.
2.  **Node.js & npm** installed.
3.  A **Gemini API Key**. Get one from [Google AI Studio](https://aistudio.google.com/).

### 1. Setup Environment
Create a `.env` file in the root directory of the project and add your API key:
```env
GEMINI_API=your_actual_api_key_here
```

### 2. Run the Application
I have provided a convenient batch script to start both the Python backend and the React frontend simultaneously.

Simply run the script from the root project directory:
```bash
start_app.bat
```
*(Or just double-click `start_app.bat` in your File Explorer if on Windows).*

This script will open two new terminal windows:
1.  **Terminal 1:** Starts the FastAPI server (`uvicorn`) on `http://localhost:8000`.
2.  **Terminal 2:** Starts the React Vite development server on `http://localhost:5173`.

### 3. Usage
Once both servers are running, the Chatbot UI should automatically open in your default browser perfectly ready.
1. Deploy a task (e.g., *"Design a system architecture for a real-time chat app"*).
2. Hit the **Send** button.
3. Read the final polished response, and inspect the **Pipeline Trace** block underneath it to see the AI's step-by-step reasoning!

---

## 📂 Project Structure
```text
ai-agent-pipeline/
├── main.py                 # FastAPI backend containing the single-call Agent pipeline logic
├── start_app.bat           # 1-click startup script for both servers
├── requirements.txt        # Python dependencies (fastapi, uvicorn, google-genai, pydantic)
├── .env                    # Environment variables (Gemini API Key)
└── ai-chatbot/             # React Frontend Directory
    ├── src/
    │   ├── App.jsx         # Main Chatbot UI component & Agent trace
    │   ├── App.css         # Premium styling for chat container, glassmorphism, bubbles
    │   └── index.css       # Global styles (fonts, variables, dynamic background)
    └── package.json        # Node dependencies (vite, react, lucide-react)
```
