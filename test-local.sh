#!/bin/bash

# Fortune Teller App - Local Testing Script

echo "════════════════════════════════════════════════════"
echo "  Fortune Teller App - Local Testing"
echo "════════════════════════════════════════════════════"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env file with:"
    echo "  QWEN_API_KEY=your_api_key"
    echo "  QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"
echo ""
echo "Starting servers..."
echo ""
echo "📱 React App: http://localhost:3000"
echo "🔧 API Server: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""
echo "════════════════════════════════════════════════════"
echo ""

# Start both servers using npm-run-all or concurrently
if command -v concurrently &> /dev/null; then
    concurrently "npm start" "npm run server"
else
    # Fallback: run server in background and start React
    echo "Starting API server..."
    npm run server &
    SERVER_PID=$!
    
    echo "Starting React app..."
    npm start
    
    # Cleanup on exit
    kill $SERVER_PID 2>/dev/null
fi
