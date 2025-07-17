# Rasa Chatbot Solution

A complete Rasa Open Source implementation with Docker deployment, training data, and custom actions.

## 🚀 Quick Start

```bash
# Clone and start the bot
git clone <repo-url>
cd frameworks/rasa/
docker-compose up -d

# Train the model (optional - pre-trained model included)
docker-compose exec rasa-server rasa train

# Test the bot
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender": "test", "message": "hello"}'
```

## 📋 Prerequisites

- Docker 20.0+
- Docker Compose 2.0+
- 4GB RAM minimum
- Port 5005 available

## 🏗️ Project Structure

```
frameworks/rasa/
├── 📁 actions/                    # Custom action server
│   ├── __init__.py
│   ├── actions.py                # Custom action implementations
│   └── requirements.txt          # Action server dependencies
├── 📁 data/                      # Training data
│   ├── nlu.yml                   # NLU training examples
│   ├── rules.yml                 # Conversation rules
│   └── stories.yml               # Training stories
├── 📁 models/                    # Trained models (generated)
├── 📁 tests/                     # Test conversations
│   └── test_stories.yml
├── 📄 config.yml                 # Model configuration
├── 📄 domain.yml                 # Bot domain definition
├── 📄 endpoints.yml              # External service endpoints
├── 📄 credentials.yml            # Channel credentials
├── 🐳 Dockerfile                 # Production container
├── 🐳 docker-compose.yml         # Development setup
├── 📄 requirements.txt           # Python dependencies
└── 📖 README.md                  # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```bash
# Rasa Configuration
RASA_DEBUG=true
RASA_TOKEN=your_rasa_token_here

# Action Server Configuration  
ACTION_SERVER_HOST=rasa-actions
ACTION_SERVER_PORT=5055

# Database Configuration (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rasa
DB_USER=rasa
DB_PASSWORD=rasa

# External API Keys
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
```

### Model Configuration (config.yml)

The bot uses a hybrid NLU pipeline with:
- **BERT embeddings** for robust intent classification
- **CRF Entity Extractor** for entity recognition  
- **TED Policy** for dialogue management
- **Memoization Policy** for exact story matching

## 🎯 Features

### Supported Intents
- ✅ **greet** - Handle user greetings
- ✅ **goodbye** - Handle farewells
- ✅ **affirm/deny** - Yes/no responses
- ✅ **mood_great/unhappy** - Mood tracking
- ✅ **ask_weather** - Weather information
- ✅ **ask_time** - Current time
- ✅ **book_appointment** - Appointment booking
- ✅ **faq** - Frequently asked questions

### Entity Recognition
- 📅 **date-time** - Dates and times
- 🏙️ **location** - Cities and places  
- 👤 **person** - Names and contacts
- 📧 **email** - Email addresses
- 📞 **phone** - Phone numbers

### Custom Actions
- 🌤️ **Weather lookup** - Real-time weather data
- 📅 **Calendar integration** - Appointment scheduling
- 📊 **Analytics tracking** - Conversation metrics
- 🔍 **Knowledge base search** - FAQ responses

## 🚀 Deployment Options

### 1. Docker Compose (Recommended for Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- **Rasa Server** (port 5005) - Core bot API
- **Action Server** (port 5055) - Custom actions
- **Duckling** (port 8000) - Entity extraction
- **Redis** (port 6379) - Lock store & cache

### 2. Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=rasa

# Access the service
kubectl port-forward service/rasa-server 5005:5005
```

### 3. Production Docker

```bash
# Build production image
docker build -t rasa-chatbot:latest .

# Run with custom configuration
docker run -d \
  --name rasa-bot \
  -p 5005:5005 \
  -e RASA_TOKEN=your_token \
  rasa-chatbot:latest
```

## 🧪 Testing

### Run Test Suite

```bash
# Test NLU model
docker-compose exec rasa-server rasa test nlu

# Test conversation stories
docker-compose exec rasa-server rasa test core

# Run custom action tests
docker-compose exec rasa-actions python -m pytest tests/
```

### Interactive Testing

```bash
# Start interactive session
docker-compose exec rasa-server rasa shell

# Test with debugging
docker-compose exec rasa-server rasa shell --debug
```

### API Testing

```bash
# Test NLU endpoint
curl -X POST http://localhost:5005/model/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "I want to book an appointment for tomorrow"}'

# Test conversation endpoint
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender": "test_user", "message": "hello"}'
```

## 🔧 Customization

### Adding New Intents

1. **Update NLU data** (`data/nlu.yml`):
```yaml
- intent: ask_hours
  examples: |
    - What are your opening hours?
    - When are you open?
    - What time do you close?
```

2. **Add responses** (`domain.yml`):
```yaml
responses:
  utter_hours:
  - text: "We're open Monday-Friday 9AM-6PM, Saturday 10AM-4PM"
```

3. **Create stories** (`data/stories.yml`):
```yaml
- story: ask hours
  steps:
  - intent: ask_hours
  - action: utter_hours
```

### Adding Custom Actions

1. **Create action** (`actions/actions.py`):
```python
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionGetHours(Action):
    def name(self) -> str:
        return "action_get_hours"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, domain: dict) -> list:
        
        hours = self.get_business_hours()
        dispatcher.utter_message(text=f"Our hours: {hours}")
        return []
```

2. **Register action** (`domain.yml`):
```yaml
actions:
  - action_get_hours
```

## 📊 Monitoring & Analytics

### Conversation Analytics

```bash
# View conversation logs
docker-compose logs rasa-server | grep "Received user message"

# Export conversations for analysis
docker-compose exec rasa-server rasa export
```

### Performance Metrics

The bot includes built-in metrics tracking:
- Response time per intent
- Confidence scores
- Fallback rates
- User engagement metrics

Access metrics at: `http://localhost:5005/api/health`

## 🔐 Security Best Practices

### Authentication
```yaml
# credentials.yml
rest:
  webhook_url: "http://localhost:5005/webhooks/rest/webhook"
  
socketio:
  user_message_evt: user_uttered
  bot_message_evt: bot_uttered
  session_persistence: true
  
# Enable token-based auth
rasa:
  url: "http://localhost:5005"
  token: "${RASA_TOKEN}"
```

### Data Privacy
- All conversations stored locally
- No data sent to external services (unless configured)
- GDPR compliance ready
- Configurable data retention policies

## 🚨 Troubleshooting

### Common Issues

**1. Model training fails**
```bash
# Check training data format
docker-compose exec rasa-server rasa data validate

# View detailed training logs
docker-compose exec rasa-server rasa train --debug
```

**2. Action server connection errors**
```bash
# Check action server health
curl http://localhost:5055/health

# Restart action server
docker-compose restart rasa-actions
```

**3. Low confidence predictions**
```bash
# Analyze NLU performance
docker-compose exec rasa-server rasa test nlu --cross-validation

# View intent confusion matrix
docker-compose exec rasa-server rasa test nlu --confusion-matrix
```

### Performance Optimization

**Memory Usage**
```bash
# Monitor container memory
docker stats

# Optimize model pipeline
# Edit config.yml to use lighter components
```

**Response Time**
```bash
# Enable caching
# Edit endpoints.yml to configure Redis cache

# Use smaller embedding models
# Modify config.yml pipeline
```

## 📚 Additional Resources

- [Rasa Documentation](https://rasa.com/docs/)
- [Rasa Community Forum](https://forum.rasa.com/)
- [Rasa GitHub Repository](https://github.com/rasahq/rasa)
- [Training Data Format](https://rasa.com/docs/rasa/training-data-format/)
- [Custom Actions Guide](https://rasa.com/docs/rasa/custom-actions/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🏷️ Version

**Current Version**: 1.0.0  
**Rasa Version**: 3.6.x  
**Python Version**: 3.10+  
**Last Updated**: 2024