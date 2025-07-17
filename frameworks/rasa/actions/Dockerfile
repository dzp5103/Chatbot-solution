FROM rasa/rasa-sdk:3.6.1

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy actions
COPY . .

# Expose port
EXPOSE 5055

# Run action server
CMD ["rasa", "run", "actions", "--debug"]