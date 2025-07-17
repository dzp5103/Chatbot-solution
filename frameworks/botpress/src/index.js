const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/**
 * Simple Botpress-compatible chatbot implementation
 * This is a simplified version that mimics Botpress functionality
 * without the full Botpress server dependency
 */
class BotpressChatbot {
    constructor() {
        this.app = express();
        this.conversations = new Map();
        this.intents = new Map();
        this.flows = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeIntents();
        this.initializeFlows();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
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
                bot: 'Botpress Compatible Chatbot'
            });
        });

        // Webhook endpoint
        this.app.post('/webhook', async (req, res) => {
            try {
                const response = await this.handleMessage(req.body);
                res.json(response);
            } catch (error) {
                console.error('Error processing webhook:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Chat endpoint for web interface
        this.app.post('/api/v1/bots/default/converse/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const { type, text } = req.body;
                
                const response = await this.processMessage(userId, { type, text });
                res.json(response);
            } catch (error) {
                console.error('Error in conversation:', error);
                res.status(500).json({ error: 'Conversation error' });
            }
        });

        // Get conversation history
        this.app.get('/api/v1/bots/default/conversations/:userId', (req, res) => {
            const { userId } = req.params;
            const conversation = this.conversations.get(userId) || { messages: [] };
            res.json(conversation);
        });
    }

    initializeIntents() {
        // Greeting intent
        this.intents.set('greeting', {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'],
            response: 'Hello! How can I help you today? 😊'
        });

        // Weather intent
        this.intents.set('weather', {
            patterns: ['weather', 'forecast', 'temperature', 'raining', 'sunny'],
            response: 'I can help you with weather information! What location are you interested in?'
        });

        // Booking intent
        this.intents.set('booking', {
            patterns: ['book', 'appointment', 'schedule', 'reserve', 'meeting'],
            response: 'I\'d be happy to help you book an appointment! What type of service do you need?'
        });

        // Help intent
        this.intents.set('help', {
            patterns: ['help', 'support', 'assistance', 'what can you do'],
            response: `I can help you with:
🌤️ Weather information
📅 Appointment booking
💬 General conversation
❓ Questions and support

What would you like to do?`
        });
    }

    initializeFlows() {
        // Main conversation flow
        this.flows.set('main', {
            name: 'main',
            nodes: [
                {
                    id: 'entry',
                    type: 'entry',
                    next: 'greeting'
                },
                {
                    id: 'greeting',
                    type: 'say',
                    text: 'Welcome! I\'m your virtual assistant. How can I help you today?',
                    quickReplies: [
                        { title: '🌤️ Weather', payload: 'weather' },
                        { title: '📅 Book Appointment', payload: 'booking' },
                        { title: '❓ Help', payload: 'help' }
                    ],
                    next: 'listen'
                },
                {
                    id: 'listen',
                    type: 'listen',
                    next: 'process_intent'
                }
            ]
        });

        // Weather flow
        this.flows.set('weather', {
            name: 'weather',
            nodes: [
                {
                    id: 'entry',
                    type: 'entry',
                    text: 'Let me get the weather information for you!',
                    next: 'get_weather'
                },
                {
                    id: 'get_weather',
                    type: 'action',
                    action: 'getWeather',
                    next: 'end'
                }
            ]
        });
    }

    async handleMessage(message) {
        const userId = message.user?.id || 'anonymous';
        const text = message.text || message.payload?.text || '';
        
        return await this.processMessage(userId, { type: 'text', text });
    }

    async processMessage(userId, message) {
        let conversation = this.conversations.get(userId);
        
        if (!conversation) {
            conversation = {
                id: uuidv4(),
                userId,
                messages: [],
                state: {},
                currentFlow: 'main',
                currentNode: 'entry'
            };
            this.conversations.set(userId, conversation);
        }

        // Add user message to conversation
        conversation.messages.push({
            id: uuidv4(),
            type: 'text',
            text: message.text,
            userId: userId,
            timestamp: new Date().toISOString()
        });

        // Process intent
        const intent = this.detectIntent(message.text);
        let response;

        if (intent) {
            response = await this.handleIntent(intent, conversation, message);
        } else {
            response = await this.handleFallback(conversation, message);
        }

        // Add bot response to conversation
        conversation.messages.push({
            id: uuidv4(),
            type: 'text',
            text: response.text,
            userId: 'bot',
            timestamp: new Date().toISOString(),
            quickReplies: response.quickReplies
        });

        return {
            responses: [response],
            conversation: {
                id: conversation.id,
                userId: conversation.userId
            }
        };
    }

    detectIntent(text) {
        if (!text || typeof text !== 'string') return null;
        
        const lowerText = text.toLowerCase();
        
        for (const [intentName, intent] of this.intents) {
            for (const pattern of intent.patterns) {
                if (lowerText.includes(pattern.toLowerCase())) {
                    return { name: intentName, ...intent };
                }
            }
        }
        
        return null;
    }

    async handleIntent(intent, conversation, message) {
        switch (intent.name) {
            case 'greeting':
                return {
                    text: intent.response,
                    quickReplies: [
                        { title: '🌤️ Weather', payload: 'weather' },
                        { title: '📅 Book Appointment', payload: 'booking' },
                        { title: '❓ Help', payload: 'help' }
                    ]
                };
                
            case 'weather':
                return await this.handleWeather(conversation, message);
                
            case 'booking':
                return await this.handleBooking(conversation, message);
                
            case 'help':
                return {
                    text: intent.response,
                    quickReplies: [
                        { title: 'Weather Info', payload: 'weather' },
                        { title: 'Book Now', payload: 'booking' }
                    ]
                };
                
            default:
                return { text: intent.response };
        }
    }

    async handleWeather(conversation, message) {
        // Mock weather data
        const weatherData = {
            temperature: '22°C',
            condition: 'Sunny',
            humidity: '65%',
            location: 'Current Location'
        };

        return {
            text: `🌤️ **Weather Information**

📍 Location: ${weatherData.location}
🌡️ Temperature: ${weatherData.temperature}
☀️ Condition: ${weatherData.condition}
💧 Humidity: ${weatherData.humidity}

Is there anything else I can help you with?`,
            quickReplies: [
                { title: '📅 Book Appointment', payload: 'booking' },
                { title: '❓ More Help', payload: 'help' }
            ]
        };
    }

    async handleBooking(conversation, message) {
        const bookingId = `BK${Date.now().toString().slice(-6)}`;
        
        return {
            text: `📅 **Appointment Booking**

I'd be happy to help you book an appointment!

For this demo, here's your mock booking:
• Booking ID: ${bookingId}
• Type: Consultation
• Date: Tomorrow at 2:00 PM
• Status: Confirmed ✅

In a real implementation, this would integrate with a calendar system.

What else can I help you with?`,
            quickReplies: [
                { title: '🌤️ Weather', payload: 'weather' },
                { title: '❓ Help', payload: 'help' }
            ]
        };
    }

    async handleFallback(conversation, message) {
        const fallbackResponses = [
            "I'm not sure I understand. Could you rephrase that?",
            "That's interesting! Can you tell me more?",
            "I'm still learning. Could you try asking that differently?",
            "I'd love to help! Here are some things I can do:",
            "Let me help you with that. What specifically are you looking for?"
        ];

        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        return {
            text: randomResponse,
            quickReplies: [
                { title: '🌤️ Weather', payload: 'weather' },
                { title: '📅 Book Appointment', payload: 'booking' },
                { title: '❓ Help', payload: 'help' }
            ]
        };
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`🤖 Botpress Compatible Chatbot running on port ${port}`);
            console.log(`🌐 Webhook endpoint: http://localhost:${port}/webhook`);
            console.log(`💬 Chat API: http://localhost:${port}/api/v1/bots/default/converse/:userId`);
            console.log(`🏥 Health check: http://localhost:${port}/health`);
        });
    }
}

// Start the bot if this file is run directly
if (require.main === module) {
    const bot = new BotpressChatbot();
    const port = process.env.PORT || 3000;
    bot.start(port);
}

module.exports = BotpressChatbot;