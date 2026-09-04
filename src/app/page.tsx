import Link from 'next/link'
import Nav from '@/components/Nav'

const primaryCards = [
  {
    href: '/evaluation-2027',
    label: '27년 사회복지관 평가',
    title: '평가 대비 특별반',
    desc: '2024~2026 자료를 기준으로 지표, 증빙, 담당자, 진행률을 누적 관리',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  {
    href: '/inspection-2026',
    label: '9.18 확정 점검',
    title: '구청 지도점검 준비실',
    desc: '점검일까지 일정표, 일일체크, 증빙자료 위치, 2025 대비 보완사항 관리',
    tone: 'border-red-200 bg-red-50 text-red-900',
  },
  {
    href: '/team-command',
    label: '중간관리자 운영',
    title: '팀 운영 컨트롤타워',
    desc: '결재·상의 흐름, 반복문제, 직원별 피드백, 나의 컨디션 기록',
    tone: 'border-sky-200 bg-sky-50 text-sky-950',
  },
  {
    href: '/ai-system',
    label: '사용원칙',
    title: 'AI 업무시스템',
    desc: 'Codex, Work, Drive, Calendar, Keep을 역할별로 나누어 쓰는 기준표',
    tone: 'border-amber-200 bg-amber-50 text-amber-950',
  },
]

const todayFlow = [
  { time: '아침', action: '오늘 일정과 반드시 끝낼 업무 3개 확인', tool: 'ChatGPT 브리핑' },
  { time: '출근 직후', action: '평가·지도점검·팀운영 중 오늘 볼 화면만 열기', tool: '대시보드' },
  { time: '업무 중', action: '갑자기 들어온 지시와 생각은 바로 처리하지 않고 수집', tool: 'Google Keep' },
  { time: '오후', action: '기안·보고서·메시지 초안 작성과 검토', tool: 'Work / Codex' },
  { time: '퇴근 전', action: '오늘 완료, 미완료, 내일 이월, 감정소모 원인 기록', tool: '팀 운영 대시보드' },
]

const archiveLinks = [
  { href: '/storyboard', title: '매뉴얼 스토리보드', desc: '주민이 그린 고산 매뉴얼 파트별 기록' },
  { href: '/daily', title: '데일리 채널', desc: '기존 매뉴얼 작업 당시 일일 기록' },
  { href: '/comments', title: '의견 게시판', desc: '기존 원고 수정 의견' },
  { href: '/designer', title: '디자이너 브리핑', desc: '매뉴얼 디자인 전달자료' },
  { href: '/photo-guide', title: '사진 가이드', desc: '매뉴얼 사진 취합 자료' },
  { href: '/report', title: '보고서 출력', desc: '기존 진행현황 출력 화면' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-slate-950 p-7 text-white shadow-xl">
          <p className="text-xs font-bold tracking-[.22em] text-emerald-300">CHEONGGOK AI WORK HUB</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">청곡 AI 업무시스템 허브</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            현재 기준 업무는 27년 사회복지관 평가, 2026 구청 지도점검, 팀 운영, AI 업무시스템입니다.
            예전 주민이 그린 고산 매뉴얼 화면은 아래 보관 링크에서 확인합니다.
          </p>
        </section>

        <section className="mb-5 grid gap-4 md:grid-cols-2">
          {primaryCards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}
            >
              <p className="text-xs font-black opacity-70">{card.label}</p>
              <h2 className="mt-2 text-xl font-black">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 opacity-80">{card.desc}</p>
            </Link>
          ))}
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">오늘의 사용 흐름</h2>
            <div className="mt-4 space-y-3">
              {todayFlow.map(item => (
                <div key={item.time} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[90px_minmax(0,1fr)_150px]">
                  <div className="text-xs font-bold text-slate-500">{item.time}</div>
                  <div className="text-sm font-semibold leading-6 text-slate-800">{item.action}</div>
                  <div className="text-xs font-bold text-emerald-700">{item.tool}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-lg font-black text-amber-950">오늘의 기준</h2>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              모든 일을 다 처리하려고 하지 말고, 오늘 끝낼 3개를 먼저 정합니다.
              갑작스러운 상의와 지시는 즉시 떠안지 않고 기록한 뒤 우선순위를 다시 잡습니다.
            </p>
            <Link href="/ai-system" className="mt-4 inline-flex rounded-xl bg-amber-900 px-4 py-2 text-sm font-bold text-white">
              AI 사용원칙 보기
            </Link>
          </aside>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">이전 작업 보관</p>
              <h2 className="mt-1 text-lg font-black text-slate-900">주민이 그린 고산 매뉴얼 관련 화면</h2>
            </div>
            <p className="text-xs text-slate-500">필요할 때만 참고</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {archiveLinks.map(link => (
              <Link key={link.href} href={link.href} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400">
                <p className="text-sm font-bold text-slate-900">{link.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
