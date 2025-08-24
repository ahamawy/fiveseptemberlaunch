import { NextRequest, NextResponse } from "next/server";
import {
  parseDocumentWithAI,
  buildLegacyProfileFromMapping,
} from "@/lib/services/ingest-core.service";

function textPreview(input: string, maxLines = 40): string {
  const lines = input.split(/\r?\n/).slice(0, maxLines);
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "file missing" }, { status: 400 });

    const name = file.name?.toLowerCase() || "";
    const type = file.type?.toLowerCase() || "";
    const buf = Buffer.from(await file.arrayBuffer());

    // Detect CSV vs text vs JSON (PDF handled elsewhere)
    let docText = "";
    if (
      name.endsWith(".csv") ||
      type.includes("csv") ||
      /,/.test(buf.toString("utf8").split("\n")[0] || "")
    ) {
      const preview = textPreview(buf.toString("utf8"));
      docText = `CSV FILE: \n${preview}`;
    } else if (name.endsWith(".json") || type.includes("json")) {
      const preview = textPreview(buf.toString("utf8"));
      docText = `JSON FILE: \n${preview}`;
    } else if (type.includes("pdf")) {
      // For PDFs we would OCR/parse elsewhere; send a hint to AI
      docText = `PDF FILE: binary length=${buf.length}. Please extract key terms (deal, fees, discounts).`;
    } else {
      const preview = textPreview(buf.toString("utf8"));
      docText = `TEXT FILE: \n${preview}`;
    }

    // Use AI agent service for CSVs to get robust mapping/suggestions
    if (name.endsWith(".csv")) {
      const { AIAgentService } = await import(
        "@/lib/services/ai-agent.service"
      );
      const result = await AIAgentService.processCSVWithSchema(
        buf.toString("utf8"),
        file.name
      );
      return NextResponse.json({
        ...result,
        success: true,
        filename: file.name,
        detected: "csv",
      });
    }

    const mapping = await parseDocumentWithAI(docText);
    const profile_suggestion = buildLegacyProfileFromMapping(mapping);

    return NextResponse.json({
      success: true,
      filename: file.name,
      detected: name.endsWith(".csv")
        ? "csv"
        : name.endsWith(".json")
        ? "json"
        : type.includes("pdf")
        ? "pdf"
        : "text",
      mapping,
      profile_suggestion,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload parse failed" },
      { status: 500 }
    );
  }
}

// Configure the route to handle file uploads
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout for OCR processing
