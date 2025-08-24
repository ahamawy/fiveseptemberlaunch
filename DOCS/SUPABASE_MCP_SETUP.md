# Supabase MCP (Model Context Protocol) Integration

## Overview

This implementation provides enhanced Supabase integration using Model Context Protocol (MCP) servers, similar to the Composio approach described. MCP allows direct interaction with Supabase from within your development environment (VS Code, Cursor, Claude Code) without constant tab switching.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project with service role key
- VS Code with MCP support (or Cursor/Claude Code)

### Installation

```bash
# Install MCP dependencies
npm install @modelcontextprotocol/sdk @supabase/supabase-js

# Optional: Install official Supabase MCP
npm install -g @supabase/mcp
```

### Environment Setup

Add to `.env.local`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MCP Configuration
MCP_SERVER_PORT=3001
MCP_DEBUG_MODE=false
```

## 📁 File Structure

```
.mcp/
├── supabase-config.json    # MCP server configuration
lib/mcp/
├── equitie-server.js       # Custom MCP server implementation
├── supabase-utils.ts       # TypeScript utilities for MCP
app/admin/
└── supabase-mcp/           # Admin UI for MCP operations
```

## 🛠️ Features

### 1. Custom MCP Server (`equitie-server.js`)

Our custom MCP server provides specialized tools for EquiTie:

- **`analyze_portfolio`** - Deep portfolio analysis with metrics
- **`debug_transaction`** - Transaction debugging with anomaly detection
- **`validate_fees`** - Fee calculation validation
- **`generate_report`** - Custom report generation
- **`sync_data`** - Mock/production data synchronization

### 2. TypeScript Utilities (`supabase-utils.ts`)

High-level TypeScript interface for MCP operations:

```typescript
import { getSupabaseMCP } from '@/lib/mcp/supabase-utils';

const mcp = getSupabaseMCP();

// Analyze portfolio
const analysis = await mcp.analyzePortfolio(investorId);

// Debug transaction
const debugInfo = await mcp.debugTransaction(transactionId);

// Validate fees
const validation = await mcp.validateFees(dealId, amount);
```

### 3. Admin Interface (`/admin/supabase-mcp`)

Visual interface for MCP operations:
- Execute MCP actions with one click
- Query builder with templates
- Real-time results display
- Connection health monitoring

## 🔧 Configuration

### VS Code / Cursor Setup

1. Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "equitie": {
      "command": "node",
      "args": ["./lib/mcp/equitie-server.js"],
      "env": {
        "SUPABASE_URL": "${env:SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${env:SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

2. Restart VS Code to activate MCP

### Claude Code Setup

```bash
# Run the setup script
npx @composio/mcp@latest setup "./lib/mcp/equitie-server.js" "EquiTie-Supabase" --client cursor
```

## 📊 Usage Examples

### In VS Code / Cursor

Once configured, you can use natural language commands:

```
"Analyze portfolio for investor 1 and show any anomalies"
"Debug transaction TXN-001 and check for fee discrepancies"
"Generate a performance report for the last 30 days"
"Validate fees for deal 1 with $1M investment"
```

### Programmatic Usage

```typescript
// Portfolio Analysis
const portfolioAnalysis = await mcp.analyzePortfolio(1);
console.log('Total Value:', portfolioAnalysis.data.metrics.totalValue);
console.log('Active Positions:', portfolioAnalysis.data.metrics.activePositions);

// Transaction Debugging
const debug = await mcp.debugTransaction('TXN-001');
if (debug.data.anomalies.length > 0) {
  console.warn('Anomalies detected:', debug.data.anomalies);
}

// Fee Validation
const fees = await mcp.validateFees(1, 1000000);
console.log('Total Fees:', fees.data.totalFees);
console.log('Net Amount:', fees.data.netAmount);

// Custom Query
const result = await mcp.executeQuery({
  table: 'investors.investor',
  operation: 'select',
  filters: { status: 'active' },
  limit: 10
});
```

## 🔐 Security Considerations

1. **Service Role Key**: The MCP server uses the service role key for full database access. Never expose this to client-side code.

2. **Action Filtering**: Unlike random MCP servers, our implementation only exposes specific, safe actions:
   - Read operations (analyze, debug, validate)
   - Report generation
   - No direct DELETE or destructive operations

3. **Audit Trail**: All MCP operations are logged and can be audited through the admin interface.

## 🧪 Testing

### Test MCP Connection

```bash
# Start the MCP server
node lib/mcp/equitie-server.js

# In another terminal, test with curl
curl -X POST http://localhost:3001/tools/list
```

### Test via Admin UI

1. Navigate to `/admin/supabase-mcp`
2. Click "Health Check" to verify connection
3. Try each action with test parameters

## 🚦 Comparison with Direct Supabase Access

| Feature | Direct Supabase | MCP Integration |
|---------|----------------|-----------------|
| IDE Integration | ❌ | ✅ |
| Natural Language | ❌ | ✅ |
| Batch Operations | Manual | Automated |
| Debugging | Basic | Enhanced |
| Audit Trail | Limited | Complete |
| Performance Analysis | Manual | Built-in |

## 🎯 Benefits

1. **Stay in Flow**: No tab switching between IDE and Supabase dashboard
2. **Enhanced Debugging**: Automatic anomaly detection and correlation
3. **Batch Operations**: Execute multiple related queries in one command
4. **Type Safety**: TypeScript utilities provide full type safety
5. **Audit & Security**: All operations logged and restricted to safe actions

## 🔄 Workflow Example

### Traditional Workflow
1. Open Supabase dashboard
2. Navigate to SQL editor
3. Write query
4. Execute and copy results
5. Switch back to IDE
6. Paste and process results

### MCP Workflow
1. Type: "Get recent transactions with fee analysis"
2. Results appear instantly in IDE
3. Continue coding with context

## 📝 Roadmap

- [ ] Add more MCP actions (bulk updates, migrations)
- [ ] Implement caching for frequently accessed data
- [ ] Add real-time subscription support
- [ ] Create VS Code extension for visual MCP control
- [ ] Add team collaboration features

## 🆘 Troubleshooting

### MCP Server Won't Start
- Check Node.js version (18+ required)
- Verify environment variables are set
- Check port 3001 is not in use

### Connection Failed
- Verify Supabase URL and service role key
- Check network connectivity
- Ensure Supabase project is active

### No Results
- Check table names (use dot notation for schema tables)
- Verify filters are correct
- Check query syntax in Query Builder

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Supabase Docs](https://supabase.com/docs)
- [EquiTie MCP Admin](/admin/supabase-mcp)