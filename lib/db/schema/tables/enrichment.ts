/**
 * Data Enrichment Tables
 * DocSend analytics, company enrichment, growth prospects
 */

export const EnrichmentTables = {
  'docsend_views': {
    name: 'docsend_views',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(docsend_views_id_seq)',
      contact_name: 'character varying',
      contact_email: 'character varying',
      space_name: 'character varying',
      space_link: 'text',
      space_link_owner: 'character varying',
      content_name: 'character varying',
      content_link: 'text',
      content_version: 'integer',
      visit_date: 'timestamp with time zone',
      duration: 'interval',
      percent_completion: 'numeric',
      location: 'character varying',
      device: 'character varying',
      atypical_visit: 'boolean DEFAULT false',
      downloaded_at: 'timestamp with time zone',
      printed_at: 'timestamp with time zone',
      deal_id: 'integer',
      investor_id: 'integer',
      prospect_linkedin_url: 'text',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'deal_id', references: 'deals.deal(deal_id)' },
      { column: 'investor_id', references: 'investors.investor(id)' }
    ]
  },

  'company_enrichment': {
    name: 'company_enrichment',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(company_enrichment_id_seq)',
      company_name: 'character varying NOT NULL UNIQUE',
      industry: 'character varying',
      company_type: 'character varying',
      is_investment_firm: 'boolean DEFAULT false',
      is_tech_company: 'boolean DEFAULT false',
      is_followed: 'boolean DEFAULT false',
      linkedin_followers: 'integer',
      employees_on_linkedin: 'integer DEFAULT 0',
      key_contacts: 'ARRAY',
      notes: 'text',
      created_at: 'timestamp without time zone DEFAULT now()',
      updated_at: 'timestamp without time zone DEFAULT now()',
      company_id: 'integer'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies.company(company_id)' }
    ]
  },

  'growth_prospects': {
    name: 'growth_prospects',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(growth_prospects_id_seq)',
      full_name: 'character varying NOT NULL',
      first_name: 'character varying',
      last_name: 'character varying',
      email: 'character varying',
      linkedin_url: 'character varying UNIQUE',
      company: 'character varying',
      position: 'character varying',
      is_decision_maker: 'boolean DEFAULT false',
      is_investor_type: 'boolean DEFAULT false',
      is_tech_leader: 'boolean DEFAULT false',
      growth_score: 'integer DEFAULT 0',
      connection_date: 'date',
      notes: 'text',
      status: 'character varying DEFAULT new',
      matched_investor_id: 'integer',
      created_at: 'timestamp without time zone DEFAULT now()',
      updated_at: 'timestamp without time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'matched_investor_id', references: 'investors.investor(id)' }
    ]
  }
};