# Security Notice - URGENT ACTION REQUIRED

## Exposed Secrets Removed (2025-08-24)

### What Happened
GitGuardian detected exposed secrets in the repository history, including:
- Supabase service role keys
- OpenRouter API key
- Supabase anon key

### Actions Taken
1. ✅ Removed `.env.local` from entire git history using git filter-branch
2. ✅ Created `.env.local.example` template without secrets
3. ✅ Updated `.gitignore` to prevent future exposure
4. ✅ Force pushed cleaned history to GitHub

### IMMEDIATE ACTIONS REQUIRED

#### 1. Rotate All Compromised Keys (CRITICAL)
You MUST rotate these keys immediately in your services:

**Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select project: ikezqzljrupkzmyytgok (EquiTieOSH)
3. Navigate to Settings → API
4. Generate new keys:
   - Regenerate anon/public key
   - Regenerate service_role key
5. Update your local `.env.local` with new keys

**OpenRouter:**
1. Go to https://openrouter.ai/keys
2. Revoke the exposed key starting with `sk-or-v1-bb454a83...`
3. Generate a new API key
4. Update your local `.env.local`

#### 2. Update Local Environment
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your NEW keys (after rotation)
nano .env.local
```

#### 3. Verify No Secrets in Code
```bash
# Search for any remaining secrets
grep -r "eyJhbGciOiJIUzI1NiI" . --exclude-dir=node_modules
grep -r "sk-or-v1-" . --exclude-dir=node_modules
```

### Prevention Measures
1. **Never commit `.env.local` or any `.env` files**
2. **Always use environment variables for secrets**
3. **Review changes before committing**
4. **Use git-secrets or similar tools**

### Team Action Items
- [ ] Each team member must pull the force-pushed changes
- [ ] Each team member must update their `.env.local` with new keys
- [ ] Review all branches for exposed secrets

### Git Commands for Team Members
```bash
# Backup current work
git stash

# Force pull the cleaned history
git fetch --all
git reset --hard origin/main

# Apply stashed changes if needed
git stash pop
```

### Contact
If you have questions or need the new keys, contact the security team immediately.

---
**Remember:** These exposed keys could be used by malicious actors. Rotate them NOW!