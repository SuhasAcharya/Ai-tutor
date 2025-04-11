// This injects regenerator-runtime into the global scope immediately
try {
  if (typeof window !== 'undefined' && !window.regeneratorRuntime) {
    console.log('Injecting regeneratorRuntime polyfill');
    const regeneratorRuntime = require('regenerator-runtime');
    window.regeneratorRuntime = regeneratorRuntime;
  }
} catch (e) {
  console.error('Failed to inject regeneratorRuntime:', e);
} 