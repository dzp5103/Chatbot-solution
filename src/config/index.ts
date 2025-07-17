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
  recentMonths: 6, // Consider projects updated in last 6 months as "recent"
  searchQueries: [
    // Multi-model LLM chatbots - recently updated
    'multi-model chatbot LLM pushed:>2024-06-01 stars:>50',
    'chatbot OpenAI Anthropic Hugging Face pushed:>2024-06-01',
    'LLM integration chatbot multiple models pushed:>2024-06-01',
    
    // Self-hosted AI chatbots with recent activity
    'self-hosted AI chatbot docker pushed:>2024-06-01 stars:>20',
    'open source chatbot ollama local model pushed:>2024-06-01',
    'chatbot custom AI model integration pushed:>2024-06-01',
    
    // Framework-specific with recent updates
    'chatbot framework typescript javascript pushed:>2024-06-01 stars:>30',
    'conversational ai python pytorch transformers pushed:>2024-06-01',
    'chatbot webhook API integration pushed:>2024-06-01',
    
    // Trending AI chatbot technologies
    'chatbot RAG vector database pushed:>2024-06-01',
    'langchain chatbot application pushed:>2024-06-01 stars:>10',
    'chatbot embedding similarity search pushed:>2024-06-01'
  ],
  // Search for multi-model specific terms in repositories
  multiModelKeywords: [
    'multi-model', 'multiple models', 'model switching',
    'openai', 'anthropic', 'claude', 'gpt', 'llama',
    'hugging face', 'transformers', 'ollama', 'local model',
    'llm integration', 'ai provider', 'model api',
    'custom model', 'model endpoint', 'ai gateway'
  ]
};