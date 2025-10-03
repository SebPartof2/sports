#!/bin/bash

# Build and deploy script for Cloudflare Pages

echo "Building MLB Scores Website for Cloudflare Pages..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Build the project
echo "Building project..."
npm run build

# Build for Cloudflare Pages
echo "Building for Cloudflare Pages..."
npm run pages:build

echo "Build complete! Ready for deployment."
echo "To deploy, run: npm run pages:deploy"
echo "Or connect your repository to Cloudflare Pages dashboard."