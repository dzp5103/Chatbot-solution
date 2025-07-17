# Rasa Chatbot Solution

A complete Rasa Open Source chatbot implementation with training data, custom actions, and deployment configurations.

## Quick Start

```bash
# 1. Install dependencies
pip install rasa[full]

# 2. Train the model
rasa train

# 3. Run the chatbot
rasa run actions &  # Start action server
rasa shell          # Interactive chat
```

## Prerequisites

- Python 3.8+
- pip or conda
- 2GB RAM minimum
- Internet connection for initial model downloads

## Installation

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Rasa
pip install rasa[full]==3.6.4

# Install additional dependencies
pip install -r requirements.txt

# Download language model
python -m spacy download en_core_web_md
```

### Docker Installation

```bash
# Build the image
docker build -t rasa-chatbot .

# Run the container
docker run -p 5005:5005 rasa-chatbot
```

## Project Structure

```
rasa/
├── actions/           # Custom action code
├── data/             # Training data
├── models/           # Trained models
├── tests/            # Test conversations
├── config.yml       # Rasa pipeline configuration
├── domain.yml       # Bot domain definition
├── endpoints.yml    # External service endpoints
├── credentials.yml  # Channel credentials
└── README.md        # This file
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
RASA_MODEL_PATH=./models
RASA_ACTION_ENDPOINT=http://localhost:5055/webhook
DATABASE_URL=sqlite:///rasa.db
```

### Training Data Customization

Edit `data/nlu.yml` to add your training examples:

```yaml
version: "3.1"
nlu:
- intent: greet
  examples: |
    - hey
    - hello
    - hi
    - hello there
    - good morning
```

## Training

```bash
# Train NLU and Core models
rasa train

# Train only NLU
rasa train nlu

# Train only Core
rasa train core
```

## Testing

```bash
# Test NLU model
rasa test nlu

# Test conversation flows
rasa test core

# Interactive learning
rasa interactive
```

## Deployment Options

### 1. Local Development
```bash
rasa run --enable-api --cors "*"
```

### 2. Docker
```bash
docker-compose up
```

### 3. Kubernetes
```bash
kubectl apply -f k8s/
```

### 4. Cloud Functions
See `deployment/cloud-functions/` directory

## API Usage

### Send Message
```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender": "user", "message": "hello"}'
```

### Response Format
```json
[
  {
    "recipient_id": "user",
    "text": "Hello! How can I help you today?"
  }
]
```

## Monitoring

### Conversation Analytics
- Enable analytics in `endpoints.yml`
- View metrics at `http://localhost:5005/api/conversations`

### Performance Metrics
```bash
# Check model performance
rasa test --stories tests/test_stories.yml
```

## Troubleshooting

### Common Issues

1. **Model Training Fails**
   ```bash
   # Clear cache and retrain
   rm -rf .rasa
   rasa train --force
   ```

2. **Action Server Connection Error**
   ```bash
   # Ensure action server is running
   rasa run actions --port 5055
   ```

3. **Memory Issues**
   ```bash
   # Reduce batch size in config.yml
   policies:
   - name: TEDPolicy
     batch_size: [32, 64]
   ```

## Advanced Features

### Custom Actions
See `actions/actions.py` for examples of:
- API integrations
- Database queries
- Form validations
- Slot manipulations

### Multi-language Support
```yaml
# In config.yml
language: en
pipeline:
  - name: SpacyNLP
    model: "en_core_web_md"
```

### Integration Examples
- REST API endpoints
- Database connections
- External service calls
- Webhook integrations

## Security

### Best Practices
- Store secrets in environment variables
- Use HTTPS in production
- Implement rate limiting
- Validate user inputs
- Regular security updates

### Authentication
```python
# Add to actions/actions.py
from rasa_sdk.events import SessionStarted

class ActionSessionStart(Action):
    def name(self) -> Text:
        return "action_session_start"

    def run(self, dispatcher, tracker, domain):
        # Add authentication logic
        return [SessionStarted()]
```

## Performance Optimization

### Model Optimization
```yaml
# Optimize pipeline in config.yml
pipeline:
  - name: WhitespaceTokenizer
  - name: CountVectorsFeaturizer
  - name: DIETClassifier
    epochs: 100
    random_seed: 1
```

### Caching
```yaml
# Enable caching
policies:
  - name: MemoizationPolicy
    max_history: 3
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- [Rasa Documentation](https://rasa.com/docs/)
- [Community Forum](https://forum.rasa.com/)
- [GitHub Issues](https://github.com/your-repo/issues)

## Changelog

### v1.0.0
- Initial release with basic conversation flow
- Docker support
- Kubernetes deployment manifests
- Custom actions for weather and FAQ