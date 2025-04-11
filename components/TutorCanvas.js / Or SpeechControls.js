function TutorCanvas({ startListening, stopListening, isListening, /* ...other props */ }) {

  // ... other component logic

  return (
    <div>
      {/* ... other elements ... */}

      {/* Find your microphone button */}
      <button
        onClick={isListening ? stopListening : startListening} // Use the props here!
        disabled={/* maybe disable based on other state */}
        className="..." // Add your styling
      >
        {isListening ? (
          // Icon/Text for "Stop Listening"
          <span>Stop</span>
        ) : (
          // Icon/Text for "Start Listening"
          <span>Start Listening / Mic Icon</span>
        )}
      </button>

      {/* Display permission errors passed down */}
      {props.permissionError && <p style={{ color: 'red' }}>{props.permissionError}</p>}

      {/* ... rest of the component ... */}
    </div>
  );
} 