# Testing Framework for Chatbot Solutions

This directory contains comprehensive testing frameworks and examples for validating chatbot implementations across multiple dimensions.

## 🧪 Testing Structure

```
testing/
├── unit/                      # Unit testing frameworks
│   ├── rasa/                 # Rasa-specific unit tests
│   ├── botpress/             # Botpress unit tests  
│   ├── microsoft-bot/        # Bot Framework unit tests
│   └── common/               # Shared testing utilities
├── integration/              # Integration testing suites
│   ├── api-tests/            # API endpoint testing
│   ├── database-tests/       # Database integration
│   ├── service-tests/        # External service mocking
│   └── multi-framework/      # Cross-framework testing
└── conversation-flow/        # Conversation testing
    ├── scenarios/            # Test conversation scenarios
    ├── nlu-testing/          # NLU accuracy testing
    ├── dialogue-testing/     # Multi-turn conversation tests
    └── performance/          # Load and performance testing
```

## 🎯 Testing Philosophy

### Test Pyramid Approach
1. **Unit Tests** (70%): Fast, isolated component testing
2. **Integration Tests** (20%): Service interaction validation
3. **End-to-End Tests** (10%): Complete user journey testing

### Conversation-Specific Testing
- **Intent Recognition**: NLU accuracy and confidence scoring
- **Entity Extraction**: Parameter detection and validation
- **Context Management**: Multi-turn conversation state
- **Response Quality**: Content relevance and formatting
- **Error Handling**: Graceful failure and recovery

## 🚀 Quick Start

### Run All Tests
```bash
# Run complete test suite
npm run test:all

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:conversation
```

### Framework-Specific Testing
```bash
# Test Rasa implementation
cd testing/unit/rasa && pytest

# Test Microsoft Bot Framework
cd testing/unit/microsoft-bot && npm test

# Test Botpress flows
cd testing/conversation-flow && npm run test:botpress
```

## 📊 Test Coverage Goals

### Minimum Coverage Requirements
- **Unit Tests**: 80% code coverage
- **Integration Tests**: All API endpoints
- **Conversation Tests**: Core user journeys
- **Performance Tests**: Response time < 500ms

### Quality Gates
- All tests must pass before deployment
- Coverage reports generated automatically
- Performance benchmarks validated
- Security vulnerabilities scanned

## 🔧 Testing Tools & Frameworks

### Unit Testing
- **Jest** (JavaScript/TypeScript)
- **pytest** (Python/Rasa)
- **Mocha/Chai** (Alternative JS testing)

### Integration Testing
- **Supertest** (API testing)
- **Docker Compose** (Service orchestration)
- **Testcontainers** (Database testing)

### Conversation Testing
- **Rasa Test** (NLU/Core testing)
- **Bot Framework Testing** (Dialog validation)
- **Custom Conversation Simulator**

### Performance Testing
- **Artillery** (Load testing)
- **Apache Bench** (Simple benchmarking)
- **k6** (Performance testing)

## 📝 Test Writing Guidelines

### Unit Test Example
```javascript
// frameworks/microsoft-bot/test/bot.test.js
describe('Microsoft Bot', () => {
  test('should respond to greeting intent', async () => {
    const bot = new MicrosoftBot(mockState, mockLogger);
    const response = await bot.processMessage(mockGreetingContext);
    
    expect(response.text).toContain('Hello');
    expect(response.attachments).toBeDefined();
  });
});
```

### Conversation Test Example
```yaml
# conversation-flow/scenarios/booking-flow.yml
stories:
- story: successful appointment booking
  steps:
  - user: |
      I want to book an appointment
    intent: book_appointment
  - action: utter_ask_appointment_type
  - user: |
      business consultation
    intent: provide_appointment_type
    entities:
    - appointment_type: business
  - action: utter_ask_date
```

### Integration Test Example
```javascript
// integration/api-tests/bot-endpoint.test.js
describe('Bot API Endpoints', () => {
  test('POST /api/messages should process bot messages', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send(mockBotMessage)
      .expect(200);
      
    expect(response.body).toHaveProperty('activities');
  });
});
```

## 🎨 Test Data Management

### Mock Data
- Realistic conversation examples
- Anonymized user data
- Various language patterns
- Edge case scenarios

### Test Fixtures
```javascript
// common/fixtures/conversations.js
export const mockConversations = {
  greeting: {
    user: "Hello",
    expected: { intent: "greeting", confidence: > 0.8 }
  },
  booking: {
    user: "I need to book an appointment",
    expected: { intent: "book_appointment", confidence: > 0.7 }
  }
};
```

## 📈 Continuous Testing

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Chatbot Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run Tests
      run: |
        npm run test:all
        npm run test:coverage
```

### Automated Testing Schedule
- **On commit**: Unit tests
- **On PR**: Full test suite
- **Nightly**: Performance tests
- **Weekly**: Security scans

## 🔍 Test Reporting

### Coverage Reports
- HTML coverage reports
- Badge integration
- Trend analysis
- Quality gates

### Performance Metrics
- Response time percentiles
- Throughput measurements
- Resource utilization
- Error rates

## 🛡️ Testing Best Practices

### DO:
- ✅ Write tests before implementing features
- ✅ Use descriptive test names
- ✅ Mock external dependencies
- ✅ Test both success and failure scenarios
- ✅ Keep tests independent and isolated
- ✅ Validate conversation context and state

### DON'T:
- ❌ Skip testing error handling
- ❌ Use production data in tests
- ❌ Create dependent test chains
- ❌ Ignore flaky tests
- ❌ Test implementation details
- ❌ Hardcode test data

## 🚨 Debugging Test Failures

### Common Issues
1. **Flaky Tests**: Network timeouts, timing issues
2. **State Pollution**: Tests affecting each other
3. **Mock Issues**: Outdated or incorrect mocks
4. **Environment Differences**: Local vs CI variations

### Debugging Tools
- Test runners with watch mode
- Debug logging and breakpoints
- Test isolation utilities
- Conversation replay tools

## 📚 Resources

### Documentation
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [pytest Documentation](https://docs.pytest.org/)
- [Rasa Testing Guide](https://rasa.com/docs/rasa/testing-your-assistant)
- [Bot Framework Testing](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-testing)

### Training Materials
- Testing best practices workshops
- Conversation design testing
- Performance testing strategies
- Security testing methodologies

## 🤝 Contributing

When adding new tests:
1. Follow naming conventions
2. Include both positive and negative cases  
3. Document test scenarios
4. Update coverage requirements
5. Ensure tests are maintainable

For questions about testing strategies or implementation details, refer to the main repository documentation or open an issue.