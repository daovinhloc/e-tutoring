const { spawn } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

function startNgrok() {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting ngrok...');
      
      // Check if auth token exists
      if (!process.env.NGROK_AUTH_TOKEN) {
        throw new Error('NGROK_AUTH_TOKEN is not defined in .env file');
      }
      
      console.log('Auth Token:', process.env.NGROK_AUTH_TOKEN);
      
      // Start ngrok using CLI with random URL
      const ngrok = spawn('ngrok', [
        'http',
        '5000',
        '--authtoken', process.env.NGROK_AUTH_TOKEN
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let publicUrl = '';
      
      ngrok.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        console.log('Ngrok:', message);
        
        // Extract the public URL from ngrok output
        const urlMatch = message.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
        if (urlMatch) {
          publicUrl = urlMatch[0];
        }
        
        if (output.includes('started tunnel')) {
          console.log('Ngrok tunnel started successfully!');
          console.log('Your public URL:', publicUrl);
          resolve(publicUrl);
        }
      });

      ngrok.stderr.on('data', (data) => {
        console.error('Ngrok Error:', data.toString());
      });

      ngrok.on('error', (err) => {
        console.error('Failed to start ngrok:', err);
        reject(err);
      });

      ngrok.on('close', (code) => {
        if (code !== 0) {
          console.error(`ngrok process exited with code ${code}`);
          reject(new Error(`ngrok process exited with code ${code}`));
        }
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('Shutting down ngrok...');
        ngrok.kill();
        process.exit();
      });

    } catch (error) {
      console.error('Error starting ngrok:', error);
      reject(error);
    }
  });
}

// Start ngrok immediately when this file is run directly
if (require.main === module) {
  startNgrok().catch(console.error);
} else {
  // Export the function to be used in index.js
  module.exports = startNgrok;
} 