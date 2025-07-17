import { spawn, ChildProcess } from 'child_process';
import { MCPServerConfig } from '../types';
import { MCPServerConfiguration } from '../config';

export class MCPServerManager {
  private servers: Map<string, ChildProcess> = new Map();
  private serverConfigs: MCPServerConfig[] = MCPServerConfiguration;

  async startAllServers(): Promise<void> {
    console.log('🚀 Starting MCP Servers...');
    
    for (const config of this.serverConfigs) {
      if (config.enabled) {
        await this.startServer(config);
      } else {
        console.log(`⏭️  Skipping ${config.name} (disabled or missing config)`);
      }
    }
  }

  private async startServer(config: MCPServerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔧 Starting ${config.name} server...`);
        
        const childProcess = spawn(config.command, config.args, {
          env: { ...process.env, ...config.env },
          stdio: ['pipe', 'pipe', 'pipe']
        });

        childProcess.stdout.on('data', (data: Buffer) => {
          console.log(`[${config.name}] ${data.toString().trim()}`);
        });

        childProcess.stderr.on('data', (data: Buffer) => {
          console.error(`[${config.name} ERROR] ${data.toString().trim()}`);
        });

        childProcess.on('error', (error: Error) => {
          console.error(`❌ Failed to start ${config.name}:`, error.message);
          reject(error);
        });

        childProcess.on('spawn', () => {
          console.log(`✅ ${config.name} server started successfully`);
          this.servers.set(config.name, childProcess);
          resolve();
        });

        // Give the process a moment to start
        setTimeout(() => {
          if (!childProcess.killed) {
            this.servers.set(config.name, childProcess);
            resolve();
          }
        }, 2000);

      } catch (error) {
        console.error(`❌ Error starting ${config.name}:`, error);
        reject(error);
      }
    });
  }

  async stopAllServers(): Promise<void> {
    console.log('🛑 Stopping MCP Servers...');
    
    for (const [name, process] of this.servers) {
      try {
        process.kill('SIGTERM');
        console.log(`✅ Stopped ${name} server`);
      } catch (error) {
        console.error(`❌ Error stopping ${name}:`, error);
      }
    }
    
    this.servers.clear();
  }

  getServerStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const config of this.serverConfigs) {
      const process = this.servers.get(config.name);
      status[config.name] = process ? !process.killed : false;
    }
    
    return status;
  }

  async listAvailableServers(): Promise<string[]> {
    console.log('\n📋 Available MCP Servers:');
    console.log('├── @modelcontextprotocol/server-everything');
    console.log('├── @modelcontextprotocol/server-brave-search');
    console.log('├── @modelcontextprotocol/server-filesystem');
    console.log('└── @modelcontextprotocol/server-git');
    
    return [
      '@modelcontextprotocol/server-everything',
      '@modelcontextprotocol/server-brave-search',
      '@modelcontextprotocol/server-filesystem',
      '@modelcontextprotocol/server-git'
    ];
  }
}