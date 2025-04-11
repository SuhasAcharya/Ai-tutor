'use client'; // This component uses client-side hooks and APIs

import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SpeechControls({
  isSpeaking,  // Whether the AI is currently speaking
  isChatting,
  aiResponse,
  userTranscript, // Receive state from parent
  setUserTranscript, // Receive setter from parent
  setIsListening, // Receive setter from parent
  setIsChatting, // Receive setter from parent
  sendToGemini, // Receive handler from parent
  stopConversationHandler, // <-- Accept the handler from parent
  lastError, // Receive error state
  kannadaVoiceFound, // Receive voice status
  NATIVE_LANGUAGE, // Receive native language
  TARGET_LANGUAGE // Receive target language
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const [textInput, setTextInput] = useState(''); // State for text input
  const pauseTimeoutRef = useRef(null); // Ref to manage the pause timeout

  // Update parent state when transcript/listening changes
  useEffect(() => {
    setUserTranscript(transcript);
  }, [transcript, setUserTranscript]);

  useEffect(() => {
    setIsListening(listening);
  }, [listening, setIsListening]);

  // Pause listening while AI is speaking or user is typing
  useEffect(() => {
    if ((isSpeaking || textInput) && listening) { // Also pause if user starts typing
      console.log("AI Speaking or user typing, stopping recognition temporarily.");
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      SpeechRecognition.stopListening();
    } else if (!isSpeaking && !textInput && isChatting && !listening) { // Resume only if not typing
      console.log("AI stopped/User cleared input, resuming recognition for Kannada.");
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'kn-IN' });
    }
  }, [isSpeaking, isChatting, listening, resetTranscript, textInput]); // Added textInput dependency

  // Process speech after a brief pause in speaking
  const processTranscriptAfterPause = useCallback(() => {
    const finalTranscript = transcript.trim();
    if (finalTranscript) {
      console.log("User paused (Kannada), stopping recognition and processing transcript:", finalTranscript);
      SpeechRecognition.stopListening();
      sendToGemini(finalTranscript);
      resetTranscript();
    } else {
      console.log("User paused (Kannada), but transcript is empty. Stopping listening.");
      if (listening) {
          SpeechRecognition.stopListening();
      }
    }
  }, [transcript, sendToGemini, resetTranscript, listening]);

  // Set up continuous speech recognition with real-time processing
  useEffect(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    if (listening && transcript && !isSpeaking) {
      pauseTimeoutRef.current = setTimeout(() => {
        console.log("Pause detected (Kannada).");
        processTranscriptAfterPause();
      }, 1500);
    }

    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [listening, transcript, isSpeaking, processTranscriptAfterPause]);

  const startListeningHandler = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition not supported or not ready.");
      return;
    }
    if (!isMicrophoneAvailable) {
      alert("Microphone is not available or permission denied.");
      return;
    }

    resetTranscript();
    setUserTranscript('');
    setTextInput(''); // Clear text input when starting speech
    setIsChatting(true);

    console.log("Starting initial recognition for Kannada.");
    SpeechRecognition.startListening({
      continuous: true,
      language: 'kn-IN'
    });
  };

  const handleStopClick = () => {
    console.log("User clicked Stop Conversation.");
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (listening) SpeechRecognition.stopListening(); // Ensure listening stops
    stopConversationHandler(); // Call parent handler (clears errors etc.)
    resetTranscript();
    setTextInput(''); // Clear text input on stop
  };

  // Handler for sending text input
  const handleSendText = () => {
    if (!textInput.trim()) return;
    console.log("Sending text input:", textInput);
    sendToGemini(textInput);
    setTextInput(''); // Clear input after sending
    // Ensure recognition is stopped if user was typing
    if (listening) {
        SpeechRecognition.stopListening();
    }
  };

  // Handle Enter key in text input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendText();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-white bg-opacity-80 rounded-lg shadow-lg overflow-y-auto"> {/* Allow vertical scroll */}
      {!isChatting ? (
        // Start Button Area
        <div className="flex flex-col items-center justify-center h-full">
            <button
              onClick={startListeningHandler}
              disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
              className={`px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 text-lg font-semibold shadow-md ${(!browserSupportsSpeechRecognition || !isMicrophoneAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Start Kannada Lesson
            </button>
             {!browserSupportsSpeechRecognition && (
                <p className="text-red-500 mt-4 text-sm">Speech recognition not supported in this browser.</p>
             )}
             {!isMicrophoneAvailable && ( // Show mic issue even before starting
                <p className="text-red-500 mt-4 text-sm">Microphone access denied or unavailable. Please check browser permissions.</p>
             )}
        </div>
      ) : (
        // Chatting Area
        <div className="w-full flex flex-col h-full">
          {/* Stop Button */}
          <div className="flex-shrink-0 mb-2 text-center">
             <button
                onClick={handleStopClick}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 text-sm font-semibold shadow-md"
             >
                Stop Lesson
             </button>
          </div>

          {/* Error Display */}
          {lastError && (
            <div className="flex-shrink-0 my-2 p-2 border border-red-300 bg-red-50 rounded-lg text-red-700 text-sm text-left">
              {lastError}
            </div>
          )}

          {/* Transcript Box - Enhanced Guidance */}
          <div className="flex-shrink-0 mt-2 p-3 border rounded-lg bg-gray-50 min-h-[80px] text-left relative group"> {/* Added relative group for tooltip */}
            <p className="font-semibold text-gray-600 text-sm flex items-center">
              You said (Speak {TARGET_LANGUAGE})
              {/* Simple Tooltip/Info Icon */}
              <span className="ml-2 text-gray-400 cursor-help" title={`Microphone is listening for ${TARGET_LANGUAGE}. English speech may be misunderstood.`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </p>
            <p className="text-gray-800">{userTranscript || (listening ? `Listening for ${TARGET_LANGUAGE}...` : '...')}</p>
             {/* Optional: Add a more visible note if needed */}
             {/* <p className="text-xs text-gray-500 mt-1">Tip: Use the text box below for clear English.</p> */}
          </div>

          {/* AI Response Box */}
          <div className="flex-shrink-0 mt-2 p-3 border rounded-lg bg-blue-50 min-h-[80px] text-left">
            <p className="font-semibold text-blue-600 text-sm">Tutor says:</p>
            <p className="text-gray-800">{aiResponse || '...'}</p>
             {/* Indicate if Kannada voice is missing */}
             {kannadaVoiceFound === false && !isSpeaking && aiResponse && (
                 <p className="text-xs text-orange-600 mt-1">(Kannada voice output not available in your browser)</p>
             )}
          </div>

          {/* Status Indicators */}
          <div className="flex-shrink-0 mt-2 h-6 flex items-center justify-center space-x-4">
              {listening && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600">Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600">AI Speaking...</span>
                </div>
              )}
          </div>

           {/* Text Input Fallback - Enhanced Placeholder */}
           <div className="flex-shrink-0 mt-auto pt-2 flex gap-2">
                <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    // Make placeholder very clear about best use
                    placeholder={`Speak ${TARGET_LANGUAGE}, or type clear ${NATIVE_LANGUAGE} here...`}
                    className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={listening || isSpeaking}
                />
                <button
                    onClick={handleSendText}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    disabled={!textInput.trim() || listening || isSpeaking}
                >
                    Send
                </button>
           </div>

        </div>
      )}
    </div>
  );
} 