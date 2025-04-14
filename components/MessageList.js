import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageList({
  lastError,
  userTranscript,
  aiResponse,
  targetLanguage,
  displayedUserMessage
}) {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userTranscript, aiResponse, displayedUserMessage]);

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4">
      {/* Error message toast */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            className="mb-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg sticky top-2 z-10 mx-auto max-w-xl"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            {lastError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message display area */}
      <div className="w-full max-w-xl mx-auto space-y-2 sm:space-y-4">
        {/* User transcript box */}
        <div className="bg-indigo-900/50 backdrop-blur-sm rounded-lg p-2 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-white font-medium text-sm sm:text-base">You said (Speak {targetLanguage})</h3>
          </div>
          <p className="text-white/90 text-sm sm:text-base min-h-[1.5em]"> {/* Ensure minimum height */}
            {displayedUserMessage || userTranscript || '...'}
          </p>
        </div>

        {/* AI response box */}
        <div className="bg-purple-900/50 backdrop-blur-sm rounded-lg p-2 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h3 className="text-white font-medium text-sm sm:text-base">Tutor says:</h3>
          </div>
          <p className="text-white/90 text-sm sm:text-base min-h-[1.5em]">{aiResponse || '...'}</p> {/* Ensure minimum height */}
        </div>
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 