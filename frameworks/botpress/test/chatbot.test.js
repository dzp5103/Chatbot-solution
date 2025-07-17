const BotpressChatbot = require('../src/index');
const request = require('supertest');

describe('BotpressChatbot', () => {
    let bot;
    let app;

    beforeEach(() => {
        bot = new BotpressChatbot();
        app = bot.app;
    });

    test('should initialize correctly', () => {
        expect(bot).toBeDefined();
        expect(bot.app).toBeDefined();
        expect(bot.conversations).toBeDefined();
        expect(bot.intents).toBeDefined();
        expect(bot.flows).toBeDefined();
    });

    test('should respond to health check', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body.status).toBe('healthy');
        expect(response.body.bot).toBe('Botpress Compatible Chatbot');
    });

    test('should handle conversation via API', async () => {
        const userId = 'test-user';
        const message = { type: 'text', text: 'hello' };

        const response = await request(app)
            .post(`/api/v1/bots/default/converse/${userId}`)
            .send(message)
            .expect(200);

        expect(response.body.responses).toBeDefined();
        expect(response.body.responses[0].text).toBeDefined();
        expect(response.body.conversation).toBeDefined();
    });

    test('should detect greeting intent', () => {
        const intent = bot.detectIntent('hello');
        expect(intent).toBeDefined();
        expect(intent.name).toBe('greeting');
    });

    test('should detect weather intent', () => {
        const intent = bot.detectIntent('what is the weather');
        expect(intent).toBeDefined();
        expect(intent.name).toBe('weather');
    });

    test('should detect booking intent', () => {
        const intent = bot.detectIntent('book an appointment');
        expect(intent).toBeDefined();
        expect(intent.name).toBe('booking');
    });

    test('should handle unknown input', () => {
        const intent = bot.detectIntent('random unknown text');
        expect(intent).toBeNull();
    });

    test('should handle webhook messages', async () => {
        const webhookMessage = {
            user: { id: 'test-user' },
            text: 'hello'
        };

        const response = await request(app)
            .post('/webhook')
            .send(webhookMessage)
            .expect(200);

        expect(response.body.responses).toBeDefined();
        expect(response.body.conversation).toBeDefined();
    });

    test('should maintain conversation history', async () => {
        const userId = 'test-user';
        
        // Send first message
        await request(app)
            .post(`/api/v1/bots/default/converse/${userId}`)
            .send({ type: 'text', text: 'hello' });

        // Send second message
        await request(app)
            .post(`/api/v1/bots/default/converse/${userId}`)
            .send({ type: 'text', text: 'weather' });

        // Get conversation history
        const response = await request(app)
            .get(`/api/v1/bots/default/conversations/${userId}`)
            .expect(200);

        expect(response.body.messages).toBeDefined();
        expect(response.body.messages.length).toBeGreaterThan(0);
    });

    test('should handle weather requests', async () => {
        const conversation = { messages: [], state: {} };
        const message = { text: 'weather' };
        
        const response = await bot.handleWeather(conversation, message);
        
        expect(response.text).toContain('Weather Information');
        expect(response.text).toContain('Temperature');
        expect(response.quickReplies).toBeDefined();
    });

    test('should handle booking requests', async () => {
        const conversation = { messages: [], state: {} };
        const message = { text: 'book appointment' };
        
        const response = await bot.handleBooking(conversation, message);
        
        expect(response.text).toContain('Appointment Booking');
        expect(response.text).toContain('Booking ID');
        expect(response.quickReplies).toBeDefined();
    });
});