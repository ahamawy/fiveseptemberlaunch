/**
 * Document Management Tables
 * Documents, legal agreements, and transaction documentation
 */

export const DocumentTables = {
  'documents': {
    name: 'documents',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT uuid_generate_v4()',
      name: 'text NOT NULL',
      type: 'text',
      url: 'text',
      description: 'text',
      investor_id: 'integer',
      deal_id: 'integer',
      company_id: 'integer',
      uploaded_at: 'timestamp with time zone DEFAULT now()',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()',
      document_category: 'character varying',
      is_executed: 'boolean DEFAULT false',
      is_legal_document: 'boolean DEFAULT false',
      transaction_id: 'integer',
      execution_date: 'timestamp with time zone',
      expiry_date: 'timestamp with time zone',
      signatory_name: 'character varying',
      signatory_title: 'character varying',
      counterparty_name: 'character varying',
      document_status: 'character varying DEFAULT draft'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'investor_id', references: 'investors.investor(id)' },
      { column: 'transaction_id', references: 'transactions.transaction.primary(transaction_id)' },
      { column: 'company_id', references: 'companies.company(company_id)' },
      { column: 'deal_id', references: 'deals.deal(deal_id)' }
    ]
  },

  'transaction_documents': {
    name: 'transaction_documents',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(transaction_documents_id_seq)',
      transaction_id: 'integer NOT NULL',
      document_id: 'uuid NOT NULL',
      document_role: 'character varying',
      signed_date: 'timestamp with time zone',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'document_id', references: 'documents(id)' },
      { column: 'transaction_id', references: 'transactions.transaction.primary(transaction_id)' }
    ]
  },

  'legal_document_status': {
    name: 'legal_document_status',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(legal_document_status_id_seq)',
      transaction_id: 'integer',
      investor_id: 'integer',
      deal_id: 'integer',
      document_type: 'character varying NOT NULL',
      status: 'character varying DEFAULT pending CHECK (pending|sent|signed|countersigned|completed|expired)',
      sent_date: 'timestamp with time zone',
      signed_date: 'timestamp with time zone',
      completed_date: 'timestamp with time zone',
      expiry_date: 'timestamp with time zone',
      document_id: 'uuid',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'transaction_id', references: 'transactions.transaction.primary(transaction_id)' },
      { column: 'document_id', references: 'documents(id)' },
      { column: 'investor_id', references: 'investors.investor(id)' },
      { column: 'deal_id', references: 'deals.deal(deal_id)' }
    ],
    constraints: [
      { name: 'status_check', check: "status IN ('pending', 'sent', 'signed', 'countersigned', 'completed', 'expired')" }
    ]
  },

  'agreement_types': {
    name: 'agreement_types',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(agreement_types_id_seq)',
      type_code: 'character varying NOT NULL UNIQUE',
      type_name: 'character varying NOT NULL',
      description: 'text',
      is_binding: 'boolean DEFAULT true',
      required_signatures: 'integer DEFAULT 1',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: []
  }
};