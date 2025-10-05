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

  // Text-to-Speech Function
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

  // Start Recording
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

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe Audio
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
        setChatInput(transcribedText);
        setChatMessages(prev => [...prev, { type: 'user', text: transcribedText }]);
      }
    } catch (error) {
      console.error('Transcription Error:', error);
    }
    setLoading(false);
  };

  // Send Chat Message
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
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'bot', text: 'Error: Could not process your request' }]);
    }
    setLoading(false);
  };

  // Fetch Events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Events Error:', error);
    }
    setLoading(false);
  };

  // Check Library Hours
  const checkLibraryHours = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/check_library_hours`);
      if (response.ok) {
        const data = await response.json();
        setLibraryHours(data);
      }
    } catch (error) {
      console.error('Library Hours Error:', error);
    }
    setLoading(false);
  };

  // Get Weather
  const getWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_weather`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    } catch (error) {
      console.error('Weather Error:', error);
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
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      {msg.type === 'bot' && (
                        <button
                          onClick={() => speakText(msg.text)}
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
                onChange={(e) => setChatInput(e.target.value)}
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
                events.map((event, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-gray-800">{event.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{new Date(event.starts_on).toLocaleString()}</p>
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  </div>
                ))
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
                Library Hours & Rooms
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
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm overflow-x-auto">{JSON.stringify(libraryHours, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Click "Check Availability" to view library information</p>
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
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-700">
                Use the chat to ask about specific bus routes and schedules. For example:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>"What time is the next bus to College Avenue?"</li>
                <li>"Show me the bus schedule for Route A"</li>
                <li>"When does the bus run on weekends?"</li>
              </ul>
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
              <div className="text-center py-8">
                <p className="text-gray-700 text-lg">{typeof weather === 'string' ? weather : JSON.stringify(weather)}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Click "Get Weather" to check current conditions</p>
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
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
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
              {['Brower Commons', 'Busch Dining Hall', 'Livingston Dining Commons', 'Neilson Dining Hall'].map(
                (dining) => (
                  <div key={dining} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-800">{dining}</h3>
                    <p className="text-sm text-gray-600 mt-1">Click chat to inquire about menu and hours</p>
                  </div>
                )
              )}
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
