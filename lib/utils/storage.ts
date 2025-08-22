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
  companyId: number
): Promise<{ logo_url: string | null; background_url: string | null }> {
  const bucket = getCompanyAssetsBucket();
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
    const bgFile = findFile(["background", "bg", "cover"]);
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


