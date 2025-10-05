import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, Calendar, Book, Bus, MapPin, Bell, Cloud, Coffee, MessageSquare, Volume2, Home } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function CampusAssistant() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setchatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [libraryHours, setLibraryHours] = useState(null);
  const [weather, setWeather] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

 
  const speakText = async (text) => {
    try {
      const response = await fetch(`${API_BASE_URL}/text_to_speech?query=${encodeURIComponent(text)}&voice=21m00Tcm4TlvDq8ikWAM`);
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording Error:', error);
      alert('Microphone access denied');
    }
  };

 
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  const transcribeAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch(`${API_BASE_URL}/speech_to_text`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcribedText = data.text || '';
        
        if (transcribedText.trim()) {
          setChatMessages(prev => [...prev, { type: 'user', text: transcribedText }]);
          
          try {
            const botResponse = await fetch(`${API_BASE_URL}/student_life`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: transcribedText }),
            });

            if (botResponse.ok) {
              const botData = await botResponse.json();
              const botMessage = typeof botData === 'string' ? botData : JSON.stringify(botData, null, 2);
              setChatMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
            } else {
              setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not connect to server' }]);
            }
          } catch (error) {
            setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not process your request' }]);
          }
        }
      }
    } catch (error) {
      console.error('Transcription Error:', error);
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not transcribe audio' }]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);
    setchatInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/student_life`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        setChatMessages(prev => [...prev, { type: 'bot', text: botMessage }]);
      } else {
        setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not connect to server' }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not process your request' }]);
    }
    setLoading(false);
  };

  const navigateToChat = (message) => {
    setActiveTab('chat');
    setchatInput(message);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        alert('Failed to fetch events');
      }
    } catch (error) {
      console.error('Events Error:', error);
      alert('Error fetching events. Make sure the backend is running.');
    }
    setLoading(false);
  };

  const checkLibraryHours = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/check_library_hours`);
      if (response.ok) {
        const data = await response.json();
        setLibraryHours(data);
      } else {
        alert('Failed to fetch library hours');
      }
    } catch (error) {
      console.error('Library Hours Error:', error);
      alert('Error fetching library hours. Make sure the backend is running.');
    }
    setLoading(false);
  };

  const getWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_weather`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {
        const text = await response.text();
        setWeather(text);
      }
    } catch (error) {
      console.error('Weather Error:', error);
      alert('Error fetching weather. Make sure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8" />
            Rutgers Campus Assistant
          </h1>
          <p className="text-red-100 mt-2">Your AI-powered campus companion</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'library', label: 'Library', icon: Book },
            { id: 'bus', label: 'Bus', icon: Bus },
            { id: 'weather', label: 'Weather', icon: Cloud },
            { id: 'food', label: 'Food', icon: Coffee },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-96 overflow-y-auto mb-4 space-y-4 border border-gray-200 rounded-lg p-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your campus assistant</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.type === 'bot' && msg.text.includes('<') && msg.text.includes('>') ? (
                        <div 
                          className="whitespace-pre-wrap break-words prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: msg.text
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/&lt;br\s*\/?&gt;/gi, '<br />')
                              .replace(/&lt;p&gt;/gi, '<p>')
                              .replace(/&lt;\/p&gt;/gi, '</p>')
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      )}
                      {msg.type === 'bot' && (
                        <button
                          onClick={() => speakText(msg.text.replace(/<[^>]*>/g, ''))}
                          className="mt-2 text-sm opacity-70 hover:opacity-100 flex items-center gap-1"
                        >
                          <Volume2 className="w-4 h-4" />
                          Listen
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setchatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !chatInput.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-red-600" />
                Campus Events
              </h2>
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh Events'}
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Click "Refresh Events" to load campus events</p>
              ) : (
                events.map((event, idx) => {
                  const stripHtml = (html) => {
                    const tmp = document.createElement('div');
                    tmp.innerHTML = html;
                    return tmp.textContent || tmp.innerText || '';
                  };

                  const cleanDescription = event.description ? stripHtml(event.description) : '';
                  const eventDate = event.starts_on ? new Date(event.starts_on) : null;
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{event.name}</h3>
                          {eventDate && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{eventDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                              <span className="text-gray-400">•</span>
                              <span>{eventDate.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {cleanDescription && (
                        <p className="text-gray-700 mt-3 text-sm leading-relaxed line-clamp-4">
                          {cleanDescription}
                        </p>
                      )}
                      {cleanDescription.length > 200 && (
                        <button className="text-red-600 text-sm mt-2 hover:underline">
                          Read more
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Book className="w-7 h-7 text-red-600" />
                Library Room Availability
              </h2>
              <button
                onClick={checkLibraryHours}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Check Availability'}
              </button>
            </div>
            {libraryHours ? (
              <div className="space-y-4">
                {libraryHours.status === 200 ? (
                  (() => {
                    try {
                      const data = JSON.parse(libraryHours.response);
                      const slots = data.slots || [];
                      
                      const availableSlots = slots.filter(slot => !slot.className || slot.className !== 's-lc-eq-checkout');
                      const bookedSlots = slots.filter(slot => slot.className === 's-lc-eq-checkout');
                      
                      const formatTime = (dateStr) => {
                        const date = new Date(dateStr);
                        return date.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        });
                      };

                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">{availableSlots.length}</span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Available Slots</p>
                                  <p className="font-bold text-lg text-gray-800">Ready to Book</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">{bookedSlots.length}</span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Booked Slots</p>
                                  <p className="font-bold text-lg text-gray-800">Currently Occupied</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {availableSlots.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Available Time Slots
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                                {availableSlots.map((slot, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-green-50 border border-green-200 rounded p-2 text-center hover:bg-green-100 transition-colors cursor-pointer"
                                  >
                                    <p className="text-xs font-medium text-gray-700">
                                      {formatTime(slot.start)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatTime(slot.end)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {bookedSlots.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Booked Time Slots
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                                {bookedSlots.map((slot, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-red-50 border border-red-200 rounded p-2 text-center opacity-60"
                                  >
                                    <p className="text-xs font-medium text-gray-700">
                                      {formatTime(slot.start)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatTime(slot.end)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>Note:</strong> Time slots are shown in 15-minute intervals. Green slots are available for booking, red slots are already booked.
                            </p>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                          <p className="text-sm text-red-700">
                            <strong>Error:</strong> Failed to parse library data
                          </p>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> Failed to fetch library data (Status: {libraryHours.status})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-500 mb-2">Click "Check Availability" to view library room slots</p>
                <p className="text-sm text-gray-400">Shows available and booked time slots for library rooms</p>
              </div>
            )}
          </div>
        )}

        {/* Bus Tab */}
        {activeTab === 'bus' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Bus className="w-7 h-7 text-red-600" />
              Bus Schedule
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-gray-700">
                Use the chat to ask about specific bus routes and schedules. For example:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>"What time is the next bus to College Avenue?"</li>
                <li>"Show me the bus schedule for Route A"</li>
                <li>"When does the bus run on weekends?"</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Quick Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => navigateToChat("What time is the next bus to College Avenue?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Next bus to College Avenue</p>
                  <p className="text-xs text-gray-500 mt-1">Get current schedule</p>
                </button>
                <button
                  onClick={() => navigateToChat("Show me the bus schedule for Route A")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Route A Schedule</p>
                  <p className="text-xs text-gray-500 mt-1">View full route info</p>
                </button>
                <button
                  onClick={() => navigateToChat("When does the bus run on weekends?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Weekend Schedule</p>
                  <p className="text-xs text-gray-500 mt-1">Check weekend hours</p>
                </button>
                <button
                  onClick={() => navigateToChat("How do I get from Busch to Livingston?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Campus Navigation</p>
                  <p className="text-xs text-gray-500 mt-1">Get directions</p>
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Check the Rutgers New Brunswick Passigo service for real-time bus tracking and schedules.
              </p>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Cloud className="w-7 h-7 text-red-600" />
                Weather in New Brunswick, NJ
              </h2>
              <button
                onClick={getWeather}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
            {weather ? (
              weather.error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700">
                    <strong>Error:</strong> {weather.error}
                  </p>
                  <p className="text-sm text-red-600 mt-1">{weather.details}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Current Weather</h3>
                        <p className="text-blue-100">{weather.location}</p>
                      </div>
                      <Cloud className="w-16 h-16 opacity-50" />
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-6xl font-bold">{weather.current?.temperature_f}°F</p>
                        <p className="text-xl mt-2">{weather.current?.condition}</p>
                        <p className="text-blue-100 text-sm mt-1">
                          Feels like {weather.current?.feels_like_f}°F
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-100">Humidity:</span>
                          <span className="font-medium">{weather.current?.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">Wind:</span>
                          <span className="font-medium">
                            {weather.current?.wind_speed_mph} mph {weather.current?.wind_direction}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">Visibility:</span>
                          <span className="font-medium">{weather.current?.visibility_miles} mi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">UV Index:</span>
                          <span className="font-medium">{weather.current?.uv_index}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {weather.forecast && weather.forecast.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">3-Day Forecast</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {weather.forecast.map((day, idx) => {
                          const date = new Date(day.date);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          
                          return (
                            <div 
                              key={idx} 
                              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="text-center">
                                <p className="font-bold text-lg text-gray-800">{dayName}</p>
                                <p className="text-sm text-gray-600">{monthDay}</p>
                                
                                <Cloud className="w-12 h-12 mx-auto my-3 text-blue-500" />
                                
                                <p className="text-sm text-gray-700 mb-3">{day.condition}</p>
                                
                                <div className="flex justify-center gap-4 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">High</p>
                                    <p className="text-2xl font-bold text-red-600">{day.max_temp_f}°</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Low</p>
                                    <p className="text-2xl font-bold text-blue-600">{day.min_temp_f}°</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600 border-t border-gray-200 pt-3">
                                  <div className="flex justify-between">
                                    <span>Rain Chance:</span>
                                    <span className="font-medium">{day.chance_of_rain}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Sunrise:</span>
                                    <span className="font-medium">{day.sunrise}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Sunset:</span>
                                    <span className="font-medium">{day.sunset}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Weather data is updated in real-time. Click "Get Weather" to refresh the forecast.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-500 mb-2">Click "Get Weather" to check current conditions</p>
                <p className="text-sm text-gray-400">View real-time weather and 3-day forecast for New Brunswick, NJ</p>
              </div>
            )}
          </div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Coffee className="w-7 h-7 text-red-600" />
              Food Ordering
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
              <p className="text-gray-700 mb-2">
                Use the chat to order food from campus dining locations. Specify:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>The dining hall or restaurant</li>
                <li>Your preferred pickup time</li>
                <li>Any special requests</li>
              </ul>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Brower Commons', location: 'College Avenue' },
                { name: 'Busch Dining Hall', location: 'Busch Campus' },
                { name: 'Livingston Dining Commons', location: 'Livingston Campus' },
                { name: 'Neilson Dining Hall', location: 'Cook/Douglass' }
              ].map((dining) => (
                <div key={dining.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{dining.name}</h3>
                      <p className="text-sm text-gray-500">{dining.location}</p>
                    </div>
                    <Coffee className="w-6 h-6 text-red-600" />
                  </div>
                  <button
                    onClick={() => navigateToChat(`What's available at ${dining.name} today?`)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Ask about menu
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => navigateToChat("What dining halls are open right now?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Check Open Locations</p>
                  <p className="text-xs text-gray-500 mt-1">See current hours</p>
                </button>
                <button
                  onClick={() => navigateToChat("What are today's dining hall specials?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Today's Specials</p>
                  <p className="text-xs text-gray-500 mt-1">View featured items</p>
                </button>
                <button
                  onClick={() => navigateToChat("I'd like to order food for pickup at 6pm")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Place an Order</p>
                  <p className="text-xs text-gray-500 mt-1">Order for pickup</p>
                </button>
                <button
                  onClick={() => navigateToChat("What are the meal plan options?")}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">Meal Plans</p>
                  <p className="text-xs text-gray-500 mt-1">View available plans</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 Rutgers Campus Assistant. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">Powered by AI for Rutgers students</p>
        </div>
      </footer>
    </div>
  );
}
