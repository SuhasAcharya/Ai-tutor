import React from 'react';
import { motion } from 'framer-motion';

export default function ChatControls({
  isSpeaking,
  isListening,
  message,
  handleMessageChange,
  handleSubmit,
  startListening,
  stopListening,
  handleStopSpeaking,
  nativeLanguage, // Pass these if needed for placeholder, etc.
  targetLanguage
}) {
  return (
    <div className="w-full bg-indigo-900/80 backdrop-blur-sm border-t border-indigo-700 p-2 sm:p-4 flex-shrink-0">
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
                title="Start Listening"
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
                title="Stop Listening"
              >
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
            title="Send Message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>

          {/* Stop AI button */}
          {isSpeaking && (
            <motion.button
              type="button"
              onClick={handleStopSpeaking}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-red-500/50 hover:bg-red-500/70 text-white rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Stop AI Speaking"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </form>
      </div>
    </div>
  );
} 