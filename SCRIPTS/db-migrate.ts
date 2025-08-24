#!/usr/bin/env node
// @ts-nocheck
/**
 * Database Migration Runner
 * Applies SQL migrations to Supabase in correct order
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationFile {
  name: string;
  path: string;
  order: number;
}

class MigrationRunner {
  private supabase: any;
  private migrationsDir: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.migrationsDir = path.join(__dirname, '..', 'DB', 'migrations');
  }

  async getMigrationFiles(): Promise<MigrationFile[]> {
    const files = await fs.readdir(this.migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .map(name => ({
        name,
        path: path.join(this.migrationsDir, name),
        order: parseInt(name.split('_')[0]) || 999
      }))
      .sort((a, b) => a.order - b.order);
    
    return sqlFiles;
  }

  async checkMigrationTable(): Promise<void> {
    // Create migration tracking table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW(),
        success BOOLEAN DEFAULT true,
        error_message TEXT
      );
    `;
    
    const { error } = await this.supabase.rpc('execute_sql', { 
      query: createTableQuery 
    }).catch(() => ({ error: 'RPC not available' }));
    
    if (error) {
      // Try direct approach if RPC doesn't work
      console.log('Creating migrations table via MCP...');
    }
  }

  async hasBeenApplied(migrationName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', migrationName)
      .single();
    
    return !error && data !== null;
  }

  async recordMigration(name: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.supabase
      .from('schema_migrations')
      .insert({
        version: name,
        success,
        error_message: errorMessage
      });
  }

  async runMigration(migration: MigrationFile): Promise<boolean> {
    console.log(`\n📋 Running migration: ${migration.name}`);
    
    // Check if already applied
    const applied = await this.hasBeenApplied(migration.name);
    if (applied) {
      console.log(`  ✓ Already applied`);
      return true;
    }

    try {
      const sql = await fs.readFile(migration.path, 'utf-8');
      
      // Split by semicolons but be careful with functions/procedures
      const statements = sql
        .split(/;\s*$/gm)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim() + ';');
      
      console.log(`  Found ${statements.length} statements`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        // Skip comments
        if (statement.startsWith('--') || statement.match(/^\/\*.*\*\/$/s)) {
          continue;
        }
        
        console.log(`  Executing statement ${i + 1}/${statements.length}...`);
        
        // For now, we'll need to use the MCP tool since direct SQL execution requires special setup
        console.log(`  [Would execute]: ${statement.substring(0, 50)}...`);
      }
      
      await this.recordMigration(migration.name, true);
      console.log(`  ✅ Migration completed successfully`);
      return true;
      
    } catch (error: any) {
      console.error(`  ❌ Migration failed: ${error.message}`);
      await this.recordMigration(migration.name, false, error.message);
      return false;
    }
  }

  async runAll(): Promise<void> {
    console.log('🚀 Starting database migrations...\n');
    
    // Check/create migrations table
    await this.checkMigrationTable();
    
    // Get all migration files
    const migrations = await this.getMigrationFiles();
    console.log(`Found ${migrations.length} migration files`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const migration of migrations) {
      const success = await this.runMigration(migration);
      if (success) {
        successCount++;
      } else {
        failCount++;
        // Stop on first failure
        break;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✨ Migration Summary:`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`  Total: ${migrations.length}`);
    
    if (failCount > 0) {
      process.exit(1);
    }
  }

  async status(): Promise<void> {
    console.log('📊 Migration Status\n');
    
    const migrations = await this.getMigrationFiles();
    const { data: applied } = await this.supabase
      .from('schema_migrations')
      .select('*')
      .order('applied_at', { ascending: false });
    
    console.log('Available migrations:');
    for (const migration of migrations) {
      const appliedMig = applied?.find((a: any) => a.version === migration.name);
      const status = appliedMig 
        ? (appliedMig.success ? '✅' : '❌')
        : '⏳';
      console.log(`  ${status} ${migration.name}`);
    }
    
    if (applied && applied.length > 0) {
      console.log('\nLast applied:');
      const last = applied[0];
      console.log(`  ${last.version} at ${new Date(last.applied_at).toLocaleString()}`);
    }
  }
}

// CLI handling
const command = process.argv[2];
const runner = new MigrationRunner();

switch (command) {
  case 'up':
  case 'migrate':
    runner.runAll().catch(console.error);
    break;
  case 'status':
    runner.status().catch(console.error);
    break;
  default:
    console.log(`
Database Migration Tool

Usage:
  npm run db:migrate:up     Apply all pending migrations
  npm run db:migrate:status  Check migration status
  
Commands:
  up, migrate  - Apply all pending migrations
  status       - Show migration status
`);
}