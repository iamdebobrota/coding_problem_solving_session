
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import google.generativeai as genai
import json


# load the environment variables
load_dotenv()

# initiate the genai client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
genai_model=os.getenv("GEMINI_MODEL")
model = genai.GenerativeModel(genai_model)

# inilize the app
app = FastAPI()

# Pydantic model for the request body
class GenerateRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"

# home page
@app.get("/")
def home():
    return FileResponse("index.html")
    # return {"message": "Welcome to the Home Page"}


# generate route
@app.post("/generate")
async def generate_questions(req: GenerateRequest):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    prompt = f"""You are a technical interviewer. Generate 10 questions on the topic {req.topic} for a {req.difficulty} level exam.
    Include a mixture of conceptual and practical questions.
    Return ONLY valid JSON in this exact format, no extra text:
    {{
        "questions": [
            {{"question": "What is a closure in JavaScript?", "type": "conceptual"}},
            {{"question": "Debug the following code...", "type": "practical" }}
        ]
    }}
    The "type" field must be either "conceptual" or "practical"."""


    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # strop markdown code if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0].strip()


        data = json.loads(text)
        if "questions" not in data:
            raise HTTPException(status_code=400, detail="Missing 'questions' key in the response")

        return data

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Failed to parse JSON response")
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "rate" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

        raise HTTPException(status_code=500, detail="AI request failed: {error_msg}")