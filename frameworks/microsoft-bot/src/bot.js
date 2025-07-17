const { ActivityHandler, MessageFactory, ConversationState, UserState, MemoryStorage } = require('botbuilder');
const { DialogSet, DialogTurnStatus, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs');
const { MainDialog } = require('./dialogs/mainDialog');
const { LuisRecognizer } = require('botbuilder-ai');
const { QnAMaker } = require('botbuilder-ai');

/**
 * Microsoft Bot Framework implementation with advanced conversation management,
 * LUIS integration, QnA Maker support, and adaptive cards.
 */
class MicrosoftBot extends ActivityHandler {
    constructor(conversationState, userState, logger) {
        super();

        // Initialize state management
        this.conversationState = conversationState;
        this.userState = userState;
        this.logger = logger;

        // Create dialog set
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.dialogs = new DialogSet(this.dialogState);

        // Add main dialog
        this.mainDialog = new MainDialog();
        this.dialogs.add(this.mainDialog);

        // Initialize LUIS recognizer
        if (process.env.LuisAppId && process.env.LuisAPIKey && process.env.LuisAPIHostName) {
            const luisConfig = {
                applicationId: process.env.LuisAppId,
                endpointKey: process.env.LuisAPIKey,
                endpoint: `https://${process.env.LuisAPIHostName}.api.cognitive.microsoft.com`
            };
            this.luisRecognizer = new LuisRecognizer(luisConfig);
        }

        // Initialize QnA Maker
        if (process.env.QnAKnowledgebaseId && process.env.QnAAuthKey && process.env.QnAEndpointHostName) {
            const qnaConfig = {
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAAuthKey,
                host: process.env.QnAEndpointHostName
            };
            this.qnaMaker = new QnAMaker(qnaConfig);
        }

        // Handle member addition
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await this.sendWelcomeMessage(context);
                }
            }
            await next();
        });

        // Handle messages
        this.onMessage(async (context, next) => {
            this.logger.log('Processing message activity.');

            // Run the dialog
            const dialogContext = await this.dialogs.createContext(context);
            const results = await dialogContext.continueDialog();

            if (results.status === DialogTurnStatus.empty) {
                await this.processMessage(context);
            }

            // Save state
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            await next();
        });
    }

    /**
     * Process incoming messages with LUIS and QnA Maker
     */
    async processMessage(context) {
        let recognizerResult = null;

        // Try LUIS first
        if (this.luisRecognizer) {
            recognizerResult = await this.luisRecognizer.recognize(context);
            const topIntent = LuisRecognizer.topIntent(recognizerResult);
            
            if (topIntent !== 'None' && recognizerResult.intents[topIntent].score > 0.5) {
                await this.handleLuisIntent(context, topIntent, recognizerResult);
                return;
            }
        }

        // Fall back to QnA Maker
        if (this.qnaMaker) {
            const qnaResults = await this.qnaMaker.getAnswers(context);
            if (qnaResults.length > 0 && qnaResults[0].score > 0.3) {
                await context.sendActivity(MessageFactory.text(qnaResults[0].answer));
                return;
            }
        }

        // Default response
        await this.sendDefaultResponse(context);
    }

    /**
     * Handle LUIS intents
     */
    async handleLuisIntent(context, intent, recognizerResult) {
        const entities = recognizerResult.entities;

        switch (intent) {
            case 'Greeting':
                await this.sendWelcomeMessage(context);
                break;

            case 'BookAppointment':
                const dialogContext = await this.dialogs.createContext(context);
                await dialogContext.beginDialog('mainDialog');
                break;

            case 'GetWeather':
                const location = entities.location && entities.location[0] ? entities.location[0] : 'your location';
                await context.sendActivity(MessageFactory.text(`I'd be happy to help you get weather information for ${location}. This feature is coming soon!`));
                break;

            case 'Help':
                await this.sendHelpMessage(context);
                break;

            case 'Cancel':
                await context.sendActivity(MessageFactory.text('Okay, I\'ve cancelled that for you.'));
                break;

            default:
                await this.sendDefaultResponse(context);
                break;
        }
    }

    /**
     * Send welcome message with adaptive card
     */
    async sendWelcomeMessage(context) {
        const welcomeCard = require('./cards/welcomeCard.json');
        const cardAttachment = MessageFactory.attachment(this.createAdaptiveCardAttachment(welcomeCard));
        await context.sendActivity(cardAttachment);
    }

    /**
     * Send help message
     */
    async sendHelpMessage(context) {
        const helpText = `
🤖 **Microsoft Bot Framework Assistant**

I can help you with:
• 📅 **Book appointments** - Schedule meetings and appointments
• 🌤️ **Weather information** - Get current weather conditions
• ❓ **Questions** - Ask me anything from my knowledge base
• 💬 **General conversation** - Chat about various topics

**Sample commands:**
• "Book an appointment for tomorrow"
• "What's the weather like?"
• "How can I help you?"
• "Cancel my booking"

Type anything to get started! 🚀
        `;
        await context.sendActivity(MessageFactory.text(helpText));
    }

    /**
     * Send default response
     */
    async sendDefaultResponse(context) {
        const responses = [
            "I'm not sure I understand. Could you rephrase that?",
            "That's interesting! Can you tell me more?",
            "I'm still learning. Could you try asking that differently?",
            "Hmm, I don't have information about that. Try asking something else!",
            "I'd love to help! Could you be more specific?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        await context.sendActivity(MessageFactory.text(randomResponse));
    }

    /**
     * Create adaptive card attachment
     */
    createAdaptiveCardAttachment(card) {
        return {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: card
        };
    }

    /**
     * Send proactive message to user
     */
    async sendProactiveMessage(conversationReference, message) {
        await this.adapter.continueConversation(conversationReference, async (context) => {
            await context.sendActivity(MessageFactory.text(message));
        });
    }

    /**
     * Get user profile
     */
    async getUserProfile(context) {
        const userProfile = await this.userState.createProperty('UserProfile').get(context, () => ({}));
        return userProfile;
    }

    /**
     * Save user profile
     */
    async saveUserProfile(context, profile) {
        await this.userState.createProperty('UserProfile').set(context, profile);
        await this.userState.saveChanges(context);
    }
}

module.exports.MicrosoftBot = MicrosoftBot;