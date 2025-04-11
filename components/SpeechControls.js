'use client'; // This component uses client-side hooks and APIs

import React, { useEffect, useCallback } from 'react';
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
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Update parent state when transcript/listening changes
  useEffect(() => {
    setUserTranscript(transcript);
  }, [transcript, setUserTranscript]);

  useEffect(() => {
    setIsListening(listening);
  }, [listening, setIsListening]);

  // Pause listening while AI is speaking
  useEffect(() => {
    if (isSpeaking && listening) {
      SpeechRecognition.stopListening();
    } else if (!isSpeaking && isChatting && !listening) {
      // Resume listening when AI stops speaking
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: 'en-US'
      });
    }
  }, [isSpeaking, isChatting, listening]);

  // Process speech after a brief pause in speaking
  const processTranscript = useCallback(() => {
    if (transcript.trim()) {
      sendToGemini(transcript);
      resetTranscript();
    }
  }, [transcript, sendToGemini, resetTranscript]);

  // Set up continuous speech recognition with real-time processing
  useEffect(() => {
    let timeoutId;

    if (isChatting && transcript && !isSpeaking) {  // Only process when AI is not speaking
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set a new timeout to process after 1.5 seconds of silence
      timeoutId = setTimeout(() => {
        processTranscript();
      }, 1500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [transcript, isChatting, isSpeaking, processTranscript]);

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
    window.speechSynthesis.getVoices();
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: 'en-US'
    });
    setIsChatting(true);
  };

  const stopConversation = () => {
    SpeechRecognition.stopListening();
    setIsChatting(false);
    setIsListening(false);
    resetTranscript();
    setUserTranscript('');
  };

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
            onClick={stopConversation}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 text-sm font-semibold shadow-md"
          >
            Stop Conversation
          </button>

          <div className="mt-4 p-4 border rounded-lg bg-gray-50 min-h-[100px] text-left">
            <p className="font-semibold text-gray-600">You said:</p>
            <p className="text-gray-800">{userTranscript || (listening ? 'Listening...' : '...')}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg bg-blue-50 min-h-[100px] text-left">
            <p className="font-semibold text-blue-600">Tutor says:</p>
            <p className="text-gray-800">{aiResponse || '...'}</p>
          </div>

          {listening && !isSpeaking && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Listening...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">AI Speaking...</span>
            </div>
          )}

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