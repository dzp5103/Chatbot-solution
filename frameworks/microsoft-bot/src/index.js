const restify = require('restify');
const { BotFrameworkAdapter, ConversationState, UserState, MemoryStorage } = require('botbuilder');
const { MicrosoftBot } = require('./bot');
const { TelemetryLoggerMiddleware } = require('botbuilder-applicationinsights');

// Load environment variables
require('dotenv').config();

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    appType: process.env.MicrosoftAppType || 'MultiTenant'
});

// Add telemetry middleware
if (process.env.InstrumentationKey) {
    const telemetryLoggerMiddleware = new TelemetryLoggerMiddleware({
        instrumentationKey: process.env.InstrumentationKey
    });
    adapter.use(telemetryLoggerMiddleware);
}

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\\n [onTurnError] unhandled error: ${error}`);
    console.error(error);

    // Send a trace message
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug. Please try again later.');
};

// Create storage and state
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create logger
const logger = {
    log: (message) => {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
};

// Create the bot
const bot = new MicrosoftBot(conversationState, userState, logger);

// Create HTTP server
const server = restify.createServer({
    name: 'Microsoft Bot Framework Chatbot',
    version: '1.0.0'
});

// Enable CORS
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

// CORS middleware
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.send(200);
        return;
    }
    
    return next();
});

// Health check endpoint
server.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        bot: 'Microsoft Bot Framework Chatbot'
    });
});

// Bot Framework endpoint
server.post('/api/messages', async (req, res) => {
    try {
        await adapter.processActivity(req, res, async (context) => {
            await bot.run(context);
        });
    } catch (error) {
        console.error('Error processing activity:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Static files for web chat (optional)
server.get('/webchat/*', restify.plugins.serveStatic({
    directory: './webchat',
    default: 'index.html'
}));

// Start server
const port = process.env.PORT || 3978;
server.listen(port, () => {
    console.log(`\\n${server.name} listening on port ${port}`);
    console.log(`\\nBot endpoint: http://localhost:${port}/api/messages`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`\\nConnect Bot Framework Emulator to: http://localhost:${port}/api/messages`);
    
    if (process.env.MicrosoftAppId) {
        console.log(`App ID: ${process.env.MicrosoftAppId}`);
    } else {
        console.log('\\nNo Microsoft App ID configured - running in development mode');
        console.log('For production deployment, set MicrosoftAppId and MicrosoftAppPassword');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

module.exports = { server, bot, adapter };