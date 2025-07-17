# Google Dialogflow Integration

A comprehensive implementation of Google Dialogflow for building conversational AI applications with natural language understanding, multi-channel deployment, and Google Cloud integration.

## 🎯 Overview

This implementation provides:
- **Natural Language Understanding**: Advanced intent recognition and entity extraction
- **Multi-Channel Deployment**: Web, mobile, voice assistants, messaging platforms
- **Google Cloud Integration**: BigQuery, Cloud Functions, Cloud Storage
- **Conversation Management**: Context handling, follow-up intents, system entities
- **Rich Responses**: Cards, quick replies, suggestions, media content

## 🚀 Quick Start

### Prerequisites
- Google Cloud Platform account
- Dialogflow Console access
- Node.js 16+ or Python 3.8+
- Google Cloud SDK (gcloud CLI)

### Setup Google Cloud Project
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth application-default login

# Create new project (optional)
gcloud projects create your-chatbot-project --name="Chatbot Solution"
gcloud config set project your-chatbot-project

# Enable required APIs
gcloud services enable dialogflow.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable storage.googleapis.com
```

### Local Development Setup
```bash
# Clone and setup
git clone https://github.com/dzp5103/Chatbot-solution.git
cd Chatbot-solution/frameworks/dialogflow

# Install dependencies
npm install
# or for Python
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your project details

# Run the chatbot locally
npm start
# or
python app.py
```

## 📁 Project Structure

```
dialogflow/
├── agent.json                 # Dialogflow agent configuration
├── intents/                   # Intent definitions
│   ├── greeting.json         # Greeting intent
│   ├── booking.json          # Appointment booking
│   ├── weather.json          # Weather inquiries
│   └── fallback.json         # Default fallback
├── entities/                 # Entity type definitions
│   ├── appointment_types.json
│   ├── time_periods.json
│   └── locations.json
├── fulfillment/              # Webhook fulfillment
│   ├── index.js              # Main fulfillment logic
│   ├── handlers/             # Intent handlers
│   │   ├── greeting.js
│   │   ├── booking.js
│   │   └── weather.js
│   ├── services/             # External service integrations
│   │   ├── calendar.js
│   │   ├── weather-api.js
│   │   └── database.js
│   └── utils/                # Utility functions
├── training-phrases/         # Training data
├── responses/                # Static responses
├── contexts/                 # Context definitions
├── deployment/               # Cloud deployment configs
│   ├── cloud-functions/
│   └── cloud-run/
├── test/                     # Testing suite
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## 🤖 Intent Configuration

### Greeting Intent
```json
{
  "name": "greeting",
  "displayName": "Greeting",
  "trainingPhrases": [
    {
      "parts": [{"text": "Hello"}],
      "type": "EXAMPLE"
    },
    {
      "parts": [{"text": "Hi there"}],
      "type": "EXAMPLE"
    },
    {
      "parts": [{"text": "Good morning"}],
      "type": "EXAMPLE"
    }
  ],
  "messages": [
    {
      "text": {
        "text": [
          "Hello! How can I help you today?",
          "Hi! What can I do for you?",
          "Greetings! How may I assist you?"
        ]
      }
    }
  ],
  "outputContexts": [
    {
      "name": "greeting-context",
      "lifespanCount": 5
    }
  ]
}
```

### Booking Intent with Parameters
```json
{
  "name": "booking.appointment",
  "displayName": "Book Appointment",
  "trainingPhrases": [
    {
      "parts": [
        {"text": "I want to book a "},
        {"text": "consultation", "entityType": "@appointment_type", "alias": "appointment_type"},
        {"text": " for "},
        {"text": "tomorrow", "entityType": "@sys.date-time", "alias": "date"}
      ],
      "type": "EXAMPLE"
    }
  ],
  "parameters": [
    {
      "name": "appointment_type",
      "displayName": "Appointment Type",
      "entityTypeDisplayName": "@appointment_type",
      "mandatory": true,
      "prompts": ["What type of appointment would you like?"]
    },
    {
      "name": "date",
      "displayName": "Date",
      "entityTypeDisplayName": "@sys.date-time",
      "mandatory": true,
      "prompts": ["When would you like to schedule this?"]
    }
  ],
  "webhookState": "WEBHOOK_STATE_ENABLED"
}
```

## 🔧 Fulfillment Implementation

### Main Fulfillment Handler (Node.js)
```javascript
const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const { Card, Image } = require('dialogflow-fulfillment');

// Import handlers
const greetingHandler = require('./handlers/greeting');
const bookingHandler = require('./handlers/booking');
const weatherHandler = require('./handlers/weather');

// Main webhook function
exports.dialogflowFirebaseFulfillment = (request, response) => {
    const agent = new WebhookClient({ request, response });
    
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    // Intent handlers map
    const intentMap = new Map();
    intentMap.set('Default Welcome Intent', greetingHandler.welcome);
    intentMap.set('greeting', greetingHandler.greeting);
    intentMap.set('booking.appointment', bookingHandler.bookAppointment);
    intentMap.set('booking.appointment - yes', bookingHandler.confirmBooking);
    intentMap.set('weather.current', weatherHandler.getCurrentWeather);
    intentMap.set('weather.forecast', weatherHandler.getForecast);
    
    // Handle the intent
    agent.handleRequest(intentMap);
};

// Health check endpoint
exports.healthCheck = (request, response) => {
    response.status(200).send('Dialogflow webhook is healthy');
};
```

### Booking Handler Implementation
```javascript
// handlers/booking.js
const { Card, Suggestion } = require('dialogflow-fulfillment');
const calendarService = require('../services/calendar');
const databaseService = require('../services/database');

class BookingHandler {
    async bookAppointment(agent) {
        const appointmentType = agent.parameters.appointment_type;
        const date = agent.parameters.date;
        const time = agent.parameters.time;

        // Validate required parameters
        if (!appointmentType) {
            agent.add('What type of appointment would you like to book?');
            agent.add(new Suggestion('Consultation'));
            agent.add(new Suggestion('Support'));
            agent.add(new Suggestion('Demo'));
            return;
        }

        if (!date) {
            agent.add('When would you like to schedule your appointment?');
            agent.add(new Suggestion('Tomorrow'));
            agent.add(new Suggestion('Next week'));
            agent.add(new Suggestion('Monday'));
            return;
        }

        try {
            // Check availability
            const availability = await calendarService.checkAvailability(date, time);
            
            if (availability.isAvailable) {
                // Create booking confirmation card
                const bookingCard = new Card({
                    title: 'Appointment Booking Confirmation',
                    subtitle: `${appointmentType} - ${this.formatDate(date)}`,
                    text: `Would you like to confirm this appointment?`,
                    imageUrl: 'https://example.com/booking-icon.png',
                    buttonText: 'Confirm Booking',
                    buttonUrl: `https://your-booking-system.com/confirm/${booking.id}`
                });

                agent.add(bookingCard);
                agent.add('Please confirm if you\'d like to book this appointment.');
                agent.add(new Suggestion('Yes, book it'));
                agent.add(new Suggestion('Choose different time'));
                agent.add(new Suggestion('Cancel'));

                // Set context for follow-up
                agent.setContext({
                    name: 'booking-confirmation',
                    lifespan: 5,
                    parameters: {
                        appointmentType,
                        date,
                        time,
                        bookingId: availability.bookingId
                    }
                });

            } else {
                agent.add(`I'm sorry, ${this.formatDate(date)} at ${time || 'that time'} is not available.`);
                agent.add('Here are some alternative times:');
                
                // Suggest alternative times
                availability.alternatives.forEach(alt => {
                    agent.add(new Suggestion(`${alt.date} at ${alt.time}`));
                });
            }

        } catch (error) {
            console.error('Booking error:', error);
            agent.add('I apologize, but I\'m having trouble accessing the booking system right now. Please try again later.');
        }
    }

    async confirmBooking(agent) {
        const context = agent.getContext('booking-confirmation');
        
        if (!context) {
            agent.add('I don\'t have the booking details. Let\'s start over.');
            return;
        }

        const { appointmentType, date, time, bookingId } = context.parameters;

        try {
            // Confirm the booking
            const booking = await calendarService.confirmBooking(bookingId);
            
            if (booking.success) {
                // Save to database
                await databaseService.saveBooking({
                    userId: agent.session,
                    appointmentType,
                    date,
                    time,
                    bookingId,
                    status: 'confirmed'
                });

                agent.add(`🎉 Perfect! Your ${appointmentType} appointment is confirmed for ${this.formatDate(date)}.`);
                agent.add(`📧 You'll receive a confirmation email shortly.`);
                agent.add(`📅 A calendar invitation will be sent to you.`);
                
                // Provide additional options
                agent.add(new Suggestion('Add to my calendar'));
                agent.add(new Suggestion('Set reminder'));
                agent.add(new Suggestion('Book another appointment'));

            } else {
                agent.add('I\'m sorry, there was an issue confirming your booking. Please try again.');
            }

        } catch (error) {
            console.error('Confirmation error:', error);
            agent.add('There was an error confirming your appointment. Please contact support.');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

module.exports = new BookingHandler();
```

### Weather Service Integration
```javascript
// services/weather-api.js
const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.WEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getCurrentWeather(location) {
        try {
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    q: location,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                location: response.data.name,
                temperature: Math.round(response.data.main.temp),
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                icon: response.data.weather[0].icon
            };

        } catch (error) {
            console.error('Weather API error:', error);
            throw new Error('Unable to fetch weather data');
        }
    }

    async getForecast(location, days = 5) {
        try {
            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    q: location,
                    appid: this.apiKey,
                    units: 'metric',
                    cnt: days * 8 // 8 forecasts per day (3-hour intervals)
                }
            });

            const dailyForecasts = this.groupForecastsByDay(response.data.list);
            
            return {
                location: response.data.city.name,
                forecasts: dailyForecasts
            };

        } catch (error) {
            console.error('Forecast API error:', error);
            throw new Error('Unable to fetch forecast data');
        }
    }

    groupForecastsByDay(forecasts) {
        const grouped = {};
        
        forecasts.forEach(forecast => {
            const date = forecast.dt_txt.split(' ')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(forecast);
        });

        return Object.keys(grouped).map(date => ({
            date,
            temperature: {
                min: Math.min(...grouped[date].map(f => f.main.temp_min)),
                max: Math.max(...grouped[date].map(f => f.main.temp_max))
            },
            description: grouped[date][4]?.weather[0]?.description || grouped[date][0].weather[0].description,
            humidity: grouped[date][4]?.main.humidity || grouped[date][0].main.humidity
        }));
    }
}

module.exports = new WeatherService();
```

## 🚀 Deployment Options

### Google Cloud Functions
```javascript
// deployment/cloud-functions/deploy.js
const { CloudFunctionsServiceClient } = require('@google-cloud/functions');

async function deployWebhook() {
    const client = new CloudFunctionsServiceClient();
    
    const request = {
        location: 'projects/your-project/locations/us-central1',
        function: {
            name: 'dialogflow-webhook',
            description: 'Dialogflow fulfillment webhook',
            sourceArchiveUrl: 'gs://your-bucket/webhook.zip',
            httpsTrigger: {},
            runtime: 'nodejs18',
            entryPoint: 'dialogflowFirebaseFulfillment',
            environmentVariables: {
                WEATHER_API_KEY: process.env.WEATHER_API_KEY,
                DATABASE_URL: process.env.DATABASE_URL
            }
        }
    };

    const [operation] = await client.createFunction(request);
    const [response] = await operation.promise();
    
    console.log('Function deployed:', response.name);
    return response.httpsTrigger.url;
}
```

### Cloud Run Deployment
```yaml
# deployment/cloud-run/service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: dialogflow-webhook
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: '10'
        run.googleapis.com/cpu-throttling: 'false'
    spec:
      containerConcurrency: 100
      containers:
      - image: gcr.io/your-project/dialogflow-webhook
        ports:
        - containerPort: 8080
        env:
        - name: WEATHER_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: weather-api-key
        resources:
          limits:
            cpu: '1'
            memory: '512Mi'
```

### Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase project
firebase init functions

# Deploy functions
firebase deploy --only functions

# Set environment variables
firebase functions:config:set weather.api_key="your-api-key"
firebase functions:config:set database.url="your-database-url"
```

## 🧪 Testing

### Intent Testing
```javascript
// test/intent-tests.js
const { expect } = require('chai');
const { SessionsClient } = require('@google-cloud/dialogflow');

describe('Dialogflow Intent Testing', () => {
    let sessionClient;
    let sessionPath;

    before(() => {
        sessionClient = new SessionsClient();
        sessionPath = sessionClient.projectAgentSessionPath(
            'your-project-id',
            'test-session-id'
        );
    });

    it('should recognize greeting intent', async () => {
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: 'Hello',
                    languageCode: 'en',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        expect(result.intent.displayName).to.equal('greeting');
        expect(result.intentDetectionConfidence).to.be.above(0.8);
    });

    it('should extract booking parameters correctly', async () => {
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: 'I want to book a consultation for tomorrow',
                    languageCode: 'en',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        expect(result.intent.displayName).to.equal('booking.appointment');
        expect(result.parameters.fields.appointment_type.stringValue).to.equal('consultation');
        expect(result.parameters.fields.date).to.exist;
    });
});
```

### Webhook Testing
```javascript
// test/webhook-tests.js
const request = require('supertest');
const app = require('../fulfillment/index');

describe('Webhook Endpoints', () => {
    it('should respond to health check', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
            
        expect(response.text).to.equal('Dialogflow webhook is healthy');
    });

    it('should handle booking intent webhook', async () => {
        const mockRequest = {
            queryResult: {
                intent: {
                    displayName: 'booking.appointment'
                },
                parameters: {
                    appointment_type: 'consultation',
                    date: '2024-01-15'
                }
            }
        };

        const response = await request(app)
            .post('/webhook')
            .send(mockRequest)
            .expect(200);

        expect(response.body.fulfillmentText).to.include('appointment');
    });
});
```

## 📊 Analytics and Monitoring

### Dialogflow Analytics
```javascript
// utils/analytics.js
const { BigQuery } = require('@google-cloud/bigquery');

class DialogflowAnalytics {
    constructor() {
        this.bigquery = new BigQuery();
        this.dataset = this.bigquery.dataset('dialogflow_analytics');
    }

    async logConversation(sessionId, intent, parameters, confidence) {
        const table = this.dataset.table('conversations');
        
        const row = {
            timestamp: new Date().toISOString(),
            session_id: sessionId,
            intent_name: intent,
            parameters: JSON.stringify(parameters),
            confidence_score: confidence,
            user_agent: this.getUserAgent()
        };

        await table.insert([row]);
    }

    async getIntentMetrics(startDate, endDate) {
        const query = `
            SELECT 
                intent_name,
                COUNT(*) as total_requests,
                AVG(confidence_score) as avg_confidence,
                COUNT(DISTINCT session_id) as unique_users
            FROM \`${this.bigquery.projectId}.dialogflow_analytics.conversations\`
            WHERE timestamp BETWEEN @start_date AND @end_date
            GROUP BY intent_name
            ORDER BY total_requests DESC
        `;

        const options = {
            query,
            params: { start_date: startDate, end_date: endDate }
        };

        const [results] = await this.bigquery.query(options);
        return results;
    }
}

module.exports = new DialogflowAnalytics();
```

## 🔒 Security Best Practices

### Authentication
```javascript
// middleware/auth.js
const { OAuth2Client } = require('google-auth-library');

class AuthMiddleware {
    constructor() {
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async verifyToken(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            req.user = ticket.getPayload();
            next();

        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    }

    async verifyWebhook(req, res, next) {
        const signature = req.headers['x-webhook-signature'];
        const expectedSignature = this.computeSignature(req.body);
        
        if (signature !== expectedSignature) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }
        
        next();
    }
}

module.exports = new AuthMiddleware();
```

## 📚 Resources

### Documentation
- [Dialogflow Documentation](https://cloud.google.com/dialogflow/docs)
- [Fulfillment Guide](https://cloud.google.com/dialogflow/docs/fulfillment-overview)
- [Best Practices](https://cloud.google.com/dialogflow/docs/best-practices)

### Training Resources
- Intent design patterns
- Entity extraction optimization
- Conversation flow design
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your Dialogflow agent thoroughly
4. Include training phrases and test cases
5. Submit a pull request

This Dialogflow implementation provides a robust foundation for building sophisticated conversational AI applications with Google's powerful natural language understanding capabilities.