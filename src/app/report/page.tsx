'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'

const reportItems = [
  {
    href: '/evaluation-2027',
    label: '2027 평가',
    title: '사회복지관 평가 준비 현황',
    desc: '지표별 진행률, 증빙 준비상태, 미완료 항목을 확인합니다.',
  },
  {
    href: '/inspection-2026',
    label: '9.18 지도점검',
    title: '구청 지도점검 준비 현황',
    desc: '점검확정일 기준 일정표, 일일체크, 보완사항을 확인합니다.',
  },
  {
    href: '/programs',
    label: '사업관리',
    title: '개별사업 관리 보고',
    desc: '생활쿠폰지원사업 등 개별사업의 기안, 실시, 활동일지, 결과보고 흐름을 확인합니다.',
  },
  {
    href: '/team-command',
    label: '팀운영',
    title: '팀 운영 컨트롤 기록',
    desc: '결재·상의 흐름, 반복 문제, 직원별 피드백, 과장 컨디션 기록을 확인합니다.',
  },
  {
    href: '/hr-labor',
    label: '인사노무',
    title: '관리자 학습 기록',
    desc: '사회복지시설 인사노무, 운영규정, 서비스규정 학습 기록을 확인합니다.',
  },
  {
    href: '/money',
    label: '소비점검',
    title: '개인 소비패턴 점검',
    desc: '카드 청구예정액, 현금흐름, 구독료, 일별 소비 기록을 확인합니다.',
  },
]

function today() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="no-print">
        <Nav />
      </div>

      <main className="mx-auto max-w-5xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-slate-950 p-7 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black tracking-[.22em] text-emerald-300">REPORT HUB</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">청곡 AI 업무시스템 보고서 출력</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                예전 매뉴얼 제작 보고서가 아니라, 현재 운영 중인 평가·지도점검·팀운영·사업관리 자료를 확인하고 출력하는 입구입니다.
              </p>
            </div>
            <button onClick={() => window.print()} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950">
              현재 화면 인쇄
            </button>
          </div>
        </section>

        <section id="report-content" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-2xl font-black">업무시스템 보고서 목록</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">작성일: {today()}</p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reportItems.map(item => (
              <Link key={item.href} href={item.href} className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-300 hover:bg-emerald-50">
                <p className="text-xs font-black tracking-[.12em] text-emerald-700">{item.label}</p>
                <h3 className="mt-2 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-950">정리 기준</p>
            <p className="mt-2 text-sm font-bold leading-6 text-amber-900">
              주민이 그린 고산 매뉴얼 제작용 페이지는 현재 업무시스템에서 제외했습니다.
              관련 데이터는 즉시 삭제하지 않고 Supabase에서 접근 제한 상태로 보관합니다.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #report-content { box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  )
}
