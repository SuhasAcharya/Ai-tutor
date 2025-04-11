'use client'; // Still needed for hooks and interactivity within this component

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900">
      {!isChatting ? (
        // Enhanced Start Learning overlay
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* Avatar preview */}
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto">
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  {/* Eyes */}
                  <div className="absolute flex space-x-6 top-10 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      className="w-3 h-3 bg-gray-800 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <motion.div
                      className="w-3 h-3 bg-gray-800 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>
                  {/* Smile */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-red-400 rounded-full" />
                </motion.div>
              </div>
            </div>

            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Learn Kannada with AI
              </h1>
              <p className="text-xl text-white/80">
                Your personal AI tutor is ready to help you master Kannada through interactive conversations
              </p>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-pink-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Voice Interaction</h3>
                <p className="text-white/70 text-sm">Practice speaking and listening with natural conversations</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-purple-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Smart Feedback</h3>
                <p className="text-white/70 text-sm">Get instant corrections and explanations as you learn</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-orange-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Cultural Context</h3>
                <p className="text-white/70 text-sm">Learn language with cultural insights and real-world usage</p>
              </div>
            </motion.div>

            {/* Start button */}
            <motion.button
              onClick={() => setIsChatting(true)}
              className="px-12 py-6 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-full shadow-lg text-xl relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Start Learning Kannada</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Top nav bar - Simplified */}
          <div className="bg-indigo-900/60 backdrop-blur-sm p-4 flex justify-between items-center border-b border-indigo-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="flex items-center gap-0.5  p-2 rounded-lg">
                <span className="text-4xl font-bold text-orange-400">ಕ</span>
                <span className="text-2xl font-bold text-pink-400 font-serif">A</span>
              </div>
              Namme Bhashe
            </h2>

            <div className="flex items-center gap-4">
              {/* Status indicators */}
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center space-x-1 bg-blue-600/50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Listening</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center space-x-1 bg-green-600/50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Speaking</span>
                  </div>
                )}
              </div>

              {/* Back to Home button */}
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  stopSpeaking();
                  handleStopConversation();
                  setIsChatting(false);
                  setShowDemo(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden md:inline">Back to Home</span>
              </motion.button>
            </div>
          </div>

          {/* Main content area with fixed height and scrollable */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden p-4">
              {/* Left side - Avatar with integrated listening indicator */}
              <div className="hidden md:flex md:w-1/3 items-center justify-center p-4">
                <div className="relative flex flex-col items-center">
                  {/* CSS Human Avatar */}
                  <div className="relative w-48 h-48 lg:w-64 lg:h-64">
                    {/* Avatar Container */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Head */}
                      <div className="relative">
                        <motion.div
                          className="w-32 h-32 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full shadow-lg"
                        >
                          {/* Eyes */}
                          <div className="absolute flex space-x-8 top-10 left-1/2 transform -translate-x-1/2">
                            <motion.div
                              className="w-4 h-4 bg-gray-800 rounded-full"
                              animate={isSpeaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                            />
                            <motion.div
                              className="w-4 h-4 bg-gray-800 rounded-full"
                              animate={isSpeaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                            />
                          </div>

                          {/* Mouth */}
                          <motion.div
                            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-red-400 rounded-full overflow-hidden"
                            animate={isSpeaking ? {
                              height: ["8px", "12px", "6px", "14px", "8px"],
                              width: ["24px", "20px", "22px", "26px", "24px"]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                          >
                            <div className="w-full h-1/2 bg-red-500"></div>
                          </motion.div>
                        </motion.div>

                        {/* Body */}
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-32 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-3xl z-[-1]">
                          {/* Shoulders */}
                          <div className="absolute flex justify-between w-full px-3 top-6">
                            <motion.div
                              className="w-10 h-10 bg-blue-500 rounded-full"
                              animate={{ rotate: isSpeaking ? [0, -2, 0, 2, 0] : 0 }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                            <motion.div
                              className="w-10 h-10 bg-blue-500 rounded-full"
                              animate={{ rotate: isSpeaking ? [0, 2, 0, -2, 0] : 0 }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Listening indicator below avatar */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex flex-col items-center space-y-2 bg-indigo-900/30 backdrop-blur-sm rounded-lg p-4"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-500/50 rounded-full">
                          <div className="relative">
                            <div className="absolute -inset-3">
                              <div className="w-16 h-16 rounded-full animate-ping bg-blue-500/20"></div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-white font-medium">Listening...</p>
                        <p className="text-white/70 text-sm">Speak in {targetLanguage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right side - Message area */}
              <div className="flex-1 overflow-y-auto">
                {/* Error message toast if exists */}
                <AnimatePresence>
                  {lastError && (
                    <motion.div
                      className="mb-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg"
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                    >
                      {lastError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message display area */}
                <div className="w-full max-w-xl mx-auto space-y-4">
                  {/* User transcript box - Remove listening overlay */}
                  <div className="bg-indigo-900/50 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-white font-medium">You said (Speak {targetLanguage})</h3>
                    </div>
                    <p className="text-white/90">
                      {displayedUserMessage || userTranscript || '...'}
                    </p>
                  </div>

                  {/* AI response box */}
                  <div className="bg-purple-900/50 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-medium">Tutor says:</h3>
                    </div>
                    <p className="text-white/90">{aiResponse || '...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed controls at bottom */}
            <div className="bg-indigo-900/80 backdrop-blur-sm border-t border-indigo-700 p-4">
              <div className="w-full max-w-2xl mx-auto">
                {/* Combined input and controls row */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  {/* Voice control button with tooltip */}
                  <div className="relative group">
                    {!isListening ? (
                      <motion.button
                        type="button"
                        onClick={startListening}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSpeaking}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={stopListening}
                        className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSpeaking}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-1 bg-white/20 animate-[listening_1.5s_ease-in-out_infinite]"></div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </motion.button>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {isSpeaking ? "AI is speaking..." : isListening ? "Click to stop listening" : "Click to start speaking"}
                    </div>
                  </div>

                  {/* Text input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`Type your message in ${nativeLanguage} or ${targetLanguage}...`}
                      className="w-full p-3 md:p-4 rounded-lg bg-indigo-800/50 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      value={message}
                      onChange={handleMessageChange}
                      disabled={isSpeaking || isListening}
                    />
                  </div>

                  {/* Send button */}
                  <motion.button
                    type="submit"
                    className="flex-shrink-0 p-3 md:p-4 md:px-6 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg text-white disabled:opacity-50 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!message.trim() || isSpeaking || isListening}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>

                  {/* Stop AI button */}
                  {isSpeaking && (
                    <motion.button
                      type="button"
                      onClick={handleStopSpeaking}
                      className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/50 hover:bg-red-500/70 text-white rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 