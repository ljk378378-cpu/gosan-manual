import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2026 구청 지도점검 준비실 | 청곡종합사회복지관',
  description: '2026년 수성구청 지도점검 준비현황과 시설·인사·회계·후원금 증빙을 관리하는 청곡종합사회복지관 업무 대시보드',
  icons: {
    icon: '/inspection-2026-icon.png?v=2',
    apple: '/inspection-2026-icon.png?v=2',
  },
  openGraph: {
    title: '2026 구청 지도점검 준비실',
    description: '청곡종합사회복지관 지도점검 준비현황 및 증빙 체크 대시보드',
    type: 'website',
  },
}

export default function InspectionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
