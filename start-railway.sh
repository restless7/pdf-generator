#!/bin/bash

echo "🔍 Railway PDF Generator - Finding Chromium..."

# Common paths where chromium might be installed in Nixpacks
POSSIBLE_PATHS=(
  "/usr/bin/chromium"
  "/usr/bin/chromium-browser"
  "/nix/store/*/bin/chromium"
  "/usr/bin/google-chrome"
  "/usr/bin/google-chrome-stable"
)

CHROMIUM_PATH=""

# Find the first available chromium installation
for path in "${POSSIBLE_PATHS[@]}"; do
  if [ -f "$path" ] || ls $path 2>/dev/null; then
    CHROMIUM_PATH="$path"
    echo "✅ Found Chromium at: $CHROMIUM_PATH"
    break
  fi
done

# If not found with direct paths, try which command
if [ -z "$CHROMIUM_PATH" ]; then
  CHROMIUM_PATH=$(which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which google-chrome 2>/dev/null)
  if [ -n "$CHROMIUM_PATH" ]; then
    echo "✅ Found Chromium via which: $CHROMIUM_PATH"
  fi
fi

# Set the environment variable
if [ -n "$CHROMIUM_PATH" ]; then
  export PUPPETEER_EXECUTABLE_PATH="$CHROMIUM_PATH"
  echo "🎯 Set PUPPETEER_EXECUTABLE_PATH=$PUPPETEER_EXECUTABLE_PATH"
else
  echo "⚠️  Warning: Chromium not found, using Puppeteer default"
fi

# Print environment info
echo "🔧 Environment Configuration:"
echo "   NODE_ENV=$NODE_ENV"
echo "   PORT=$PORT"
echo "   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"
echo "   PUPPETEER_EXECUTABLE_PATH=$PUPPETEER_EXECUTABLE_PATH"

# Start the application
echo "🚀 Starting PDF Generator Service..."
exec npm start