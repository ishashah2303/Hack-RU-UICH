# Rutgers Campus Assistant

> An intelligent, voice-enabled campus companion that streamlines student life at Rutgers University through AI-powered natural language interactions.

## Project Description

Rutgers Campus Assistant is a comprehensive web application designed to simplify campus navigation and daily tasks for Rutgers students. Built during HackRU 2024, this project combines artificial intelligence, voice recognition, and real-time campus data to create an intuitive interface where students can ask questions naturally and receive immediate, accurate responses.

The platform integrates multiple campus services into a single, cohesive experience:
- Real-time event discovery from the Rutgers calendar system
- Library study room availability checking via LibCal API
- Bus route information and campus navigation assistance
- Live weather data for New Brunswick, NJ
- Dining hall information and menu inquiries

What sets this assistant apart is its multimodal interaction design. Students can type their queries, speak them using voice commands, or use quick-action buttons for common tasks. The AI workflow, powered by LangGraph, intelligently routes queries to the appropriate campus services and synthesizes comprehensive responses. Voice responses via text-to-speech make the assistant accessible while multitasking or on the go.

The project addresses a real problem: students often need to check multiple websites and apps to plan their day on campus. This assistant consolidates that information into conversational interactions, saving time and reducing friction in the student experience.

## Features

### Core Functionality
- **AI-Powered Chat Interface**: Natural language understanding for campus-related questions
- **Voice Input (Speech-to-Text)**: Hands-free querying with automatic message sending
- **Voice Output (Text-to-Speech)**: Listen to responses while on the move
- **Smart Context Awareness**: AI remembers conversation context for follow-up questions

### Campus Services Integration
- **Live Event Feed**: Browse upcoming campus events with detailed information
- **Library Room Finder**: Real-time study room availability with time slot visualization
- **Bus Schedule Helper**: Quick answers about routes, timing, and campus transportation
- **Weather Dashboard**: Current conditions and 3-day forecast for campus planning
- **Dining Directory**: Explore dining halls, menus, and operating hours

### User Experience
- **Quick Action Buttons**: Pre-configured queries for common questions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Tabs**: Organized interface for different campus services
- **Real-Time Updates**: Fresh data from campus APIs and weather services

## Tech Stack

### Backend
- **Python 3.8+** - Core programming language
- **FastAPI** - Modern, high-performance web framework
- **LangGraph** - AI agent workflow orchestration
- **ElevenLabs API** - Advanced speech-to-text and text-to-speech
- **Requests** - HTTP library for API integrations
- **Uvicorn** - ASGI server for production deployment

### Frontend
- **React 18** - Component-based UI framework
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first styling framework
- **Lucide React** - Beautiful, consistent icon library

### External APIs
- **Rutgers Campus Labs API** - Event discovery
- **LibCal API** - Library room booking system
- **wttr.in** - Free weather data service
- **ElevenLabs** - Voice AI capabilities

## Project Structure

```
HACK-RU-2024/
├── backend/
│   ├── main.py                 # FastAPI routes and endpoints
│   ├── workflow.py             # LangGraph AI workflow logic
│   ├── student_life.ipynb      # Development and testing notebook
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables (not in repo)
│
├── frontend/
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   └── eslint.config.js        # Code linting rules
│
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- ElevenLabs API key (sign up at https://elevenlabs.io)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create and activate virtual environment:**
```bash
# On macOS/Linux
python3 -m venv .venv
source .venv/bin/activate

# On Windows
python -m venv .venv
.venv\Scripts\activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**

Create a `.env` file in the `backend/` directory:
```env
ELEVEN_API_KEY=your_elevenlabs_api_key_here
```

To get an ElevenLabs API key:
- Visit https://elevenlabs.io
- Sign up for a free account
- Navigate to your profile settings
- Copy your API key

5. **Start the backend server:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

You can view the interactive API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Verify Installation

1. Backend health check: Visit `http://localhost:8000` - you should see a JSON response
2. Frontend: The React app should load with the Rutgers Campus Assistant interface
3. Test voice: Click the microphone button and grant microphone permissions

## Usage Guide

### Chat Interface
1. Navigate to the **Chat** tab
2. Type your question or click the microphone to speak
3. Voice input automatically sends after transcription
4. Click the "Listen" button on any response to hear it spoken

**Example Queries:**
- "What events are happening this weekend?"
- "Are there any study rooms available right now?"
- "What's the weather going to be like tomorrow?"
- "When is the next bus to College Avenue?"

### Campus Events
1. Go to the **Events** tab
2. Click "Refresh Events" to load current campus events
3. Browse events with dates, times, and descriptions
4. Events auto-update from the Rutgers Campus Labs API

### Library Rooms
1. Select the **Library** tab
2. Click "Check Availability"
3. View available (green) and booked (red) time slots
4. Slots are shown in 15-minute intervals for the current day

### Bus Schedules
1. Open the **Bus** tab
2. Use quick action buttons for common routes
3. Or ask in chat: "Show me Route A schedule"
4. Links to Passigo for real-time tracking

### Weather Information
1. Visit the **Weather** tab
2. Click "Get Weather" for current conditions
3. View temperature, humidity, wind, and UV index
4. Check the 3-day forecast with highs, lows, and precipitation chances

### Dining Halls
1. Access the **Food** tab
2. Click on any dining hall to ask about its menu
3. Use quick actions for operating hours and specials
4. Chat interface can answer specific dietary questions

## API Endpoints

### AI & Voice
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/student_life` | POST | Send query to AI assistant |
| `/speech_to_text` | POST | Convert audio file to text (English only) |
| `/text_to_speech` | GET | Convert text to audio speech |

### Campus Services
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get_events` | GET | Fetch upcoming campus events |
| `/check_library_hours` | GET | Get library room availability |
| `/get_weather` | GET | Retrieve weather data for New Brunswick, NJ |
| `/check_bus_schedule` | GET | Bus schedule information |
| `/order_food` | GET | Food ordering assistance |

### Request Examples

**Chat Query:**
```bash
curl -X POST http://localhost:8000/student_life \
  -H "Content-Type: application/json" \
  -d '{"query": "What events are happening today?"}'
```

**Get Weather:**
```bash
curl http://localhost:8000/get_weather
```

## Voice Features

### Speech-to-Text
The application uses ElevenLabs' speech-to-text API with:
- English language restriction for accuracy
- Automatic silence detection
- Real-time transcription
- Auto-send after recording stops

**Workflow:**
1. Click microphone button
2. Speak your question clearly
3. Click microphone again to stop
4. Message automatically transcribes and sends
5. Bot response appears immediately

### Text-to-Speech
Listen to any bot response:
- Click the "Listen" button below any message
- Uses natural-sounding voice synthesis
- Supports long responses
- Works in background while browsing

## Development

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend with module replacement:**
```bash
cd frontend
npm run dev
```


## Future Enhancements

- [ ] Add user authentication and personalized preferences
- [ ] Integrate real-time bus tracking API
- [ ] Expand dining hall menu scraping
- [ ] Add calendar integration for event reminders
- [ ] Implement push notifications for important updates
- [ ] Add multilingual support beyond English

## Acknowledgments

- **Rutgers University** for providing public APIs and campus data
- **ElevenLabs** for advanced voice AI technology
- **HackRU Team** for organizing the hackathon
- **Open Source Community** for tools like FastAPI, React, and Tailwind CSS
- **wttr.in** for free weather API access

## Team

Created during HackRU 2025 by passionate developers dedicated to improving student life at Rutgers.

---

**Built with care for the Rutgers community** | HackRU 2024