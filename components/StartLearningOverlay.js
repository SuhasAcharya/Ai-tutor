import React from 'react';
import { motion } from 'framer-motion';

export default function StartLearningOverlay({ onStartLearning }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start md:justify-center bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="text-center w-full max-w-2xl mx-auto p-4 py-8 md:p-8">
        {/* Avatar preview - Smaller on mobile */}
        <div className="mb-4 md:mb-8">
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
            >
              {/* Eyes - Adjusted spacing for mobile */}
              <div className="absolute flex space-x-4 md:space-x-6 top-8 md:top-10 left-1/2 transform -translate-x-1/2">
                <motion.div
                  className="w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div
                  className="w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              {/* Smile - Adjusted size for mobile */}
              <div className="absolute top-12 md:top-16 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-2 md:h-3 bg-red-400 rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Welcome text - Reduced text size on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8 space-y-2 md:space-y-4"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            Learn Kannada with AI
          </h1>
          <p className="text-lg md:text-xl text-white/80 px-4">
            Your personal AI tutor is ready to help you master Kannada through interactive conversations
          </p>
        </motion.div>

        {/* Feature highlights - Adjusted spacing and padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8 px-4"
        >
          {/* Voice Interaction */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
            <div className="text-pink-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1 text-sm md:text-base">Voice Interaction</h3>
            <p className="text-white/70 text-xs md:text-sm">Practice speaking and listening with natural conversations</p>
          </div>

          {/* Smart Feedback */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
            <div className="text-purple-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1 text-sm md:text-base">Smart Feedback</h3>
            <p className="text-white/70 text-xs md:text-sm">Get instant corrections and explanations as you learn</p>
          </div>

          {/* Cultural Context */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
            <div className="text-orange-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1 text-sm md:text-base">Cultural Context</h3>
            <p className="text-white/70 text-xs md:text-sm">Learn language with cultural insights and real-world usage</p>
          </div>
        </motion.div>

        {/* Start button - Adjusted padding for mobile */}
        <motion.button
          onClick={onStartLearning}
          className="px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-full shadow-lg text-lg md:text-xl relative overflow-hidden group"
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
  );
} 