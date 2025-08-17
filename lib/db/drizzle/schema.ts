import { pgSchema, pgTable, uuid, text, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Fees schema
export const fees = pgSchema('fees');

export const feeSchedule = fees.table('fee_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: integer('deal_id').notNull(),
  component: text('component').notNull(), // enum in DB, typed as string here
  basis: text('basis').notNull(), // GROSS | NET | NET_AFTER_PREMIUM
  precedence: integer('precedence').notNull(),
  isPercent: boolean('is_percent').notNull().default(false),
  rate: numeric('rate', { precision: 18, scale: 6 }).notNull(),
  notes: text('notes'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const feeApplication = fees.table('fee_application', {
  id: uuid('id').primaryKey().defaultRandom(),
  txId: uuid('tx_id').notNull(),
  investorId: uuid('investor_id').notNull(),
  dealId: integer('deal_id').notNull(),
  component: text('component').notNull(),
  basis: text('basis').notNull(),
  amount: numeric('amount', { precision: 18, scale: 2 }).notNull(),
  percent: numeric('percent', { precision: 18, scale: 6 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const scheduleVersion = fees.table('schedule_version', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: integer('deal_id').notNull(),
  version: integer('version').notNull(),
  isLocked: boolean('is_locked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Investors schema (subset)
export const investors = pgSchema('investors');

export const investor = investors.table('investor', {
  investorId: uuid('investor_id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  primaryEmail: text('primary_email'),
  investorType: text('investor_type'),
  kycStatus: text('kyc_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Public analytics views can be mapped as tables for typing if needed later


