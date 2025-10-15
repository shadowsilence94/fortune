# Deploy Fortune Teller App - Free Options

## Option 1: Vercel (Recommended)

### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add QWEN_API_KEY
   # Enter your Qwen API key when prompted
   
   vercel env add QWEN_BASE_URL
   # Enter: https://dashscope.aliyuncs.com/compatible-mode/v1
   ```

5. **Redeploy with env vars:**
   ```bash
   vercel --prod
   ```

**Limits:** 100GB bandwidth/month, Serverless functions

---

## Option 2: Netlify

### Steps:
1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=build
   ```

4. **For API (use Netlify Functions):**
   - Move server.js to netlify/functions/
   - Modify for serverless

**Limits:** 100GB bandwidth/month, 125k function invocations

---

## Option 3: Railway

### Steps:
1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway deploy
   ```

4. **Set env vars:**
   ```bash
   railway variables set QWEN_API_KEY=your_key
   railway variables set QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   ```

**Limits:** $5 free credit/month, 500 hours runtime

---

## Option 4: Render

### Steps:
1. **Push to GitHub**
2. **Connect to Render.com**
3. **Create Web Service**
4. **Set build command:** `npm run build`
5. **Set start command:** `node server.js`
6. **Add environment variables**

**Limits:** 750 hours/month, sleeps after 15min inactivity

---

## Recommended: Vercel
- Best for React apps
- Automatic deployments
- Good performance
- Easy setup
