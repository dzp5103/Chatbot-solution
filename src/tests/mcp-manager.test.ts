import { MCPServerManager } from '../services/mcp-manager';

describe('MCP Server Manager', () => {
  let mcpManager: MCPServerManager;

  beforeEach(() => {
    mcpManager = new MCPServerManager();
  });

  test('should list available servers', async () => {
    const servers = await mcpManager.listAvailableServers();
    expect(Array.isArray(servers)).toBe(true);
    expect(servers.length).toBeGreaterThan(0);
  });

  test('should get server status', () => {
    const status = mcpManager.getServerStatus();
    expect(typeof status).toBe('object');
  });
});