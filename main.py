import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
import traceback
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API")

app = FastAPI()

# Add CORS middleware to allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_input: str

def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """Helper function to call Gemini API."""
    client = genai.Client(api_key=api_key) # Uses GEMINI_API_KEY environment variable
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )
    return response.text

@app.post("/chat")
async def chat_pipeline(request: ChatRequest):
    user_input = request.user_input
    
    try:
        # Agent 1: Router
        router_instruction = "You are a Router Agent. Analyze the user's request and classify its intent briefly. Then, provide a high-level one-sentence direction for the Research Agent."
        router_output = call_gemini(f"User Request: {user_input}", router_instruction)
        
        # Agent 2: Researcher
        research_instruction = "You are a Research Agent. Based on the user's request and the Router's direction, gather necessary context, break down the problem, and provide a detailed outline of what needs to be created or addressed."
        research_prompt = f"User Request: {user_input}\n\nRouter Output: {router_output}"
        research_output = call_gemini(research_prompt, research_instruction)
        
        # Agent 3: Coder/Drafter
        drafter_instruction = "You are a Drafting Agent. Based on the Research Agent's outline, generate the actual detailed content, whether it's code, a summary, or a creative piece. Do not include boilerplate pleasantries."
        drafter_prompt = f"User Request: {user_input}\n\nResearch Output: {research_output}"
        drafter_output = call_gemini(drafter_prompt, drafter_instruction)
        
        # Agent 4: Reviewer
        reviewer_instruction = "You are a Reviewer Agent. Critically analyze the Drafting Agent's output against the original user request. Identify any flaws, missing parts, or areas for improvement, and provide a corrected/improved version."
        reviewer_prompt = f"Original Request: {user_input}\n\nDraft:\n{drafter_output}"
        reviewer_output = call_gemini(reviewer_prompt, reviewer_instruction)
        
        # Agent 5: Polisher
        polisher_instruction = "You are a Polisher Agent. Take the Reviewer's corrected output and format it beautifully for the final user. Use clear markdown styling. Make the response engaging, helpful, and direct in a Chatbot style."
        polisher_prompt = f"Original Request: {user_input}\n\nReviewed Draft:\n{reviewer_output}"
        final_output = call_gemini(polisher_prompt, polisher_instruction)
        
        return {
            "response": final_output,
            "agents": [
                {"name": "Router", "output": router_output},
                {"name": "Researcher", "output": research_output},
                {"name": "Drafter", "output": drafter_output},
                {"name": "Reviewer", "output": reviewer_output},
                {"name": "Polisher", "output": final_output}
            ]
        }
    except Exception as e:
        error_msg = f"An error occurred in the pipeline:\n{traceback.format_exc()}"
        print(error_msg)
        return {"response": error_msg, "error": True}