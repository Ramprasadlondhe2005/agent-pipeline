import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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

class AgentOutput(BaseModel):
    name: str = Field(description="The name of the agent (e.g., 'Router', 'Researcher', 'Drafter', 'Reviewer', 'Polisher')")
    output: str = Field(description="The output produced by this specific agent step")

class PipelineResponse(BaseModel):
    agents: list[AgentOutput] = Field(description="The outputs from the 5 agents evaluated in sequence.")
    final_response: str = Field(description="The beautifully formatted final output from the Polisher agent, using markdown.")

def call_gemini_pipeline(user_input: str) -> PipelineResponse:
    """Helper function to call Gemini API and get structured JSON response."""
    client = genai.Client(api_key=api_key)
    
    system_instruction = """You are a highly capable AI system operating as a 5-step Agentic Pipeline.
For the user's request, you must simulate the following 5 distinct agent steps in sequence internally, and return the structured JSON output for each step:
1. Router Agent: Briefly classify the intent and give a 1-sentence direction.
2. Research Agent: Break down the problem and outline necessary context based on the Router's direction.
3. Drafting Agent: Generate the actual content, code, or summary based on the Research outline.
4. Reviewer Agent: Critically analyze the Draft against the original request. Identify flaws and corrections.
5. Polisher Agent: Take the corrected draft and apply final beautiful Markdown formatting for the user.

You MUST provide exactly 5 agents in your `agents` array, perfectly matching the names:
"Router", "Researcher", "Drafter", "Reviewer", "Polisher".
And finally, provide the polished text in `final_response`.
"""
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        response_mime_type="application/json",
        response_schema=PipelineResponse
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"User Request: {user_input}",
        config=config
    )
    
    # Parse the returned JSON text into our Pydantic model
    return PipelineResponse.model_validate_json(response.text)

@app.post("/chat")
async def chat_pipeline(request: ChatRequest):
    user_input = request.user_input
    
    try:
        # Run the entire pipeline in ONE single API call to avoid rate limits
        pipeline_data = call_gemini_pipeline(user_input)
        
        return {
            "response": pipeline_data.final_response,
            "agents": [
                {"name": agent.name, "output": agent.output} 
                for agent in pipeline_data.agents
            ]
        }
    except Exception as e:
        error_msg = f"An error occurred in the pipeline:\n{traceback.format_exc()}"
        print(error_msg)
        return {"response": error_msg, "error": True}