#!/bin/bash

# Quick Start Script for Fortune Teller App
# This script makes it easy to start the app for local testing

clear

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🔮 Fortune Teller App - Quick Start                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo ""
    echo "Please create a .env file with:"
    echo "  QWEN_API_KEY=your_api_key_here"
    echo "  QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
    echo ""
    exit 1
fi

echo "✅ Environment file found"

# Ensure .env.local exists with increased header size
if [ ! -f .env.local ]; then
    echo "Creating .env.local with optimized settings..."
    cat > .env.local << 'ENVEOF'
DISABLE_ESLINT_PLUGIN=true
NODE_OPTIONS="--max-http-header-size=16384"
ENVEOF
    echo "✅ .env.local created"
fi

# Check for node_modules
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies (this may take a few minutes)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies ready"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Starting Application...                                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📍 API Server:  http://localhost:3001"
echo "📍 React App:   http://localhost:3000 (will open automatically)"
echo ""
echo "💡 Test Burmese text: Switch language to မြန်မာ and generate fortune"
echo "💡 Press Ctrl+C to stop the servers"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Start server in background
echo "🚀 Starting API Server..."
npm run server &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Failed to start API server"
    exit 1
fi

echo "✅ API Server running on port 3001"
echo ""
echo "🚀 Starting React App..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    # Also kill any other node processes on these ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup INT TERM EXIT

# Start React app (this will block)
npm start

# This line won't be reached until npm start exits
cleanup
