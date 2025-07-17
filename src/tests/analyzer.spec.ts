import { test, expect } from '@playwright/test';

test.describe('Chatbot Solution Analyzer', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the API response is correct
    const response = await page.locator('pre').textContent();
    const data = JSON.parse(response || '{}');
    
    expect(data.message).toBe('Chatbot Solution Analyzer API');
    expect(data.version).toBe('1.0.0');
    expect(data.endpoints).toBeDefined();
  });

  test('status endpoint works', async ({ page }) => {
    await page.goto('/api/status');
    
    const response = await page.locator('pre').textContent();
    const data = JSON.parse(response || '{}');
    
    expect(data.status).toBe('running');
    expect(data.timestamp).toBeDefined();
    expect(data.mcpServers).toBeDefined();
  });

  test('MCP servers list endpoint works', async ({ page }) => {
    await page.goto('/api/mcp/list');
    
    const response = await page.locator('pre').textContent();
    const data = JSON.parse(response || '{}');
    
    expect(data.available_servers).toBeDefined();
    expect(Array.isArray(data.available_servers)).toBe(true);
  });
});

test.describe('Browser Automation Testing', () => {
  test('can capture chatbot interface elements', async ({ page }) => {
    // Test with a sample chatbot interface
    await page.setContent(`
      <html>
        <body>
          <div class="chat-container">
            <div class="chat-messages">
              <div class="message bot-message">Hello! How can I help you?</div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="Type your message..." />
              <button>Send</button>
            </div>
          </div>
        </body>
      </html>
    `);

    // Test chatbot interface detection
    const chatContainer = page.locator('.chat-container');
    await expect(chatContainer).toBeVisible();

    const messageInput = page.locator('input[type="text"]');
    await expect(messageInput).toBeVisible();

    const sendButton = page.locator('button');
    await expect(sendButton).toBeVisible();

    // Test interaction
    await messageInput.fill('Test message');
    await expect(messageInput).toHaveValue('Test message');
  });

  test('detects responsive design elements', async ({ page }) => {
    await page.setContent(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media (max-width: 768px) {
              .chat-container { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="chat-container">
            <h1>Responsive Chatbot</h1>
          </div>
        </body>
      </html>
    `);

    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');

    // Test responsive behavior
    await page.setViewportSize({ width: 500, height: 800 });
    const container = page.locator('.chat-container');
    await expect(container).toBeVisible();
  });
});