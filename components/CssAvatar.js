'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// More Advanced CSS + Framer Motion Avatar Component
export default function CssAvatar({ isSpeaking }) {

  // --- Animation Variants ---

  // Mouth cycles through shapes when speaking
  const mouthVariants = {
    idle: {
      height: '3px',
      width: '35px',
      y: 0,
      backgroundColor: '#6B21A8', // Darker purple for idle mouth line
      borderRadius: '2px',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    speaking: {
      // Use keyframes for a more dynamic animation loop
      height: ['3px', '12px', '18px', '12px', '3px'], // Cycle height
      width: ['35px', '30px', '28px', '30px', '35px'], // Cycle width
      y: [0, 1, 3, 1, 0], // Cycle vertical position slightly
      backgroundColor: ['#6B21A8', '#BE185D', '#F472B6', '#BE185D', '#6B21A8'], // Cycle color
      borderRadius: ['2px', '6px', '9px', '6px', '2px'], // Cycle rounding
      transition: {
        duration: 0.6, // Duration of one full cycle
        ease: 'easeInOut',
        repeat: Infinity, // Loop the animation indefinitely while speaking
        repeatType: "loop", // Simple loop (could also use "mirror")
      }
    }
  };

  // Eyebrows can subtly move up/down when speaking starts/stops (optional)
  const eyebrowVariants = {
    idle: { y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    speaking: { y: -2, transition: { duration: 0.2, ease: 'easeIn' } } // Subtle lift
  };

  // --- Component Structure ---
  return (
    // Container - slightly larger overall size
    <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">

      {/* Head - More refined gradient and shadow */}
      <div className="absolute w-full h-full rounded-full border-4 border-purple-300 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-fuchsia-500">

        {/* Inner shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_8px_20px_rgba(0,0,0,0.2)]"></div>

        {/* Hair - Simple shape on top */}
        <div className="absolute top-[-15%] left-[10%] w-[80%] h-[50%] bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 rounded-t-[50%] rounded-b-[20%] shadow-md border-b-2 border-gray-600">
           {/* Hair texture/shine (optional) */}
           <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[50%] h-[10%] bg-gray-500 opacity-30 rounded-full blur-sm"></div>
        </div>

        {/* Face elements container (relative positioning context) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">

          {/* Eyebrows Container */}
          <motion.div
            className="absolute top-[30%] w-[60%] flex justify-between"
            variants={eyebrowVariants}
            animate={isSpeaking ? 'speaking' : 'idle'}
          >
            {/* Left Eyebrow */}
            <div className="w-[40%] h-[6px] md:h-[8px] bg-gray-700 rounded-full transform -rotate-6"></div>
            {/* Right Eyebrow */}
            <div className="w-[40%] h-[6px] md:h-[8px] bg-gray-700 rounded-full transform rotate-6"></div>
          </motion.div>

          {/* Eyes Container */}
          <div className="absolute top-[40%] flex justify-center gap-10 md:gap-12 w-full">
            {/* Left Eye */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner overflow-hidden">
              {/* Iris */}
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-radial from-purple-700 via-purple-900 to-black rounded-full flex items-center justify-center">
                 {/* Pupil */}
                 <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-black rounded-full"></div>
                 {/* Glint */}
                 <div className="absolute top-1 left-1 w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
            {/* Right Eye */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border-2 border-gray-600 flex items-center justify-center shadow-inner overflow-hidden">
               {/* Iris */}
               <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-radial from-purple-700 via-purple-900 to-black rounded-full flex items-center justify-center">
                 {/* Pupil */}
                 <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-black rounded-full"></div>
                 {/* Glint */}
                 <div className="absolute top-1 right-1 w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
          </div>

          {/* Mouth Container - Positioned lower */}
          <div className="absolute bottom-[20%] flex justify-center w-full h-[20px]"> {/* Added height for positioning context */}
            {/* Animated Mouth */}
            <motion.div
              className="origin-center"
              variants={mouthVariants}
              animate={isSpeaking ? 'speaking' : 'idle'}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 