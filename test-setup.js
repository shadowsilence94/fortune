require('dotenv').config();

console.log('Testing Fortune Teller App Setup...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   PORT:', process.env.PORT || '3001 (default)');
console.log('   GEMINI_API_KEY:', process.env.REACT_APP_GEMINI_API_KEY ? 
  `${process.env.REACT_APP_GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

// Check dependencies
console.log('\n2. Checking Dependencies:');
try {
  require('express');
  console.log('   ✓ Express installed');
} catch (e) {
  console.log('   ✗ Express missing');
}

try {
  require('@google/generative-ai');
  console.log('   ✓ Google Generative AI installed');
} catch (e) {
  console.log('   ✗ Google Generative AI missing');
}

try {
  require('socket.io');
  console.log('   ✓ Socket.IO installed');
} catch (e) {
  console.log('   ✗ Socket.IO missing');
}

// Test Gemini API
console.log('\n3. Testing Gemini API:');
if (process.env.REACT_APP_GEMINI_API_KEY && process.env.REACT_APP_GEMINI_API_KEY !== 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  
  (async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Say hello in Myanmar");
      console.log('   ✓ Gemini API working');
      console.log('   Response:', result.response.text().substring(0, 50) + '...');
    } catch (error) {
      console.log('   ✗ Gemini API error:', error.message);
    }
  })();
} else {
  console.log('   ⚠ Gemini API key not configured properly');
  console.log('   Please get your API key from: https://makersuite.google.com/app/apikey');
}

console.log('\n4. Next Steps:');
console.log('   1. Set your Gemini API key in .env file');
console.log('   2. Run: ./start-app.sh or npm run dev');
console.log('   3. Open http://localhost:3000 in your browser');
