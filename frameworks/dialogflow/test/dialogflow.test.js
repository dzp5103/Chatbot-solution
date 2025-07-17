const DialogflowChatbot = require('../src/index');
const request = require('supertest');

describe('DialogflowChatbot', () => {
    let bot;
    let app;

    beforeEach(() => {
        bot = new DialogflowChatbot();
        app = bot.app;
    });

    test('should initialize correctly', () => {
        expect(bot).toBeDefined();
        expect(bot.app).toBeDefined();
        expect(bot.userSessions).toBeDefined();
        expect(bot.intentHandlers).toBeDefined();
    });

    test('should respond to health check', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body.status).toBe('healthy');
        expect(response.body.bot).toBe('Dialogflow Webhook Fulfillment');
    });

    test('should handle direct chat API', async () => {
        const message = { message: 'hello', sessionId: 'test-session' };

        const response = await request(app)
            .post('/api/chat')
            .send(message)
            .expect(200);

        expect(response.body.response).toBeDefined();
        expect(response.body.sessionId).toBe('test-session');
    });

    test('should process direct messages correctly', async () => {
        const response = await bot.processDirectMessage('hello', 'test-session');
        
        expect(response.response).toBeDefined();
        expect(response.sessionId).toBe('test-session');
        expect(response.response).toContain('Hello');
    });

    test('should handle weather requests', async () => {
        const response = await bot.processDirectMessage('weather', 'test-session');
        
        expect(response.response).toBeDefined();
        expect(response.response).toContain('weather');
    });

    test('should handle booking requests', async () => {
        const response = await bot.processDirectMessage('book', 'test-session');
        
        expect(response.response).toBeDefined();
        expect(response.response).toContain('appointment');
    });

    test('should handle unknown messages', async () => {
        const response = await bot.processDirectMessage('random unknown text', 'test-session');
        
        expect(response.response).toBeDefined();
        expect(response.response).toContain("I'm not sure I understand");
    });

    test('should get weather data', async () => {
        const weatherData = await bot.getWeatherData('New York');
        
        expect(weatherData).toBeDefined();
        expect(weatherData.location).toBeDefined();
        expect(weatherData.temperature).toBeDefined();
        expect(weatherData.condition).toBeDefined();
    });

    test('should create booking', async () => {
        const bookingData = {
            serviceType: 'consultation',
            date: '2024-01-15',
            time: '2:00 PM',
            sessionId: 'test-session'
        };
        
        const booking = await bot.createBooking(bookingData);
        
        expect(booking).toBeDefined();
        expect(booking.id).toBeDefined();
        expect(booking.serviceType).toBe('consultation');
        expect(booking.status).toBe('confirmed');
    });

    test('should track session data', () => {
        const sessionId = 'test-session';
        
        // Session should not exist initially
        expect(bot.userSessions.get(sessionId)).toBeUndefined();
        
        // Mock agent to test updateSession
        const mockAgent = {
            session: sessionId,
            intent: 'greeting',
            parameters: { test: 'value' }
        };
        
        bot.updateSession(mockAgent);
        
        const session = bot.userSessions.get(sessionId);
        expect(session).toBeDefined();
        expect(session.id).toBe(sessionId);
        expect(session.lastIntent).toBe('greeting');
        expect(session.interactions).toBe(1);
    });

    test('should handle session data API', async () => {
        const sessionId = 'test-session';
        
        const response = await request(app)
            .get(`/api/session/${sessionId}`)
            .expect(200);

        expect(response.body).toBeDefined();
    });
});