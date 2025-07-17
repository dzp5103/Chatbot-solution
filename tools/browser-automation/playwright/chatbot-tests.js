const { test, expect } = require('@playwright/test');

/**
 * Chatbot UI Testing Suite with Playwright
 * 
 * This test suite provides comprehensive testing for chatbot interfaces
 * including conversation flows, UI interactions, and accessibility validation.
 */

class ChatbotTester {
  constructor(page) {
    this.page = page;
    this.chatInterface = '.chat-interface';
    this.messageInput = '[data-testid="message-input"]';
    this.sendButton = '[data-testid="send-button"]';
    this.messageContainer = '.message-container';
    this.botMessage = '.bot-message';
    this.userMessage = '.user-message';
  }

  async sendMessage(message) {
    await this.page.fill(this.messageInput, message);
    await this.page.click(this.sendButton);
    await this.page.waitForSelector(`${this.botMessage}:last-child`, { timeout: 10000 });
  }

  async getLastBotMessage() {
    const lastMessage = await this.page.locator(`${this.botMessage}:last-child`).textContent();
    return lastMessage.trim();
  }

  async waitForResponse(timeout = 5000) {
    await this.page.waitForFunction(
      () => {
        const messages = document.querySelectorAll('.bot-message');
        return messages.length > 0;
      },
      { timeout }
    );
  }

  async clearChat() {
    const clearButton = await this.page.locator('[data-testid="clear-chat"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }
}

test.describe('Chatbot Interface Tests', () => {
  let chatbot;

  test.beforeEach(async ({ page }) => {
    // Navigate to chatbot interface
    await page.goto('http://localhost:5005');
    chatbot = new ChatbotTester(page);
    
    // Wait for interface to load
    await page.waitForSelector(chatbot.chatInterface);
  });

  test('should display chatbot interface correctly', async ({ page }) => {
    // Check essential elements are present
    await expect(page.locator(chatbot.chatInterface)).toBeVisible();
    await expect(page.locator(chatbot.messageInput)).toBeVisible();
    await expect(page.locator(chatbot.sendButton)).toBeVisible();
    
    // Check placeholder text
    const placeholder = await page.locator(chatbot.messageInput).getAttribute('placeholder');
    expect(placeholder).toContain('Type your message');
  });

  test('should handle basic greeting conversation', async ({ page }) => {
    await chatbot.sendMessage('Hello');
    
    const response = await chatbot.getLastBotMessage();
    expect(response.toLowerCase()).toMatch(/(hello|hi|hey|greet)/);
  });

  test('should handle multiple message exchange', async ({ page }) => {
    // Greeting
    await chatbot.sendMessage('Hi there');
    await chatbot.waitForResponse();
    
    // Follow-up question
    await chatbot.sendMessage('How are you?');
    await chatbot.waitForResponse();
    
    // Check conversation history
    const messages = await page.locator('.message').count();
    expect(messages).toBeGreaterThanOrEqual(4); // 2 user + 2 bot messages
  });

  test('should handle weather inquiry', async ({ page }) => {
    await chatbot.sendMessage('What\'s the weather like?');
    
    const response = await chatbot.getLastBotMessage();
    expect(response.toLowerCase()).toMatch(/(weather|temperature|sunny|cloudy|rain)/);
  });

  test('should handle appointment booking flow', async ({ page }) => {
    await chatbot.sendMessage('I want to book an appointment');
    await chatbot.waitForResponse();
    
    const response = await chatbot.getLastBotMessage();
    expect(response.toLowerCase()).toMatch(/(appointment|book|schedule|date|time)/);
  });

  test('should handle invalid/unclear input gracefully', async ({ page }) => {
    await chatbot.sendMessage('asdf1234xyz');
    
    const response = await chatbot.getLastBotMessage();
    expect(response.toLowerCase()).toMatch(/(sorry|understand|help|unclear)/);
  });

  test('should display typing indicator during response', async ({ page }) => {
    const messagePromise = chatbot.sendMessage('Hello');
    
    // Check for typing indicator
    const typingIndicator = page.locator('.typing-indicator');
    await expect(typingIndicator).toBeVisible({ timeout: 2000 });
    
    await messagePromise;
    await expect(typingIndicator).not.toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on input
    await page.focus(chatbot.messageInput);
    
    // Type message
    await page.keyboard.type('Hello chatbot');
    
    // Send with Enter key
    await page.keyboard.press('Enter');
    
    await chatbot.waitForResponse();
    const response = await chatbot.getLastBotMessage();
    expect(response).toBeTruthy();
  });

  test('should handle long messages properly', async ({ page }) => {
    const longMessage = 'This is a very long message that tests how the chatbot handles extended input from users and ensures the interface remains responsive and functional even with lengthy text inputs that might span multiple lines or contain various characters and symbols.';
    
    await chatbot.sendMessage(longMessage);
    
    // Verify message was sent
    const userMessage = await page.locator(`${chatbot.userMessage}:last-child`).textContent();
    expect(userMessage).toContain(longMessage);
    
    // Verify bot responded
    await chatbot.waitForResponse();
    const response = await chatbot.getLastBotMessage();
    expect(response).toBeTruthy();
  });

  test('should maintain conversation context', async ({ page }) => {
    // Set context
    await chatbot.sendMessage('My name is John');
    await chatbot.waitForResponse();
    
    // Test context recall
    await chatbot.sendMessage('What\'s my name?');
    await chatbot.waitForResponse();
    
    const response = await chatbot.getLastBotMessage();
    expect(response.toLowerCase()).toContain('john');
  });
});

test.describe('Accessibility Tests', () => {
  test('should meet WCAG accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:5005');
    
    // Check for proper ARIA labels
    const messageInput = page.locator('[data-testid="message-input"]');
    const ariaLabel = await messageInput.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focusedElement);
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('http://localhost:5005');
    
    // Check for screen reader announcements
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });
});

test.describe('Performance Tests', () => {
  test('should load interface quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5005');
    await page.waitForSelector('.chat-interface');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle rapid message sending', async ({ page }) => {
    await page.goto('http://localhost:5005');
    const chatbot = new ChatbotTester(page);
    
    // Send multiple messages rapidly
    const messages = ['Hi', 'How are you?', 'What can you do?'];
    for (const message of messages) {
      await chatbot.sendMessage(message);
    }
    
    // Verify all messages were processed
    await page.waitForFunction(
      () => document.querySelectorAll('.bot-message').length >= 3,
      { timeout: 15000 }
    );
  });
});

test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      await page.goto('http://localhost:5005');
      const chatbot = new ChatbotTester(page);
      
      await chatbot.sendMessage('Hello');
      await chatbot.waitForResponse();
      
      const response = await chatbot.getLastBotMessage();
      expect(response).toBeTruthy();
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5005');
    
    const chatbot = new ChatbotTester(page);
    
    // Check interface is responsive
    await expect(page.locator(chatbot.chatInterface)).toBeVisible();
    
    // Test touch interactions
    await page.tap(chatbot.messageInput);
    await page.fill(chatbot.messageInput, 'Hello mobile');
    await page.tap(chatbot.sendButton);
    
    await chatbot.waitForResponse();
    const response = await chatbot.getLastBotMessage();
    expect(response).toBeTruthy();
  });
});

// Export for use in other test files
module.exports = { ChatbotTester };