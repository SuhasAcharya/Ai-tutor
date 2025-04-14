'use client'; // Still needed for hooks and interactivity within this component

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Toaster, toast } from 'react-hot-toast';
import StartLearningOverlay from './StartLearningOverlay';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatControls from './ChatControls';
import TutorAvatar from './TutorAvatar';

// Helper function to detect iOS (can be placed outside or in a utils file)
const isIOS = () => {
  // Check for iPad, iPhone, or iPod and ensure it's not Windows Phone (which also includes "iPhone" in UA string sometimes)
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

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
    browserSupportsSpeechRecognition
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
    if (isSpeaking && listening) {
      console.log("AI speaking, stopping listening");
      SpeechRecognition.stopListening();
    }
    // --- Modification: Avoid auto-restarting listening on iOS ---
    // --- because continuous mode is unreliable/disabled      ---
    else if (!isSpeaking && isChatting && !listening && !isIOS()) {
      console.log("AI stopped speaking, resuming listening (non-iOS)");
      // Consider if auto-restart is desired even on non-iOS if continuous is off
      // startListening(); // Re-enable if you want auto-restart on non-iOS
    }
  }, [isSpeaking, isChatting, listening]); // Added listening dependency

  // Update the startListening function
  const startListening = async () => {
    try {
      if (!browserSupportsSpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser. Please use the text input.");
        return;
      }

      // --- Modification: Specific check for Kannada on iOS ---
      if (languageCode === 'kn-IN' && isIOS()) {
        toast(
          (t) => (
            <div className="text-center">
              <p className="text-xl mb-1">
                Aiyyo 🥲!
              </p>
              <p className="text-sm">
                Kannada voice input isn't quite ready for iOS browsers yet.
              </p>
              <p className="text-sm mt-1">
                Suhas is working on it! Please use the text input for now. 🙏
              </p>
            </div>
          ),
          {
            duration: 6000,
            style: {
              maxWidth: '400px',
            },
          }
        );
        return;
      }

      // --- Modification: Check microphone permission state ---
      let permissionState = 'prompt';
      try {
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        permissionState = micPermission.state;
        micPermission.onchange = () => {
          console.log(`Microphone permission state changed to: ${micPermission.state}`);
          // You might want to update UI based on this change
        };
      } catch (permError) {
        console.warn("Permissions API not fully supported or error querying microphone state:", permError);
      }

      if (permissionState === 'denied') {
        toast.error("Microphone access was denied. Please enable it in your browser/system settings and refresh the page.");
        return;
      }

      // Attempt to get user media to trigger prompt if state is 'prompt'
      // This is often needed on first use or if permissions API is limited
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted or already available.");
        // Close the stream immediately if only needed for permission check
        // stream.getTracks().forEach(track => track.stop()); // Uncomment if needed
      } catch (getUserMediaError) {
        if (getUserMediaError.name === 'NotAllowedError' || getUserMediaError.name === 'PermissionDeniedError') {
          toast.error("Microphone access was not allowed. Please grant permission when prompted.");
        } else {
          console.error("Error accessing microphone:", getUserMediaError);
          toast.error("Could not access the microphone. Please ensure it's connected and not in use.");
        }
        return; // Stop if we can't get microphone access
      }

      if (isSpeaking) {
        toast("Hold on! Let the tutor finish speaking first. 😊", { icon: '🤫' });
        return;
      }

      console.log("Starting speech recognition...");
      resetTranscript();
      setUserTranscript('');

      // --- Modification: Adjust options for iOS ---
      const options = {
        language: languageCode,
        continuous: !isIOS(), // Disable continuous mode on iOS
        interimResults: false // Disable interim results for stability
      };
      console.log("Using options:", options);

      // Start listening
      await SpeechRecognition.startListening(options);

    } catch (error) {
      console.error("Error in startListening function:", error);
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError' || error.name === 'PermissionDeniedError') {
        toast.error("Looks like microphone access wasn't granted. Please check permissions!");
      } else if (error.name === 'NoSpeechRecognizedError') {
        toast.error("Hmm, didn't catch that. Could you try speaking again?");
      } else if (error.name === 'network') {
        toast.error("Network hiccup! Please check your connection and try again.");
      } else if (error.name === 'language-not-supported') {
        toast.error(`Sorry, your browser doesn't support voice input for ${languageCode} yet.`);
      }
      else {
        toast.error("Something went wrong with voice input. Try again or use text?");
      }
    }
  };

  // Add a stop listening function
  const stopListening = async () => {
    try {
      await SpeechRecognition.stopListening();
      console.log("Stopped listening.");
      // Process final transcript if needed (your timeout effect might handle this)
      // if (transcript.trim()) {
      //   onMessageSubmit(transcript);
      // }
      // resetTranscript(); // Resetting here might clear transcript before timeout processes it
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
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#374151',
            color: '#fff',
            padding: '12px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            duration: 5000,
          },
        }}
      />

      {!isChatting ? (
        <StartLearningOverlay onStartLearning={() => {
          setIsChatting(true);
          // Optional: Try to start listening immediately after overlay if not iOS/Kannada
          // if (!(languageCode === 'kn-IN' && isIOS())) {
          //    setTimeout(startListening, 100); // Delay slightly
          // }
        }} />
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