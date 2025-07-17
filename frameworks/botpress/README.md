# Botpress Chatbot Solution

A complete Botpress chatbot implementation with custom flows, actions, and deployment configurations.

## 🚀 Quick Start

```bash
# Install and start Botpress
git clone <repo-url>
cd frameworks/botpress/
npm install
npm start

# Access Botpress Studio at http://localhost:3000
# Default admin: admin / Password: 123456
```

## 📋 Prerequisites

- Node.js 18+ and npm
- 4GB RAM minimum
- Port 3000 available
- Docker (optional, for containerized deployment)

## 🏗️ Project Structure

```
frameworks/botpress/
├── 📁 actions/                    # Custom actions and hooks
│   ├── builtin/                  # Built-in action overrides
│   ├── custom/                   # Custom TypeScript actions
│   └── hooks/                    # Lifecycle hooks
├── 📁 flows/                     # Conversation flows
│   ├── main.flow.json           # Main conversation flow
│   ├── faq.flow.json            # FAQ handling flow
│   └── appointment.flow.json     # Appointment booking flow
├── 📁 intents/                   # NLU intents
│   ├── greeting.intent.json     # Greeting intent
│   ├── goodbye.intent.json      # Goodbye intent
│   └── booking.intent.json      # Booking intent
├── 📁 entities/                  # Entity definitions
│   ├── date.entity.json         # Date entity
│   └── location.entity.json     # Location entity
├── 📁 config/                    # Configuration files
│   ├── bot.config.json          # Bot configuration
│   └── module.config.json       # Module configuration
├── 📁 media/                     # Static assets
├── 📄 package.json              # Node.js dependencies
├── 🐳 Dockerfile                # Production container
├── 🐳 docker-compose.yml        # Development setup
└── 📖 README.md                 # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```bash
# Botpress Configuration
BP_HOST=0.0.0.0
BP_PORT=3000
BP_PRODUCTION=false

# Database Configuration
DATABASE_URL=postgres://postgres:password@localhost:5432/botpress

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# External Services
WEATHER_API_KEY=your_weather_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Channels
TELEGRAM_BOT_TOKEN=your_telegram_token
SLACK_BOT_TOKEN=your_slack_token
FACEBOOK_APP_SECRET=your_facebook_secret
```

## 🎯 Features

### Conversation Flows
- ✅ **Greeting Flow** - Welcome users and gather context
- ✅ **FAQ Flow** - Handle frequently asked questions
- ✅ **Appointment Booking** - Schedule appointments with calendar integration
- ✅ **Support Escalation** - Handoff to human agents
- ✅ **Fallback Handling** - Graceful error handling

### NLU Capabilities
- 📝 **Intent Recognition** - 15+ predefined intents
- 🏷️ **Entity Extraction** - Dates, locations, names, emails
- 🌐 **Multi-language Support** - English, Spanish, French
- 🎯 **Confidence Scoring** - Adjustable thresholds

### Custom Actions
- 🌤️ **Weather API Integration** - Real-time weather data
- 📅 **Calendar Integration** - Google Calendar sync
- 📧 **Email Notifications** - Automated confirmations
- 🔍 **Knowledge Base Search** - FAQ database lookup

## 🚀 Deployment Options

### 1. Development Mode

```bash
# Start in development mode
npm run dev

# Access Botpress Studio
open http://localhost:3000
```

### 2. Docker Compose (Recommended)

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f botpress

# Stop services
docker-compose down
```

Services included:
- **Botpress Server** (port 3000) - Main application
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Session storage
- **Nginx** (port 80) - Reverse proxy

### 3. Production Docker

```bash
# Build production image
docker build -t botpress-chatbot:latest .

# Run production container
docker run -d \
  --name botpress-bot \
  -p 3000:3000 \
  -e BP_PRODUCTION=true \
  -e DATABASE_URL=your_db_url \
  botpress-chatbot:latest
```

### 4. Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=botpress

# Access service
kubectl port-forward service/botpress 3000:3000
```

## 🧪 Testing

### Conversation Testing

```bash
# Run conversation tests
npm run test:conversations

# Test specific flow
npm run test:flow -- --flow=appointment

# Run with coverage
npm run test:coverage
```

### API Testing

```bash
# Test webhook endpoints
curl -X POST http://localhost:3000/api/v1/bots/test-bot/converse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"text": "Hello", "userId": "test-user"}'

# Test NLU endpoint
curl -X POST http://localhost:3000/api/v1/bots/test-bot/nlu/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"text": "Book an appointment for tomorrow"}'
```

### Load Testing

```bash
# Install Artillery for load testing
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

## 🔧 Customization

### Creating Custom Actions

1. **Create action file** (`actions/custom/my-action.ts`):
```typescript
import { CustomActionProps } from 'botpress'

export const myCustomAction = async (props: CustomActionProps) => {
  const { conversation, user, event, args } = props
  
  // Your custom logic here
  const result = await performCustomLogic(args.input)
  
  await conversation.say({
    type: 'text',
    text: `Result: ${result}`
  })
}

async function performCustomLogic(input: string): Promise<string> {
  // Implementation here
  return `Processed: ${input}`
}
```

2. **Register action** in `bot.config.json`:
```json
{
  "actions": {
    "myCustomAction": "./actions/custom/my-action"
  }
}
```

### Adding New Intents

1. **Create intent file** (`intents/my-intent.intent.json`):
```json
{
  "name": "my-intent",
  "examples": [
    "I need help with my order",
    "Where is my package",
    "Track my shipment"
  ],
  "confidence": 0.7
}
```

2. **Add to flow** (`flows/main.flow.json`):
```json
{
  "nodes": [
    {
      "id": "handle-my-intent",
      "type": "listen",
      "conditions": [
        {
          "intent": "my-intent",
          "confidence": 0.7
        }
      ],
      "transitions": ["my-intent-response"]
    }
  ]
}
```

### Creating Conversation Flows

Use Botpress Studio visual flow builder or define flows in JSON:

```json
{
  "version": "1.0",
  "startNode": "welcome",
  "nodes": [
    {
      "id": "welcome",
      "type": "say",
      "content": {
        "text": "Welcome! How can I help you today?"
      },
      "transitions": ["listen-intent"]
    },
    {
      "id": "listen-intent",
      "type": "listen",
      "conditions": [
        {
          "intent": "greeting",
          "confidence": 0.7
        }
      ],
      "transitions": ["greeting-response"]
    }
  ]
}
```

## 📊 Analytics & Monitoring

### Built-in Analytics

Access analytics at: `http://localhost:3000/admin/analytics`

Metrics include:
- Conversation volume
- Intent recognition accuracy
- User engagement
- Flow completion rates

### Custom Analytics

```typescript
// Track custom events
await bp.events.track('custom-event', {
  userId: user.id,
  data: { action: 'button-click', value: 'book-appointment' }
})

// Query analytics
const analytics = await bp.analytics.query({
  metric: 'conversations',
  timeframe: '7d',
  filters: { intent: 'booking' }
})
```

## 🔐 Security Best Practices

### Authentication Configuration

```json
{
  "auth": {
    "enabled": true,
    "jwt": {
      "secret": "${JWT_SECRET}",
      "expiration": "1h"
    },
    "oauth": {
      "google": {
        "clientId": "${GOOGLE_CLIENT_ID}",
        "clientSecret": "${GOOGLE_CLIENT_SECRET}"
      }
    }
  }
}
```

### Data Encryption

```typescript
// Encrypt sensitive data
const encrypted = await bp.security.encrypt(sensitiveData)
await bp.kvs.set(userId, 'encrypted-data', encrypted)

// Decrypt when needed
const decrypted = await bp.security.decrypt(encrypted)
```

## 🚨 Troubleshooting

### Common Issues

**1. Bot not responding**
```bash
# Check bot status
curl http://localhost:3000/api/v1/health

# Restart bot
npm restart
```

**2. NLU training issues**
```bash
# Retrain NLU
npm run train

# Validate training data
npm run validate
```

**3. Database connection errors**
```bash
# Check database connectivity
npm run db:check

# Run migrations
npm run db:migrate
```

### Performance Optimization

**Memory Usage**
```bash
# Monitor memory usage
docker stats botpress

# Optimize flows
# Reduce complexity in conversation flows
```

**Response Time**
```bash
# Enable caching
# Configure Redis for session storage

# Optimize database queries
# Add proper indexes
```

## 📚 Additional Resources

- [Botpress Documentation](https://botpress.com/docs/)
- [Botpress Community](https://discord.gg/botpress)
- [GitHub Repository](https://github.com/botpress/botpress)
- [Flow Builder Guide](https://botpress.com/docs/building-chatbots/flow-builder/)
- [Custom Actions Guide](https://botpress.com/docs/building-chatbots/custom-actions/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Test your changes (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏷️ Version

**Current Version**: 1.0.0  
**Botpress Version**: 12.26.x  
**Node.js Version**: 18+  
**Last Updated**: 2024