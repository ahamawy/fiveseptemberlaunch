/**
 * Schema Configuration
 * Environment detection and configuration management
 */

export class SchemaConfig {
  private env: NodeJS.ProcessEnv;

  constructor() {
    this.env = process.env;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  /**
   * Check if Supabase credentials are available
   */
  hasSupabaseCredentials(): boolean {
    const url = this.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = this.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Check for placeholder values
    const isPlaceholder = url === 'https://placeholder.supabase.co' || 
                         anonKey === 'placeholder-anon-key';
    
    // Also check if Supabase is explicitly disabled
    const isSupabaseEnabled = this.env.NEXT_PUBLIC_ENABLE_SUPABASE === 'true';
    
    return !!(url && anonKey && !isPlaceholder && isSupabaseEnabled);
  }

  /**
   * Check if MCP is explicitly enabled
   */
  isMCPEnabled(): boolean {
    return this.env.NEXT_PUBLIC_ENABLE_MCP === 'true';
  }

  /**
   * Check if using mock data
   */
  isUsingMockData(): boolean {
    return this.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  }

  /**
   * Get Supabase URL
   */
  getSupabaseUrl(): string {
    const url = this.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error('Supabase URL not configured');
    // Return placeholder if not enabled
    if (url === 'https://placeholder.supabase.co' && this.env.NEXT_PUBLIC_ENABLE_SUPABASE !== 'true') {
      return url; // Don't throw for placeholders in mock mode
    }
    return url;
  }

  /**
   * Get Supabase anonymous key
   */
  getSupabaseAnonKey(): string {
    const key = this.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) throw new Error('Supabase anon key not configured');
    // Return placeholder if not enabled
    if (key === 'placeholder-anon-key' && this.env.NEXT_PUBLIC_ENABLE_SUPABASE !== 'true') {
      return key; // Don't throw for placeholders in mock mode
    }
    return key;
  }

  /**
   * Get Supabase service key (for server-side operations)
   */
  getSupabaseServiceKey(): string | undefined {
    return this.env.SUPABASE_SERVICE_KEY;
  }

  /**
   * Get database URL (for migrations)
   */
  getDatabaseUrl(): string | undefined {
    return this.env.DATABASE_URL;
  }

  /**
   * Get Supabase project ID (for MCP)
   */
  getSupabaseProjectId(): string | undefined {
    return this.env.SUPABASE_PROJECT_ID;
  }

  /**
   * Get configuration for logging
   */
  getLogLevel(): string {
    return this.env.NEXT_PUBLIC_LOG_LEVEL || 'info';
  }

  /**
   * Check if should enable query logging
   */
  shouldLogQueries(): boolean {
    return this.isDevelopment() && this.getLogLevel() === 'debug';
  }

  /**
   * Get mock delay in milliseconds
   */
  getMockDelay(): number {
    return parseInt(this.env.NEXT_PUBLIC_MOCK_DELAY_MS || '0', 10);
  }

  /**
   * Get configuration summary
   */
  getSummary() {
    return {
      mode: this.isDevelopment() ? 'development' : 'production',
      hasSupabaseCredentials: this.hasSupabaseCredentials(),
      isMCPEnabled: this.isMCPEnabled(),
      isUsingMockData: this.isUsingMockData(),
      logLevel: this.getLogLevel(),
      mockDelay: this.getMockDelay()
    };
  }
}