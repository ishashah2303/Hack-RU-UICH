from multiprocessing import current_process
from fastapi import FastAPI, Query
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import date
from workflow import workflow
import requests

load_dotenv()

app = FastAPI()


# --- Models ---
class QueryRequest(BaseModel):
    query: str


available_rooms = {
    "A101": ["9am-11am", "2pm-4pm"],
    "B202": ["10am-12pm", "3pm-5pm"],
    "C303": ["1pm-3pm", "4pm-6pm"]
}

@app.get("/book_study_room")
def book_study_room(
    room_id: str = Query(..., description="Room ID like A101, B202, C303"),
    time: str = Query(..., description="Requested time slot, e.g., 2pm-4pm")
):
    if room_id not in available_rooms:
        return {"status": "error", "message": f"Room {room_id} does not exist."}

    if time in available_rooms[room_id]:
        # simulate booking
        available_rooms[room_id].remove(time)
        return {
            "status": "success",
            "room_id": room_id,
            "time": time,
            "message": f"✅ Study room {room_id} booked for {time}."
        }
    else:
        return {
            "status": "unavailable",
            "room_id": room_id,
            "time": time,
            "available_slots": available_rooms[room_id],
            "message": f"❌ Requested slot not available. Choose from available slots."
        }


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
    return "Predict based on your search, You check the weather in New Brunswick, NJ"

# Root endpoint
@app.get("/")
def root():
    return {"message": "Campus Assistant API is running."}

@app.post("/student_life")
def student_life(request: QueryRequest):
    return workflow.invoke({"query": request.query})
