'use client'; // This component uses client-side hooks and APIs

import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SpeechControls({
  isSpeaking,
  isChatting,
  aiResponse,
  userTranscript, // Receive state from parent
  setUserTranscript, // Receive setter from parent
  setIsListening, // Receive setter from parent
  setIsChatting, // Receive setter from parent
  sendToGemini, // Receive handler from parent
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Effect to update parent state when transcript/listening changes
  useEffect(() => {
    setUserTranscript(transcript);
  }, [transcript, setUserTranscript]);

  useEffect(() => {
    setIsListening(listening);
  }, [listening, setIsListening]);

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
    setUserTranscript(''); // Clear transcript in parent state via setter
    // setAiResponse(''); // Let parent handle clearing AI response if needed
    window.speechSynthesis.getVoices(); // Ensure voices are loaded
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: 'en-US'
    });
    setIsChatting(true); // Update parent state
  };

  const stopListeningAndProcessHandler = async () => {
    SpeechRecognition.stopListening();
    // Use the transcript directly from the hook here, as it's the most up-to-date
    if (transcript.trim()) {
      await sendToGemini(transcript); // Call parent's handler
    } else {
      setIsChatting(false); // Update parent state
    }
    resetTranscript(); // Reset local transcript
    // setUserTranscript(''); // Parent state already cleared on startListening
  };

  // Render the controls UI
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white bg-opacity-80 rounded-lg shadow-lg">
      {!isChatting ? (
        <button
          onClick={startListeningHandler}
          disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
          className={`px-8 py-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 text-lg font-semibold shadow-md ${(!browserSupportsSpeechRecognition || !isMicrophoneAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Start Conversation
        </button>
      ) : (
        <div className="w-full text-center">
          <button
            onClick={listening ? stopListeningAndProcessHandler : startListeningHandler}
            disabled={isSpeaking || !browserSupportsSpeechRecognition || !isMicrophoneAvailable}
            className={`px-6 py-3 rounded-full text-white font-semibold transition duration-300 shadow-md ${
              listening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-green-500 hover:bg-green-600'
            } ${(isSpeaking || !browserSupportsSpeechRecognition || !isMicrophoneAvailable) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {listening ? 'Stop Listening' : 'Start Listening'}
          </button>

          <div className="mt-4 p-4 border rounded-lg bg-gray-50 min-h-[100px] text-left">
            <p className="font-semibold text-gray-600">You said:</p>
            {/* Display transcript state from parent */}
            <p className="text-gray-800">{userTranscript || (listening ? 'Listening...' : '...')}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg bg-blue-50 min-h-[100px] text-left">
            <p className="font-semibold text-blue-600">Tutor says:</p>
            <p className="text-gray-800">{aiResponse || '...'}</p>
          </div>

          {!browserSupportsSpeechRecognition && (
            <p className="text-red-500 mt-4">Speech recognition not supported in this browser.</p>
          )}
          {!isMicrophoneAvailable && isChatting && (
            <p className="text-red-500 mt-4">Microphone access denied or unavailable.</p>
          )}
        </div>
      )}
    </div>
  );
} 