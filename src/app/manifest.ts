import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '청곡 AI 업무시스템',
    short_name: '청곡AI',
    description: '평가, 지도점검, 팀 운영, 인사노무 학습, 소비점검을 관리하는 개인 업무 대시보드',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f3f6f4',
    theme_color: '#123c2c',
    orientation: 'any',
    icons: [
      {
        src: '/inspection-2026-icon.png?v=3',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/inspection-2026-icon.png?v=3',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
