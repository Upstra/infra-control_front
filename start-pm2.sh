#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Build with production environment variables
echo "Building application..."
VITE_API_URL=http://localhost:80 pnpm build

# Start with PM2
echo "Starting with PM2 on port 80..."
pm2 start ecosystem.config.cjs

# Show status
pm2 status