import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '팀 운영 컨트롤타워 | 청곡종합사회복지관',
  description: '중간관리자의 보고·상의·결재 흐름과 직원별 업무관리 방식을 정리하는 업무 대시보드',
  icons: {
    icon: '/inspection-2026-icon.png?v=2',
    apple: '/inspection-2026-icon.png?v=2',
  },
  openGraph: {
    title: '팀 운영 컨트롤타워',
    description: '보고·상의·결재와 직원별 업무관리 방식 점검 대시보드',
    type: 'website',
  },
}

export default function TeamCommandLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
