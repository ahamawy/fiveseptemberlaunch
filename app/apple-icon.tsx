import { ImageResponse } from 'next/og'
import { brand } from '@/lib/brand'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL as string | undefined
  const gradient = 'linear-gradient(135deg, #C898FF 0%, #8F4AD2 100%)'
  const monogram = (brand.name || 'E')[0]
  return new ImageResponse(
    (
      <div
        style={{
          background: gradient,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'Space Grotesk, sans-serif',
          borderRadius: '36px',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="logo"
            width={120}
            height={120}
            style={{ width: 120, height: 120, objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 100 }}>{monogram}</span>
        )}
      </div>
    ),
    {
      ...size,
    }
  )
}