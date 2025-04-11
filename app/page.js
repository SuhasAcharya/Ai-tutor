'use client'; // Required for hooks and event handlers

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { v4 as uuidv4 } from 'uuid'; // For session ID
import CssAvatar from '../components/CssAvatar'; // Import the new CSS Avatar component
import { motion } from 'framer-motion';
import Link from 'next/link';
import TutorCanvas from '../components/TutorCanvas';

// --- Define Languages Here ---
const TARGET_LANGUAGE = "Kannada";
const NATIVE_LANGUAGE = "English";
// --- End Language Definition ---

// --- Remove TutorCanvasLoading and dynamic import ---
// const TutorCanvasLoading = () => <div className="w-full h-64 md:h-full flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading 3D Viewer...</p></div>;
const SpeechControlsLoading = () => <div className="w-full h-full flex items-center justify-center p-4 bg-white bg-opacity-80 rounded-lg shadow-lg"><p className="text-gray-500">Loading controls...</p></div>;

// const TutorCanvas = dynamic(() => import('../components/TutorCanvas'), {
//   ssr: false,
//   loading: TutorCanvasLoading
// });

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
  const [showDemo, setShowDemo] = useState(false);
  const speechSynthesisRef = useRef(null);

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
          // Re-check for Kannada voice here if needed, or let speak() handle it
          const voices = window.speechSynthesis.getVoices();
          const found = voices.some(voice => voice.lang === 'kn-IN');
          setKannadaVoiceFound(found);
          if (!found) {
             console.warn("No Kannada ('kn-IN') voice found during preload check.");
             // Optionally set error here, but speak() also handles it
             // setLastError("Warning: No Kannada voice available in your browser for speech output.");
          } else {
             console.log("Kannada voice found during preload check.");
          }
        };
      }
    }, 500); // Adjust delay if needed
    return () => clearTimeout(timer); // Cleanup timer
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Restore Original Speech Synthesis Handling (using window.speechSynthesis) ---
  const speak = (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
        setIsSpeaking(false); // Ensure speaking is false if we can't speak
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        // Add a tiny delay before starting new speech after cancelling
        // This helps ensure the state update registers visually
        setTimeout(() => startSpeech(text), 50);
        return;
    }
    startSpeech(text);
  };

  const startSpeech = (text) => {
    const emojiRegex = /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}])/gu;
    const speakableText = text.replace(emojiRegex, '').replace(/ +/g, ' ').trim();

    if (!speakableText) {
      console.log("Skipping speech: only emojis or empty text.");
      setIsSpeaking(false); // Ensure speaking is false if nothing to say
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speakableText);
    utterance.lang = 'kn-IN';
    const voices = window.speechSynthesis.getVoices();
    const kannadaVoice = voices.find(voice => voice.lang === 'kn-IN');

    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
      if (kannadaVoiceFound !== true) setKannadaVoiceFound(true);
    } else {
      if (kannadaVoiceFound !== false) setKannadaVoiceFound(false);
      if (!lastError.includes("No Kannada voice")) {
          setLastError("Warning: No Kannada voice available in your browser for speech output.");
      }
    }

    utterance.pitch = 1;
    utterance.rate = 0.65;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log("Browser TTS started");
      setIsSpeaking(true); // Set speaking true HERE
      if (!lastError.includes("No Kannada voice")) {
          setLastError('');
      }
    };

    utterance.onend = () => {
      console.log("Browser TTS finished");
      setIsSpeaking(false); // Set speaking false HERE
    };

    utterance.onerror = (event) => {
      console.error("Browser speech synthesis error:", event.error);
      setIsSpeaking(false); // Set speaking false on error
      setLastError(`Speech synthesis error: ${event.error}`);
    };

    utteranceRef.current = utterance;
    // setIsSpeaking(true); // Set speaking true BEFORE calling speak
    window.speechSynthesis.speak(utterance);
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

      // Clean up any existing speech synthesis
      cleanupSpeech();

      // Create and store the utterance
      const utterance = new SpeechSynthesisUtterance(data.response);
      utterance.lang = 'kn-IN';
      utterance.onend = () => {
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        speechSynthesisRef.current = null;
      };

      // Store the utterance reference
      speechSynthesisRef.current = utterance;
      
      // Start speaking
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);

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
    cleanupSpeech();
    setIsSpeaking(false);
    setIsListening(false);
    setUserTranscript('');
    setAiResponse('');
  };

  // Add a function to handle speech synthesis cleanup
  const cleanupSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current = null;
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      cleanupSpeech();
    };
  }, []);

  // --- UI Rendering ---
  return (
    <main className="min-h-screen">
      {!showDemo ? (
        <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 min-h-screen">
          <div className="container mx-auto px-4 py-20">
            <motion.nav 
              className="flex justify-between items-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-2xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
              >
                AI Tutor
              </motion.div>
              <div className="flex gap-6">
                <motion.a 
                  href="#features" 
                  className="text-white hover:text-pink-200 transition"
                  whileHover={{ scale: 1.05 }}
                >
                  Features
                </motion.a>
                <motion.a 
                  href="#pricing" 
                  className="text-white hover:text-pink-200 transition"
                  whileHover={{ scale: 1.05 }}
                >
                  Pricing
                </motion.a>
                <motion.a 
                  href="#about" 
                  className="text-white hover:text-pink-200 transition"
                  whileHover={{ scale: 1.05 }}
                >
                  About
                </motion.a>
              </div>
            </motion.nav>

            <div className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Learn Faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">AI-Powered</span> Tutoring
                </h1>
                <p className="text-xl text-indigo-100 mb-8">
                  Get personalized guidance, instant feedback, and interactive learning experiences tailored to your unique needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-full shadow-lg text-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDemo(true)}
                  >
                    Try For Free
                  </motion.button>
                  <motion.button
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full text-lg"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-900/80 to-purple-800/80 backdrop-blur-sm p-4">
                  <img 
                    src="/demo-screenshot.png" 
                    alt="AI Tutor Interface Preview" 
                    className="rounded-lg w-full h-auto"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x400/4c1d95/ffffff?text=AI+Tutor+Interface";
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="mt-32 text-center"
              id="features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-16">Why Choose Our AI Tutor?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-xl"
                  whileHover={{ y: -10, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                >
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Personalized Learning</h3>
                  <p className="text-indigo-100">Adaptive learning path that adjusts to your knowledge level and learning style.</p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-xl"
                  whileHover={{ y: -10, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Learn At Your Pace</h3>
                  <p className="text-indigo-100">No time constraints. Practice and learn whenever it's convenient for you.</p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm p-8 rounded-xl"
                  whileHover={{ y: -10, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                >
                  <div className="bg-gradient-to-br from-orange-500 to-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Instant Feedback</h3>
                  <p className="text-indigo-100">Get immediate responses and corrections to enhance your learning experience.</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="py-16 mt-16 bg-gradient-to-t from-black/50 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold text-white mb-8">Ready to transform your learning experience?</h2>
              <motion.button
                className="px-10 py-5 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-full shadow-lg text-xl"
                whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(true)}
              >
                Get Started Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen">
          <TutorCanvas 
            isSpeaking={isSpeaking}
            isListening={isListening}
            userTranscript={userTranscript}
            aiResponse={aiResponse}
            handleStopConversation={handleStopConversation}
            isChatting={isChatting}
            setIsChatting={setIsChatting}
            lastError={lastError}
            onMessageSubmit={sendToGemini}
            setUserTranscript={setUserTranscript}
            setIsListening={setIsListening}
            targetLanguage={TARGET_LANGUAGE}
            nativeLanguage={NATIVE_LANGUAGE}
            kannadaVoiceFound={kannadaVoiceFound}
            setShowDemo={setShowDemo}
          />
        </div>
      )}
    </main>
  );
}
