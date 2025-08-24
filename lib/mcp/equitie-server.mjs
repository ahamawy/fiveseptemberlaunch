#!/usr/bin/env node

/**
 * Equitie MCP Server
 * Custom domain-specific tools for the Equitie platform
 */

console.log('Starting Equitie MCP Server...');

// For now, just create a simple HTTP server for testing
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'equitie-mcp',
    version: '1.0.0',
    status: 'running',
    tools: [
      'calculate_fees',
      'get_investor_dashboard',
      'get_deal_performance'
    ]
  }));
});

const port = process.env.PORT || 3101;
server.listen(port, () => {
  console.log(`Equitie MCP Server running on port ${port}`);
});