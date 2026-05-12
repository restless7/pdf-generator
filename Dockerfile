# Use Node.js with additional system packages for Puppeteer
FROM node:20-bullseye-slim

# Install system dependencies for Puppeteer and Chromium
RUN apt-get update \
    && apt-get install -y \
        chromium \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        xvfb \
        curl \
        --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set environment variables
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build:server

# Set production environment and prune dev dependencies
ENV NODE_ENV=production
RUN npm prune --production

# Create necessary directories
RUN mkdir -p output cache temp templates

# Expose port
EXPOSE ${PORT:-4000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-4000}/api/health || exit 1

# Start the application
CMD ["npm", "start"]