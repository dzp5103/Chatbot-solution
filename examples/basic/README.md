# Basic Greeting Chatbot

A simple chatbot implementation that demonstrates basic conversation patterns and can be extended for more complex use cases.

## Overview

This basic chatbot provides:
- Greeting and farewell interactions
- Simple FAQ responses
- Weather information (mock)
- Name recognition and context

## Quick Start

### Using Rasa

```bash
cd frameworks/rasa
pip install -r requirements.txt
rasa train
rasa shell
```

### Using Node.js (Simple Implementation)

```bash
cd examples/basic/greeting-bot
npm install
npm start
```

## Implementation

### 1. Rasa Version

Located in `frameworks/rasa/`, this implementation includes:

**Intents:**
- `greet` - Hello, hi, good morning
- `goodbye` - Bye, see you later
- `ask_name` - What's your name?
- `provide_name` - My name is...
- `ask_weather` - What's the weather?

**Example Conversation:**
```
User: Hello
Bot: Hey! How can I help you today?

User: What's your name?
Bot: I'm a chatbot built with Rasa. What should I call you?

User: My name is Sarah
Bot: Nice to meet you, Sarah!

User: What's the weather like?
Bot: The current weather is sunny with a temperature of 22°C and humidity at 65%.
```

### 2. Simple Node.js Version

```javascript
const express = require('express');
const app = express();

const responses = {
  greet: ["Hello!", "Hi there!", "Hey! How can I help?"],
  goodbye: ["Goodbye!", "See you later!", "Have a great day!"],
  default: ["I'm not sure I understand. Can you rephrase that?"]
};

app.post('/chat', (req, res) => {
  const { message } = req.body;
  const intent = classifyIntent(message);
  const response = getResponse(intent);
  res.json({ response });
});

function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'greet';
  }
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return 'goodbye';
  }
  return 'default';
}

function getResponse(intent) {
  const responseList = responses[intent] || responses.default;
  return responseList[Math.floor(Math.random() * responseList.length)];
}

app.listen(3000, () => {
  console.log('Basic chatbot running on port 3000');
});
```

### 3. Python Version (ChatterBot)

```python
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

# Create chatbot
chatbot = ChatBot('BasicBot')

# Train with English corpus
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train("chatterbot.corpus.english.greetings")
trainer.train("chatterbot.corpus.english.conversations")

# Chat function
def chat():
    print("Bot: Hello! I'm a basic chatbot. Type 'quit' to exit.")
    
    while True:
        user_input = input("You: ")
        
        if user_input.lower() == 'quit':
            print("Bot: Goodbye!")
            break
            
        response = chatbot.get_response(user_input)
        print(f"Bot: {response}")

if __name__ == "__main__":
    chat()
```

## Features

### Supported Interactions

1. **Greetings**
   - "Hello", "Hi", "Good morning"
   - Responds with friendly greeting

2. **Farewells**
   - "Goodbye", "Bye", "See you later"
   - Provides polite closing

3. **Name Exchange**
   - Asks for user's name
   - Remembers name in conversation

4. **Weather (Mock)**
   - Provides sample weather information
   - Can be extended with real API

5. **Help**
   - Lists available commands
   - Guides user interaction

### Conversation Flow

```
┌─────────────┐
│   Greeting  │
└─────┬───────┘
      │
      v
┌─────────────┐
│ Name Exchange│
└─────┬───────┘
      │
      v
┌─────────────┐
│ Topic Choice│
├─────────────┤
│ • Weather   │
│ • Help      │
│ • Goodbye   │
└─────┬───────┘
      │
      v
┌─────────────┐
│  Response   │
└─────────────┘
```

## Customization

### Adding New Intents

1. **Rasa Version:**
   ```yaml
   # In data/nlu.yml
   - intent: ask_time
     examples: |
       - what time is it?
       - current time
       - tell me the time
   ```

2. **Node.js Version:**
   ```javascript
   const responses = {
     // ... existing responses
     time: ["The current time is " + new Date().toLocaleTimeString()]
   };
   
   function classifyIntent(message) {
     // ... existing logic
     if (lowerMessage.includes('time')) {
       return 'time';
     }
   }
   ```

### Adding Responses

```yaml
# In domain.yml (Rasa)
responses:
  utter_ask_time:
  - text: "The current time is {time}"
  - text: "It's {time} right now"
```

### Context Management

```python
# Store conversation context
context = {
  'user_name': None,
  'last_topic': None,
  'conversation_start': datetime.now()
}

def update_context(intent, entities):
    if intent == 'provide_name':
        context['user_name'] = entities.get('name')
    context['last_topic'] = intent
```

## Testing

### Manual Testing

```bash
# Test with Rasa
rasa shell

# Test conversation flow
User: Hello
User: My name is John
User: What's the weather?
User: Goodbye
```

### Automated Testing

```bash
# Run conversation tests
rasa test

# Test with sample data
python test_basic_bot.py
```

### Test Cases

1. **Greeting Flow**
   - Input: "Hello"
   - Expected: Greeting response

2. **Name Recognition**
   - Input: "My name is Alice"
   - Expected: "Nice to meet you, Alice!"

3. **Weather Request**
   - Input: "How's the weather?"
   - Expected: Weather information

4. **Unknown Input**
   - Input: "xyz123"
   - Expected: Clarification request

## Deployment

### Local Development

```bash
# Rasa
rasa run --enable-api

# Node.js
npm start

# Python
python basic_bot.py
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment

```bash
# Deploy to Heroku
git add .
git commit -m "Basic chatbot"
git push heroku main
```

## Extension Ideas

### Intermediate Features

1. **FAQ System**
   ```yaml
   - intent: ask_faq
     examples: |
       - what are your hours?
       - how can I contact support?
       - what services do you offer?
   ```

2. **Form Handling**
   ```yaml
   forms:
     contact_form:
       required_slots:
         - name
         - email
         - message
   ```

3. **Button/Quick Replies**
   ```json
   {
     "text": "What would you like to know?",
     "quick_replies": [
       {"title": "Weather", "payload": "/ask_weather"},
       {"title": "Help", "payload": "/ask_help"}
     ]
   }
   ```

### Advanced Features

1. **API Integration**
2. **Database Storage**
3. **Multi-language Support**
4. **Analytics Integration**
5. **Voice Interface**

## Troubleshooting

### Common Issues

1. **Training Fails**
   ```bash
   # Clear cache and retrain
   rm -rf .rasa
   rasa train --force
   ```

2. **Poor Response Quality**
   - Add more training examples
   - Improve intent classification
   - Use confidence thresholds

3. **Context Not Maintained**
   - Check slot configuration
   - Verify session settings
   - Review conversation design

### Debug Mode

```bash
# Rasa debug
rasa shell --debug

# Node.js debug
DEBUG=* npm start
```

This basic chatbot provides a foundation for building more sophisticated conversational AI systems. Start here and gradually add complexity as needed.