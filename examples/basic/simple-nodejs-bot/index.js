const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * Simple Node.js chatbot implementation
 * Demonstrates basic conversation patterns and intent classification
 */

class SimpleChatbot {
  constructor() {
    this.context = new Map(); // Store user context
    this.responses = {
      greeting: [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Hey! Great to see you!"
      ],
      goodbye: [
        "Goodbye! Have a great day!",
        "See you later!",
        "Take care!"
      ],
      weather: [
        "The weather is sunny with 22°C temperature.",
        "It's a beautiful day with clear skies!",
        "Current weather: Sunny, 22°C, light breeze."
      ],
      help: [
        "I can help you with:\n• Weather information\n• General questions\n• Simple conversations\n\nJust ask me anything!"
      ],
      thanks: [
        "You're welcome!",
        "Happy to help!",
        "Anytime!"
      ],
      name: [
        "I'm a simple chatbot built with Node.js. What's your name?",
        "You can call me ChatBot! What should I call you?"
      ],
      default: [
        "I'm not sure I understand. Could you rephrase that?",
        "That's interesting! Tell me more.",
        "I'm still learning. Can you ask me something else?"
      ]
    };
  }

  classifyIntent(message) {
    const text = message.toLowerCase().trim();
    
    // Greeting patterns
    if (this.matchesPatterns(text, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      return 'greeting';
    }
    
    // Goodbye patterns
    if (this.matchesPatterns(text, ['bye', 'goodbye', 'see you', 'farewell'])) {
      return 'goodbye';
    }
    
    // Weather patterns
    if (this.matchesPatterns(text, ['weather', 'temperature', 'hot', 'cold', 'rain', 'sunny'])) {
      return 'weather';
    }
    
    // Help patterns
    if (this.matchesPatterns(text, ['help', 'what can you do', 'commands', 'options'])) {
      return 'help';
    }
    
    // Thanks patterns
    if (this.matchesPatterns(text, ['thank', 'thanks', 'thx'])) {
      return 'thanks';
    }
    
    // Name patterns
    if (this.matchesPatterns(text, ['your name', 'who are you', 'what are you called'])) {
      return 'name';
    }
    
    // Name introduction patterns
    if (this.matchesPatterns(text, ['my name is', 'i am', 'call me'])) {
      return 'introduce';
    }
    
    return 'default';
  }

  matchesPatterns(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  extractName(message) {
    const patterns = [
      /my name is (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
      /i'm (\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  getRandomResponse(intent) {
    const responses = this.responses[intent] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  processMessage(message, userId = 'default') {
    const intent = this.classifyIntent(message);
    let response = '';
    
    // Handle name introduction
    if (intent === 'introduce') {
      const name = this.extractName(message);
      if (name) {
        this.context.set(userId, { name });
        response = `Nice to meet you, ${name}! How can I help you today?`;
      } else {
        response = "I'd love to know your name! What should I call you?";
      }
    } 
    // Personalized responses if we know the user's name
    else if (this.context.has(userId) && this.context.get(userId).name) {
      const userName = this.context.get(userId).name;
      response = this.getRandomResponse(intent);
      
      if (intent === 'greeting') {
        response = `Hello ${userName}! ${response}`;
      } else if (intent === 'goodbye') {
        response = `Goodbye ${userName}! ${response}`;
      }
    } 
    // Default responses
    else {
      response = this.getRandomResponse(intent);
    }

    return {
      intent,
      response,
      confidence: this.calculateConfidence(intent),
      timestamp: new Date().toISOString()
    };
  }

  calculateConfidence(intent) {
    // Simple confidence calculation
    return intent === 'default' ? 0.3 : 0.8 + Math.random() * 0.2;
  }
}

// Express server setup
const app = express();
const chatbot = new SimpleChatbot();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint for chat
app.post('/api/chat', (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = chatbot.processMessage(message, userId);
    res.json(result);
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple web interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background: #f5f5f5;
            }
            .chat-container { 
                background: white; 
                border-radius: 10px; 
                padding: 20px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .messages { 
                height: 400px; 
                overflow-y: auto; 
                border: 1px solid #ddd; 
                padding: 10px; 
                margin-bottom: 10px;
                background: #fafafa;
                border-radius: 5px;
            }
            .message { 
                margin: 10px 0; 
                padding: 10px;
                border-radius: 5px;
            }
            .user { 
                background: #007bff; 
                color: white; 
                text-align: right;
                margin-left: 20%;
            }
            .bot { 
                background: #e9ecef; 
                color: #333;
                margin-right: 20%;
            }
            .input-container { 
                display: flex; 
                gap: 10px; 
            }
            input { 
                flex: 1; 
                padding: 10px; 
                border: 1px solid #ddd; 
                border-radius: 5px;
                font-size: 16px;
            }
            button { 
                padding: 10px 20px; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 16px;
            }
            button:hover { 
                background: #0056b3; 
            }
            .typing {
                color: #666;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <h1>Simple Chatbot Demo</h1>
            <div class="messages" id="messages">
                <div class="message bot">Hello! I'm a simple chatbot. Try saying hello!</div>
            </div>
            <div class="input-container">
                <input type="text" id="messageInput" placeholder="Type your message..." 
                       onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>

        <script>
            const messagesDiv = document.getElementById('messages');
            const messageInput = document.getElementById('messageInput');
            const userId = 'user_' + Math.random().toString(36).substr(2, 9);

            function addMessage(text, isUser) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + (isUser ? 'user' : 'bot');
                messageDiv.textContent = text;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            function showTyping() {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'message bot typing';
                typingDiv.textContent = 'Bot is typing...';
                typingDiv.id = 'typing';
                messagesDiv.appendChild(typingDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            function hideTyping() {
                const typingDiv = document.getElementById('typing');
                if (typingDiv) {
                    typingDiv.remove();
                }
            }

            async function sendMessage() {
                const message = messageInput.value.trim();
                if (!message) return;

                addMessage(message, true);
                messageInput.value = '';
                
                showTyping();

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message, userId })
                    });

                    const data = await response.json();
                    
                    // Simulate typing delay
                    setTimeout(() => {
                        hideTyping();
                        addMessage(data.response, false);
                    }, 500 + Math.random() * 1000);

                } catch (error) {
                    hideTyping();
                    addMessage('Sorry, something went wrong. Please try again.', false);
                }
            }

            // Focus on input when page loads
            messageInput.focus();
        </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🤖 Simple chatbot running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to chat`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

module.exports = { SimpleChatbot, app };