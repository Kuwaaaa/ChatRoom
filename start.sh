#!/bin/bash

echo "Starting WebRTC P2P Video Room..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if .next exists
if [ ! -d ".next" ]; then
    echo "Building project..."
    npm run build
    echo ""
fi

# Create data directory if not exists
mkdir -p data

# Create logs directory if not exists
mkdir -p logs

echo "Starting server..."
npm run dev
