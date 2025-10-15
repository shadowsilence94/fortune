#!/bin/bash

echo "🔮 Starting Fortune Teller App..."

# Kill any existing processes on ports 3000 and 3001
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start the server in background
echo "Starting server on port 3001..."
node server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the React app
echo "Starting React app on port 3000..."
npm start &
CLIENT_PID=$!

echo "✅ Server running on http://localhost:3001"
echo "✅ Client running on http://localhost:3000"
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $SERVER_PID 2>/dev/null || true
    kill $CLIENT_PID 2>/dev/null || true
    exit
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
