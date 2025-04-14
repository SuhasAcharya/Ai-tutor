import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({
  isSpeaking,
  isListening,
  userTranscript,
  aiResponse,
  handleStopConversation, // Renamed from handleStopSpeaking for clarity
  setIsChatting,
  setShowDemo,
  lastError,
  targetLanguage,
  nativeLanguage,
  message,
  handleMessageChange,
  handleSubmit,
  startListening,
  stopListening,
  handleStopSpeaking, // Keep this for the specific stop AI button
  displayedUserMessage // Pass this down if needed for the input sync
}) {
  return (
    <div className="flex flex-col h-full"> {/* Ensure this takes up available height */}
      {/* Top nav bar - Add w-full */}
      <div className="w-full bg-indigo-900/60 backdrop-blur-sm p-2 sm:p-4 flex justify-between items-center border-b border-indigo-700 flex-shrink-0">
        <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-1 sm:gap-3">
          <div className="flex items-center gap-0.5 p-1 sm:p-2 rounded-lg">
            <span className="text-2xl sm:text-4xl font-bold text-orange-400">ಕ</span>
            <span className="text-lg sm:text-2xl font-bold text-pink-400 font-serif">A</span>
          </div>
          Namme Bhashe
        </h2>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status indicators */}
          <div className="hidden sm:flex items-center gap-2">
            {isListening && (
              <div className="flex items-center space-x-1 bg-blue-600/50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs sm:text-sm">Listening</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center space-x-1 bg-green-600/50 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs sm:text-sm">Speaking</span>
              </div>
            )}
          </div>
          {/* Back to Home button */}
          <motion.button
            className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleStopConversation(); // Use the main stop handler
              setIsChatting(false);
              setShowDemo(false); // Assuming setShowDemo comes from parent
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Back</span>
            <span className="hidden md:inline"> to Home</span>
          </motion.button>
        </div>
      </div>

      {/* Main content area (Messages) */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {/* Error message toast */}
        <AnimatePresence>
          {lastError && (
            <motion.div
              className="mb-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg sticky top-2 z-10 mx-auto max-w-xl" // Make error sticky?
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
            <p className="text-white/90 text-sm sm:text-base">
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
            <p className="text-white/90 text-sm sm:text-base">{aiResponse || '...'}</p>
          </div>
        </div>
      </div>

      {/* Fixed controls at bottom */}
      <div className="bg-indigo-900/80 backdrop-blur-sm border-t border-indigo-700 p-2 sm:p-4 flex-shrink-0">
        <div className="w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-1 sm:gap-2">
            {/* Voice control button */}
            <div className="relative group">
              {!isListening ? (
                <motion.button
                  type="button"
                  onClick={startListening}
                  className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSpeaking}
                  title="Start Listening" // Add title for accessibility
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={stopListening}
                  className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSpeaking}
                  title="Stop Listening" // Add title for accessibility
                >
                  {/* Simple square icon for stop */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                  </svg>
                </motion.button>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                {isSpeaking ? "AI is speaking..." : isListening ? "Click to stop listening" : "Click to start speaking"}
              </div>
            </div>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Type message...`}
                className="w-full p-2 sm:p-3 md:p-4 rounded-lg bg-indigo-800/50 text-white border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                value={message}
                onChange={handleMessageChange}
                disabled={isSpeaking || isListening}
              />
            </div>

            {/* Send button */}
            <motion.button
              type="submit"
              className="flex-shrink-0 p-2 sm:p-3 md:p-4 md:px-6 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg text-white disabled:opacity-50 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!message.trim() || isSpeaking || isListening}
              title="Send Message" // Add title for accessibility
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>

            {/* Stop AI button */}
            {isSpeaking && (
              <motion.button
                type="button"
                onClick={handleStopSpeaking} // Use the specific stop speaking handler
                className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-red-500/50 hover:bg-red-500/70 text-white rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Stop AI Speaking" // Add title for accessibility
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 