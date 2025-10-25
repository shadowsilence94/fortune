# 🔮 Fortune Teller App

AI-powered fortune telling app with Myanmar (Burmese) and English language support.

## 🚀 Quick Start

```bash
./quick-start.sh
```

This will:
- Check environment setup
- Create necessary config files
- Start API server (port 3001)
- Start React app (port 3000)
- Open browser automatically

## 📋 Manual Start

### Terminal 1 - API Server
```bash
npm run server
```

### Terminal 2 - React App
```bash
npm start
```

## ⚙️ Configuration

Create `.env` file with:
```env
QWEN_API_KEY=your_api_key_here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
PORT=3001
```

## ✨ Features

- 🔮 AI Fortune Telling (English & Myanmar)
- 💬 Chat with AI Astrologer
- 📅 Booking System
- 💳 Payment Integration
- 👑 Owner Dashboard
- 🌐 Bilingual Interface
- 📱 Mobile Responsive

## 🧪 Testing

1. Open http://localhost:3000
2. Switch language to Myanmar (မြန်မာ)
3. Fill in birth details
4. Select topic (e.g., အချစ်ရေး - Love)
5. Click "ဟောစာရယ်မယ်" button
6. View full Myanmar fortune prediction

## 🚀 Deploy to Vercel

```bash
vercel --prod
```

Set environment variables in Vercel Dashboard:
- `QWEN_API_KEY`
- `QWEN_BASE_URL`

## 📞 Owner Access

Dashboard: http://localhost:3000/owner-dashboard

- Username: `naingwin`
- Password: `naingwinohnmarmyint29A`

## 🔧 Troubleshooting

### Port in use
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Technical Details

- **Frontend**: React 19, Framer Motion
- **Backend**: Express.js, Node.js
- **AI**: Qwen API (Alibaba Cloud)
- **Real-time**: Socket.IO
- **Deployment**: Vercel-ready

## 🛠️ Recent Fixes

- ✅ Myanmar text repetition fixed (frequency_penalty: 0.8)
- ✅ HTTP 431 error resolved (increased header size)
- ✅ JSX syntax errors fixed
- ✅ Vercel deployment configured
- ✅ Myanmar font support added (Padauk)

---

Made with ❤️ by Sayar Naing Win
