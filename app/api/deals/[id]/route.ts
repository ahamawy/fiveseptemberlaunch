import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("deals.deal")
      .select("*")
      .eq("deal_id", id)
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = Number(params.id);
    const body = await request.json();

    const update: any = {};
    if (body?.name) update.deal_name = body.name;
    if (body?.status) update.deal_status = body.status;
    if (body?.currency) update.deal_currency = body.currency;
    if (body?.company_id) update.underlying_company_id = body.company_id;

    const sb = getServiceClient();
    const { data, error } = await sb
      .from("deals.deal")
      .update(update)
      .eq("deal_id", id)
      .select("*")
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = Number(params.id);
    const sb = getServiceClient();
    const { error } = await sb.from("deals.deal").delete().eq("deal_id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

