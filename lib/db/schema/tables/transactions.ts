/**
 * Transaction Tables
 * Primary, Secondary, Advisory, and Subnominee transactions
 */

export const TransactionTables = {
  'transactions_clean': {
    name: 'transactions_clean',
    schema: 'public',
    columns: {
      transaction_id: 'integer NOT NULL DEFAULT nextval(transactions_transaction_id_seq)',
      deal_id: 'integer NOT NULL',
      investor_id: 'integer NOT NULL',
      transaction_date: 'date NOT NULL',
      units: 'integer NOT NULL',
      unit_price: 'numeric NOT NULL',
      gross_capital: 'numeric NOT NULL',
      initial_net_capital: 'numeric',
      admin_fee: 'numeric',
      management_fee_percent: 'numeric',
      performance_fee_percent: 'numeric',
      structuring_fee_percent: 'numeric',
      premium_fee_percent: 'numeric',
      nominee: 'boolean DEFAULT false',
      term_sheet: 'character varying',
      closing_agreement: 'character varying',
      transfer_due: 'numeric',
      initial_amount_received: 'numeric',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL',
      status: 'character varying DEFAULT completed CHECK (pending|completed|cancelled)',
      fee_calc_method: 'text',
      fee_calc_is_locked: 'boolean DEFAULT false',
      fee_calc_locked_at: 'timestamp with time zone',
      fee_calc_notes: 'text',
      premium_amount: 'numeric',
      structuring_fee_amount: 'numeric',
      management_fee_amount: 'numeric',
      transfer_post_discount: 'numeric',
      structuring_fee_discount_percent: 'numeric',
      management_fee_discount_percent: 'numeric',
      admin_fee_discount_percent: 'numeric',
      structuring_fee_discount: 'numeric',
      management_fee_discount: 'numeric',
      admin_fee_discount: 'numeric',
      net_capital: 'numeric',
      premium_percent: 'numeric'
    },
    primaryKey: 'transaction_id',
    foreignKeys: [
      { column: 'deal_id', references: 'deals_clean(deal_id)' },
      { column: 'investor_id', references: 'investors_clean(id)' }
    ],
    constraints: [
      { name: 'transaction_status_check', check: "status IN ('pending', 'completed', 'cancelled')" }
    ]
  },

  'transactions.transaction.secondary': {
    name: 'transactions.transaction.secondary',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(transaction_secondaries_id_seq)',
      deal_name_link: 'integer NOT NULL',
      seller_name: 'integer NOT NULL',
      subnominee_seller: 'integer',
      transaction: 'integer NOT NULL',
      unit_price: 'numeric NOT NULL',
      buyer_name: 'integer NOT NULL',
      number_of_unit_sold: 'integer NOT NULL',
      initial_net_capital: 'numeric NOT NULL',
      price_per_unit_sold: 'numeric NOT NULL',
      secondary_transaction_date: 'date',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'transaction', references: 'transactions_clean(transaction_id)' },
      { column: 'buyer_name', references: 'investors_clean(id)' },
      { column: 'deal_name_link', references: 'deals_clean(deal_id)' },
      { column: 'seller_name', references: 'investors_clean(id)' },
      { column: 'subnominee_seller', references: 'transactions.transaction.subnominee(subnominee_id)' }
    ]
  },

  'transactions.transaction.advisory': {
    name: 'transactions.transaction.advisory',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(transactions_advisory_id_seq)',
      advisory_deal: 'character varying',
      deal_link: 'integer NOT NULL',
      holding_entity: 'integer',
      number_of_shares: 'integer',
      granted_share_price: 'numeric',
      advisory_cash_revenue: 'numeric',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'holding_entity', references: 'companies_clean(company_id)' },
      { column: 'deal_link', references: 'deals_clean(deal_id)' }
    ]
  },

  'transactions.transaction.subnominee': {
    name: 'transactions.transaction.subnominee',
    schema: 'public',
    columns: {
      subnominee_id: 'integer NOT NULL DEFAULT nextval(transactions_sub_nominees_subnominee_id_seq)',
      sub_nominee_investor_link: 'integer NOT NULL',
      transaction: 'integer NOT NULL',
      gross_capital_nominee: 'numeric',
      initial_net_capital_nominee: 'numeric',
      subnominee_share_of_ticket: 'numeric',
      gross_capital_subnominee: 'numeric',
      createdAt: 'timestamp with time zone NOT NULL',
      updatedAt: 'timestamp with time zone NOT NULL'
    },
    primaryKey: 'subnominee_id',
    foreignKeys: [
      { column: 'transaction', references: 'transactions_clean(transaction_id)' },
      { column: 'sub_nominee_investor_link', references: 'investors_clean(id)' }
    ]
  },

  'investor_units': {
    name: 'investor_units',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT uuid_generate_v4()',
      investor_id: 'integer NOT NULL',
      deal_id: 'integer NOT NULL',
      investment_amount: 'numeric NOT NULL',
      net_capital: 'numeric NOT NULL',
      units_purchased: 'numeric NOT NULL',
      unit_price_at_purchase: 'numeric NOT NULL DEFAULT 1000.00',
      current_unit_price: 'numeric DEFAULT 1000.00',
      current_value: 'numeric',
      unrealized_gain_loss: 'numeric DEFAULT 0',
      realized_gain_loss: 'numeric DEFAULT 0',
      purchase_date: 'date NOT NULL',
      exit_date: 'date',
      status: 'character varying DEFAULT Active',
      notes: 'text',
      created_at: 'timestamp without time zone DEFAULT now()',
      updated_at: 'timestamp without time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: []
  },

  'investment_snapshots': {
    name: 'investment_snapshots',
    schema: 'public',
    columns: {
      snapshot_id: 'integer NOT NULL DEFAULT nextval(investment_snapshots_snapshot_id_seq)',
      investor_id: 'integer NOT NULL',
      deal_id: 'integer NOT NULL',
      company_id: 'integer NOT NULL',
      snapshot_date: 'date NOT NULL DEFAULT CURRENT_DATE',
      total_units: 'integer NOT NULL',
      net_capital: 'numeric NOT NULL',
      entry_valuation: 'numeric NOT NULL',
      last_valuation: 'numeric NOT NULL',
      moic: 'numeric DEFAULT (last_valuation / NULLIF(entry_valuation, 0))',
      current_value: 'numeric DEFAULT (net_capital * (last_valuation / NULLIF(entry_valuation, 0)))',
      profit_percent: 'numeric DEFAULT (((net_capital * (last_valuation / NULLIF(entry_valuation, 0))) - net_capital) / NULLIF(net_capital, 0))',
      valuation_source: 'text NOT NULL',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'snapshot_id',
    foreignKeys: [
      { column: 'deal_id', references: 'deals_clean(deal_id)' },
      { column: 'company_id', references: 'companies_clean(company_id)' },
      { column: 'investor_id', references: 'investors_clean(id)' }
    ]
  }
};