# Hack-RU-UICH

## Setup

### Weather API Configuration

To use the weather functionality, you need to set up an OpenWeatherMap API key:

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Set the environment variable:
   ```bash
   export OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

Or create a `.env` file in the project root:
```
OPENWEATHER_API_KEY=your_actual_api_key_here
```

### Google Calendar Integration Setup

To use the reminder functionality with Google Calendar:

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Enable Google Calendar API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Calendar API
   - Create credentials (OAuth 2.0 Client ID) for a desktop application

3. **Download credentials:**
   - Download the JSON credentials file
   - Rename it to `credentials.json` and place it in the project root

4. **Setup authentication:**
   ```bash
   python setup_google_calendar.py
   ```
   This will open a browser window for you to authenticate with Google.

5. **Set environment variables (optional):**
   ```bash
   export GOOGLE_CALENDAR_ID=your_calendar_id_here  # Optional, defaults to "primary"
   export GOOGLE_CREDENTIALS_FILE=credentials.json  # Optional, defaults to "credentials.json"
   ```

### Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

### API Endpoints

#### Set Reminder (POST)
```bash
curl -X POST "http://localhost:8000/set_reminder" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Study Session",
    "description": "Review for AI exam",
    "start_time": "2024-01-15T14:30:00",
    "location": "Library Room A101",
    "reminder_minutes": 15
  }'
```

#### Set Reminder (GET - for easy testing)
```bash
curl "http://localhost:8000/set_reminder?title=Study%20Session&start_time=2024-01-15T14:30:00&description=Review%20for%20AI%20exam&location=Library%20Room%20A101&reminder_minutes=15"
```

### Testing the Reminder Functionality

After setting up Google Calendar integration, you can test the reminder functionality:

```bash
# Test the reminder API
python test_reminder.py
```

This will create test reminders in your Google Calendar to verify everything is working correctly.

## Uber API Integration

The API now includes comprehensive Uber ride functionality:

### Uber Endpoints

#### Get Available Uber Products
```bash
curl "http://localhost:8000/uber/products?latitude=40.5008&longitude=-74.4474"
```

#### Get Price Estimates
```bash
# POST version
curl -X POST "http://localhost:8000/uber/estimate" \
  -H "Content-Type: application/json" \
  -d '{
    "start_latitude": 40.5008,
    "start_longitude": -74.4474,
    "end_latitude": 40.4964,
    "end_longitude": -74.4441
  }'

# GET version
curl "http://localhost:8000/uber/estimate?start_lat=40.5008&start_lng=-74.4474&end_lat=40.4964&end_lng=-74.4441"
```

#### Get Time Estimates
```bash
curl "http://localhost:8000/uber/time_estimates?latitude=40.5008&longitude=-74.4474"
```

#### Get Campus Rides (Pre-configured destinations)
```bash
# To New Brunswick Station
curl "http://localhost:8000/uber/campus_rides"

# To other destinations
curl "http://localhost:8000/uber/campus_rides?destination=princeton"
curl "http://localhost:8000/uber/campus_rides?destination=manhattan"
curl "http://localhost:8000/uber/campus_rides?destination=newark_airport"
```

### Available Campus Destinations
- `new_brunswick_station` - New Brunswick Station
- `princeton` - Princeton
- `newark_airport` - Newark Airport
- `jfk_airport` - JFK Airport
- `philadelphia` - Philadelphia
- `manhattan` - Manhattan