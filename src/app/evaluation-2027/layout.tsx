import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2027 사회복지관 평가 준비 | 청곡종합사회복지관',
  description: '2027년 사회복지관 평가 지표와 연도별 증빙 준비현황을 관리하는 청곡종합사회복지관 업무 대시보드',
  openGraph: {
    title: '2027 사회복지관 평가 준비 대시보드',
    description: '청곡종합사회복지관 평가 지표 및 증빙 준비현황',
    type: 'website',
  },
}

export default function EvaluationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
