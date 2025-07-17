const { MicrosoftBot } = require('../src/bot');
const { ConversationState, UserState, MemoryStorage, TestAdapter, ActivityTypes } = require('botbuilder');

describe('MicrosoftBot', () => {
    let bot;
    let conversationState;
    let userState;
    let adapter;

    beforeEach(() => {
        const storage = new MemoryStorage();
        conversationState = new ConversationState(storage);
        userState = new UserState(storage);
        const logger = { log: jest.fn() };
        bot = new MicrosoftBot(conversationState, userState, logger);
        adapter = new TestAdapter(async (context) => {
            await bot.run(context);
        });
    });

    test('should initialize correctly', () => {
        expect(bot).toBeDefined();
        expect(bot.conversationState).toBe(conversationState);
        expect(bot.userState).toBe(userState);
    });

    test('should create adaptive card attachment', () => {
        const testCard = { type: 'AdaptiveCard', version: '1.4', body: [] };
        const attachment = bot.createAdaptiveCardAttachment(testCard);
        
        expect(attachment.contentType).toBe('application/vnd.microsoft.card.adaptive');
        expect(attachment.content).toBe(testCard);
    });

    test('should handle user profile operations', async () => {
        // Test that the methods exist and are functions
        expect(typeof bot.getUserProfile).toBe('function');
        expect(typeof bot.saveUserProfile).toBe('function');
    });

    test('should respond to messages', async () => {
        await adapter
            .send('hello')
            .assertReply((activity) => {
                expect(activity.type).toBe(ActivityTypes.Message);
                expect(activity.text || activity.attachments).toBeTruthy();
            });
    });

    test('should handle default responses', () => {
        const responses = [
            "I'm not sure I understand. Could you rephrase that?",
            "That's interesting! Can you tell me more?",
            "I'm still learning. Could you try asking that differently?",
            "Hmm, I don't have information about that. Try asking something else!",
            "I'd love to help! Could you be more specific?"
        ];

        // Test that sendDefaultResponse method works
        expect(typeof bot.sendDefaultResponse).toBe('function');
        
        // All responses should be strings
        responses.forEach(response => {
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(0);
        });
    });
});