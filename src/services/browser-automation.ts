import { Browser, Page, chromium, firefox, webkit } from 'playwright';
import { PlaywrightConfig } from '../config';

export class BrowserAutomationService {
  private browsers: Map<string, Browser> = new Map();
  private pages: Map<string, Page> = new Map();

  async initializeBrowsers(): Promise<void> {
    console.log('🌐 Initializing browsers for automation...');
    
    try {
      // Launch Chromium
      const chromiumBrowser = await chromium.launch({
        headless: PlaywrightConfig.headless,
        timeout: PlaywrightConfig.timeout
      });
      this.browsers.set('chromium', chromiumBrowser);
      console.log('✅ Chromium browser initialized');

      // Launch Firefox
      try {
        const firefoxBrowser = await firefox.launch({
          headless: PlaywrightConfig.headless,
          timeout: PlaywrightConfig.timeout
        });
        this.browsers.set('firefox', firefoxBrowser);
        console.log('✅ Firefox browser initialized');
      } catch (error) {
        console.warn('⚠️  Firefox not available:', error);
      }

      // Launch WebKit
      try {
        const webkitBrowser = await webkit.launch({
          headless: PlaywrightConfig.headless,
          timeout: PlaywrightConfig.timeout
        });
        this.browsers.set('webkit', webkitBrowser);
        console.log('✅ WebKit browser initialized');
      } catch (error) {
        console.warn('⚠️  WebKit not available:', error);
      }

    } catch (error) {
      console.error('❌ Error initializing browsers:', error);
      throw error;
    }
  }

  async createPage(browserName: string = 'chromium'): Promise<Page> {
    const browser = this.browsers.get(browserName);
    if (!browser) {
      throw new Error(`Browser ${browserName} not initialized`);
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Chatbot Solution Analyzer Bot 1.0'
    });

    const page = await context.newPage();
    const pageId = `${browserName}-${Date.now()}`;
    this.pages.set(pageId, page);

    return page;
  }

  async navigateAndAnalyze(url: string, browserName: string = 'chromium'): Promise<{
    title: string;
    description: string;
    screenshots: string[];
    performance: any;
    accessibility: any;
  }> {
    const page = await this.createPage(browserName);
    
    try {
      console.log(`🔗 Navigating to ${url} with ${browserName}`);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Get basic page info
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content') || '';
      
      // Take screenshots
      const screenshots: string[] = [];
      const screenshotPath = `./workspace/screenshots/${browserName}-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push(screenshotPath);
      
      // Basic performance metrics
      const performanceMetrics = await page.evaluate((): {
        loadTime: number;
        domContentLoaded: number;
        resourceCount: number;
      } => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });
      
      // Basic accessibility check
      const accessibility = await page.evaluate(() => {
        return {
          hasMainLandmark: !!document.querySelector('main'),
          hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
          hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.hasAttribute('alt')),
          hasLabels: Array.from(document.querySelectorAll('input')).every(input => 
            input.hasAttribute('aria-label') || 
            input.hasAttribute('aria-labelledby') || 
            !!document.querySelector(`label[for="${input.id}"]`)
          )
        };
      });
      
      await page.close();
      
      return {
        title,
        description,
        screenshots,
        performance: performanceMetrics,
        accessibility
      };
      
    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error);
      await page.close();
      throw error;
    }
  }

  async testChatbotInterface(url: string): Promise<{
    hasChatInterface: boolean;
    interactionTest: boolean;
    responsiveness: boolean;
    details: any;
  }> {
    const page = await this.createPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Look for common chatbot interface elements
      const chatSelectors = [
        '[class*="chat"]',
        '[class*="message"]',
        '[class*="bot"]',
        '[id*="chat"]',
        '[data-testid*="chat"]',
        'iframe[src*="chat"]',
        '.widget',
        '.messenger'
      ];
      
      let hasChatInterface = false;
      let chatElement = null;
      
      for (const selector of chatSelectors) {
        try {
          chatElement = await page.locator(selector).first();
          if (await chatElement.isVisible()) {
            hasChatInterface = true;
            break;
          }
        } catch {
          // Selector not found, continue
        }
      }
      
      // Test interaction if chat interface found
      let interactionTest = false;
      if (hasChatInterface && chatElement) {
        try {
          // Look for input field
          const inputSelectors = [
            'input[type="text"]',
            'textarea',
            '[contenteditable="true"]',
            '[placeholder*="message"]',
            '[placeholder*="type"]'
          ];
          
          for (const inputSelector of inputSelectors) {
            try {
              const input = page.locator(inputSelector);
              if (await input.isVisible()) {
                await input.fill('Hello, this is a test message');
                await input.press('Enter');
                interactionTest = true;
                break;
              }
            } catch {
              // Continue to next selector
            }
          }
        } catch (error) {
          console.log('Interaction test failed:', error);
        }
      }
      
      // Test responsiveness
      const responsiveness = await page.evaluate(() => {
        const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules).some(rule => 
              rule.type === CSSRule.MEDIA_RULE
            );
          } catch {
            return false;
          }
        });
        
        const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');
        
        return hasMediaQueries && hasViewportMeta;
      });
      
      await page.close();
      
      return {
        hasChatInterface,
        interactionTest,
        responsiveness,
        details: {
          chatInterfaceFound: hasChatInterface,
          interactionSuccessful: interactionTest,
          mobileResponsive: responsiveness
        }
      };
      
    } catch (error) {
      console.error(`❌ Error testing chatbot interface at ${url}:`, error);
      await page.close();
      return {
        hasChatInterface: false,
        interactionTest: false,
        responsiveness: false,
        details: { error: (error as Error).message }
      };
    }
  }

  async closeBrowsers(): Promise<void> {
    console.log('🔒 Closing browsers...');
    
    // Close all pages
    for (const page of this.pages.values()) {
      try {
        await page.close();
      } catch (error) {
        console.warn('Warning: Error closing page:', error);
      }
    }
    this.pages.clear();
    
    // Close all browsers
    for (const [name, browser] of this.browsers) {
      try {
        await browser.close();
        console.log(`✅ Closed ${name} browser`);
      } catch (error) {
        console.error(`❌ Error closing ${name} browser:`, error);
      }
    }
    this.browsers.clear();
  }
}