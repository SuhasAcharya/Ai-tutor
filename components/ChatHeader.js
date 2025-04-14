import React from 'react';
import { motion } from 'framer-motion';

export default function ChatHeader({
    isListening,
    isSpeaking,
    handleStopConversation,
    setIsChatting,
    setShowDemo
}) {
    return (
        <div className="w-full bg-indigo-900/60 backdrop-blur-sm p-2 sm:p-4 flex justify-between items-center border-b border-indigo-700 flex-shrink-0">
            {/* Logo/Title */}
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-0.5 p-1 sm:p-2 rounded-lg">
                    <span className="text-2xl sm:text-4xl font-bold text-orange-400">ಕ</span>
                    <span className="text-lg sm:text-2xl font-bold text-pink-400 font-serif">A</span>
                </div>
                Namme Bhashe
            </h2>

            {/* Controls */}
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
                    title="Back to Home" // Accessibility
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">Back</span>
                    <span className="hidden md:inline"> to Home</span>
                </motion.button>
            </div>
        </div>
    );
} 