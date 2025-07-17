#!/usr/bin/env ts-node

import { MCPServerManager } from '../services/mcp-manager';

async function setupMCPServers() {
  console.log('🔧 Setting up MCP Servers for Chatbot Solution Analyzer\n');
  
  const manager = new MCPServerManager();
  
  try {
    // List available servers
    console.log('📋 Available MCP Servers:');
    await manager.listAvailableServers();
    
    console.log('\n⚙️  Starting MCP servers...');
    await manager.startAllServers();
    
    console.log('\n📊 Server Status:');
    const status = manager.getServerStatus();
    for (const [name, running] of Object.entries(status)) {
      console.log(`  ${running ? '✅' : '❌'} ${name}: ${running ? 'Running' : 'Stopped'}`);
    }
    
    console.log('\n✅ MCP server setup complete!');
    console.log('💡 You can now use these servers for enhanced chatbot analysis');
    
    // Keep running for a bit to test the servers
    console.log('\n⏳ Testing servers for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n🛑 Stopping servers...');
    await manager.stopAllServers();
    console.log('✅ All servers stopped');
    
  } catch (error) {
    console.error('❌ Error setting up MCP servers:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupMCPServers().catch(console.error);
}