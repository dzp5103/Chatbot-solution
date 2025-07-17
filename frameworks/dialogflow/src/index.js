const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/**
 * Dialogflow Webhook Fulfillment Server
 * Handles webhook requests from Google Dialogflow for dynamic responses
 */
class DialogflowChatbot {
    constructor() {
        this.app = express();
        this.userSessions = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupIntentHandlers();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                bot: 'Dialogflow Webhook Fulfillment'
            });
        });

        // Main webhook endpoint for Dialogflow
        this.app.post('/webhook', (req, res) => {
            const agent = new WebhookClient({ request: req, response: res });
            
            // Log the request for debugging
            console.log('Dialogflow Request headers:', JSON.stringify(req.headers, null, 2));
            console.log('Dialogflow Request body:', JSON.stringify(req.body, null, 2));
            
            // Handle the request
            this.handleWebhook(agent);
        });

        // Test endpoint for direct API calls
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, sessionId } = req.body;
                const response = await this.processDirectMessage(message, sessionId);
                res.json(response);
            } catch (error) {
                console.error('Error in direct chat:', error);
                res.status(500).json({ error: 'Chat processing error' });
            }
        });

        // Get session data
        this.app.get('/api/session/:sessionId', (req, res) => {
            const { sessionId } = req.params;
            const session = this.userSessions.get(sessionId) || {};
            res.json(session);
        });
    }

    setupIntentHandlers() {
        this.intentHandlers = new Map();

        // Default Welcome Intent
        this.intentHandlers.set('Default Welcome Intent', (agent) => {
            const welcomeText = `👋 Welcome to our intelligent assistant!

I'm powered by Google Dialogflow and can help you with:
• 🌤️ Weather information
• 📅 Appointment booking  
• ❓ Questions and support
• 💬 General conversation

What would you like to do today?`;

            agent.add(welcomeText);
            agent.add(new Suggestion('Check Weather'));
            agent.add(new Suggestion('Book Appointment'));
            agent.add(new Suggestion('Get Help'));
        });

        // Default Fallback Intent
        this.intentHandlers.set('Default Fallback Intent', (agent) => {
            const fallbackResponses = [
                "I didn't understand that. Could you rephrase?",
                "I'm not sure what you mean. Can you try asking differently?",
                "That's interesting! Could you be more specific?",
                "I'd love to help! Could you clarify what you're looking for?"
            ];
            
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            agent.add(randomResponse);
            agent.add(new Suggestion('Weather'));
            agent.add(new Suggestion('Booking'));
            agent.add(new Suggestion('Help'));
        });

        // Weather Intent
        this.intentHandlers.set('weather.get', async (agent) => {
            const location = agent.parameters.location || 'current location';
            
            try {
                const weatherData = await this.getWeatherData(location);
                
                const weatherResponse = `🌤️ **Weather for ${weatherData.location}**

🌡️ Temperature: ${weatherData.temperature}
☀️ Condition: ${weatherData.condition}  
💧 Humidity: ${weatherData.humidity}
🌬️ Wind: ${weatherData.wind}

Is there anything else I can help you with?`;

                agent.add(weatherResponse);
                
                // Add a card with weather details
                agent.add(new Card({
                    title: `Weather in ${weatherData.location}`,
                    text: `${weatherData.condition} - ${weatherData.temperature}`,
                    imageUrl: weatherData.icon,
                    buttonText: 'View Forecast',
                    buttonUrl: weatherData.forecastUrl
                }));
                
                agent.add(new Suggestion('Book Appointment'));
                agent.add(new Suggestion('Help'));
                
            } catch (error) {
                console.error('Weather API error:', error);
                agent.add('Sorry, I could not retrieve weather information at the moment. Please try again later.');
            }
        });

        // Booking Intent
        this.intentHandlers.set('booking.appointment', async (agent) => {
            const date = agent.parameters.date;
            const time = agent.parameters.time;
            const serviceType = agent.parameters.serviceType || 'consultation';
            
            if (!date || !time) {
                agent.add('To book an appointment, I need both a date and time. Could you please provide both?');
                agent.add(new Suggestion('Tomorrow at 2pm'));
                agent.add(new Suggestion('Next Monday 10am'));
                return;
            }
            
            try {
                const booking = await this.createBooking({
                    date,
                    time,
                    serviceType,
                    sessionId: agent.session
                });
                
                const bookingResponse = `✅ **Appointment Confirmed!**

📋 **Booking Details:**
• Reference: ${booking.id}
• Service: ${booking.serviceType}
• Date: ${booking.date}
• Time: ${booking.time}
• Status: Confirmed

📧 A confirmation email will be sent shortly.
📅 Calendar invite has been created.

Is there anything else I can help you with?`;

                agent.add(bookingResponse);
                
                // Add confirmation card
                agent.add(new Card({
                    title: 'Appointment Confirmed',
                    text: `${booking.serviceType} on ${booking.date} at ${booking.time}`,
                    buttonText: 'View Details',
                    buttonUrl: `https://example.com/booking/${booking.id}`
                }));
                
                agent.add(new Suggestion('Check Weather'));
                agent.add(new Suggestion('Book Another'));
                
            } catch (error) {
                console.error('Booking error:', error);
                agent.add('Sorry, there was an issue creating your appointment. Please try again or contact support.');
            }
        });

        // Help Intent
        this.intentHandlers.set('help.get', (agent) => {
            const helpText = `🤖 **How I Can Help You**

I'm your intelligent assistant powered by Google Dialogflow. Here's what I can do:

**🌤️ Weather Information**
- "What's the weather like?"
- "Weather in New York"
- "Is it going to rain?"

**📅 Appointment Booking**
- "Book an appointment for tomorrow"
- "Schedule a meeting next week"
- "Reserve time for consultation"

**💬 General Assistance**
- Ask questions about our services
- Get support and information
- Natural conversation

**📱 Multi-Platform**
- Web chat interface
- Google Assistant integration
- Slack and other platforms

Try saying something like "What's the weather?" or "Book an appointment"!`;

            agent.add(helpText);
            agent.add(new Suggestion('Weather'));
            agent.add(new Suggestion('Book Appointment'));
            agent.add(new Suggestion('Learn More'));
        });

        // Custom actions
        this.intentHandlers.set('custom.demo', (agent) => {
            agent.add('This is a custom Dialogflow action! You can extend this chatbot by adding more intent handlers.');
            agent.add(new Suggestion('Weather'));
            agent.add(new Suggestion('Booking'));
        });
    }

    handleWebhook(agent) {
        const intentName = agent.intent;
        console.log(`Processing intent: ${intentName}`);
        
        // Update session data
        this.updateSession(agent);
        
        // Handle the intent
        const handler = this.intentHandlers.get(intentName);
        if (handler) {
            handler(agent);
        } else {
            console.log(`No handler found for intent: ${intentName}`);
            agent.add("I'm not sure how to handle that request. Could you try rephrasing?");
        }
    }

    updateSession(agent) {
        const sessionId = agent.session;
        let session = this.userSessions.get(sessionId) || {
            id: sessionId,
            startTime: new Date().toISOString(),
            interactions: 0,
            lastIntent: null
        };
        
        session.interactions++;
        session.lastIntent = agent.intent;
        session.lastUpdate = new Date().toISOString();
        session.parameters = agent.parameters;
        
        this.userSessions.set(sessionId, session);
    }

    async getWeatherData(location) {
        // Mock weather data - in production, integrate with weather API
        const weatherData = {
            location: location === 'current location' ? 'Your Location' : location,
            temperature: '22°C',
            condition: 'Sunny',
            humidity: '65%',
            wind: '5 km/h',
            icon: 'https://openweathermap.org/img/w/01d.png',
            forecastUrl: `https://weather.com/search?query=${encodeURIComponent(location)}`
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return weatherData;
    }

    async createBooking(bookingData) {
        // Mock booking creation - in production, integrate with calendar/booking system
        const booking = {
            id: `BK${Date.now().toString().slice(-6)}`,
            serviceType: bookingData.serviceType,
            date: bookingData.date,
            time: bookingData.time,
            sessionId: bookingData.sessionId,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return booking;
    }

    async processDirectMessage(message, sessionId = 'default') {
        // Simple direct message processing for testing
        const responses = {
            'hello': 'Hello! How can I help you today?',
            'weather': 'The weather is sunny and 22°C today!',
            'book': 'I can help you book an appointment. What date and time work for you?',
            'help': 'I can help with weather information, appointment booking, and general questions.'
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return { response, sessionId };
            }
        }
        
        return { 
            response: "I'm not sure I understand. Could you rephrase that?", 
            sessionId 
        };
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`🤖 Dialogflow Webhook running on port ${port}`);
            console.log(`🌐 Webhook endpoint: http://localhost:${port}/webhook`);
            console.log(`💬 Direct chat API: http://localhost:${port}/api/chat`);
            console.log(`🏥 Health check: http://localhost:${port}/health`);
            console.log(`
📋 **Setup Instructions:**
1. Create a Dialogflow agent at https://dialogflow.cloud.google.com/
2. Set webhook URL to: http://localhost:${port}/webhook
3. Create intents and configure fulfillment
4. Test your agent!
            `);
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const dialogflowBot = new DialogflowChatbot();
    const port = process.env.PORT || 3000;
    dialogflowBot.start(port);
}

module.exports = DialogflowChatbot;