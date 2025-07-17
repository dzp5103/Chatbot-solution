# Multi-stage Docker build for Rasa chatbot
FROM python:3.11-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application files
COPY . .

# Train the model
RUN rasa train --config config.yml --domain domain.yml --data data/

# Production stage
FROM python:3.11-slim as production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy from base stage
COPY --from=base /root/.local /root/.local
COPY --from=base /app .

# Make sure scripts are executable
ENV PATH=/root/.local/bin:$PATH

# Expose ports
EXPOSE 5005 5055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5005/status || exit 1

# Default command
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--port", "5005"]