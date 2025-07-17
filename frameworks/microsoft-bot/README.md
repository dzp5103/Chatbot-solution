# Microsoft Bot Framework Implementation

A comprehensive implementation of the Microsoft Bot Framework with multi-channel support, adaptive cards, and Azure integration.

## 🎯 Overview

This implementation provides:
- **Multi-channel Support**: Teams, Slack, Telegram, Web Chat, Email
- **Adaptive Cards**: Rich interactive UI components
- **Conversation State Management**: User and conversation state persistence
- **Azure Integration**: Bot Service, Cognitive Services, QnA Maker
- **Enterprise Features**: Authentication, middleware, telemetry

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Azure subscription (for cloud deployment)
- Bot Framework Emulator for testing

### Local Development
```bash
# Install dependencies
npm install

# Start the bot
npm start

# Test with Bot Framework Emulator
# Connect to: http://localhost:3978/api/messages
```

### Azure Deployment
```bash
# Deploy to Azure Bot Service
az bot prepare-deploy --lang Javascript --code-dir "."
az webapp deployment source config-zip --resource-group myResourceGroup --name myBotApp --src bot.zip
```

## 📁 Project Structure

```
microsoft-bot/
├── src/
│   ├── bot.js                 # Main bot logic
│   ├── dialogs/              # Conversation dialogs
│   │   ├── mainDialog.js     # Root dialog
│   │   ├── bookingDialog.js  # Booking flow
│   │   └── profileDialog.js  # User profile
│   ├── cards/                # Adaptive cards
│   │   ├── welcomeCard.json  # Welcome card template
│   │   └── bookingCard.json  # Booking confirmation
│   ├── middleware/           # Custom middleware
│   │   ├── logger.js         # Logging middleware
│   │   └── telemetry.js      # Analytics middleware
│   └── services/             # External integrations
│       ├── qnaService.js     # QnA Maker service
│       └── luisService.js    # LUIS NLU service
├── test/                     # Unit and integration tests
├── deployment/               # Azure deployment configs
├── package.json              # Dependencies and scripts
├── .env.example             # Environment template
└── README.md                # This file
```

## 🤖 Bot Features

### Conversation Management
- **Multi-turn Dialogs**: Complex conversation flows
- **State Persistence**: User preferences and context
- **Interruption Handling**: Natural conversation interruptions
- **Rich Responses**: Adaptive cards, quick replies, suggestions

### Integrations
- **LUIS**: Natural language understanding
- **QnA Maker**: Knowledge base integration
- **Azure Cognitive Services**: Vision, Speech, Translator
- **Custom APIs**: External service integration

### Channels Supported
- Microsoft Teams
- Slack
- Telegram
- Facebook Messenger
- Web Chat
- Email
- SMS (via Twilio)

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Bot Framework Emulator
1. Download from: https://github.com/Microsoft/BotFramework-Emulator
2. Connect to: `http://localhost:3978/api/messages`
3. Test conversation flows and adaptive cards

## 🚀 Deployment Options

### Azure Bot Service
```bash
# Create Azure resources
az group create --name myResourceGroup --location "East US"
az botservice create --resource-group myResourceGroup --name myBot --kind webapp --sdk-version v4

# Deploy bot code
npm run deploy:azure
```

### Docker Deployment
```bash
# Build container
docker build -t microsoft-bot .

# Run locally
docker run -p 3978:3978 microsoft-bot

# Deploy to container service
docker push myregistry/microsoft-bot:latest
```

### Local Development
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## 🔧 Configuration

### Environment Variables
```bash
# Bot Framework
MicrosoftAppId=your-app-id
MicrosoftAppPassword=your-app-password
MicrosoftAppType=MultiTenant

# Azure Services
LuisAppId=your-luis-app-id
LuisAPIKey=your-luis-key
LuisAPIHostName=your-luis-hostname

QnAKnowledgebaseId=your-qna-kb-id
QnAAuthKey=your-qna-auth-key
QnAEndpointHostName=your-qna-hostname

# Database
CosmosDbEndpoint=your-cosmos-endpoint
CosmosDbAuthKey=your-cosmos-key
CosmosDbDatabaseId=your-database-id
CosmosDbContainerId=your-container-id
```

### Adaptive Cards
The bot includes several pre-built adaptive cards:
- Welcome card with action buttons
- Booking confirmation with form inputs
- Status cards with progress indicators
- Rich media cards with images and videos

## 📊 Analytics & Monitoring

### Application Insights
```javascript
// Automatic telemetry collection
const { TelemetryLoggerMiddleware } = require('botbuilder-applicationinsights');

// Track custom events
this.telemetryClient.trackEvent({
    name: 'UserBooking',
    properties: { userId, bookingType, timestamp }
});
```

### Bot Analytics Dashboard
- Conversation metrics
- User engagement patterns
- Performance monitoring
- Error tracking and alerts

## 🔒 Security Features

### Authentication
- Azure AD integration
- OAuth 2.0 support
- Multi-factor authentication
- Role-based access control

### Data Protection
- Conversation data encryption
- PII detection and masking
- GDPR compliance features
- Audit logging

## 🌟 Advanced Features

### Proactive Messaging
```javascript
// Send proactive messages to users
await adapter.continueConversation(conversationReference, async (context) => {
    await context.sendActivity('Your appointment is in 1 hour!');
});
```

### Skill Integration
- Integrate with Bot Framework Skills
- Compose multiple specialized bots
- Centralized skill management

### Custom Middleware
- Request/response logging
- Content moderation
- Rate limiting
- Custom authentication

## 📚 Learning Resources

### Official Documentation
- [Bot Framework Documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Bot Framework Emulator](https://github.com/Microsoft/BotFramework-Emulator)

### Samples and Tutorials
- [Bot Builder Samples](https://github.com/Microsoft/BotBuilder-Samples)
- [Adaptive Cards Samples](https://github.com/Microsoft/AdaptiveCards)
- [Azure Bot Service Tutorials](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-tutorial)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

For issues and questions:
- Check the [troubleshooting guide](../../documentation/troubleshooting/)
- Review [Bot Framework documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- Open an issue in this repository