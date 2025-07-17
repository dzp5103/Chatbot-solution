const { WaterfallDialog, TextPrompt, DateTimePrompt, ChoicePrompt, ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory } = require('botbuilder');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const TEXT_PROMPT = 'textPrompt';
const DATETIME_PROMPT = 'datetimePrompt';
const CHOICE_PROMPT = 'choicePrompt';

/**
 * Main dialog that orchestrates the conversation flow
 */
class MainDialog extends ComponentDialog {
    constructor() {
        super('mainDialog');

        // Add prompts
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        // Add main waterfall dialog
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.introStep.bind(this),
            this.getServiceStep.bind(this),
            this.getDateStep.bind(this),
            this.getTimeStep.bind(this),
            this.confirmStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * Introduction step - welcome and ask for service type
     */
    async introStep(stepContext) {
        const messageText = `🎯 **Appointment Booking System**

I'll help you book an appointment! This will take just a few moments.

What type of service would you like to book?`;

        const promptMessage = MessageFactory.text(messageText);
        
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: promptMessage,
            choices: [
                { value: 'consultation', synonyms: ['consult', 'meeting', 'discussion'] },
                { value: 'support', synonyms: ['help', 'assistance', 'technical'] },
                { value: 'demo', synonyms: ['demonstration', 'presentation', 'show'] },
                { value: 'training', synonyms: ['education', 'learning', 'workshop'] },
                { value: 'other', synonyms: ['different', 'custom', 'special'] }
            ]
        });
    }

    /**
     * Get service details
     */
    async getServiceStep(stepContext) {
        // Store the service type
        stepContext.options.serviceType = stepContext.result.value;

        const serviceMessages = {
            consultation: "📋 Great choice! A consultation session will help us understand your needs better.",
            support: "🛠️ Perfect! I'll set up a support session to resolve your technical issues.",
            demo: "🎥 Excellent! A demo session will showcase our features and capabilities.",
            training: "🎓 Wonderful! A training session will help you get the most out of our platform.",
            other: "✨ No problem! We'll customize the session based on your specific requirements."
        };

        const confirmMessage = serviceMessages[stepContext.options.serviceType] || "👍 Got it!";
        await stepContext.context.sendActivity(MessageFactory.text(confirmMessage));

        const promptText = "📞 Could you please provide your name and contact information?";
        return await stepContext.prompt(TEXT_PROMPT, { prompt: MessageFactory.text(promptText) });
    }

    /**
     * Get preferred date
     */
    async getDateStep(stepContext) {
        // Store contact info
        stepContext.options.contactInfo = stepContext.result;

        const promptText = `📅 **Date Selection**

When would you prefer to schedule your ${stepContext.options.serviceType}? 

Please provide a preferred date (e.g., "tomorrow", "next Monday", "December 15th"):`;
        
        return await stepContext.prompt(DATETIME_PROMPT, { 
            prompt: MessageFactory.text(promptText),
            retryPrompt: MessageFactory.text("Please provide a valid date (e.g., 'tomorrow', 'next week', 'December 15').")
        });
    }

    /**
     * Get preferred time
     */
    async getTimeStep(stepContext) {
        // Store the date
        stepContext.options.appointmentDate = stepContext.result[0].value;

        const promptText = `⏰ **Time Selection**

What time would work best for you? 

Available slots:
• 🌅 **Morning** (9:00 AM - 12:00 PM)
• 🌞 **Afternoon** (1:00 PM - 5:00 PM)  
• 🌆 **Evening** (6:00 PM - 8:00 PM)

Please specify your preferred time:`;
        
        return await stepContext.prompt(TEXT_PROMPT, { prompt: MessageFactory.text(promptText) });
    }

    /**
     * Confirmation step
     */
    async confirmStep(stepContext) {
        // Store the time
        stepContext.options.appointmentTime = stepContext.result;

        const date = new Date(stepContext.options.appointmentDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const confirmationCard = this.createConfirmationCard(
            stepContext.options.serviceType,
            stepContext.options.contactInfo,
            formattedDate,
            stepContext.options.appointmentTime
        );

        const confirmMessage = MessageFactory.attachment(confirmationCard);
        await stepContext.context.sendActivity(confirmMessage);

        const promptText = "✅ Does this look correct? Please confirm your appointment:";
        
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: MessageFactory.text(promptText),
            choices: [
                { value: 'confirm', synonyms: ['yes', 'correct', 'ok', 'confirm'] },
                { value: 'modify', synonyms: ['change', 'edit', 'update', 'modify'] },
                { value: 'cancel', synonyms: ['no', 'abort', 'stop', 'cancel'] }
            ]
        });
    }

    /**
     * Final step - process confirmation
     */
    async finalStep(stepContext) {
        const choice = stepContext.result.value;

        switch (choice) {
            case 'confirm':
                await this.processBooking(stepContext);
                break;
                
            case 'modify':
                await stepContext.context.sendActivity(MessageFactory.text("🔄 Let's start over. I'll help you reschedule your appointment."));
                return await stepContext.replaceDialog(this.id);
                
            case 'cancel':
                await stepContext.context.sendActivity(MessageFactory.text("❌ No problem! Your appointment has been cancelled. Feel free to book again anytime."));
                break;
        }

        return await stepContext.endDialog();
    }

    /**
     * Process the booking confirmation
     */
    async processBooking(stepContext) {
        // Generate booking reference
        const bookingRef = 'BK' + Date.now().toString().slice(-6);
        
        const successMessage = `🎉 **Appointment Confirmed!**

📋 **Booking Details:**
• **Reference:** ${bookingRef}
• **Service:** ${stepContext.options.serviceType.charAt(0).toUpperCase() + stepContext.options.serviceType.slice(1)}
• **Contact:** ${stepContext.options.contactInfo}
• **Date:** ${new Date(stepContext.options.appointmentDate).toLocaleDateString()}
• **Time:** ${stepContext.options.appointmentTime}

📧 **Next Steps:**
• Confirmation email sent to your address
• Calendar invite will be sent shortly
• You'll receive a reminder 24 hours before

Need to make changes? Contact us or start a new booking.

Thank you for choosing our services! 🚀`;

        await stepContext.context.sendActivity(MessageFactory.text(successMessage));

        // Simulate booking processing
        await this.simulateBookingProcess(stepContext);
    }

    /**
     * Create confirmation card
     */
    createConfirmationCard(serviceType, contactInfo, date, time) {
        const card = {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
                {
                    type: "Container",
                    style: "accent",
                    items: [
                        {
                            type: "TextBlock",
                            text: "📋 Appointment Summary",
                            weight: "Bolder",
                            size: "Large",
                            color: "Light"
                        }
                    ]
                },
                {
                    type: "FactSet",
                    facts: [
                        { title: "Service Type:", value: serviceType.charAt(0).toUpperCase() + serviceType.slice(1) },
                        { title: "Contact:", value: contactInfo },
                        { title: "Date:", value: date },
                        { title: "Time:", value: time }
                    ]
                },
                {
                    type: "Container",
                    style: "good",
                    spacing: "Medium",
                    items: [
                        {
                            type: "TextBlock",
                            text: "✅ Ready to confirm your appointment?",
                            weight: "Bolder"
                        }
                    ]
                }
            ]
        };

        return CardFactory.adaptiveCard(card);
    }

    /**
     * Simulate booking process with status updates
     */
    async simulateBookingProcess(stepContext) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await stepContext.context.sendActivity(MessageFactory.text("📧 Sending confirmation email..."));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await stepContext.context.sendActivity(MessageFactory.text("📅 Adding to calendar system..."));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await stepContext.context.sendActivity(MessageFactory.text("✅ All done! Your appointment is successfully booked."));
    }
}

module.exports.MainDialog = MainDialog;