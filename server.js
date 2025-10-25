require('dotenv').config();
const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();

// Create server with increased header size
const server = http.createServer({
  maxHeaderSize: 16384 // 16KB header size (increased from default 8KB)
}, app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;

// CORS middleware with increased limits
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '50mb' })); // Increased body limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Add URL encoded support
app.use(express.static(path.join(__dirname, 'build')));

// Initialize Qwen AI
const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

// In-memory storage for demo (use database in production)
const users = new Map();
const bookings = new Map();
const chatSessions = new Map();
const payments = new Map();

// Create owner user
users.set('owner-001', {
  id: 'owner-001',
  email: 'naingwin@owner.com',
  password: 'naingwinohnmarmyint29A',
  name: 'Sayar Naing Win',
  isPremium: true,
  isOwner: true,
  createdAt: new Date()
});

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'naingwin',
  password: 'naingwinohnmarmyint29A'
};

// Admin login endpoint (for username/password format)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const ownerToken = 'owner-token-' + Date.now();
    
    res.json({
      success: true,
      token: ownerToken,
      user: {
        id: 'owner-001',
        email: 'naingwin@owner.com',
        name: 'Sayar Naing Win',
        isOwner: true,
        isPremium: true
      },
      message: 'Admin login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Middleware to check admin authentication
const checkAdminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token.startsWith('admin-token-')) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Separate owner login endpoint
app.post('/api/owner/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check for owner credentials
  if (email === 'naingwin@owner.com' && password === 'naingwinohnmarmyint29A') {
    const ownerToken = 'owner-token-' + Date.now();
    
    res.json({
      success: true,
      token: ownerToken,
      user: {
        id: 'owner-001',
        email: 'naingwin@owner.com',
        name: 'Sayar Naing Win',
        isOwner: true,
        isPremium: true
      },
      message: 'Owner login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid owner credentials'
    });
  }
});

// Updated owner auth middleware
const checkOwnerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No authorization header' });
  }
  
  // Check if it's an owner token
  if (authHeader.startsWith('owner-token-')) {
    req.user = {
      id: 'owner-001',
      email: 'naingwin@owner.com',
      name: 'Sayar Naing Win',
      isOwner: true
    };
    next();
  } else {
    res.status(401).json({ success: false, message: 'Owner access required' });
  }
};

// Horoscope endpoint - Qwen Pro API
app.post('/api/horoscope', async (req, res) => {
  try {
    const { birthDate, birthTime, birthPlace, userGender, topic, specificQuestion, timeline, language } = req.body;

    console.log('=== HOROSCOPE REQUEST ===');
    console.log('Request data:', { birthDate, birthTime, birthPlace, userGender, topic, timeline, language });
    console.log('Qwen API Key exists:', !!process.env.QWEN_API_KEY);
    console.log('Qwen API Key length:', process.env.QWEN_API_KEY?.length);

    // Validate required fields
    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        prediction: language === 'my' 
          ? 'လိုအပ်သော အချက်အလက်များ မပြည့်စုံပါ။'
          : 'Please fill in all required fields.'
      });
    }

    // Always try Qwen API first for all users
    if (process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== 'YOUR_QWEN_API_KEY_HERE') {
      try {
        console.log('🤖 Using Qwen API for prediction...');
        
        const prompt = `As Sayar Naing Win, a professional Myanmar astrologer, provide a ${language === 'my' ? 'Myanmar' : 'English'} fortune reading for:

Birth Information:
- Date: ${birthDate}
- Time: ${birthTime}
- Place: ${birthPlace}
- Gender: ${userGender}

Reading Focus:
- Topic: ${topic}
- Timeline: ${timeline}
${specificQuestion ? `- Specific Question: ${specificQuestion}` : ''}

${language === 'my' ? `
ကျေးဇူးပြု၍ အောက်ပါအချက်များပါဝင်သော ပြည့်စုံသော ဟောစာကို မြန်မာဘာသာဖြင့် ပေးပါ:

၁။ မွေးဖွားချိန်အရ ကိုယ်ရည်ကိုယ်သွေး လက္ခဏာများ
၂။ ${topic} အကြောင်း အထူးအချက်များနှင့် အကြံပြုချက်များ  
၃။ ${timeline} ကာလအတွက် ဟောစာများနှင့် ခန့်မှန်းချက်များ
၄။ လက်တွေ့လိုက်နာရမည့် အကြံပြုချက်များ
၅။ ကံကောင်းသော အရာများ၊ ရက်များ၊ အရောင်များ

အရေးကြီးချက်များ:
- စာလုံး ၄၀၀ မှ ၅၀၀ ကြား ရေးပါ
- တူညီသော ဝါကျများ ထပ်ခါတလဲလဲ မရေးပါနှင့်
- အချက်တိုင်းကို ကွဲပြားစွာ ဖော်ပြပါ
- ဟောစာကို အစအဆုံး ဆက်စပ်စွာ ရေးပါ
- စာကြောင်းတိုင်းကို "။" ဖြင့် အဆုံးသတ်ပါ
` : `
Please provide a detailed, mystical, and insightful reading that feels authentic and personal. Include:
1. General personality traits based on birth details
2. Specific insights about the requested topic (${topic})
3. Predictions for the ${timeline} timeframe
4. Practical advice and guidance
5. Lucky elements or suggestions

Please respond in English with a mystical and professional tone.
Keep the response between 250-450 words. Make sure to complete all sentences properly.
`}`;

        // Try free models first
        const modelsToTry = ['qwen-turbo', 'qwen2-7b-instruct', 'qwen1.5-7b-chat'];
        
        for (const model of modelsToTry) {
          try {
            console.log(`🔄 Trying model: ${model}`);
            const completion = await qwen.chat.completions.create({
              model: model,
              messages: [
                {
                  role: "system",
                  content: language === 'my' 
                    ? "သင်သည် ဆရာနိုင်ဝင်း ဖြစ်ပြီး မြန်မာနိုင်ငံ၏ ကျွမ်းကျင်သော ဗေဒင်ဆရာ ဖြစ်သည်။ ရှေးရိုးမြန်မာ ဗေဒင်ပညာနှင့် ဟောစာပညာကို နက်နဲစွာ သိရှိသည်။ တူညီသောစာကြောင်းများကို မထပ်ရေးပါနှင့်။ ကွဲပြားသော အကြောင်းအရာများဖြင့် အပြည့်အစုံ ဖြေကြားပါ။"
                    : "You are Sayar Naing Win, a wise and experienced Myanmar astrologer with deep knowledge of traditional astrology and fortune telling. Provide varied and detailed insights without repeating the same phrases."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: language === 'my' ? 1500 : 500,
              temperature: 0.8,
              top_p: 0.95,
              frequency_penalty: 0.8,  // Reduce repetition
              presence_penalty: 0.6    // Encourage diversity
            });

            const prediction = completion.choices[0]?.message?.content;
            
            if (prediction && prediction.trim().length > 0) {
              console.log(`✅ SUCCESS! Qwen API (${model}) generated prediction`);
              console.log('Prediction length:', prediction.length);
              console.log('Language:', language);
              
              // For Myanmar text, check if reasonably complete
              if (language === 'my') {
                // If text is too short (less than 200 chars), try next model
                if (prediction.trim().length < 200) {
                  console.log('⚠️ Myanmar text too short, trying next model...');
                  continue;
                }
              }
              
              return res.json({
                success: true,
                prediction: prediction.trim()
              });
            }
          } catch (modelError) {
            console.log(`❌ Model ${model} failed:`, modelError.message);
            continue;
          }
        }
        
      } catch (qwenError) {
        console.log('❌ All Qwen models failed:', qwenError.message);
      }
    } else {
      console.log('⚠️ Qwen API key not configured, using fallback');
    }

    // Fallback predictions if API fails
    console.log('Using fallback predictions...');
    const fallbackPredictions = {
      en: {
        love: `Based on your birth details from ${birthPlace} on ${birthDate} at ${birthTime}, the celestial alignments suggest a period of emotional growth ahead. Venus influences your ${timeline} timeline favorably, indicating potential for meaningful connections. Your ${userGender} energy resonates with cosmic harmony. Trust your intuition when it comes to matters of the heart. ${specificQuestion ? 'Regarding your specific question, the stars counsel patience and openness.' : ''}`,
        
        career: `The planetary positions at your birth time ${birthTime} indicate strong professional potential. Jupiter's influence brings opportunities for advancement in your ${timeline} period. Your birth location ${birthPlace} adds earth energy to your career path. Consider new ventures that align with your passions. ${specificQuestion ? 'Your specific inquiry shows promise - trust your instincts.' : ''}`,
        
        health: `The cosmic energies from your birth date ${birthDate} encourage focus on balance and wellness. Your ${userGender} constitution benefits from harmonious lifestyle choices. The ${timeline} period ahead requires attention to both physical and mental health. Pay attention to your body's signals. ${specificQuestion ? 'Regarding your health concern, moderation and mindfulness are key.' : ''}`,
        
        finance: `Mercury's position relative to your birth details suggests careful financial planning will yield positive results. The energy from ${birthPlace} supports practical money management. Your ${timeline} financial outlook shows steady progress. Avoid impulsive spending and consider long-term investments. ${specificQuestion ? 'Your financial question indicates a need for patience and strategic thinking.' : ''}`,
        
        general: `Born on ${birthDate} at ${birthTime} in ${birthPlace}, your celestial blueprint indicates a time of transformation and growth. The cosmic energies align favorably for your ${timeline} journey. Your ${userGender} energy harmonizes well with current planetary movements. Embrace change with confidence, as it will lead to positive outcomes. ${specificQuestion ? 'The universe has heard your specific question - trust the process.' : ''}`
      },
      my: {
        love: `${birthPlace} တွင် ${birthDate} ရက်နေ့ ${birthTime} အချိန်တွင် မွေးဖွားခဲ့သော သင်အတွက် ကြယ်များက အချစ်ရေးတွင် ကောင်းမွန်သော အပြောင်းအလဲများ ရှိလာမည်ကို ညွှန်ပြနေပါသည်။ ${timeline} ကာလအတွင်း ရှုခရာ ကြယ်၏ လွှမ်းမိုးမှုက အထူးကောင်းမွန်ပါသည်။ နှလုံးသားမှ ခံစားချက်များကို ယုံကြည်ပါ။ ${specificQuestion ? 'သင်၏ အထူးမေးခွန်းအတွက် ကြယ်များက စိတ်ရှည်မှုနှင့် ပွင့်လင်းမှုကို အကြံပေးနေပါသည်။' : ''}`,
        
        career: `မွေးဖွားရက် ${birthDate} နှင့် အချိန် ${birthTime} အရ အလုပ်ကိစ္စတွင် အခွင့်အလမ်းကောင်းများ ရရှိမည်။ ဗြဟသ္ပတိ ကြယ်၏ လွှမ်းမိုးမှုက ${timeline} ကာလတွင် တိုးတက်မှုများ ယူဆောင်လာမည်။ ${birthPlace} ၏ မြေဒေသ စွမ်းအင်က သင်၏ အသက်မွေးဝမ်းကြောင်းလမ်းကို ပံ့ပိုးပေးပါသည်။ ${specificQuestion ? 'သင်၏ အထူးမေးခွန်းက အလားအလာကောင်းကို ပြသနေပါသည်။' : ''}`,
        
        health: `မွေးဖွားရက် ${birthDate} မှ စွမ်းအင်များက ကျန်းမာရေးတွင် ဟန်ချက်ညီမှုကို အာရုံစိုက်ရန် တိုက်တွန်းနေပါသည်။ ${timeline} ကာလအတွင်း ရုပ်ပိုင်းနှင့် စိတ်ပိုင်း ကျန်းမာရေး နှစ်မျိုးလုံးကို ဂရုစိုက်ရန် လိုအပ်ပါသည်။ ကိုယ်ခန္ဓာ၏ အချက်ပြမှုများကို နားထောင်ပါ။ ${specificQuestion ? 'သင်၏ ကျန်းမာရေး စိုးရိမ်မှုအတွက် အလယ်အလတ်နှင့် သတိရှိမှုက အဓိကကျပါသည်။' : ''}`,
        
        finance: `ဗုဒ္ဓဟူး ကြယ်၏ အနေအထားက ငွေကြေးကိစ္စတွင် သေချာစွာ စီမံကိန်းချမှုက ကောင်းမွန်သော ရလဒ်များ ပေးမည်ကို ညွှန်ပြနေပါသည်။ ${birthPlace} မှ စွမ်းအင်က လက်တွေ့ကျသော ငွေကြေး စီမံခန့်ခွဲမှုကို ပံ့ပိုးပေးပါသည်။ ${timeline} ငွေကြေး အလားအလာက တည်ငြိမ်သော တိုးတက်မှုကို ပြသနေပါသည်။ ${specificQuestion ? 'သင်၏ ငွေကြေး မေးခွန်းက စိတ်ရှည်မှုနှင့် မဟာဗျူဟာ တွေးခေါ်မှု လိုအပ်ကြောင်း ညွှန်ပြနေပါသည်။' : ''}`,
        
        general: `${birthDate} ရက်နေ့ ${birthTime} အချိန်တွင် ${birthPlace} တွင် မွေးဖွားခဲ့သော သင်၏ ကြယ်စာအရ အပြောင်းအလဲနှင့် တိုးတက်မှုများ၏ အချိန်ကာလ ရောက်ရှိနေပါပြီ။ ${timeline} ခရီးစဉ်အတွက် စကြာဝဠာ စွမ်းအင်များ အထူးကောင်းမွန်စွာ ပေါင်းစပ်နေပါသည်။ လက်ရှိ ဂြိုဟ်များ၏ လှုပ်ရှားမှုများနှင့် သင်၏ စွမ်းအင် ကောင်းမွန်စွာ ညီညွတ်နေပါသည်။ ${specificQuestion ? 'စကြာဝဠာက သင်၏ အထူးမေးခွန်းကို ကြားနေပါပြီ - လုပ်ငန်းစဉ်ကို ယုံကြည်ပါ။' : ''}`
      }
    };

    const predictions = fallbackPredictions[language] || fallbackPredictions.en;
    const prediction = predictions[topic] || predictions.general;

    res.json({
      success: true,
      prediction: prediction
    });

  } catch (error) {
    console.error('Horoscope API Error:', error);
    
    const errorMessage = language === 'my' 
      ? 'နက္ခတ်များ တိမ်ဖုံးနေသည်။ နောက်မှ ထပ်ကြိုးစားပါ။'
      : 'The stars are clouded at this moment. Please try again later.';
    
    res.json({
      success: true,
      prediction: errorMessage
    });
  }
});

// Chat endpoint - Using Qwen API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, isPremium, userId, userName } = req.body;

    console.log('=== CHAT REQUEST ===');
    console.log('User ID:', userId);
    console.log('User Name:', userName);
    console.log('Message:', message);

    // Check if user is authenticated (registered user only)
    if (!userId || !userName) {
      console.log('❌ Chat access denied - user not registered');
      return res.status(401).json({
        response: language === 'my' 
          ? 'ချတ်ဝန်ဆောင်မှုကို အသုံးပြုရန် အကောင့်ဝင်ပါ။'
          : 'Please login to use chat service.',
        error: true
      });
    }

    console.log('✅ User authenticated, proceeding with chat...');

    // Always try Qwen API for all users (free and premium)
    if (process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== 'YOUR_QWEN_API_KEY_HERE') {
      try {
        console.log('🤖 Using Qwen API for chat...');
        
        const systemPrompt = isPremium 
          ? `You are Sayar Naing Win, a professional AI fortune teller. Provide detailed, insightful, and mystical responses with deep analysis and specific predictions. You have access to premium insights. Respond in ${language === 'my' ? 'Myanmar' : 'English'} language.`
          : `You are Sayar Naing Win, an AI fortune teller. Provide helpful but general responses. Keep responses shorter and mention that detailed insights and specific predictions require premium subscription. Respond in ${language === 'my' ? 'Myanmar' : 'English'} language.`;

        const modelsToTry = ['qwen-turbo', 'qwen2-7b-instruct', 'qwen1.5-7b-chat'];
        
        for (const model of modelsToTry) {
          try {
            console.log(`🔄 Trying chat model: ${model}`);
            const completion = await qwen.chat.completions.create({
              model: model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: message
                }
              ],
              max_tokens: isPremium ? 300 : 150,
              temperature: 0.8
            });

            const response = completion.choices[0]?.message?.content;

            if (response) {
              console.log(`✅ SUCCESS! Qwen chat (${model}) generated response`);
              
              // Store chat session
              const sessionId = Date.now().toString();
              chatSessions.set(sessionId, {
                id: sessionId,
                userId,
                userName,
                message,
                response,
                timestamp: new Date(),
                isPremium
              });

              return res.json({
                response,
                premiumRequired: !isPremium
              });
            }
          } catch (modelError) {
            console.log(`❌ Chat model ${model} failed:`, modelError.message);
            continue;
          }
        }
      } catch (qwenError) {
        console.log('❌ All Qwen chat models failed:', qwenError.message);
      }
    }

    // Fallback response
    const errorMessage = language === 'my' 
      ? 'ယခုအချိန်တွင် ဖြေကြားနိုင်မှု မရှိပါ။ နောက်မှ ထပ်ကြိုးစားပါ။'
      : 'I cannot provide insights at this moment. Please try again later.';
    
    res.json({
      response: errorMessage,
      error: true
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    const errorMessage = language === 'my' 
      ? 'ယခုအချိန်တွင် ဖြေကြားနိုင်မှု မရှိပါ။ နောက်မှ ထပ်ကြိုးစားပါ။'
      : 'I cannot provide insights at this moment. Please try again later.';
    
    res.json({
      response: errorMessage,
      error: true
    });
  }
});

// Booking endpoint - Enhanced
app.post('/api/booking', async (req, res) => {
  try {
    const bookingData = req.body;
    const bookingId = Date.now().toString();
    
    // Store booking
    bookings.set(bookingId, {
      id: bookingId,
      ...bookingData,
      status: 'pending',
      createdAt: new Date()
    });
    
    console.log('New booking:', bookingData);
    
    res.json({
      success: true,
      bookingId,
      message: 'Booking confirmed successfully!'
    });

  } catch (error) {
    console.error('Booking API Error:', error);
    res.json({
      success: false,
      error: 'Unable to process booking. Please try again.'
    });
  }
});

// Payment endpoint - Fixed to require manual approval
app.post('/api/payment', async (req, res) => {
  try {
    const { plan, paymentMethod, userId } = req.body;
    const transactionId = `TXN_${Date.now()}`;
    
    // Store payment record as PENDING (requires manual approval)
    payments.set(transactionId, {
      id: transactionId,
      userId,
      plan,
      paymentMethod,
      status: 'pending_approval', // Changed from 'pending' to 'pending_approval'
      createdAt: new Date()
    });
    
    console.log('Payment request submitted for manual approval:', { plan, paymentMethod, userId });
    
    // DO NOT automatically approve - admin must approve manually
    res.json({
      success: true,
      transactionId,
      message: 'Payment submitted for manual verification. Admin will approve your premium access.',
      requiresApproval: true
    });

  } catch (error) {
    console.error('Payment API Error:', error);
    res.json({
      success: false,
      error: 'Payment processing failed. Please try again.'
    });
  }
});

// Regular user registration and login (separate from owner)
app.post('/api/user/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Prevent owner email from being registered as regular user
  if (email === 'naingwin@owner.com') {
    return res.status(400).json({
      success: false,
      message: 'This email is reserved. Please use a different email.'
    });
  }
  
  const userId = Date.now().toString();
  
  users.set(userId, {
    id: userId,
    email,
    password, // In production, hash this
    name,
    isPremium: false,
    isOwner: false,
    createdAt: new Date()
  });
  
  res.json({
    success: true,
    user: { 
      id: userId, 
      email, 
      name, 
      isPremium: false,
      isOwner: false
    }
  });
});

app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check all users including owner
  for (let [id, user] of users) {
    if (user.email === email && user.password === password) {
      return res.json({
        success: true,
        user: { 
          id, 
          email: user.email, 
          name: user.name, 
          isPremium: user.isPremium,
          isOwner: user.isOwner || false
        }
      });
    }
  }
  
  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});
app.get('/api/admin/dashboard', checkOwnerAuth, (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Get today's bookings
  const todayBookings = Array.from(bookings.values()).filter(booking => 
    booking.createdAt.toISOString().split('T')[0] === today
  );
  
  // Get recent chat sessions
  const recentChats = Array.from(chatSessions.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  // Calculate revenue
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const monthlyPayments = Array.from(payments.values()).filter(payment => {
    const paymentDate = payment.createdAt;
    return paymentDate.getMonth() === thisMonth && 
           paymentDate.getFullYear() === thisYear &&
           payment.status === 'completed';
  });
  
  const monthlyRevenue = monthlyPayments.reduce((total, payment) => {
    const amount = payment.plan === 'yearly' ? 150000 : 15000;
    return total + amount;
  }, 0);
  
  res.json({
    success: true,
    data: {
      todayBookings: todayBookings.length,
      activeChats: recentChats.filter(chat => 
        (now - chat.timestamp) < 30 * 60 * 1000 // Active in last 30 minutes
      ).length,
      monthlyRevenue,
      premiumUsers: Array.from(users.values()).filter(user => user.isPremium && !user.isOwner).length,
      bookings: Array.from(bookings.values()).slice(-20), // Last 20 bookings
      chatSessions: recentChats,
      currentTime: now.toISOString()
    }
  });
});

app.post('/api/admin/approve-user', checkOwnerAuth, (req, res) => {
  const { userId, isPremium } = req.body;
  
  if (users.has(userId)) {
    const user = users.get(userId);
    user.isPremium = isPremium;
    if (isPremium) {
      user.premiumExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }
    
    res.json({
      success: true,
      message: `User ${isPremium ? 'approved for' : 'removed from'} premium access`
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.get('/api/admin/users', checkOwnerAuth, (req, res) => {
  const userList = Array.from(users.values())
    .filter(user => !user.isOwner) // Don't show owner in user list
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      premiumExpiry: user.premiumExpiry
    }));
  
  res.json({
    success: true,
    users: userList
  });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined chat`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { message, userId, language, isPremium } = data;
      
      // Process message with Qwen AI
      if (process.env.QWEN_API_KEY && process.env.QWEN_API_KEY !== 'YOUR_QWEN_API_KEY_HERE') {
        try {
          const systemPrompt = `You are Sayar Naing Win, an AI fortune teller. Respond in ${language === 'my' ? 'Myanmar' : 'English'} language. ${isPremium ? 'Provide detailed insights.' : 'Provide brief response, mention premium for details.'}`;

          const completion = await qwen.chat.completions.create({
            model: "qwen-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            max_tokens: isPremium ? 200 : 100,
            temperature: 0.8
          });

          const response = completion.choices[0]?.message?.content || 'Sorry, I cannot respond right now.';

          // Send response back to user
          io.to(`user-${userId}`).emit('receive-message', {
            message: response,
            timestamp: new Date(),
            type: 'bot'
          });
          return;
        } catch (qwenError) {
          console.log('Qwen socket error:', qwenError.message);
        }
      }

      // Fallback response
      socket.emit('receive-message', {
        message: 'Sorry, I cannot respond right now. Please try again.',
        timestamp: new Date(),
        type: 'bot',
        error: true
      });

    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('receive-message', {
        message: 'Sorry, I cannot respond right now. Please try again.',
        timestamp: new Date(),
        type: 'bot',
        error: true
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app for specific routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/owner-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Only start server if not in Vercel environment
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Server maxHeaderSize: 16KB`);
    console.log(`Qwen API configured: ${!!process.env.QWEN_API_KEY}`);
  });
}

// Export for Vercel and serverless
module.exports = app;
