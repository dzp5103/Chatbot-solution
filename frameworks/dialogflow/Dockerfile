FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY .env.example .env

# Create non-root user
RUN addgroup -g 1001 -S dialogflow && \
    adduser -S dialogflow -u 1001

# Set ownership
RUN chown -R dialogflow:dialogflow /app
USER dialogflow

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the webhook server
CMD ["npm", "start"]