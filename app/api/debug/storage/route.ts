import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";
import { getCompanyAssetsBucket } from "@/lib/utils/storage";

export async function GET() {
  try {
    const sb = getServiceClient();
    const bucketName = getCompanyAssetsBucket();
    
    // Try to list buckets
    let buckets = [];
    try {
      const { data } = await sb.storage.listBuckets();
      buckets = data || [];
    } catch (e: any) {
      console.log("Error listing buckets:", e.message);
    }
    
    // Try to list files in the configured bucket
    let files = [];
    let listError = null;
    try {
      const { data, error } = await sb.storage
        .from(bucketName)
        .list('', { limit: 10 });
      
      if (error) {
        listError = error;
      } else {
        files = data || [];
      }
    } catch (e: any) {
      listError = e.message;
    }
    
    // Try to list files for company 1
    let company1Files = [];
    try {
      const { data } = await sb.storage
        .from(bucketName)
        .list('1', { limit: 10 });
      company1Files = data || [];
    } catch (e) {
      // ignore
    }
    
    // Try different bucket names
    const possibleBuckets = ['company-assets', 'companies', 'assets', 'public'];
    const bucketTests = await Promise.all(
      possibleBuckets.map(async (bucket) => {
        try {
          const { data, error } = await sb.storage.from(bucket).list('', { limit: 1 });
          return { bucket, success: !error, fileCount: data?.length || 0 };
        } catch {
          return { bucket, success: false, fileCount: 0 };
        }
      })
    );
    
    return NextResponse.json({
      configuredBucket: bucketName,
      availableBuckets: buckets.map((b: any) => b.name),
      bucketTests,
      filesInConfiguredBucket: files,
      company1Files,
      listError,
      env: {
        NEXT_PUBLIC_COMPANY_ASSETS_BUCKET: process.env.NEXT_PUBLIC_COMPANY_ASSETS_BUCKET || 'not set',
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}