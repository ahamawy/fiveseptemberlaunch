# Port Allocation Map - Equitie Platform

## 🚦 Port Assignments

| Port | Service | Status | Description |
|------|---------|--------|-------------|
| **3001** | **Main Application** | 🟢 Primary | Next.js application (investor portal) |
| 3000 | ❌ RESERVED | ⛔ Blocked | DO NOT USE - Often occupied by Docker services |
| 3100 | MCP Supabase | 🟢 Active | Supabase MCP server for database operations |
| 3101 | MCP Custom | 🟢 Active | Custom Equitie MCP tools |
| 5432 | PostgreSQL | 🔵 Optional | Local PostgreSQL (when using local-db profile) |
| 6379 | Redis | 🔵 Optional | Redis cache (when using cache profile) |
| 54323 | Supabase Studio | 🟢 Active | Supabase Studio UI |
| 54325 | Supabase DB | 🟢 Active | Supabase PostgreSQL database |

## ⚠️ Important Notes

### Port 3000 Conflicts
**NEVER use port 3000** - It's commonly occupied by:
- Langfuse containers
- Other Docker services
- Various development tools

### Default Development Port
```bash
npm run dev  # Automatically uses port 3001
```

## 🐳 Docker Services

### Core Services (Always Running)
```bash
# Start MCP servers
docker-compose up -d mcp-supabase mcp-equitie

# Check status
docker ps | grep equitie
```

### Optional Services
```bash
# Local PostgreSQL
docker-compose --profile local-db up -d

# Redis cache
docker-compose --profile cache up -d

# Run migrations
docker-compose --profile migrate up
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
lsof -i :3001

# Kill process on port (use carefully)
kill -9 $(lsof -t -i:3001)

# Check Docker containers
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Common Issues

1. **"EADDRINUSE" Error**
   - Another service is using the port
   - Check Docker containers: `docker ps`
   - Stop conflicting container: `docker stop <container_name>`

2. **App opens wrong service**
   - Verify you're accessing port 3001, not 3000
   - Clear browser cache
   - Check URL: `http://localhost:3001`

3. **Langfuse appears instead of app**
   - Langfuse is running on port 3000
   - Stop it: `docker stop langfuse-langfuse-web-1`
   - Access app at port 3001 instead

## 📋 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Main App | http://localhost:3001 | Investor portal |
| Admin Portal | http://localhost:3001/admin | Admin dashboard |
| API Health | http://localhost:3001/api/health | Health check |
| Supabase Studio | http://localhost:54323 | Database management |

## 🔄 Service Management

### Start Everything
```bash
# 1. Start Docker services (MCP servers)
docker-compose up -d mcp-supabase mcp-equitie

# 2. Start main application
npm run dev

# 3. Verify
open http://localhost:3001
```

### Stop Everything
```bash
# Stop app (Ctrl+C in terminal)

# Stop Docker services
docker-compose down

# Stop specific containers
docker stop equitie-mcp-supabase equitie-mcp-custom
```

## 📝 Configuration Files

- **package.json**: Dev script configured for port 3001
- **docker-compose.yml**: All Docker services and ports
- **playwright.config.ts**: Tests use port 3001
- **.env.local**: No port configuration needed (uses defaults)

---
*Last Updated: 2025-08-27*
*Always use port 3001 for the main application to avoid conflicts*