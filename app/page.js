'use client'; // Required for hooks and event handlers

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { v4 as uuidv4 } from 'uuid'; // For session ID

// --- Define Loading Components Consistently ---
// These will be rendered on the server AND on the initial client render pass
const TutorCanvasLoading = () => <div className="w-full h-64 md:h-full flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading 3D Viewer...</p></div>;
const SpeechControlsLoading = () => <div className="w-full h-full flex items-center justify-center p-4 bg-white bg-opacity-80 rounded-lg shadow-lg"><p className="text-gray-500">Loading controls...</p></div>;

// --- Dynamically import the Canvas component ---
const TutorCanvas = dynamic(() => import('../components/TutorCanvas'), {
  ssr: false, // This is the key: disable server-side rendering
  loading: TutorCanvasLoading // Use the consistent loading component
});

// --- Dynamically import the SpeechControls component ---
const SpeechControls = dynamic(() => import('../components/SpeechControls'), {
    ssr: false, // Disable SSR for this component
    loading: SpeechControlsLoading // Use the consistent loading component
});

// --- Main Page Component ---
export default function Home() {
  const [isClient, setIsClient] = useState(false); // State to track client-side mounting
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChatting, setIsChatting] = useState(false); // Overall chat state
  const [aiResponse, setAiResponse] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [sessionId, setSessionId] = useState('');
  const utteranceRef = useRef(null); // Ref for the current speech synthesis utterance

  // --- Effect to set isClient to true after mounting ---
   useEffect(() => {
    setIsClient(true);
    setSessionId(uuidv4()); // Generate sessionId on client mount
     // Pre-load voices on client mount after a small delay
     const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
     }, 500); // Adjust delay if needed
     return () => clearTimeout(timer); // Cleanup timer
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Speech Synthesis Handling ---
  const speak = (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        if (utteranceRef.current) {
            utteranceRef.current.onend = null;
            utteranceRef.current.onerror = null;
        }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Try finding an English voice first
    let targetVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Luna')); // Keep Luna if available? Or remove name check.
    if (!targetVoice) targetVoice = voices.find(voice => voice.lang.startsWith('en')); // Find any English voice
    if (!targetVoice && voices.length > 0) targetVoice = voices.find(voice => voice.default) || voices[0]; // Broader fallback

    if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang; // Use the voice's language
    } else {
        utterance.lang = 'en-US'; // Fallback language if no suitable voice found
        console.warn("English voice not found, using default voice for language en-US.");
    }

    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log("Speech ended");
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    setTimeout(() => window.speechSynthesis.speak(utterance), 100);
  };

  // --- Gemini API Interaction ---
  const sendToGemini = async (message) => {
    // No need for isClient check here
    if (!message || !sessionId) return;
    console.log("Sending to Gemini:", message);
    setAiResponse('...'); // Indicate loading
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received from Gemini:", data.response);
      setAiResponse(data.response);
      speak(data.response);
    } catch (error) {
      console.error("Failed to send message to Gemini:", error);
      setAiResponse(`Error: ${error.message}`);
      setIsChatting(false); // Stop chat on error
    }
  };

  // --- UI Rendering ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <header className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-700">AI Language Tutor</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-4">
        {/* --- Use the dynamically imported component --- */}
        <div className="w-full md:w-1/2 h-64 md:h-full">
           {/* Render placeholder on server & initial client render.
               Render actual component only after client mount. */}
           {!isClient ? <TutorCanvasLoading /> : <TutorCanvas isSpeaking={isSpeaking} />}
        </div>

        {/* --- Controls Area (Rendered Dynamically) --- */}
        {/* Use a container div for layout consistency */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center">
            {/* Render placeholder on server & initial client render.
                Render actual component only after client mount. */}
            {!isClient ? <SpeechControlsLoading /> : (
                <SpeechControls
                    isSpeaking={isSpeaking}
                    isChatting={isChatting}
                    aiResponse={aiResponse}
                    userTranscript={userTranscript}
                    setUserTranscript={setUserTranscript}
                    setIsListening={setIsListening}
                    setIsChatting={setIsChatting}
                    sendToGemini={sendToGemini}
                />
            )}
        </div>
      </main>
    </div>
  );
}
