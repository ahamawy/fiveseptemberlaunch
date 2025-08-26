// MCP Tools configuration - modular enable/disable and env wiring

export const mcpConfig = {
  server: {
    name: 'equitie-mcp-server',
    version: '1.0.0',
  },
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  tools: {
    enabled: new Set([
      'analyze_portfolio',
      'debug_transaction',
      'validate_fees',
      'generate_report',
      'sync_data',
    ]),
  },
};

export function isToolEnabled(name) {
  try {
    return mcpConfig.tools.enabled.has(name);
  } catch {
    return true;
  }
}


