require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSimple() {
  console.log('Testing basic Gemini API...');
  
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  console.log('API Key length:', apiKey?.length);
  console.log('API Key start:', apiKey?.substring(0, 10));
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most basic model names
    const basicModels = [
      'models/gemini-pro',
      'models/gemini-1.5-flash',
      'models/text-bison-001'
    ];
    
    for (const modelName of basicModels) {
      try {
        console.log(`\nTrying: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello world');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}`);
        console.log('Response:', text);
        return modelName;
        
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message.substring(0, 100));
      }
    }
    
    // If all fail, try without models/ prefix
    const simpleModels = ['gemini-pro', 'text-bison-001'];
    
    for (const modelName of simpleModels) {
      try {
        console.log(`\nTrying simple: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}`);
        console.log('Response:', text);
        return modelName;
        
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message.substring(0, 100));
      }
    }
    
  } catch (error) {
    console.log('General error:', error.message);
  }
  
  console.log('\n❌ All attempts failed. Your API key might be invalid or region-restricted.');
  console.log('Try getting a fresh API key from: https://aistudio.google.com/app/apikey');
}

testSimple();
