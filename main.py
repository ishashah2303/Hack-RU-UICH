from fastapi import FastAPI, Query
from pydantic import BaseModel
from dotenv import load_dotenv

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


@app.get("/find_study_group")
def find_study_group(subject: str = "AI"):
    return {
        "subject": subject,
        "groups": [
            {"id": 1, "name": "AI Enthusiasts", "members": 12, "meeting": "Library 5pm"},
            {"id": 2, "name": "Deep Learning Study Group", "members": 8, "meeting": "Lab 3, 6pm"}
        ]
    }

@app.get("/get_class_schedule")
def get_class_schedule(student_id: str = "123"):
    return {
        "student_id": student_id,
        "schedule": [
            {"course": "CS101", "time": "Mon 9am", "location": "Hall A"},
            {"course": "AI202", "time": "Wed 11am", "location": "Hall B"}
        ]
    }

@app.get("/get_assignment_deadline")
def get_assignment_deadline(course: str = "AI202"):
    return {
        "course": course,
        "assignments": [
            {"title": "Project Proposal", "due": "2025-10-15"},
            {"title": "Research Paper", "due": "2025-11-01"}
        ]
    }

@app.get("/order_food")
def order_food(item: str = "Pizza", location: str = "Cafeteria"):
    return {
        "item": item,
        "location": location,
        "status": "order placed",
        "eta_minutes": 20
    }

@app.get("/order_coffee")
def order_coffee(size: str = "Medium", type: str = "Latte"):
    return {
        "item": f"{size} {type}",
        "status": "order placed",
        "eta_minutes": 5
    }

@app.get("/check_dining_hours")
def check_dining_hours(place: str = "Main Cafeteria"):
    return {
        "place": place,
        "hours": "8am - 9pm"
    }

@app.get("/get_events")
def get_events():
    return {
        "events": [
            {"name": "Hackathon", "date": "2025-10-05", "location": "Innovation Hub"},
            {"name": "AI Workshop", "date": "2025-10-12", "location": "Hall C"}
        ]
    }

@app.get("/check_library_hours")
def check_library_hours():
    return {
        "library": "Main Library",
        "hours": "8am - 11pm"
    }

@app.get("/find_gym_slot")
def find_gym_slot():
    return {
        "slots": [
            {"time": "6am - 7am", "availability": "Available"},
            {"time": "7am - 8am", "availability": "Full"}
        ]
    }

@app.get("/check_bus_schedule")
def check_bus_schedule(route: str = "Campus Loop"):
    return {
        "route": route,
        "next_bus": "10:15am",
        "frequency": "Every 20 mins"
    }

@app.get("/find_bike_rack")
def find_bike_rack():
    return "Predict based on your search, You find the bike rack in the Rutgers New Brunswick campus"

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
