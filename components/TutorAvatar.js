import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TutorAvatar({ isSpeaking, isListening, targetLanguage }) {
  return (
    <div className="flex w-full md:w-1/3 items-center justify-center p-2 md:p-4 flex-shrink-0">
      <div className="relative flex flex-col items-center">
        {/* CSS Human Avatar */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64">
          {/* Avatar Container */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ y: [0, -3, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          >
            {/* Head */}
            <div className="relative">
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full shadow-lg"
              >
                {/* Eyes */}
                <div className="absolute flex space-x-6 md:space-x-8 top-8 md:top-10 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    className="w-3 h-3 md:w-4 md:h-4 bg-gray-800 rounded-full"
                    animate={isSpeaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  />
                  <motion.div
                    className="w-3 h-3 md:w-4 md:h-4 bg-gray-800 rounded-full"
                    animate={isSpeaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  />
                </div>

                {/* Mouth */}
                <motion.div
                  className="absolute top-16 md:top-20 left-1/2 transform -translate-x-1/2 w-8 md:w-12 h-2 md:h-3 bg-red-400 rounded-full overflow-hidden"
                  animate={isSpeaking ? {
                    height: ["4px", "8px", "3px", "9px", "4px"],
                    width: ["16px", "14px", "15px", "18px", "16px"]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  <div className="w-full h-1/2 bg-red-500"></div>
                </motion.div>
              </motion.div>

              {/* Body */}
              <div className="hidden md:block absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-32 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-3xl z-[-1]">
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
              className="mt-2 md:mt-4 flex flex-col items-center space-y-1 md:space-y-2 bg-indigo-900/30 backdrop-blur-sm rounded-lg p-2 md:p-4"
            >
              <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-blue-500/50 rounded-full">
                <div className="relative">
                  <div className="absolute -inset-2 md:-inset-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full animate-ping bg-blue-500/20"></div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-white font-medium text-xs md:text-base">Listening...</p>
              <p className="text-white/70 text-xs md:text-sm">Speak in {targetLanguage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 