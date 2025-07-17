# ChatterBot Python Solution

A simple yet powerful Python chatbot implementation using the ChatterBot library with machine learning capabilities.

## 🚀 Quick Start

```bash
# Install and run the chatbot
git clone <repo-url>
cd frameworks/chatterbot/
pip install -r requirements.txt
python src/main.py

# Or use Docker
docker-compose up -d
```

## 📋 Prerequisites

- Python 3.8+
- pip or pipenv
- 2GB RAM minimum
- SQLite (included) or PostgreSQL/MySQL (optional)

## 🏗️ Project Structure

```
frameworks/chatterbot/
├── 📁 src/                       # Source code
│   ├── main.py                  # Main chatbot application
│   ├── chatbot.py               # Core chatbot class
│   ├── trainers/                # Training modules
│   │   ├── corpus_trainer.py    # Corpus-based training
│   │   └── list_trainer.py      # List-based training
│   ├── adapters/                # Custom adapters
│   │   ├── logic_adapter.py     # Logic processing
│   │   └── storage_adapter.py   # Database storage
│   └── utils/                   # Utility functions
│       ├── preprocessor.py      # Text preprocessing
│       └── config.py            # Configuration helper
├── 📁 data/                     # Training data
│   ├── conversations/           # Conversation datasets
│   ├── corpus/                  # Training corpus files
│   └── custom/                  # Custom training data
├── 📁 tests/                    # Test files
│   ├── test_chatbot.py         # Unit tests
│   └── test_training.py        # Training tests
├── 📁 config/                   # Configuration files
│   ├── settings.py             # Application settings
│   └── database.py             # Database configuration
├── 📁 web/                      # Web interface (optional)
│   ├── app.py                  # Flask web app
│   ├── templates/              # HTML templates
│   └── static/                 # CSS/JS assets
├── 📄 requirements.txt          # Python dependencies
├── 🐳 Dockerfile              # Production container
├── 🐳 docker-compose.yml       # Development setup
└── 📖 README.md                # This file
```

## ⚙️ Features

### Core Capabilities
- ✅ **Machine Learning** - Learns from conversations
- ✅ **Corpus Training** - Pre-trained on conversation datasets
- ✅ **Custom Training** - Train with your own data
- ✅ **Multiple Adapters** - Pluggable logic and storage adapters
- ✅ **Web Interface** - Optional Flask web UI
- ✅ **API Endpoints** - RESTful API for integration

### Supported Languages
- 🇺🇸 **English** - Full support with extensive corpus
- 🇪🇸 **Spanish** - Basic conversation support
- 🇫🇷 **French** - Limited conversation support
- 🇩🇪 **German** - Basic greetings and responses

### Training Options
- 📚 **English Corpus** - Pre-built conversation datasets
- 📝 **Custom Lists** - Train with specific conversation pairs
- 🔄 **Continuous Learning** - Learn from user interactions
- 📊 **Conversation Logs** - Train from chat histories

## 🚀 Usage Examples

### Basic Console Chat

```python
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

# Create chatbot instance
chatbot = ChatBot('Simple Bot',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    logic_adapters=[
        'chatterbot.logic.BestMatch',
        'chatterbot.logic.TimeLogicAdapter',
        'chatterbot.logic.MathematicalEvaluation'
    ],
    database_uri='sqlite:///database.sqlite3'
)

# Train the chatbot
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train("chatterbot.corpus.english")

# Start conversation
while True:
    try:
        user_input = input("You: ")
        if user_input.lower() in ['quit', 'exit', 'bye']:
            break
        response = chatbot.get_response(user_input)
        print(f"Bot: {response}")
    except KeyboardInterrupt:
        break
```

### Web Interface

```python
from flask import Flask, render_template, request, jsonify
from chatterbot import ChatBot

app = Flask(__name__)

# Initialize chatbot
chatbot = ChatBot('Web Bot')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    response = chatbot.get_response(user_message)
    return jsonify({'response': str(response)})

if __name__ == '__main__':
    app.run(debug=True)
```

### Custom Training

```python
from chatterbot.trainers import ListTrainer

# Train with custom conversation pairs
trainer = ListTrainer(chatbot)

custom_conversations = [
    "Hello",
    "Hi there!",
    "How are you?",
    "I'm doing well, thank you!",
    "What's the weather like?",
    "I don't have access to weather data, but you can check a weather app!",
    "Can you help me with programming?",
    "I'd be happy to help! What programming language are you working with?"
]

trainer.train(custom_conversations)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Database Configuration
DATABASE_URI=sqlite:///chatbot.sqlite3
# DATABASE_URI=postgresql://user:pass@localhost/chatbot
# DATABASE_URI=mysql://user:pass@localhost/chatbot

# Training Configuration
AUTO_TRAIN=true
CORPUS_LANGUAGE=english
CONVERSATION_LOG_ENABLED=true

# Web Interface
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=false

# API Configuration
API_ENABLED=true
API_KEY=your_api_key_here

# Logging
LOG_LEVEL=INFO
LOG_FILE=chatbot.log
```

### Custom Logic Adapters

```python
from chatterbot.logic import LogicAdapter
from chatterbot.conversation import Statement

class WeatherAdapter(LogicAdapter):
    """Custom adapter for weather-related queries."""
    
    def __init__(self, chatbot, **kwargs):
        super().__init__(chatbot, **kwargs)
        self.weather_keywords = ['weather', 'temperature', 'rain', 'sunny']
    
    def can_process(self, statement):
        # Check if statement is weather-related
        words = statement.text.lower().split()
        return any(keyword in words for keyword in self.weather_keywords)
    
    def process(self, input_statement, additional_response_selection_parameters=None):
        # Process weather query
        response = Statement(
            text="I don't have access to real-time weather data. Please check a weather app or website!"
        )
        response.confidence = 0.8
        return response
```

## 🚀 Deployment Options

### 1. Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run console version
python src/main.py

# Run web interface
python src/web/app.py
```

### 2. Docker Deployment

```bash
# Build and run with Docker
docker build -t chatterbot-app .
docker run -p 5000:5000 chatterbot-app

# Or use Docker Compose
docker-compose up -d
```

### 3. Production Deployment

```bash
# Using Gunicorn for production
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 src.web.app:app

# Using systemd service
sudo cp scripts/chatterbot.service /etc/systemd/system/
sudo systemctl enable chatterbot
sudo systemctl start chatterbot
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_chatbot.py

# Run with coverage
python -m pytest --cov=src tests/
```

### Training Tests

```bash
# Test corpus training
python tests/test_training.py

# Test custom training
python -c "
from src.chatbot import SimpleChatBot
bot = SimpleChatBot()
bot.train_custom(['Hello', 'Hi there!'])
print('Training successful!')
"
```

### Conversation Testing

```bash
# Interactive testing
python src/test_conversation.py

# Automated conversation tests
python tests/test_conversations.py
```

## 📊 Performance & Analytics

### Conversation Logging

```python
# Enable conversation logging
chatbot = ChatBot('Analytics Bot',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri='sqlite:///chatbot.sqlite3',
    logger=chatterbot.ChatBot.logger
)

# Access conversation history
conversations = chatbot.storage.filter()
for conversation in conversations:
    print(f"Input: {conversation.text}")
```

### Response Time Optimization

```python
# Optimize database queries
chatbot = ChatBot('Fast Bot',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri='sqlite:///chatbot.sqlite3',
    read_only=True  # Faster for production
)

# Use caching for frequently asked questions
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_response(input_text):
    return chatbot.get_response(input_text)
```

## 🔐 Security Considerations

### Input Sanitization

```python
import re
from html import escape

def sanitize_input(user_input):
    # Remove HTML tags
    clean_input = re.sub(r'<[^>]+>', '', user_input)
    # Escape special characters
    clean_input = escape(clean_input)
    # Limit input length
    clean_input = clean_input[:500]
    return clean_input

# Use in conversation
user_input = sanitize_input(request.form['message'])
response = chatbot.get_response(user_input)
```

### Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/chat', methods=['POST'])
@limiter.limit("10 per minute")
def chat():
    # Handle chat request
    pass
```

## 🚨 Troubleshooting

### Common Issues

**1. Training takes too long**
```python
# Use smaller corpus
trainer.train("chatterbot.corpus.english.greetings")
# Instead of full corpus
trainer.train("chatterbot.corpus.english")
```

**2. Database connection errors**
```bash
# Check database file permissions
ls -la database.sqlite3

# Reset database
rm database.sqlite3
python src/main.py  # Will recreate database
```

**3. Low response quality**
```python
# Increase training data
trainer.train([
    "More conversation pairs",
    "Better responses",
    "Specific to your domain"
])

# Use multiple logic adapters
logic_adapters=[
    'chatterbot.logic.BestMatch',
    'chatterbot.logic.TimeLogicAdapter',
    'custom_adapters.DomainSpecificAdapter'
]
```

### Performance Optimization

```python
# Use SQL storage for better performance
storage_adapter='chatterbot.storage.SQLStorageAdapter'

# Enable read-only mode for production
read_only=True

# Limit search distance for faster responses
'chatterbot.logic.BestMatch': {
    'default_response': 'I am sorry, I do not understand.',
    'maximum_similarity_threshold': 0.90
}
```

## 📚 Additional Resources

- [ChatterBot Documentation](https://chatterbot.readthedocs.io/)
- [Python ChatterBot GitHub](https://github.com/gunthercox/ChatterBot)
- [Training Data Sources](https://github.com/gunthercox/chatterbot-corpus)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLite Documentation](https://sqlite.org/docs.html)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details.

## 🏷️ Version

**Current Version**: 1.0.0  
**ChatterBot Version**: 1.0.8  
**Python Version**: 3.8+  
**Last Updated**: 2024