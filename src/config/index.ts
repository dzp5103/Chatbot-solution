import { MCPServerConfig } from '../types';

export const MCPServerConfiguration: MCPServerConfig[] = [
  {
    name: 'filesystem',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', './workspace'],
    env: {
      WORKSPACE_DIR: process.env.MCP_WORKSPACE || './workspace'
    },
    enabled: true
  },
  {
    name: 'memory',
    command: 'npx',
    args: ['@modelcontextprotocol/server-memory'],
    env: {
      MEMORY_DIR: './workspace/memory'
    },
    enabled: true
  },
  {
    name: 'inspector',
    command: 'npx',
    args: ['@modelcontextprotocol/inspector'],
    env: {
      MCP_INSPECTOR_PORT: process.env.MCP_PORT || '3001'
    },
    enabled: true
  },
  {
    name: 'puppeteer',
    command: 'npx',
    args: ['puppeteer-mcp-server'],
    env: {
      PUPPETEER_HEADLESS: process.env.NODE_ENV === 'production' ? 'true' : 'false'
    },
    enabled: true
  }
];

export const PlaywrightConfig = {
  browsers: ['chromium', 'firefox', 'webkit'],
  headless: process.env.NODE_ENV === 'production',
  timeout: 30000,
  retries: 2
};

export const GitHubConfig = {
  baseURL: 'https://api.github.com',
  token: process.env.GITHUB_TOKEN,
  rateLimitBuffer: 100, // Keep 100 requests in reserve
  searchQueries: [
    'chatbot language:typescript stars:>100',
    'chatbot framework language:javascript stars:>50',
    'conversational ai self-hosted',
    'chatbot docker deployment',
    'rasa chatbot',
    'botpress chatbot',
    'microsoft bot framework',
    'dialogflow chatbot',
    'open source chatbot ai'
  ]
};