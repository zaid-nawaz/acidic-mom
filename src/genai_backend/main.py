from fastapi import FastAPI
from pydantic import BaseModel 
from typing import List
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._proxies import WebshareProxyConfig
from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gemini_client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

class VideoRequest(BaseModel):
    transcript_text: str

class MCQ(BaseModel):
    question: str
    options: List[str]
    answer: str

class MCQResponse(BaseModel):
    mcqs: List[MCQ]

@app.post("/generate_mcq", response_model=MCQResponse)
async def generate_mcq(request: VideoRequest):
    
    video_id = request.video_id
    
    ytt_api = YouTubeTranscriptApi(
    proxy_config=WebshareProxyConfig(
        proxy_username=os.environ.get("WEBSHARE_USERNAME"),
        proxy_password=os.environ.get("WEBSHARE_PASSWORD"),
    )
)
    transcript = ytt_api.fetch(video_id,languages=['en','hi'])
    text_content = " ".join([t.text for t in transcript])
 
    SYSTEM_PROMPT = f"""
    The following text is a lecture transcript (could be in Hindi or English). 
    Understand it and generate 4 multiple choice questions *in English* 
    based on its content.
    Generate 4 multiple choice questions based on the following lecture content:
    {text_content}
    
    Format the response as a **valid JSON** array like this:
    [
      {{
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "answer": "string"
      }}
    ]

    for example : 
    [
        {{
    "question": "What is the name of the new backend development playlist/series announced in the lecture?",
    "options": [
      "A) Chai aur Stories",
      "B) Chai aur React",
      "C) Chai aur Backend",
      "D) Chai aur JavaScript"
    ],
    "answer": "C) Chai aur Backend"
        }}

    """

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents = [
            {"role": "user", "parts": [{"text":SYSTEM_PROMPT}]},
        ],
        config={
            "response_mime_type" : "application/json"
        }
    )

    # ai_response = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    print("AI response is:", response.text)

    mcqs = json.loads(response.text)

    return {"mcqs": mcqs}