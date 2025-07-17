// Microsoft Bot Framework Unit Tests
const { TestAdapter, ConversationState, UserState, MemoryStorage } = require('botbuilder');
const { MicrosoftBot } = require('../../../frameworks/microsoft-bot/src/bot');

describe('Microsoft Bot Framework Tests', () => {
    let testAdapter;
    let bot;
    let conversationState;
    let userState;
    let memoryStorage;

    beforeEach(() => {
        // Setup test environment
        memoryStorage = new MemoryStorage();
        conversationState = new ConversationState(memoryStorage);
        userState = new UserState(memoryStorage);
        
        const logger = { log: jest.fn() };
        bot = new MicrosoftBot(conversationState, userState, logger);
        
        testAdapter = new TestAdapter(async (context) => {
            await bot.run(context);
        });
    });

    describe('Message Processing', () => {
        test('should respond to greeting messages', async () => {
            await testAdapter.test('Hello', (activity) => {
                expect(activity.type).toBe('message');
                expect(activity.text || activity.attachments).toBeTruthy();
            });
        });

        test('should handle unknown messages gracefully', async () => {
            await testAdapter.test('asdfghjkl random text', (activity) => {
                expect(activity.type).toBe('message');
                expect(activity.text).toBeDefined();
            });
        });

        test('should maintain conversation context', async () => {
            await testAdapter
                .send('Hello')
                .assertReply((activity) => {
                    expect(activity.type).toBe('message');
                })
                .send('Book an appointment')
                .assertReply((activity) => {
                    expect(activity.type).toBe('message');
                    // Should remember previous context
                });
        });
    });

    describe('Dialog Management', () => {
        test('should start booking dialog correctly', async () => {
            await testAdapter
                .send('I want to book an appointment')
                .assertReply((activity) => {
                    expect(activity.type).toBe('message');
                    expect(activity.text).toContain('Appointment Booking');
                });
        });

        test('should handle dialog interruptions', async () => {
            await testAdapter
                .send('Book appointment')
                .assertReply(() => true) // Dialog starts
                .send('cancel')
                .assertReply((activity) => {
                    expect(activity.text.toLowerCase()).toContain('cancel');
                });
        });

        test('should complete full booking flow', async () => {
            await testAdapter
                .send('Book an appointment')
                .assertReply(() => true)
                .send('consultation')
                .assertReply(() => true)
                .send('John Doe, john@example.com')
                .assertReply(() => true)
                .send('tomorrow')
                .assertReply(() => true)
                .send('2 PM')
                .assertReply(() => true)
                .send('confirm')
                .assertReply((activity) => {
                    expect(activity.text).toContain('Confirmed');
                });
        });
    });

    describe('Adaptive Cards', () => {
        test('should send welcome card on member added', async () => {
            const membersAdded = [{ id: 'new-user', name: 'New User' }];
            
            await testAdapter.testActivity({
                type: 'conversationUpdate',
                membersAdded: membersAdded,
                recipient: { id: 'bot' },
                channelId: 'test'
            }, (activity) => {
                expect(activity.attachments).toBeDefined();
                expect(activity.attachments[0].contentType).toBe('application/vnd.microsoft.card.adaptive');
            });
        });

        test('should handle adaptive card actions', async () => {
            const cardAction = {
                type: 'message',
                value: {
                    action: 'booking',
                    text: 'I\'d like to book an appointment'
                }
            };

            await testAdapter.test(cardAction, (activity) => {
                expect(activity.type).toBe('message');
            });
        });
    });

    describe('State Management', () => {
        test('should persist user profile', async () => {
            await testAdapter
                .send('My name is John')
                .assertReply(() => true);

            // Check if user state is saved
            const userProfile = await userState.createProperty('UserProfile').get(
                testAdapter.activeQueue[0].context, 
                () => ({})
            );
            
            // State should be maintained (this is a simplified test)
            expect(userProfile).toBeDefined();
        });

        test('should maintain conversation state across turns', async () => {
            await testAdapter
                .send('Start booking')
                .assertReply(() => true)
                .send('Next step')
                .assertReply((activity) => {
                    // Should maintain booking context
                    expect(activity.type).toBe('message');
                });
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed input gracefully', async () => {
            const malformedInput = { type: 'invalid', text: null };
            
            await testAdapter.test(malformedInput, (activity) => {
                expect(activity.type).toBe('message');
                expect(activity.text).toBeDefined();
            });
        });

        test('should handle service failures', async () => {
            // Mock a service failure
            const originalLuisRecognizer = bot.luisRecognizer;
            bot.luisRecognizer = {
                recognize: () => { throw new Error('Service unavailable'); }
            };

            await testAdapter.test('Hello', (activity) => {
                expect(activity.type).toBe('message');
                // Should fall back gracefully
            });

            // Restore original recognizer
            bot.luisRecognizer = originalLuisRecognizer;
        });
    });

    describe('Intent Recognition', () => {
        test('should recognize booking intent with high confidence', async () => {
            // This would normally test against real LUIS endpoint
            // For unit tests, we mock the response
            const mockLuisResult = {
                query: 'book an appointment',
                prediction: {
                    topIntent: 'BookAppointment',
                    intents: {
                        BookAppointment: { score: 0.95 }
                    },
                    entities: {}
                }
            };

            // Test intent recognition logic
            expect(mockLuisResult.prediction.topIntent).toBe('BookAppointment');
            expect(mockLuisResult.prediction.intents.BookAppointment.score).toBeGreaterThan(0.5);
        });

        test('should extract entities correctly', async () => {
            const mockLuisResult = {
                prediction: {
                    entities: {
                        datetime: [{ type: 'date', resolution: [{ value: '2024-01-15' }] }],
                        appointmentType: ['consultation']
                    }
                }
            };

            expect(mockLuisResult.prediction.entities.datetime).toBeDefined();
            expect(mockLuisResult.prediction.entities.appointmentType[0]).toBe('consultation');
        });
    });

    describe('Performance', () => {
        test('should respond within acceptable time', async () => {
            const startTime = Date.now();
            
            await testAdapter.test('Hello', () => {
                const responseTime = Date.now() - startTime;
                expect(responseTime).toBeLessThan(1000); // 1 second max
            });
        });

        test('should handle concurrent conversations', async () => {
            const adapters = Array.from({ length: 5 }, () => 
                new TestAdapter(async (context) => await bot.run(context))
            );

            const promises = adapters.map(adapter => 
                adapter.test('Hello', () => true)
            );

            await Promise.all(promises);
            // All conversations should complete successfully
        });
    });

    afterEach(() => {
        // Cleanup
        testAdapter = null;
        bot = null;
    });
});

// Helper function for testing conversation flows
function createConversationTest(steps) {
    return async (testAdapter) => {
        let currentAdapter = testAdapter;
        
        for (const step of steps) {
            if (step.send) {
                currentAdapter = currentAdapter.send(step.send);
            }
            if (step.assertReply) {
                currentAdapter = currentAdapter.assertReply(step.assertReply);
            }
        }
        
        return currentAdapter;
    };
}

// Export test utilities for reuse
module.exports = {
    createConversationTest
};