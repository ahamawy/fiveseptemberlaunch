/**
 * Knowledge Base Service
 * Inspired by Archon's architecture - provides MCP-style knowledge management
 * for EQUITIE's private equity platform
 */

import { systemContext } from './system-context.service';

export interface KnowledgeSource {
  id: string;
  type: 'document' | 'webpage' | 'database' | 'api';
  name: string;
  url?: string;
  content?: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    dealId?: string;
    investorId?: string;
  };
  embeddings?: number[];
}

export interface RAGQuery {
  query: string;
  context?: string;
  filters?: {
    type?: string;
    dealId?: string;
    investorId?: string;
    tags?: string[];
  };
  strategy?: 'hybrid' | 'semantic' | 'keyword';
  limit?: number;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: 'sourcing' | 'duediligence' | 'closing' | 'monitoring' | 'exit';
  steps: {
    name: string;
    description: string;
    requiredDocs?: string[];
    automatable: boolean;
  }[];
  aiPrompts: string[];
}

export class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private knowledgeSources: Map<string, KnowledgeSource> = new Map();
  
  // Task templates for PE workflows
  private taskTemplates: TaskTemplate[] = [
    {
      id: 'investor-onboarding',
      name: 'Investor Onboarding',
      category: 'sourcing',
      steps: [
        {
          name: 'KYC Verification',
          description: 'Verify investor identity and accreditation',
          requiredDocs: ['passport', 'accreditation_letter'],
          automatable: true
        },
        {
          name: 'Commitment Letter',
          description: 'Generate and send commitment letter',
          requiredDocs: ['termsheet'],
          automatable: true
        },
        {
          name: 'Fee Structure Agreement',
          description: 'Agree on management and performance fees',
          automatable: true
        }
      ],
      aiPrompts: [
        'Generate KYC checklist for {investor_type} investor',
        'Create commitment letter with {amount} investment in {deal_name}',
        'Calculate fee structure: {management_fee}% mgmt, {carry}% carry'
      ]
    },
    {
      id: 'deal-closing',
      name: 'Deal Closing Process',
      category: 'closing',
      steps: [
        {
          name: 'Capital Call',
          description: 'Issue capital call notices to LPs',
          automatable: true
        },
        {
          name: 'Fund Transfer',
          description: 'Process wire transfers',
          automatable: false
        },
        {
          name: 'Documentation',
          description: 'Execute final agreements',
          requiredDocs: ['spa', 'sha'],
          automatable: false
        }
      ],
      aiPrompts: [
        'Generate capital call notice for {deal_name}',
        'Create wire instructions for {investor_name}',
        'Checklist for closing {deal_type} deal'
      ]
    }
  ];

  private constructor() {
    this.initializeBuiltInKnowledge();
  }

  static getInstance(): KnowledgeBaseService {
    if (!this.instance) {
      this.instance = new KnowledgeBaseService();
    }
    return this.instance;
  }

  /**
   * Initialize with EQUITIE's built-in PE knowledge
   */
  private initializeBuiltInKnowledge() {
    // Add PE industry knowledge
    this.addKnowledgeSource({
      id: 'pe-basics',
      type: 'document',
      name: 'Private Equity Fundamentals',
      content: `
        Management Fees: Typically 2% of committed capital annually
        Carried Interest: Usually 20% of profits above hurdle rate
        Hurdle Rate: Minimum return (often 8%) before carry kicks in
        Waterfall: Distribution order - return of capital, preferred return, catch-up, carry split
        J-Curve: Initial negative returns followed by positive performance
        MOIC: Multiple on Invested Capital - total value / invested capital
        IRR: Internal Rate of Return - annualized return considering timing
        DPI: Distributions to Paid-In - realized returns / capital calls
        TVPI: Total Value to Paid-In - (distributions + NAV) / capital calls
      `,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['fundamentals', 'fees', 'metrics']
      }
    });

    // Add fee calculation templates
    this.addKnowledgeSource({
      id: 'fee-calculations',
      type: 'document',
      name: 'Fee Calculation Formulas',
      content: `
        MANAGEMENT FEE CALCULATION:
        - During Investment Period: commitment_amount * management_fee_rate
        - Post Investment Period: invested_capital * management_fee_rate
        
        CARRIED INTEREST CALCULATION:
        1. Calculate total distributions
        2. Return LP capital contributions
        3. Pay preferred return (hurdle)
        4. GP catch-up to carry percentage
        5. Split remaining profits per carry agreement
        
        EXAMPLE SQL:
        SELECT 
          investor_id,
          commitment_amount * 0.02 as annual_management_fee,
          GREATEST(0, (current_value - paid_amount) * 1.08 - paid_amount) * 0.2 as carried_interest
        FROM investors.investor
      `,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['fees', 'calculations', 'sql']
      }
    });
  }

  /**
   * Add a knowledge source
   */
  addKnowledgeSource(source: KnowledgeSource): void {
    this.knowledgeSources.set(source.id, source);
  }

  /**
   * Perform RAG search across knowledge base
   */
  async ragSearch(query: RAGQuery): Promise<{
    results: KnowledgeSource[];
    context: string;
    suggestions: string[];
  }> {
    const results: KnowledgeSource[] = [];
    
    // Simple keyword search for now (would use vector embeddings in production)
    this.knowledgeSources.forEach(source => {
      const searchText = `${source.name} ${source.content || ''}`.toLowerCase();
      if (searchText.includes(query.query.toLowerCase())) {
        // Apply filters
        if (query.filters) {
          if (query.filters.type && source.type !== query.filters.type) return;
          if (query.filters.tags && !query.filters.tags.some(tag => 
            source.metadata.tags.includes(tag)
          )) return;
        }
        results.push(source);
      }
    });

    // Sort by relevance (simple for now)
    results.sort((a, b) => {
      const aMatches = (a.content?.match(new RegExp(query.query, 'gi')) || []).length;
      const bMatches = (b.content?.match(new RegExp(query.query, 'gi')) || []).length;
      return bMatches - aMatches;
    });

    // Limit results
    const limitedResults = results.slice(0, query.limit || 5);

    // Build context from results
    const context = this.buildRAGContext(limitedResults, query);

    // Generate suggestions
    const suggestions = this.generateSuggestions(query, limitedResults);

    return {
      results: limitedResults,
      context,
      suggestions
    };
  }

  /**
   * Build context string for AI from search results
   */
  private buildRAGContext(results: KnowledgeSource[], query: RAGQuery): string {
    let context = `Knowledge Base Search Results for: "${query.query}"\n\n`;
    
    results.forEach((source, index) => {
      context += `[${index + 1}] ${source.name}\n`;
      context += `Type: ${source.type}\n`;
      if (source.content) {
        // Extract relevant snippet
        const snippet = this.extractRelevantSnippet(source.content, query.query);
        context += `Content: ${snippet}\n`;
      }
      context += `Tags: ${source.metadata.tags.join(', ')}\n\n`;
    });

    // Add system context
    context += '\n' + systemContext.getCSVAnalysisContext([]);

    return context;
  }

  /**
   * Extract relevant snippet from content
   */
  private extractRelevantSnippet(content: string, query: string): string {
    const lines = content.split('\n');
    const relevantLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        // Include context lines
        if (index > 0) relevantLines.push(lines[index - 1]);
        relevantLines.push(line);
        if (index < lines.length - 1) relevantLines.push(lines[index + 1]);
      }
    });

    return relevantLines.slice(0, 5).join('\n');
  }

  /**
   * Generate AI suggestions based on search
   */
  private generateSuggestions(query: RAGQuery, results: KnowledgeSource[]): string[] {
    const suggestions: string[] = [];
    
    // Context-aware suggestions
    if (query.query.toLowerCase().includes('fee')) {
      suggestions.push('Calculate management fees for all investors');
      suggestions.push('Generate fee report for current quarter');
      suggestions.push('Compare fee structures across deals');
    }
    
    if (query.query.toLowerCase().includes('investor')) {
      suggestions.push('View investor portfolio summary');
      suggestions.push('Check KYC status for pending investors');
      suggestions.push('Generate investor onboarding checklist');
    }
    
    if (query.query.toLowerCase().includes('deal')) {
      suggestions.push('View deal pipeline status');
      suggestions.push('Calculate deal IRR and MOIC');
      suggestions.push('Generate deal closing checklist');
    }

    // Add suggestions from found knowledge
    results.forEach(source => {
      if (source.metadata.tags.includes('calculations')) {
        suggestions.push('Run calculation from this formula');
      }
      if (source.metadata.tags.includes('sql')) {
        suggestions.push('Execute this SQL query');
      }
    });

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Get task templates for a category
   */
  getTaskTemplates(category?: string): TaskTemplate[] {
    if (category) {
      return this.taskTemplates.filter(t => t.category === category);
    }
    return this.taskTemplates;
  }

  /**
   * Generate tasks from template with AI
   */
  async generateTasksFromTemplate(
    templateId: string, 
    context: any
  ): Promise<{
    tasks: string[];
    aiPrompts: string[];
  }> {
    const template = this.taskTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Generate tasks
    const tasks = template.steps.map(step => {
      let task = `${step.name}: ${step.description}`;
      if (step.requiredDocs) {
        task += ` (Requires: ${step.requiredDocs.join(', ')})`;
      }
      if (step.automatable) {
        task += ' [Automatable]';
      }
      return task;
    });

    // Customize AI prompts with context
    const aiPrompts = template.aiPrompts.map(prompt => {
      let customized = prompt;
      Object.entries(context).forEach(([key, value]) => {
        customized = customized.replace(`{${key}}`, String(value));
      });
      return customized;
    });

    return { tasks, aiPrompts };
  }

  /**
   * MCP-style tool: Search knowledge base
   */
  async mcpSearchKnowledge(params: {
    query: string;
    filters?: any;
  }): Promise<any> {
    const results = await this.ragSearch({
      query: params.query,
      filters: params.filters,
      strategy: 'hybrid'
    });

    return {
      success: true,
      results: results.results.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        preview: r.content?.substring(0, 200)
      })),
      context: results.context,
      suggestions: results.suggestions
    };
  }

  /**
   * MCP-style tool: Get task template
   */
  async mcpGetTaskTemplate(params: {
    category: string;
    context?: any;
  }): Promise<any> {
    const templates = this.getTaskTemplates(params.category);
    
    if (templates.length === 0) {
      return {
        success: false,
        message: `No templates found for category: ${params.category}`
      };
    }

    // Generate tasks for first template
    const template = templates[0];
    const { tasks, aiPrompts } = await this.generateTasksFromTemplate(
      template.id,
      params.context || {}
    );

    return {
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        tasks,
        aiPrompts
      }
    };
  }
}

// Export singleton instance
export const knowledgeBase = KnowledgeBaseService.getInstance();