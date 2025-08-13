#!/usr/bin/env node

/**
 * Setup Script for Equitie Investor Portal
 * Run this after cloning the repository to set up your development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`, colors.blue);
    execSync(command, { stdio: 'inherit' });
    logSuccess(description || 'Command completed');
    return true;
  } catch (error) {
    logError(`Failed: ${description || command}`);
    return false;
  }
}

async function checkPrerequisites() {
  logStep('1/6', 'Checking prerequisites...');
  
  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 18) {
      logError(`Node.js version ${nodeVersion} is too old. Please install Node.js 18 or later.`);
      process.exit(1);
    }
    logSuccess(`Node.js ${nodeVersion} detected`);
  } catch (error) {
    logError('Could not determine Node.js version');
    process.exit(1);
  }

  // Check npm
  try {
    execSync('npm --version', { stdio: 'pipe' });
    logSuccess('npm is installed');
  } catch (error) {
    logError('npm is not installed');
    process.exit(1);
  }

  // Check git
  try {
    execSync('git --version', { stdio: 'pipe' });
    logSuccess('git is installed');
  } catch (error) {
    logWarning('git is not installed - version control will not be available');
  }
}

function setupEnvironment() {
  logStep('2/6', 'Setting up environment files...');
  
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envDevPath = path.join(process.cwd(), '.env.development');
  
  // Copy .env.example to .env.local if it doesn't exist
  if (!fs.existsSync(envLocalPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
      logSuccess('Created .env.local from .env.example');
    } else if (fs.existsSync(envDevPath)) {
      fs.copyFileSync(envDevPath, envLocalPath);
      logSuccess('Created .env.local from .env.development');
    } else {
      logWarning('.env.example not found - please configure environment variables manually');
    }
  } else {
    logSuccess('.env.local already exists');
  }
}

function installDependencies() {
  logStep('3/6', 'Installing dependencies...');
  
  if (!runCommand('npm install', 'Dependencies installed')) {
    logError('Failed to install dependencies');
    process.exit(1);
  }
}

function checkDatabaseSetup() {
  logStep('4/6', 'Checking database configuration...');
  
  const dbSchemaPath = path.join(process.cwd(), 'DB', 'schema.sql');
  
  if (fs.existsSync(dbSchemaPath)) {
    logSuccess('Database schema found');
    log('\nℹ️  To set up Supabase:', colors.yellow);
    log('  1. Create a Supabase project at https://supabase.com', colors.yellow);
    log('  2. Run the migrations in DB/migrations/ in order', colors.yellow);
    log('  3. Update .env.local with your Supabase credentials', colors.yellow);
    log('  4. Set NEXT_PUBLIC_ENABLE_SUPABASE=true', colors.yellow);
  } else {
    logWarning('Database schema not found - using mock data');
  }
}

function validateSetup() {
  logStep('5/6', 'Validating setup...');
  
  // Check critical directories
  const criticalDirs = [
    'app',
    'components',
    'lib',
    'BRANDING',
    'public'
  ];
  
  let allPresent = true;
  for (const dir of criticalDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      logSuccess(`Directory '${dir}' exists`);
    } else {
      logError(`Directory '${dir}' is missing`);
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    logError('Some critical directories are missing. Please check your installation.');
    process.exit(1);
  }

  // Check for TypeScript configuration
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    logSuccess('TypeScript configuration found');
  } else {
    logWarning('TypeScript configuration not found');
  }
}

function printNextSteps() {
  logStep('6/6', 'Setup complete! 🎉');
  
  console.log('\n' + '='.repeat(60));
  log('\n🚀 Quick Start Guide', colors.bright + colors.green);
  console.log('='.repeat(60) + '\n');
  
  log('1. Start the development server:', colors.cyan);
  log('   npm run dev\n');
  
  log('2. Open your browser:', colors.cyan);
  log('   http://localhost:3000\n');
  
  log('3. Run tests:', colors.cyan);
  log('   npm test           # Unit tests');
  log('   npm run test:e2e   # End-to-end tests\n');
  
  log('4. Check code quality:', colors.cyan);
  log('   npm run lint       # Linting');
  log('   npm run typecheck  # Type checking\n');
  
  console.log('='.repeat(60));
  log('\n📚 Documentation', colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
  
  log('• Quick Start: QUICK_START.md');
  log('• Zero-shot Prompts: ZERO_SHOT_PROMPTS.md');
  log('• Project Context: CLAUDE.md');
  log('• Branding Guide: BRANDING_SYSTEM_DOCUMENTATION.md\n');
  
  console.log('='.repeat(60));
  log('\n🤖 Using with Claude Code', colors.bright + colors.yellow);
  console.log('='.repeat(60) + '\n');
  
  log('This project is optimized for zero-shot prompts with Claude Code.');
  log('Example prompt:', colors.cyan);
  log('"Create a deals list page showing all active deals with filters"\n');
  
  log('The codebase includes:', colors.green);
  log('• Mock data layer ready for Supabase migration');
  log('• Service layer with caching and error handling');
  log('• Comprehensive branding system');
  log('• Type-safe database schema');
  log('• Testing infrastructure\n');
  
  logSuccess('Happy coding! 🎨');
}

// Main execution
async function main() {
  console.log('\n' + '='.repeat(60));
  log('Equitie Investor Portal - Setup Script', colors.bright + colors.cyan);
  console.log('='.repeat(60));
  
  try {
    await checkPrerequisites();
    setupEnvironment();
    installDependencies();
    checkDatabaseSetup();
    validateSetup();
    printNextSteps();
  } catch (error) {
    logError(`\nSetup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});