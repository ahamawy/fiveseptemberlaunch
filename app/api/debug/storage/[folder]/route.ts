import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(
  request: Request,
  { params }: { params: { folder: string } }
) {
  try {
    const sb = getServiceClient();
    const folder = params.folder;
    
    const { data, error } = await sb.storage
      .from('company-assets')
      .list(folder, { limit: 100 });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Generate public URLs for each file
    const filesWithUrls = (data || []).map((file: any) => ({
      ...file,
      publicUrl: sb.storage
        .from('company-assets')
        .getPublicUrl(`${folder}/${file.name}`).data?.publicUrl
    }));
    
    return NextResponse.json({
      folder,
      files: filesWithUrls,
      fileCount: filesWithUrls.length
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}