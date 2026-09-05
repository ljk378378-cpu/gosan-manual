import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '인사노무 학습실 | 청곡 AI 업무시스템',
  description: '사회복지시설 관리안내를 기본 교재로 인사노무 기준, 최신자료, 기관 규정을 매일 학습하고 기록하는 관리자 학습실',
  icons: {
    icon: '/inspection-2026-icon.png?v=3',
    apple: '/inspection-2026-icon.png?v=3',
  },
  openGraph: {
    title: '인사노무 학습실',
    description: '사회복지시설 관리안내 기반 관리자 인사노무 학습노트',
    type: 'website',
  },
}

export default function HrLaborLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
