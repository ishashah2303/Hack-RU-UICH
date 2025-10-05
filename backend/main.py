from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import date
from workflow import workflow

import requests
import os
import io
import re

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")


def strip_html_tags(text):
    """Remove HTML tags from text"""
    if not text:
        return text

    clean = re.compile('<.*?>')
    text_without_tags = re.sub(clean, '', str(text))

    text_without_tags = text_without_tags.replace('&nbsp;', ' ')
    text_without_tags = text_without_tags.replace('&amp;', '&')
    text_without_tags = text_without_tags.replace('&lt;', '<')
    text_without_tags = text_without_tags.replace('&gt;', '>')
    text_without_tags = text_without_tags.replace('&quot;', '"')
    text_without_tags = text_without_tags.replace('**', '')
    text_without_tags = text_without_tags.replace('*', '')

    text_without_tags = ' '.join(text_without_tags.split())
    return text_without_tags


class QueryRequest(BaseModel):
    query: str


@app.post("/text_to_speech")
def text_to_speech(request: QueryRequest, voice_id: str = "21m00Tcm4TlvDq8ikWAM"):
    """Convert text to speech using ElevenLabs TTS."""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_API_KEY
    }
    payload = {
        "text": request.query,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.7
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, stream=True)
        response.raise_for_status()
        return StreamingResponse(io.BytesIO(response.content), media_type="audio/mpeg")
    except requests.RequestException as e:
        return JSONResponse(content={"error": "Text-to-speech failed", "details": str(e)})

@app.get("/text_to_speech")
def text_to_speech_get(query: str, voice: str = "21m00Tcm4TlvDq8ikWAM"):
    return text_to_speech(QueryRequest(query=query), voice)


@app.post("/speech_to_text")
async def speech_to_text(
    file: UploadFile = File(...),
    model_id: str = "scribe_v1",
    language_code: str = "en",
    tag_audio_events: bool = True,
    diarize: bool = False
):
    url = "https://api.elevenlabs.io/v1/speech-to-text"
    headers = {
        "xi-api-key": ELEVEN_API_KEY
    }

    try:
        audio_bytes = await file.read()
        files = {
            "file": (file.filename, audio_bytes, file.content_type or "application/octet-stream")
        }
        data = {
            "model_id": model_id,
            "language_code": "en",
            "tag_audio_events": tag_audio_events,
            "diarize": diarize,
        }
        if language_code:
            data["language_code"] = language_code

        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return JSONResponse(content={"error": "Speech-to-text failed", "details": str(e)})


@app.get("/check_library_hours")
def check_library_hours(
    ):
    payload = {
        "lid": 2558,
        "gid": 35511,
        "eid": 141478,
        "seat": 0,
        "seatId": 0,
        "zone": 0,
        "start": "2025-10-05",
        "end": "2025-10-06",
        "pageIndex": 0,
        "pageSize": 18
    }

    headers = {
        "Referer": "https://libcal.rutgers.edu/",
        "Origin": "https://libcal.rutgers.edu",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    LIBCAL_URL = "https://libcal.rutgers.edu/spaces/availability/grid"
    res = requests.post(LIBCAL_URL, data=payload, headers=headers)
    return {"status": res.status_code, "response": res.text}


@app.get("/order_food")
def order_food():
    return "Suggest the place and time taken."


@app.get("/get_events")
def get_events():
    today = date.today()  # get current date
    url = f"https://rutgers.campuslabs.com/engage/api/discovery/event/search?endsAfter={today}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()  # parse JSON from API
    except requests.RequestException as e:
        return {"error": "Failed to fetch events", "details": str(e)}

    events_list = []
    for event in data.get("value", []):
        events_list.append({
            "name": event.get("name", "No Name"),
            "description": event.get("description", ""),
            "starts_on": event.get("startsOn", ""),
        })

    return {"date": str(today), "events": events_list}


@app.get("/check_bus_schedule")
def check_bus_schedule():
    return "Check the Rutgers New Brunswick Passigo service and provide the answer."


@app.get("/get_directions")
def get_directions():
    return f"Provide directions from current location to destination."


@app.get("/set_reminder")
def set_reminder():
    return "Reminder set"


@app.get("/get_weather")
def get_weather():
    try:
        location = "New Brunswick,NJ"
        
        current_url = f"https://wttr.in/{location}?format=j1"
        response = requests.get(current_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current_condition", [{}])[0]
        
        forecast = data.get("weather", [])[:3]
        
        weather_data = {
            "location": "New Brunswick, NJ",
            "current": {
                "temperature_f": current.get("temp_F", "N/A"),
                "temperature_c": current.get("temp_C", "N/A"),
                "condition": current.get("weatherDesc", [{}])[0].get("value", "N/A"),
                "feels_like_f": current.get("FeelsLikeF", "N/A"),
                "feels_like_c": current.get("FeelsLikeC", "N/A"),
                "humidity": current.get("humidity", "N/A"),
                "wind_speed_mph": current.get("windspeedMiles", "N/A"),
                "wind_direction": current.get("winddir16Point", "N/A"),
                "precipitation_mm": current.get("precipMM", "N/A"),
                "visibility_miles": current.get("visibilityMiles", "N/A"),
                "uv_index": current.get("uvIndex", "N/A")
            },
            "forecast": []
        }
        
        for day in forecast:
            weather_data["forecast"].append({
                "date": day.get("date", "N/A"),
                "max_temp_f": day.get("maxtempF", "N/A"),
                "min_temp_f": day.get("mintempF", "N/A"),
                "max_temp_c": day.get("maxtempC", "N/A"),
                "min_temp_c": day.get("mintempC", "N/A"),
                "condition": day.get("hourly", [{}])[0].get("weatherDesc", [{}])[0].get("value", "N/A"),
                "chance_of_rain": day.get("hourly", [{}])[0].get("chanceofrain", "0"),
                "sunrise": day.get("astronomy", [{}])[0].get("sunrise", "N/A"),
                "sunset": day.get("astronomy", [{}])[0].get("sunset", "N/A")
            })
        
        return weather_data
        
    except requests.RequestException as e:
        return JSONResponse(
            content={
                "error": "Failed to fetch weather data",
                "details": str(e),
                "location": "New Brunswick, NJ"
            },
            status_code=500
        )


@app.post("/student_life")
def student_life(request: QueryRequest):
    message = workflow.invoke({"query": request.query})
    response = message.get("response", "NO INFO: TRY AGAIN")
    clean_response = strip_html_tags(response)
    return clean_response


@app.get("/")
def root():
    return {"message": "Rutgers Campus Assistant API is running."}
