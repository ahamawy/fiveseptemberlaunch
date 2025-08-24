import { ImageResponse } from 'next/og'
import { brand } from '@/lib/brand'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
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
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="logo"
            width={24}
            height={24}
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 20 }}>{monogram}</span>
        )}
      </div>
    ),
    {
      ...size,
    }
  )
}