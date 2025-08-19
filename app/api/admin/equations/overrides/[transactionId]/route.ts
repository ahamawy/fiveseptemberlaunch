import { NextResponse } from "next/server";
import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";

function parseTxId(params: { transactionId: string }) {
  const id = parseInt(params.transactionId, 10);
  if (Number.isNaN(id)) throw new Error("Invalid transactionId");
  return id;
}

export async function GET(
  _req: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transactionId = parseTxId(params);
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { data, error } = await client
      .from("fees.legacy_import")
      .select("*")
      .eq("transaction_id", transactionId)
      .ilike("component", "%_DISCOUNT");

    if (error) throw error;
    return NextResponse.json({ transactionId, overrides: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 400 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transactionId = parseTxId(params);
    const body = await req.json();
    const discounts = Array.isArray(body?.discounts) ? body.discounts : [];
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

    // Remove existing overrides for this transaction
    const { error: delErr } = await client
      .from("fees.legacy_import")
      .delete()
      .eq("transaction_id", transactionId)
      .ilike("component", "%_DISCOUNT");
    if (delErr) throw delErr;

    if (discounts.length === 0) {
      return NextResponse.json({ transactionId, overrides: [] });
    }

    // Insert new overrides
    const rows = discounts.map((d: any) => ({
      transaction_id: transactionId,
      component: String(d.component || "").toUpperCase(),
      basis: d.basis ?? null,
      percent: d.percent ?? null,
      amount: d.amount ?? null,
      source_file: "tx_override",
      imported_at: new Date().toISOString(),
    }));

    const { data, error } = await client
      .from("fees.legacy_import")
      .insert(rows)
      .select("*");
    if (error) throw error;

    return NextResponse.json({ transactionId, overrides: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { transactionId: string } }
) {
  try {
    const transactionId = parseTxId(params);
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { error } = await client
      .from("fees.legacy_import")
      .delete()
      .eq("transaction_id", transactionId)
      .ilike("component", "%_DISCOUNT");
    if (error) throw error;
    return NextResponse.json({ transactionId, removed: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 400 }
    );
  }
}
