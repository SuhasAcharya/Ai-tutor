'use client';

import React from 'react';
import SpeechControls from './SpeechControls';

export default function SpeechControlsWrapper(props) {
  // Map language names to language codes
  const getLanguageCode = (languageName) => {
    const languageMap = {
      'Kannada': 'kn-IN',
      'English': 'en-US',
      // Add more mappings as needed
    };
    
    const code = languageMap[languageName] || 'en-US';
    console.log(`SpeechControlsWrapper: Mapping ${languageName} to ${code}`);
    return code;
  };
  
  // Get the language code
  const languageCode = getLanguageCode(props.targetLanguage);
  
  // Pass the language code directly
  return (
    <SpeechControls 
      {...props}
      languageCode={languageCode}
    />
  );
} 