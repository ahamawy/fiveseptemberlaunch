import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseLogoUrl = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/equitiebrand/${encodeURIComponent('Square Logo White.png')}`
    : undefined;
  const resolvedLogo = logoUrl || supabaseLogoUrl;
  const hasLogo = typeof resolvedLogo === 'string' && resolvedLogo.length > 0;

  return new ImageResponse(
    (
      hasLogo ? (
        // Use provided logo URL if available
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvedLogo!} alt="EquiTie" width={32} height={32} style={{ borderRadius: 6 }} />
        </div>
      ) : (
        // Fallback monogram
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C898FF" />
              <stop offset="100%" stopColor="#8F4AD2" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="6" fill="url(#icon-gradient)" />
          <path
            d="M 10 10 L 22 10 L 22 13 L 13 13 L 13 14.5 L 20 14.5 L 20 17.5 L 13 17.5 L 13 19 L 22 19 L 22 22 L 10 22 Z"
            fill="white"
          />
        </svg>
      )
    ),
    {
      ...size,
    }
  )
}