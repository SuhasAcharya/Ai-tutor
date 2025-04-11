// CRITICAL: Ensure regeneratorRuntime is available globally
import regeneratorRuntime from "regenerator-runtime";

// Add to global scope in multiple ways
if (typeof window !== 'undefined') {
  // Direct assignment
  window.regeneratorRuntime = regeneratorRuntime;
  
  // Also add to global scope for non-window environments
  if (typeof global !== 'undefined') {
    global.regeneratorRuntime = regeneratorRuntime;
  }
  
  // Alternative method via prototype
  Object.defineProperty(window, 'regeneratorRuntime', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: regeneratorRuntime
  });
}

export { regeneratorRuntime }; 