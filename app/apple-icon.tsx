import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
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
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            borderRadius: '36px',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvedLogo!} alt="EquiTie" width={140} height={140} style={{ objectFit: 'contain' }} />
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '36px',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
          >
            <path
              d="M 30 30 L 90 30 L 90 45 L 45 45 L 45 52.5 L 80 52.5 L 80 67.5 L 45 67.5 L 45 75 L 90 75 L 90 90 L 30 90 Z"
              fill="white"
            />
          </svg>
        </div>
      )
    ),
    {
      ...size,
    }
  )
}