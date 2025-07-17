import express from 'express';
import dotenv from 'dotenv';
import { ChatbotAnalyzer } from './tools/chatbot-analyzer';
import { MCPServerManager } from './services/mcp-manager';
import * as path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize services
const mcpManager = new MCPServerManager();
let analyzer: ChatbotAnalyzer | null = null;

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot Solution Analyzer API',
    version: '1.0.0',
    endpoints: {
      '/api/status': 'Get system status',
      '/api/analyze': 'Start chatbot analysis',
      '/api/mcp/status': 'Get MCP server status',
      '/api/mcp/list': 'List available MCP servers'
    }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    mcpServers: mcpManager.getServerStatus(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    if (analyzer) {
      return res.status(400).json({ error: 'Analysis already in progress' });
    }

    analyzer = new ChatbotAnalyzer();
    
    // Start analysis in background
    analyzer.initialize()
      .then(() => analyzer!.analyzeChatbotSolutions())
      .then(() => {
        console.log('✅ Analysis completed');
        analyzer = null;
      })
      .catch((error) => {
        console.error('❌ Analysis failed:', error);
        analyzer = null;
      });

    res.json({
      message: 'Analysis started',
      status: 'in_progress',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error starting analysis:', error);
    res.status(500).json({ error: 'Failed to start analysis' });
  }
});

app.get('/api/mcp/status', (req, res) => {
  res.json({
    servers: mcpManager.getServerStatus(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/mcp/list', async (req, res) => {
  try {
    const servers = await mcpManager.listAvailableServers();
    res.json({
      available_servers: servers,
      status: mcpManager.getServerStatus()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list MCP servers' });
  }
});

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  
  if (analyzer) {
    await analyzer.cleanup();
  }
  
  await mcpManager.stopAllServers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  
  if (analyzer) {
    await analyzer.cleanup();
  }
  
  await mcpManager.stopAllServers();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Chatbot Solution Analyzer Server...\n');
    
    // Start MCP servers
    await mcpManager.listAvailableServers();
    console.log('📡 MCP servers initialized\n');
    
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log('📊 Ready to analyze chatbot solutions!\n');
      console.log('Available endpoints:');
      console.log(`  - GET  http://localhost:${port}/`);
      console.log(`  - GET  http://localhost:${port}/api/status`);
      console.log(`  - POST http://localhost:${port}/api/analyze`);
      console.log(`  - GET  http://localhost:${port}/api/mcp/status`);
      console.log(`  - GET  http://localhost:${port}/api/mcp/list\n`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

export default app;