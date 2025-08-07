#!/bin/bash

echo "🏥 Starting Doctor Booking Application..."
echo

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if db.json exists
if [ ! -f "db.json" ]; then
    echo "❌ Error: db.json not found. Please ensure the database file exists."
    exit 1
fi

echo "🚀 Starting JSON Server on port 3001..."
npm run json-server &
JSON_SERVER_PID=$!

# Wait a moment for JSON server to start
sleep 3

echo "🌐 Starting Next.js development server..."
npm run dev &
NEXT_PID=$!

echo
echo "✅ Servers started successfully!"
echo "📊 JSON Server: http://localhost:3001"
echo "🖥️  Next.js App: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
wait

# Cleanup function
cleanup() {
    echo
    echo "🛑 Stopping servers..."
    kill $JSON_SERVER_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    echo "✅ Servers stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT
