'use client'; // Still needed for hooks and interactivity within this component

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import StartLearningOverlay from './StartLearningOverlay';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import TutorAvatar from './TutorAvatar';

export default function TutorCanvas({
  isSpeaking,
  isListening,
  userTranscript,
  aiResponse,
  handleStopConversation,
  isChatting,
  setIsChatting,
  lastError,
  onMessageSubmit,
  setUserTranscript,
  setIsListening,
  targetLanguage,
  nativeLanguage,
  kannadaVoiceFound,
  setShowDemo
}) {
  const [message, setMessage] = useState('');
  const [displayedUserMessage, setDisplayedUserMessage] = useState('');
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Add a ref to track the current speech synthesis utterance
  const speechUtteranceRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  // Add language code mapping
  const getLanguageCode = (languageName) => {
    const languageMap = {
      'Kannada': 'kn-IN',
      'English': 'en-US',
      // Add more mappings as needed
    };
    return languageMap[languageName] || 'en-US'; // Default to English
  };

  const languageCode = getLanguageCode(targetLanguage);

  // Add this configuration object
  const commands = [
    {
      command: '*',
      callback: (command) => {
        console.log('Recognized:', command);
      }
    }
  ];

  // Update the speech recognition hook with commands
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({ commands });

  // Add effect to update parent state when transcript changes
  useEffect(() => {
    if (transcript) {
      console.log("Setting user transcript:", transcript);
      setUserTranscript(transcript);
    }
  }, [transcript, setUserTranscript]);

  // Add effect to update parent state when listening changes
  useEffect(() => {
    console.log("Setting isListening:", listening);
    setIsListening(listening);
  }, [listening, setIsListening]);

  // Process speech after a brief pause
  useEffect(() => {
    let timeoutId;
    if (transcript && !isSpeaking) {
      timeoutId = setTimeout(() => {
        if (transcript.trim()) {
          console.log("Processing transcript:", transcript);
          onMessageSubmit(transcript);
          resetTranscript();
        }
      }, 1500); // 1.5 second pause
    }
    return () => clearTimeout(timeoutId);
  }, [transcript, isSpeaking, onMessageSubmit, resetTranscript]);

  // Update the speech handling effects
  useEffect(() => {
    // Stop listening when AI starts speaking
    if (isSpeaking && listening) {
      console.log("AI speaking, stopping listening");
      SpeechRecognition.stopListening();
    }
    // Resume listening when AI stops speaking (if we were listening before)
    else if (!isSpeaking && isChatting && !listening) {
      console.log("AI stopped speaking, resuming listening");
      startListening();
    }
  }, [isSpeaking, isChatting]);

  // Update the startListening function
  const startListening = async () => {
    try {
      if (!browserSupportsSpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
      }

      if (!isMicrophoneAvailable) {
        alert("Please enable microphone access to use speech recognition.");
        return;
      }

      // Don't start listening if AI is speaking
      if (isSpeaking) {
        console.log("Cannot start listening while AI is speaking");
        return;
      }

      console.log("Starting speech recognition...");
      resetTranscript();
      setUserTranscript('');
      setIsChatting(true);

      await SpeechRecognition.startListening({
        continuous: true,
        language: languageCode,
        interimResults: true
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      alert("Error starting speech recognition. Please try again.");
    }
  };

  // Add a stop listening function
  const stopListening = async () => {
    try {
      await SpeechRecognition.stopListening();
      if (transcript.trim()) {
        onMessageSubmit(transcript);
      }
      resetTranscript();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  // Handle message input changes
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setDisplayedUserMessage(e.target.value);

    if (listening) {
      console.log("User typing, stopping listening.");
      SpeechRecognition.stopListening();
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      resetTranscript();
      setUserTranscript(''); // Clear transcript state if user types over it
    }
  };

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setUserTranscript(message.trim());
      if (typeof onMessageSubmit === 'function') {
        onMessageSubmit(message);
      }
      setMessage('');
      setDisplayedUserMessage('');
    }
  };

  // Update chat messages when responses change
  useEffect(() => {
    if (userTranscript && userTranscript !== '...') {
      console.log('Adding user message:', userTranscript);
      const userMessage = {
        type: 'user',
        text: userTranscript,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => {
        // Check if this exact message is already the last message
        if (prev.length > 0 &&
          prev[prev.length - 1].type === 'user' &&
          prev[prev.length - 1].text === userTranscript) {
          return prev;
        }
        return [...prev, userMessage];
      });
    }
  }, [userTranscript]);

  useEffect(() => {
    if (aiResponse && aiResponse !== '...') {
      console.log('Adding AI message:', aiResponse);
      const aiMessage = {
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => {
        // Check if this exact message is already the last message
        if (prev.length > 0 &&
          prev[prev.length - 1].type === 'ai' &&
          prev[prev.length - 1].text === aiResponse) {
          return prev;
        }
        return [...prev, aiMessage];
      });
    }
  }, [aiResponse]);

  useEffect(() => {
    console.log("TutorCanvas - userTranscript updated:", userTranscript);
  }, [userTranscript]);

  useEffect(() => {
    console.log("TutorCanvas - aiResponse updated:", aiResponse);
  }, [aiResponse]);

  // Add a function to handle stopping speech synthesis
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current = null;
    }
  };

  // Update the handleStopConversation function
  const handleStopSpeaking = () => {
    try {
      stopSpeaking();
      handleStopConversation();
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    // Force container to screen height and prevent *its* scrollbar
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {!isChatting ? (
        <StartLearningOverlay onStartLearning={() => setIsChatting(true)} />
      ) : (
        // Use fragment or div, doesn't need flex properties itself if children handle layout
        <>
          {/* Header (Fixed Height, flex-shrink-0 is in ChatHeader component) */}
          <ChatHeader
            isListening={isListening}
            isSpeaking={isSpeaking}
            handleStopConversation={handleStopConversation}
            setIsChatting={setIsChatting}
            setShowDemo={setShowDemo}
          />

          {/* Central Content Area */}
          {/* flex-1: Takes space between header/footer */}
          {/* overflow-hidden: Prevents this container itself from overflowing */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Avatar (flex-shrink-0 is in TutorAvatar component) */}
            <TutorAvatar
              isSpeaking={isSpeaking}
              isListening={isListening}
              targetLanguage={targetLanguage}
            />

            {/* Message List Container (Scrollable Area) */}
            {/* flex-1: Takes remaining space within the central area (vertical on mobile, horizontal on desktop) */}
            {/* overflow-y-auto: Enables vertical scrolling ONLY for this div */}
            {/* relative: Needed if MessageList uses sticky elements (like the error toast) */}
            <div className="flex-1 overflow-y-auto relative">
              <MessageList
                lastError={lastError}
                userTranscript={userTranscript}
                aiResponse={aiResponse}
                targetLanguage={targetLanguage}
                displayedUserMessage={displayedUserMessage}
              />
            </div>
          </div>

          {/* Controls (Fixed Height, flex-shrink-0 is in ChatControls component) */}
          <ChatControls
            isSpeaking={isSpeaking}
            isListening={isListening}
            message={message}
            handleMessageChange={handleMessageChange}
            handleSubmit={handleSubmit}
            startListening={startListening}
            stopListening={stopListening}
            handleStopSpeaking={handleStopSpeaking} // Pass the specific handler
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
          />
        </>
      )}
    </div>
  );
}