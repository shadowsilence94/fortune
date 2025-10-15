require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('Testing OpenAI API...');
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    console.log('❌ Please set your OpenAI API key in .env file');
    console.log('Get it from: https://platform.openai.com/api-keys');
    return;
  }

  console.log('API Key:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    console.log('\nTesting basic chat...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say hello in Myanmar language"
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content;
    console.log('✅ Basic test successful!');
    console.log('Response:', response);

    // Test fortune telling
    console.log('\nTesting fortune telling...');
    const fortuneCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Sayar Naing Win, a wise Myanmar astrologer."
        },
        {
          role: "user",
          content: "Give a brief fortune reading in Myanmar for someone born in Yangon on 1990-01-01."
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const fortuneResponse = fortuneCompletion.choices[0]?.message?.content;
    console.log('✅ Fortune telling test successful!');
    console.log('Fortune Response:', fortuneResponse);

    console.log('\n🎉 OpenAI API is working perfectly for your fortune teller app!');
    console.log('Your app will now use AI-generated predictions instead of fallback data.');

  } catch (error) {
    console.log('❌ OpenAI API failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('   → Invalid API key. Check your OpenAI API key.');
    } else if (error.message.includes('quota') || error.message.includes('billing')) {
      console.log('   → Quota/billing issue. Add credits to your OpenAI account.');
    } else {
      console.log('   → Error details:', error.message);
    }
  }
}

testOpenAI();
