require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiPro() {
  console.log('Testing Gemini API with GCP billing...');
  
  if (!process.env.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
    console.log('❌ Please set your Gemini API key in .env file');
    console.log('Get it from: https://aistudio.google.com/app/apikey');
    return;
  }

  console.log('API Key:', process.env.REACT_APP_GEMINI_API_KEY.substring(0, 10) + '...');

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  
  // Models that should work with GCP billing
  const models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.0-pro-latest', 
    'gemini-1.0-pro',
    'gemini-pro'
  ];
  
  for (const modelName of models) {
    try {
      console.log(`\nTesting ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "Hello" in Myanmar language');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} works!`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      
      // Test fortune telling prompt
      console.log('Testing fortune telling...');
      const fortuneResult = await model.generateContent(`As Sayar Naing Win, a Myanmar astrologer, give a brief fortune reading in Myanmar for someone born in Yangon on 1990-01-01.`);
      const fortuneResponse = await fortuneResult.response;
      const fortuneText = fortuneResponse.text();
      
      console.log(`Fortune test: ${fortuneText.substring(0, 150)}...`);
      console.log(`\n🎉 ${modelName} is working perfectly for your fortune teller app!`);
      console.log(`\nUpdate your server.js to use: ${modelName}`);
      return;
      
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
      
      // Show more details for debugging
      if (error.message.includes('API key')) {
        console.log('   → API key issue. Make sure you have a valid key from Google AI Studio');
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        console.log('   → Billing/quota issue. Check your GCP billing account');
      } else if (error.message.includes('404')) {
        console.log('   → Model not found. This model might not be available in your region');
      }
    }
  }
  
  console.log('\n❌ All models failed. Please check:');
  console.log('1. Your API key is correct and active');
  console.log('2. Your GCP billing account is set up');
  console.log('3. Generative AI API is enabled in your GCP project');
  console.log('4. You have sufficient quota/credits');
}

testGeminiPro();
