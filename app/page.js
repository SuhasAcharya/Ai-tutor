'use client'; // Required for hooks and event handlers

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { v4 as uuidv4 } from 'uuid'; // For session ID

// --- Define Languages Here ---
const TARGET_LANGUAGE = "Kannada";
const NATIVE_LANGUAGE = "English";
// --- End Language Definition ---

// --- Restore TutorCanvasLoading ---
const TutorCanvasLoading = () => <div className="w-full h-64 md:h-full flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading 3D Viewer...</p></div>;
const SpeechControlsLoading = () => <div className="w-full h-full flex items-center justify-center p-4 bg-white bg-opacity-80 rounded-lg shadow-lg"><p className="text-gray-500">Loading controls...</p></div>;

// --- Restore TutorCanvas dynamic import ---
const TutorCanvas = dynamic(() => import('../components/TutorCanvas'), {
  ssr: false,
  loading: TutorCanvasLoading
});

// --- Keep SpeechControls dynamic import ---
const SpeechControls = dynamic(() => import('../components/SpeechControls'), {
  ssr: false,
  loading: SpeechControlsLoading
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
  const [kannadaVoiceFound, setKannadaVoiceFound] = useState(null); // null: unchecked, true: found, false: not found
  const [lastError, setLastError] = useState(''); // Store last error message
  const utteranceRef = useRef(null); // Ref for the current speech synthesis utterance

  // --- Effect to set isClient to true after mounting ---
  useEffect(() => {
    setIsClient(true);
    setSessionId(uuidv4()); // Generate sessionId on client mount
    // Pre-load voices on client mount after a small delay
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Pre-load voices by calling getVoices(). The actual list might populate asynchronously.
        window.speechSynthesis.getVoices();
        // Add an event listener for when voices change (important for some browsers)
        window.speechSynthesis.onvoiceschanged = () => {
          console.log("Voices loaded/changed.");
          // You could potentially re-check for Kannada voice here if needed
        };
      }
    }, 500); // Adjust delay if needed
    return () => clearTimeout(timer); // Cleanup timer
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Speech Synthesis Handling ---
  const speak = (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
        console.log("Interrupting previous speech.");
        window.speechSynthesis.cancel();
    }

    // --- Filtering step (removes emojis) ---
    const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}])/gu;
    const speakableText = text.replace(emojiRegex, '').replace(/ +/g, ' ').trim();
    console.log("Original text:", text);
    console.log("Speakable text:", speakableText);
    // --- End filtering ---

    const utterance = new SpeechSynthesisUtterance(speakableText);
    utterance.lang = 'kn-IN'; // Still prefer Kannada voice if available

    // --- Find Voice (remains the same) ---
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        console.warn("Speech synthesis voices list is empty...");
        setKannadaVoiceFound(false);
    } else {
        const kannadaVoice = voices.find(voice => voice.lang === 'kn-IN');
        if (kannadaVoice) {
          utterance.voice = kannadaVoice;
          console.log("Using Kannada voice:", kannadaVoice.name);
          if (kannadaVoiceFound !== true) setKannadaVoiceFound(true);
        } else {
          console.warn("No Kannada ('kn-IN') voice found...");
          if (kannadaVoiceFound !== false) setKannadaVoiceFound(false);
          if (!lastError.includes("No Kannada voice")) {
              setLastError("Warning: No Kannada voice available in your browser for speech output.");
          }
          // If no Kannada voice, the browser might use a default (likely English)
          // We still set the lang attribute above, but voice selection might fail.
        }
    }
    // --- End Voice Selection ---

    // --- Adjust Speech Rate ---
    utterance.pitch = 1;
    utterance.rate = 0.8; // Lower value = slower speech (Default is 1)
    utterance.volume = 1;
    // --- End Rate Adjustment ---

    // --- Event Handlers (remain the same) ---
    utterance.onstart = () => {
      console.log("Speech started");
      setIsSpeaking(true);
      if (!lastError.includes("No Kannada voice")) {
          setLastError('');
      }
    };

    utterance.onend = () => {
      console.log("Speech finished");
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      setLastError(`Speech synthesis error: ${event.error}`);
    };
    // --- End Event Handlers ---

    utteranceRef.current = utterance;
    if (speakableText) {
        window.speechSynthesis.speak(utterance);
    } else {
        console.log("Skipping speech: only emojis were present.");
        setIsSpeaking(false);
    }
  };

  // --- Gemini API Interaction ---
  const sendToGemini = async (message) => {
    if (!sessionId) {
      console.error("Session ID not set.");
      setLastError("Error: Cannot start chat without a session ID.");
      return;
    }
    if (!message) return;

    console.log("Sending to Gemini:", message);
    setAiResponse('...'); // Indicate loading
    setLastError(''); // Clear previous errors

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        let errorData = { error: `HTTP error! status: ${response.status}` };
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            const errorText = await response.text();
            console.error("Non-JSON error response from API:", errorText);
            // Try to parse if it's stringified JSON
             try {
                const parsedText = JSON.parse(errorText);
                if (parsedText && parsedText.error) {
                    errorData.error = parsedText.error;
                } else {
                     errorData.error = errorText || errorData.error;
                }
             } catch (e) {
                 errorData.error = errorText || errorData.error;
             }
          }
        } catch (parseError) {
          console.error("Failed to parse or read error response body:", parseError);
        }
        // Prepend "Error: " if not already present for consistency
        const errorMessage = (errorData.error && !String(errorData.error).toLowerCase().startsWith('error:'))
            ? `Error: ${errorData.error}`
            : errorData.error || `Error: HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received from Gemini:", data.response); // Will include emojis
      setAiResponse(data.response); // Set state with emojis for UI display
      speak(data.response); // Call speak, which now filters emojis internally before TTS

    } catch (error) {
      console.error("Failed to send message to Gemini:", error);
      // Ensure error message starts with "Error: "
      const displayError = (error.message && !error.message.toLowerCase().startsWith('error:'))
        ? `Error: ${error.message}`
        : error.message || "Error: An unknown error occurred.";
      setAiResponse(''); // Clear loading dots
      setLastError(displayError); // Display the error
      // Optionally stop chat on error
      // setIsChatting(false);
    }
  };

  // --- Handler for stopping the conversation ---
  const handleStopConversation = () => {
    console.log("Stopping conversation...");

    // Immediately stop any ongoing speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop speech recognition (though state change should handle this too)
    // We might need to import SpeechRecognition here if we want direct control,
    // but relying on the state change in SpeechControls is usually sufficient.
    // SpeechRecognition.stopListening(); // Optional direct call

    // Reset states
    setIsSpeaking(false); // Explicitly set speaking to false
    setIsChatting(false);
    setIsListening(false); // Ensure listening state is also reset
    setAiResponse('');    // Clear AI response
    setUserTranscript(''); // Clear user transcript
    setLastError(''); // Clear errors on stop

    // Note: resetTranscript() from useSpeechRecognition hook needs to be called
    // within SpeechControls where the hook is used.
  };

  // --- UI Rendering ---
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <header className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-700">{TARGET_LANGUAGE} Language Tutor</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 gap-4 overflow-hidden">
        {/* 3D Canvas Area */}
        <div className="w-full md:w-1/2 h-64 md:h-full">
          {!isClient ? <TutorCanvasLoading /> : <TutorCanvas isSpeaking={isSpeaking} />}
        </div>

        {/* Controls Area */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center">
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
              stopConversationHandler={handleStopConversation}
              lastError={lastError}
              kannadaVoiceFound={kannadaVoiceFound}
              TARGET_LANGUAGE={TARGET_LANGUAGE}
              NATIVE_LANGUAGE={NATIVE_LANGUAGE}
            />
          )}
        </div>
      </main>
    </div>
  );
}
