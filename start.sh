#!/bin/bash

# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Start Next.js on port 3000
echo "Starting Next.js on port 3000..."
npm run dev

# The npm script now explicitly uses port 3000 (-p 3000)