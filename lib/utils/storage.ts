import type { SupabaseClient } from "@supabase/supabase-js";

export function getCompanyAssetsBucket(): string {
  return process.env.NEXT_PUBLIC_COMPANY_ASSETS_BUCKET || "company-assets";
}

export function getPublicUrl(
  sb: SupabaseClient,
  bucket: string,
  path: string
): string | null {
  try {
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}

export async function findCompanyAssetUrls(
  sb: SupabaseClient,
  companyId: number,
  companyName?: string
): Promise<{ logo_url: string | null; background_url: string | null }> {
  const bucket = getCompanyAssetsBucket();
  
  // Try to find assets using company name slug first
  if (companyName) {
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    try {
      const { data: files } = await sb.storage
        .from(bucket)
        .list(slug, { limit: 100 });
      
      if (files && files.length > 0) {
        const list = Array.isArray(files) ? files : [];
        const findFile = (candidates: string[]) =>
          list.find((f) =>
            candidates.some((name) => f.name.toLowerCase().includes(name))
          );
        const logoFile = findFile(["logo", "icon"]);
        const bgFile = findFile(["background", "bg", "cover", "screenshot"]);
        const makeUrl = (file?: string) =>
          file ? getPublicUrl(sb, bucket, `${slug}/${file}`) : null;
        return {
          logo_url: makeUrl(logoFile?.name),
          background_url: makeUrl(bgFile?.name),
        };
      }
    } catch {
      // Fall through to ID-based lookup
    }
  }
  
  // Fallback to ID-based lookup
  try {
    const { data: files } = await sb.storage
      .from(bucket)
      .list(String(companyId), { limit: 100 });
    const list = Array.isArray(files) ? files : [];
    const findFile = (candidates: string[]) =>
      list.find((f) =>
        candidates.some((name) => f.name.toLowerCase().includes(name))
      );
    const logoFile = findFile(["logo", "icon"]);
    const bgFile = findFile(["background", "bg", "cover", "screenshot"]);
    const makeUrl = (file?: string) =>
      file ? getPublicUrl(sb, bucket, `${companyId}/${file}`) : null;
    return {
      logo_url: makeUrl(logoFile?.name),
      background_url: makeUrl(bgFile?.name),
    };
  } catch {
    return { logo_url: null, background_url: null };
  }
}


