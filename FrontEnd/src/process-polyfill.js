// This file provides a polyfill for the process object in the browser
window.process = {
  env: {
    NODE_ENV: 'production',
  }
}; 