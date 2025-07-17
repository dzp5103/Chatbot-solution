# Botpress Chatbot Solution

A complete Botpress chatbot implementation with visual conversation flows, custom actions, and multi-channel deployment.

## Quick Start

```bash
# 1. Install Botpress CLI
npm install -g @botpress/cli

# 2. Create and run bot
bp create my-bot
cd my-bot
bp serve
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser
- 4GB RAM minimum

## Installation

### Local Development

```bash
# Install Botpress CLI globally
npm install -g @botpress/cli

# Create new bot (or use this existing configuration)
bp create --template basic-bot my-chatbot

# Navigate to bot directory
cd botpress-chatbot

# Install dependencies
npm install

# Start development server
bp serve
```

### Using Docker

```bash
# Build and run with Docker
docker build -t botpress-chatbot .
docker run -p 3000:3000 botpress-chatbot
```

## Project Structure

```
botpress/
├── actions/          # Custom action code
├── flows/            # Conversation flows
├── hooks/            # Lifecycle hooks
├── modules/          # Custom modules
├── assets/           # Static assets
├── intents/          # NLU intents
├── entities/         # NLU entities
├── bot.config.ts     # Bot configuration
├── botpress.config.ts # Global configuration
└── package.json      # Dependencies
```

## Configuration

### Bot Configuration

```typescript
// bot.config.ts
import { IntegrationDefinition } from '@botpress/sdk'

export default {
  integrations: {
    telegram: {},
    slack: {},
    webchat: {}
  },
  conversation: {
    tags: {
      greeting: {},
      support: {},
      booking: {}
    }
  },
  states: {
    user: {
      name: {
        type: 'string'
      },
      preferences: {
        type: 'object'
      }
    },
    conversation: {
      topic: {
        type: 'string'
      }
    }
  }
}
```

### Environment Variables

Create `.env` file:

```bash
# Botpress Configuration
BP_CONFIG_HTTPSERVER_HOST=0.0.0.0
BP_CONFIG_HTTPSERVER_PORT=3000
BP_CONFIG_DATABASE_URL=postgres://user:pass@localhost/botpress

# Integrations
TELEGRAM_BOT_TOKEN=your_telegram_token
SLACK_BOT_TOKEN=your_slack_token
WEBHOOK_SECRET=your_webhook_secret

# External APIs
WEATHER_API_KEY=your_weather_api_key
CALENDAR_API_KEY=your_calendar_api_key
```

## Conversation Flows

### Main Flow

```typescript
// flows/main.ts
import { createFlow } from '@botpress/sdk'

export const mainFlow = createFlow({
  name: 'main',
  description: 'Main conversation flow',
  nodes: [
    {
      id: 'entry',
      type: 'entry',
      next: [{ condition: 'true', node: 'greeting' }]
    },
    {
      id: 'greeting',
      type: 'say',
      content: {
        text: 'Hello! How can I help you today?',
        quick_replies: [
          { title: 'Weather', payload: 'weather' },
          { title: 'Book Appointment', payload: 'booking' },
          { title: 'Help', payload: 'help' }
        ]
      },
      next: [{ condition: 'true', node: 'handle_choice' }]
    },
    {
      id: 'handle_choice',
      type: 'listen',
      next: [
        { condition: 'event.payload === "weather"', node: 'weather_flow' },
        { condition: 'event.payload === "booking"', node: 'booking_flow' },
        { condition: 'event.payload === "help"', node: 'help_flow' },
        { condition: 'true', node: 'fallback' }
      ]
    },
    {
      id: 'fallback',
      type: 'say',
      content: {
        text: "I'm not sure I understand. Could you please choose one of the options above?"
      },
      next: [{ condition: 'true', node: 'greeting' }]
    }
  ]
})
```

### Weather Flow

```typescript
// flows/weather.ts
import { createFlow } from '@botpress/sdk'

export const weatherFlow = createFlow({
  name: 'weather',
  description: 'Weather information flow',
  nodes: [
    {
      id: 'entry',
      type: 'entry',
      next: [{ condition: 'true', node: 'get_weather' }]
    },
    {
      id: 'get_weather',
      type: 'execute-code',
      code: `
        const weatherData = await getWeatherInfo(user.location || 'current');
        conversation.weatherInfo = weatherData;
      `,
      next: [{ condition: 'true', node: 'show_weather' }]
    },
    {
      id: 'show_weather',
      type: 'say',
      content: {
        text: 'Current weather: {{conversation.weatherInfo.condition}} with {{conversation.weatherInfo.temperature}}',
        cards: [
          {
            title: 'Weather Details',
            subtitle: '{{conversation.weatherInfo.location}}',
            image: '{{conversation.weatherInfo.icon}}',
            actions: [
              {
                title: 'Get Forecast',
                action: 'postback',
                payload: 'forecast'
              }
            ]
          }
        ]
      },
      next: [{ condition: 'true', node: 'end' }]
    }
  ]
})
```

## Custom Actions

### Weather Action

```typescript
// actions/weather.ts
import { IntentHandler } from '@botpress/sdk'

export const getWeather: IntentHandler = async ({ client, conversation, user }) => {
  try {
    // Mock weather API call
    const weatherData = {
      temperature: '22°C',
      condition: 'Sunny',
      humidity: '65%',
      location: user.location || 'Current Location',
      icon: 'https://example.com/sunny.png'
    }

    await client.createMessage({
      conversationId: conversation.id,
      userId: client.botId,
      type: 'text',
      payload: {
        text: `Current weather is ${weatherData.condition} with ${weatherData.temperature}`
      }
    })

    // Update conversation state
    await client.setState({
      type: 'conversation',
      conversationId: conversation.id,
      payload: { weatherInfo: weatherData }
    })

  } catch (error) {
    await client.createMessage({
      conversationId: conversation.id,
      userId: client.botId,
      type: 'text',
      payload: {
        text: 'Sorry, I could not retrieve weather information at the moment.'
      }
    })
  }
}
```

### Appointment Booking Action

```typescript
// actions/booking.ts
import { IntentHandler } from '@botpress/sdk'

export const bookAppointment: IntentHandler = async ({ client, conversation, user }) => {
  const { date, time } = conversation.slots

  if (!date || !time) {
    await client.createMessage({
      conversationId: conversation.id,
      userId: client.botId,
      type: 'text',
      payload: {
        text: 'Please provide both date and time for your appointment.'
      }
    })
    return
  }

  // Mock booking logic
  const bookingId = `BOOK-${Date.now()}`
  
  await client.createMessage({
    conversationId: conversation.id,
    userId: client.botId,
    type: 'text',
    payload: {
      text: `✅ Appointment booked successfully!\n📅 Date: ${date}\n🕐 Time: ${time}\n📋 Booking ID: ${bookingId}`
    }
  })

  // Clear slots
  await client.setState({
    type: 'conversation',
    conversationId: conversation.id,
    payload: { slots: {} }
  })
}
```

## Intents and NLU

### Intent Definitions

```typescript
// intents/greeting.ts
export const greetingIntent = {
  name: 'greeting',
  utterances: [
    'hello',
    'hi',
    'hey',
    'good morning',
    'good afternoon',
    'good evening'
  ],
  slots: []
}

// intents/weather.ts
export const weatherIntent = {
  name: 'weather',
  utterances: [
    'what\'s the weather',
    'how\'s the weather',
    'weather forecast',
    'is it raining',
    'temperature'
  ],
  slots: [
    {
      name: 'location',
      entity: 'location'
    }
  ]
}

// intents/booking.ts
export const bookingIntent = {
  name: 'booking',
  utterances: [
    'book appointment',
    'schedule meeting',
    'make appointment',
    'reserve time'
  ],
  slots: [
    {
      name: 'date',
      entity: 'date'
    },
    {
      name: 'time',
      entity: 'time'
    }
  ]
}
```

## Multi-Channel Deployment

### Telegram Integration

```typescript
// integrations/telegram.ts
export const telegramConfig = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.WEBHOOK_URL + '/telegram'
}
```

### Slack Integration

```typescript
// integrations/slack.ts
export const slackConfig = {
  enabled: true,
  botToken: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
}
```

### Web Chat

```html
<!-- Embed in website -->
<script src="https://cdn.botpress.cloud/webchat/v0/inject.js"></script>
<script>
  window.botpressWebChat.init({
    botId: 'your-bot-id',
    hostUrl: 'https://your-botpress-server.com',
    messagingUrl: 'https://your-botpress-server.com',
    clientId: 'your-client-id'
  })
</script>
```

## Testing

### Conversation Testing

```typescript
// tests/conversation.test.ts
import { test, expect } from '@jest/globals'
import { createBot } from '@botpress/sdk'

test('should handle greeting flow', async () => {
  const bot = createBot(/* config */)
  
  const response = await bot.converse({
    type: 'text',
    payload: { text: 'Hello' }
  })
  
  expect(response.messages[0].payload.text).toContain('How can I help')
})

test('should handle weather request', async () => {
  const bot = createBot(/* config */)
  
  const response = await bot.converse({
    type: 'text',
    payload: { text: 'What\'s the weather?' }
  })
  
  expect(response.messages[0].payload.text).toMatch(/weather|temperature/)
})
```

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

## Deployment

### Production Docker

```dockerfile
FROM botpress/server:latest

WORKDIR /botpress

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: botpress-chatbot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: botpress-chatbot
  template:
    metadata:
      labels:
        app: botpress-chatbot
    spec:
      containers:
      - name: botpress
        image: botpress-chatbot:latest
        ports:
        - containerPort: 3000
        env:
        - name: BP_CONFIG_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## Monitoring

### Analytics

```typescript
// hooks/analytics.ts
export const analyticsHook = async (bp: any) => {
  bp.events.registerMiddleware({
    name: 'analytics',
    direction: 'incoming',
    handler: async (event: any, next: any) => {
      // Track user interactions
      await trackEvent({
        userId: event.target,
        event: 'message_received',
        properties: {
          type: event.type,
          channel: event.channel
        }
      })
      
      next()
    }
  })
}
```

### Performance Monitoring

```typescript
// Monitor response times and errors
export const performanceHook = async (bp: any) => {
  bp.events.registerMiddleware({
    name: 'performance',
    direction: 'outgoing',
    handler: async (event: any, next: any) => {
      const start = Date.now()
      
      try {
        await next()
        const duration = Date.now() - start
        
        // Log performance metrics
        bp.logger.info(`Response time: ${duration}ms`)
        
      } catch (error) {
        bp.logger.error('Error in response:', error)
        throw error
      }
    }
  })
}
```

## Security

### Authentication

```typescript
// Configure authentication
export const authConfig = {
  strategy: 'jwt',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  }
}
```

### Input Validation

```typescript
// Validate user inputs
export const validateInput = (text: string) => {
  // Remove potentially harmful content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}
```

## Troubleshooting

### Common Issues

1. **Bot not responding**
   ```bash
   # Check bot status
   bp status
   
   # Restart bot
   bp restart
   ```

2. **NLU not understanding**
   - Add more training examples
   - Check intent confidence thresholds
   - Review entity extraction

3. **Integration issues**
   - Verify API keys and tokens
   - Check webhook URLs
   - Review integration logs

This Botpress implementation provides a complete conversational AI solution with visual flow design, multi-channel support, and enterprise-ready deployment options.