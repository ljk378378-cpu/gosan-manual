import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '엄마의 칠순, 안동 가족여행',
    short_name: '안동 가족여행',
    description: '우리 가족이 함께 준비하는 안동 칠순여행',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f2ea',
    theme_color: '#173c35',
    icons: [{ src: '/trip-icon.png', sizes: '512x512', type: 'image/png' }],
  }
}
