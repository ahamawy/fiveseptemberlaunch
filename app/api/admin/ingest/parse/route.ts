import { NextRequest, NextResponse } from "next/server";
import {
  parseDocumentWithAI,
  buildLegacyProfileFromMapping,
} from "@/lib/services/ingest-core.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const docText: string = body?.doc_text || "";
    if (!docText || docText.length < 20) {
      return NextResponse.json(
        { error: "doc_text is required" },
        { status: 400 }
      );
    }

    const mapping = await parseDocumentWithAI(docText);
    const profile_suggestion = buildLegacyProfileFromMapping(mapping);
    return NextResponse.json({ success: true, mapping, profile_suggestion });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Parse failed" },
      { status: 500 }
    );
  }
}
