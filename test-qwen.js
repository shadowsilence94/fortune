require('dotenv').config();
const OpenAI = require('openai');

async function testQwen() {
  console.log('Testing Qwen API...');
  
  if (!process.env.QWEN_API_KEY || process.env.QWEN_API_KEY === 'YOUR_QWEN_API_KEY_HERE') {
    console.log('❌ Please set your Qwen API key in .env file');
    return;
  }

  const qwen = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });

  // Try different Qwen models
  const modelsToTry = [
    'qwen-turbo',
    'qwen-max',
    'qwen-plus',
    'qwen2-72b-instruct',
    'qwen2-7b-instruct',
    'qwen1.5-72b-chat',
    'qwen1.5-14b-chat',
    'qwen1.5-7b-chat'
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`\nTesting model: ${model}...`);
      
      const completion = await qwen.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Say hello"
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      console.log(`✅ ${model} works!`);
      console.log('Response:', response);

      // Test fortune telling with working model
      console.log(`\nTesting fortune telling with ${model}...`);
      const fortuneCompletion = await qwen.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are Sayar Naing Win, a wise Myanmar astrologer."
          },
          {
            role: "user",
            content: "Give a brief fortune reading for someone born in Yangon."
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      const fortuneResponse = fortuneCompletion.choices[0]?.message?.content;
      console.log('✅ Fortune telling works!');
      console.log('Fortune Response:', fortuneResponse);

      console.log(`\n🎉 Found working model: ${model}`);
      console.log('Update your server to use this model.');
      return model;

    } catch (error) {
      console.log(`❌ ${model} failed: ${error.message}`);
    }
  }

  console.log('\n❌ No working models found. Check your Qwen account permissions.');
}

testQwen();
