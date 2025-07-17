FROM rasa/rasa:3.6.20-full

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Rasa project files
COPY . .

# Create user to run Rasa
USER 1001

# Expose ports
EXPOSE 5005

# Train model and run server
CMD ["rasa", "run", "--enable-api", "--cors", "*", "--debug"]