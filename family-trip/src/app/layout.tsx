import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '엄마의 칠순, 안동 가족여행',
  description: '2026년 11월 7일부터 8일까지 함께 만드는 가족여행 일정표',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: '안동 가족여행',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#173c35',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
