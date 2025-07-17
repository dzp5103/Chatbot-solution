# Browser Automation Testing

Comprehensive browser automation testing suite for chatbot interfaces using Playwright and Puppeteer.

## 🚀 Quick Start

```bash
# Install dependencies
cd testing/browser-automation/
npm install

# Run all tests
npm test

# Run specific framework tests
npm run test:rasa
npm run test:botpress
npm run test:chatterbot
```

## 📋 Prerequisites

- Node.js 18+
- Chrome/Chromium browser
- Chatbot services running locally
- 4GB RAM minimum

## 🏗️ Project Structure

```
testing/browser-automation/
├── 📁 tests/                     # Test suites
│   ├── rasa/                    # Rasa-specific tests
│   │   ├── chat-interface.test.js
│   │   ├── api-endpoints.test.js
│   │   └── conversation-flow.test.js
│   ├── botpress/                # Botpress-specific tests
│   │   ├── studio-interface.test.js
│   │   ├── webchat.test.js
│   │   └── admin-panel.test.js
│   ├── chatterbot/              # ChatterBot tests
│   │   ├── web-interface.test.js
│   │   └── api-responses.test.js
│   └── shared/                  # Shared test utilities
│       ├── helpers.js
│       ├── fixtures.js
│       └── constants.js
├── 📁 pages/                     # Page Object Models
│   ├── BasePage.js
│   ├── ChatPage.js
│   ├── AdminPage.js
│   └── ConversationPage.js
├── 📁 config/                    # Configuration files
│   ├── playwright.config.js
│   ├── puppeteer.config.js
│   └── test.config.js
├── 📁 screenshots/               # Test screenshots
├── 📁 reports/                   # Test reports
├── 📄 package.json              # Dependencies
└── 📖 README.md                 # This file
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```bash
# Test environment URLs
RASA_URL=http://localhost:5005
BOTPRESS_URL=http://localhost:3000
CHATTERBOT_URL=http://localhost:5000

# Browser configuration
BROWSER=chromium
HEADLESS=true
SLOW_MO=100
TIMEOUT=30000

# Test configuration
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
PARALLEL_TESTS=2

# Authentication
BOTPRESS_ADMIN_EMAIL=admin@example.com
BOTPRESS_ADMIN_PASSWORD=123456
API_TOKEN=your_api_token_here
```

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] }
    }
  ]
};
```

## 🧪 Test Examples

### Chat Interface Testing

```javascript
// tests/shared/chat-interface.test.js
const { test, expect } = require('@playwright/test');

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display chat widget', async ({ page }) => {
    await expect(page.locator('.chat-widget')).toBeVisible();
    await expect(page.locator('.chat-input')).toBeVisible();
    await expect(page.locator('.send-button')).toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    const chatInput = page.locator('.chat-input');
    const sendButton = page.locator('.send-button');
    
    // Send greeting message
    await chatInput.fill('Hello');
    await sendButton.click();
    
    // Check user message appears
    await expect(page.locator('.user-message').last()).toContainText('Hello');
    
    // Wait for bot response
    await expect(page.locator('.bot-message').last()).toBeVisible();
    
    // Verify response is not empty
    const botResponse = await page.locator('.bot-message').last().textContent();
    expect(botResponse.trim()).not.toBe('');
  });

  test('should handle conversation flow', async ({ page }) => {
    const messages = [
      { user: 'Hello', expectedKeywords: ['hi', 'hello', 'welcome'] },
      { user: 'How are you?', expectedKeywords: ['good', 'well', 'fine'] },
      { user: 'What can you do?', expectedKeywords: ['help', 'assist', 'can'] },
      { user: 'Goodbye', expectedKeywords: ['bye', 'goodbye', 'see you'] }
    ];

    for (const { user, expectedKeywords } of messages) {
      await page.locator('.chat-input').fill(user);
      await page.locator('.send-button').click();
      
      // Wait for response
      await page.waitForSelector('.bot-message:last-child', { timeout: 10000 });
      
      const response = await page.locator('.bot-message').last().textContent();
      const hasExpectedKeyword = expectedKeywords.some(keyword => 
        response.toLowerCase().includes(keyword)
      );
      
      expect(hasExpectedKeyword).toBeTruthy();
    }
  });

  test('should handle emoji and special characters', async ({ page }) => {
    const specialMessages = [
      '😀 Hello!',
      'Test with @#$%^&* symbols',
      'Multiple    spaces',
      'Line\nbreak\ntest'
    ];

    for (const message of specialMessages) {
      await page.locator('.chat-input').fill(message);
      await page.locator('.send-button').click();
      
      // Verify message is displayed correctly
      await expect(page.locator('.user-message').last()).toContainText(message);
      
      // Verify bot responds
      await expect(page.locator('.bot-message').last()).toBeVisible();
    }
  });
});
```

### Rasa-Specific Tests

```javascript
// tests/rasa/conversation-flow.test.js
const { test, expect } = require('@playwright/test');

test.describe('Rasa Conversation Flow', () => {
  test('should handle weather inquiry', async ({ page }) => {
    await page.goto('http://localhost:5005');
    
    // Send weather request
    await page.locator('#message-input').fill('What\'s the weather like?');
    await page.locator('#send-button').click();
    
    // Wait for response
    await page.waitForSelector('.bot-response:last-child');
    
    const response = await page.locator('.bot-response').last().textContent();
    expect(response).toMatch(/weather|temperature|sunny|cloudy|rainy/i);
  });

  test('should handle appointment booking', async ({ page }) => {
    await page.goto('http://localhost:5005');
    
    // Start booking flow
    await page.locator('#message-input').fill('I want to book an appointment');
    await page.locator('#send-button').click();
    
    await page.waitForSelector('.bot-response:last-child');
    
    // Provide appointment time
    await page.locator('#message-input').fill('Tomorrow at 2 PM');
    await page.locator('#send-button').click();
    
    await page.waitForSelector('.bot-response:last-child');
    
    const response = await page.locator('.bot-response').last().textContent();
    expect(response).toMatch(/appointment|booked|scheduled|confirmed/i);
  });
});
```

### Botpress Studio Tests

```javascript
// tests/botpress/studio-interface.test.js
const { test, expect } = require('@playwright/test');

test.describe('Botpress Studio Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Login to Botpress
    await page.goto('http://localhost:3000');
    await page.locator('#email').fill(process.env.BOTPRESS_ADMIN_EMAIL);
    await page.locator('#password').fill(process.env.BOTPRESS_ADMIN_PASSWORD);
    await page.locator('#login-button').click();
    await page.waitForSelector('.studio-workspace');
  });

  test('should load flow editor', async ({ page }) => {
    await page.locator('[data-testid="flows-tab"]').click();
    await expect(page.locator('.flow-editor')).toBeVisible();
    await expect(page.locator('.flow-nodes')).toBeVisible();
  });

  test('should create new flow', async ({ page }) => {
    await page.locator('[data-testid="flows-tab"]').click();
    await page.locator('[data-testid="new-flow-button"]').click();
    
    await page.locator('#flow-name').fill('Test Flow');
    await page.locator('#create-flow-button').click();
    
    await expect(page.locator('.flow-editor')).toBeVisible();
    await expect(page.locator('.flow-title')).toContainText('Test Flow');
  });

  test('should test conversation in emulator', async ({ page }) => {
    await page.locator('[data-testid="emulator-tab"]').click();
    await expect(page.locator('.chat-emulator')).toBeVisible();
    
    // Send test message
    await page.locator('.emulator-input').fill('Hello');
    await page.locator('.emulator-send').click();
    
    // Check for response
    await expect(page.locator('.emulator-message.bot')).toBeVisible();
  });
});
```

### Performance Testing

```javascript
// tests/shared/performance.test.js
const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('should load chat interface quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('.chat-widget');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Load within 3 seconds
  });

  test('should respond to messages quickly', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    await page.locator('.chat-input').fill('Hello');
    await page.locator('.send-button').click();
    await page.waitForSelector('.bot-message:last-child');
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(5000); // Respond within 5 seconds
  });

  test('should handle multiple rapid messages', async ({ page }) => {
    await page.goto('/');
    
    const messages = ['Hello', 'How are you?', 'What time is it?', 'Goodbye'];
    
    for (const message of messages) {
      await page.locator('.chat-input').fill(message);
      await page.locator('.send-button').click();
      await page.waitForTimeout(100); // Small delay between messages
    }
    
    // Wait for all responses
    await page.waitForSelector(`.bot-message:nth-child(${messages.length * 2})`);
    
    // Verify all bot responses are present
    const botMessages = await page.locator('.bot-message').count();
    expect(botMessages).toBe(messages.length);
  });
});
```

### Mobile Testing

```javascript
// tests/shared/mobile.test.js
const { test, expect, devices } = require('@playwright/test');

test.describe('Mobile Chat Interface', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile-specific elements
    await expect(page.locator('.chat-widget')).toBeVisible();
    await expect(page.locator('.mobile-chat-toggle')).toBeVisible();
    
    // Test touch interactions
    await page.locator('.mobile-chat-toggle').tap();
    await expect(page.locator('.chat-interface')).toBeVisible();
  });

  test('should handle touch input', async ({ page }) => {
    await page.goto('/');
    
    // Open chat on mobile
    await page.locator('.mobile-chat-toggle').tap();
    
    // Type message using mobile keyboard
    await page.locator('.chat-input').tap();
    await page.locator('.chat-input').fill('Hello from mobile');
    await page.locator('.send-button').tap();
    
    // Verify response
    await expect(page.locator('.bot-message').last()).toBeVisible();
  });
});
```

## 📊 Test Reporting

### HTML Reports

```javascript
// Generate HTML reports
npm run test:report

// Open report
open reports/playwright-report/index.html
```

### CI/CD Integration

```yaml
# .github/workflows/browser-tests.yml
name: Browser Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install
      
      - name: Start chatbot services
        run: docker-compose up -d
      
      - name: Wait for services
        run: ./scripts/wait-for-services.sh
      
      - name: Run tests
        run: npm test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: reports/
```

### Custom Reporters

```javascript
// config/custom-reporter.js
class CustomReporter {
  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestEnd(test, result) {
    console.log(`Finished test ${test.title}: ${result.status}`);
    
    if (result.status === 'failed') {
      console.log(`  Error: ${result.error.message}`);
    }
  }

  onEnd(result) {
    console.log(`Finished the run: ${result.status}`);
    
    // Send results to external system
    this.sendResults(result);
  }

  sendResults(result) {
    // Implementation for sending results to dashboard/Slack/etc.
  }
}

module.exports = CustomReporter;
```

## 🚨 Troubleshooting

### Common Issues

**1. Browser launch failures**
```bash
# Install browser dependencies
npx playwright install-deps

# Check browser installation
npx playwright install chromium
```

**2. Test timeouts**
```javascript
// Increase timeout in test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  await page.goto('/');
});
```

**3. Flaky tests**
```javascript
// Add retry logic
test('flaky test', async ({ page }) => {
  await test.step('retry step', async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await page.locator('.element').click();
        break;
      } catch (error) {
        if (i === 2) throw error;
        await page.waitForTimeout(1000);
      }
    }
  });
});
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Visual Testing](https://playwright.dev/docs/screenshots)

## 🤝 Contributing

1. Add tests for new chatbot features
2. Follow the Page Object Model pattern
3. Include both positive and negative test cases
4. Add performance tests for critical paths
5. Update documentation for new test utilities

## 📄 License

This testing suite is part of the Chatbot Solutions repository and follows the same license terms.

## 🏷️ Version

**Playwright Version**: 1.40+  
**Node.js Version**: 18+  
**Last Updated**: 2024