/**
 * Core Business Entity Tables
 * Companies, Deals, Investors - The foundation of the platform
 */

export const CoreTables = {
  'companies_clean': {
    name: 'companies_clean',
    schema: 'public',
    columns: {
      company_id: 'integer NOT NULL DEFAULT nextval(companies_company_id_seq)',
      company_name: 'character varying NOT NULL UNIQUE',
      company_type: 'USER-DEFINED NOT NULL',
      company_description: 'text',
      country_incorporation: 'character varying',
      company_sector: 'text',
      company_website: 'text',
      funding_round_stage: 'text',
      founding_year: 'integer',
      lead_contact_name: 'text',
      lead_contact_email: 'text',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()',
      employee_count: 'integer',
      sector: 'text DEFAULT company_sector',
      latest_valuation_mil: 'numeric'
    },
    primaryKey: 'company_id',
    foreignKeys: []
  },

  'deals_clean': {
    name: 'deals_clean',
    schema: 'public',
    columns: {
      deal_id: 'integer NOT NULL DEFAULT nextval(deals_deal_id_seq)',
      deal_name: 'character varying NOT NULL',
      deal_type: 'USER-DEFINED NOT NULL',
      underlying_company_id: 'integer',
      holding_entity: 'integer',
      deal_date: 'date',
      initial_unit_price: 'numeric',
      exit_price_per_unit: 'numeric',
      deal_exited: 'boolean DEFAULT false',
      gross_capital: 'numeric',
      deal_partner_name: 'character varying',
      deal_currency: 'character varying',
      initial_net_capital: 'numeric',
      eq_deal_structuring_fee_percent: 'numeric',
      eq_deal_premium_fee_percent: 'numeric',
      eq_performance_fee_percent: 'numeric',
      eq_deal_annual_management_fee_percent: 'numeric',
      deal_units_issued: 'integer',
      advisory_shares_earned: 'integer',
      partner_llc_agreement: 'character varying',
      partner_side_letter: 'character varying',
      exit_date: 'date',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL',
      deal_status: 'character varying',
      partner_performance_fee_percent: 'numeric',
      partner_annual_management_fee_percent: 'numeric',
      partner_subscription_capital: 'numeric',
      deal_category: 'character varying NOT NULL DEFAULT INVESTMENT',
      partner_structuring_fee_percent: 'numeric',
      closing_date: 'date',
      subscription_capital_usd: 'numeric',
      exchange_rate_usd_gbp: 'numeric DEFAULT 0.79',
      transaction_count: 'bigint NOT NULL DEFAULT 0',
      pre_money_purchase_valuation: 'numeric',
      pre_money_sell_valuation: 'numeric',
      deal_premium_amount: 'numeric'
    },
    primaryKey: 'deal_id',
    foreignKeys: [
      { column: 'underlying_company_id', references: 'companies_clean(company_id)' },
      { column: 'holding_entity', references: 'companies_clean(company_id)' }
    ]
  },

  'investors_clean': {
    name: 'investors_clean',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(investors_id_seq)',
      full_name: 'character varying NOT NULL',
      primary_email: 'character varying NOT NULL UNIQUE',
      secondary_email: 'character varying',
      phone: 'character varying',
      nationality: 'character varying',
      country_of_residence: 'character varying',
      birthday: 'date',
      address: 'text',
      investor_type: 'USER-DEFINED NOT NULL',
      referred_by: 'character varying',
      passport_copy: 'character varying',
      id_checked: 'boolean DEFAULT false',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL',
      residence_city: 'text',
      marital_status: 'text',
      occupation: 'text',
      join_date: 'date',
      source_of_wealth: 'text',
      expected_income_usd: 'numeric',
      education_background: 'text',
      languages_spoken: 'ARRAY',
      business_interests: 'text',
      usd_bank_account_details: 'text',
      decision_independence: 'boolean',
      investor_status: 'character varying DEFAULT ACTIVE',
      kyc_status: 'character varying DEFAULT pending CHECK (pending|verified|rejected)',
      investor_id: 'integer DEFAULT id',
      first_name: 'character varying',
      last_name: 'character varying',
      middle_name: 'character varying',
      job_sector: 'character varying',
      company: 'character varying',
      previous_company: 'character varying',
      university: 'character varying',
      gender: 'character varying',
      linkedin_url: 'character varying',
      professional_bio: 'text',
      extracted_from_source: 'character varying',
      enrichment_batch_id: 'integer',
      enrichment_timestamp: 'timestamp with time zone',
      data_quality_score: 'integer DEFAULT 0',
      enrichment_status: 'character varying DEFAULT pending',
      kyc_completed_date: 'timestamp without time zone',
      kyc_notes: 'text'
    },
    primaryKey: 'id',
    foreignKeys: []
  },

  'companies': {
    name: 'companies',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      slug: 'text NOT NULL UNIQUE',
      name: 'text NOT NULL',
      tagline: 'text',
      description: 'text',
      website: 'text',
      sector: 'text',
      stage: 'text CHECK (seed|series-a|series-b|series-c|growth|pre-ipo)',
      investment_amount: 'text',
      investment_date: 'date',
      featured: 'boolean DEFAULT false',
      active: 'boolean DEFAULT true',
      order_index: 'integer DEFAULT 0',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [],
    constraints: [
      { name: 'companies_stage_check', check: "stage IN ('seed', 'series-a', 'series-b', 'series-c', 'growth', 'pre-ipo')" }
    ]
  },

  'valuations.valuation': {
    name: 'valuations.valuation',
    schema: 'public',
    columns: {
      valuation_id: 'integer NOT NULL DEFAULT nextval(valuations_valuation_id_seq)',
      company_id: 'integer NOT NULL',
      description: 'text',
      valuation_date: 'date NOT NULL',
      valuation_post_money: 'numeric NOT NULL',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL',
      valuation_pre_money: 'numeric NOT NULL',
      investment_amount: 'numeric NOT NULL'
    },
    primaryKey: 'valuation_id',
    foreignKeys: [
      { column: 'company_id', references: 'companies_clean(company_id)' }
    ]
  }
};