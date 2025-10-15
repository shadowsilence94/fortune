#!/bin/bash

echo "Starting Fortune Teller App..."

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

# Start React app
echo "Starting React app on port 3000..."
npm start &
REACT_PID=$!

echo "Server PID: $SERVER_PID"
echo "React PID: $REACT_PID"
echo "Both services are starting..."
echo "Server: http://localhost:3001"
echo "React App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $SERVER_PID 2>/dev/null || true
    kill $REACT_PID 2>/dev/null || true
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
