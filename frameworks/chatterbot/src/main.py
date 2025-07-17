#!/usr/bin/env python3
"""
Simple ChatterBot implementation with training and conversation capabilities.
"""

from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer, ListTrainer
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


class SimpleChatBot:
    """A simple chatbot implementation using ChatterBot."""
    
    def __init__(self, name="Simple Bot", database_uri=None):
        """Initialize the chatbot with configuration."""
        
        if database_uri is None:
            database_uri = 'sqlite:///chatbot.sqlite3'
        
        self.chatbot = ChatBot(
            name,
            storage_adapter='chatterbot.storage.SQLStorageAdapter',
            logic_adapters=[
                'chatterbot.logic.BestMatch',
                'chatterbot.logic.TimeLogicAdapter',
                'chatterbot.logic.MathematicalEvaluation'
            ],
            database_uri=database_uri,
            trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
        )
        
        self.trained = False
        logger.info(f"Initialized {name} chatbot")
    
    def train_corpus(self, corpus="chatterbot.corpus.english"):
        """Train the chatbot using corpus data."""
        logger.info(f"Training chatbot with corpus: {corpus}")
        
        trainer = ChatterBotCorpusTrainer(self.chatbot)
        trainer.train(corpus)
        
        self.trained = True
        logger.info("Corpus training completed")
    
    def train_custom(self, conversation_list):
        """Train the chatbot with custom conversation pairs."""
        logger.info("Training chatbot with custom conversations")
        
        trainer = ListTrainer(self.chatbot)
        trainer.train(conversation_list)
        
        self.trained = True
        logger.info("Custom training completed")
    
    def get_response(self, input_text):
        """Get a response from the chatbot."""
        if not self.trained:
            logger.warning("Chatbot not trained yet, training with basic corpus")
            self.train_corpus("chatterbot.corpus.english.greetings")
        
        response = self.chatbot.get_response(input_text)
        return str(response)
    
    def start_conversation(self):
        """Start an interactive conversation."""
        print("🤖 ChatterBot is ready! (Type 'quit', 'exit', or 'bye' to stop)")
        print("="*50)
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("Bot: Goodbye! Thanks for chatting!")
                    break
                
                if not user_input:
                    continue
                
                response = self.get_response(user_input)
                print(f"Bot: {response}")
                
            except KeyboardInterrupt:
                print("\nBot: Goodbye! Thanks for chatting!")
                break
            except Exception as e:
                logger.error(f"Error processing input: {e}")
                print("Bot: I'm sorry, I encountered an error. Please try again.")


def main():
    """Main function to run the chatbot."""
    print("🚀 Starting ChatterBot...")
    
    # Create chatbot instance
    bot = SimpleChatBot("Demo Bot")
    
    # Check if training is needed
    train_mode = os.getenv('TRAIN_MODE', 'auto')
    
    if train_mode == 'corpus':
        print("📚 Training with English corpus...")
        bot.train_corpus()
    elif train_mode == 'custom':
        print("📝 Training with custom conversations...")
        custom_training = [
            "Hello",
            "Hi there! How can I help you today?",
            "How are you?",
            "I'm doing well, thank you for asking!",
            "What's your name?",
            "I'm a ChatterBot created to have conversations with you.",
            "What can you do?",
            "I can chat with you about various topics. I learn from our conversations!",
            "Tell me a joke",
            "Why don't scientists trust atoms? Because they make up everything!",
            "What's the weather like?",
            "I don't have access to weather data, but I hope it's nice where you are!",
            "Goodbye",
            "Goodbye! It was nice talking with you!"
        ]
        bot.train_custom(custom_training)
    elif train_mode == 'auto':
        print("🔄 Auto-training with basic conversations...")
        bot.train_corpus("chatterbot.corpus.english.greetings")
        bot.train_corpus("chatterbot.corpus.english.conversations")
    
    print("✅ Training completed!")
    print()
    
    # Start interactive conversation
    bot.start_conversation()


if __name__ == "__main__":
    main()