'use client'

import Link from 'next/link'

const toolRules = [
  {
    tool: 'Codex',
    role: '대시보드·앱·자동화 제작',
    useFor: '평가, 지도점검, 팀 운영, 반복 업무 기록판처럼 계속 굴릴 구조를 만들 때 사용',
    notFor: '개인정보 원본을 그대로 올리거나 승인 전 원본 파일을 직접 고치는 작업',
    firstAction: '필요한 화면, 저장 방식, 출력 형태를 정하고 작업을 맡김',
  },
  {
    tool: 'ChatGPT Work',
    role: '문서 검토·초안·파일 분석',
    useFor: '기안, 공문, 보고서, 계획서, 회의록, 평가자료집을 읽고 문장과 구조를 다듬을 때 사용',
    notFor: '최종 결재문서 원본을 승인 없이 자동 수정하는 작업',
    firstAction: '기준파일과 작성파일을 함께 넣고 보완문장부터 받음',
  },
  {
    tool: 'Google Drive',
    role: '기준자료·원본·최종본 보관',
    useFor: '맥과 윈도우에서 같은 자료를 기준으로 이어갈 때 사용',
    notFor: '임시파일을 계속 쌓아 기준본이 흐려지는 방식',
    firstAction: '00_원본기준자료, 01_작성중, 99_최종본으로 구분',
  },
  {
    tool: 'Google Calendar',
    role: '시간이 확정된 일정 관리',
    useFor: '회의, 점검일, 제출기한, 외부일정, 병원·가족일정처럼 시간이 정해진 일을 등록',
    notFor: '언젠가 해야 하는 메모나 생각 정리',
    firstAction: '날짜, 시간, 장소, 준비물을 한 번에 입력',
  },
  {
    tool: 'Google Keep',
    role: '갑자기 들어온 업무 수집',
    useFor: '업무지시, 떠오른 생각, 직원에게 확인할 말, 나중에 캘린더로 옮길 내용을 빠르게 적음',
    notFor: '최종 계획표나 장기 기록 관리',
    firstAction: '오늘 업무수집 메모에 일단 적고 퇴근 전 분류',
  },
]

const dailyRoutine = [
  {
    time: '아침 6:30',
    name: 'AI 브리핑',
    action: '오늘 일정, 마감, 핵심업무 3개, 조심할 감정소모 지점을 확인',
    output: '오늘 반드시 끝낼 3개',
  },
  {
    time: '출근 직후',
    name: '대시보드 확인',
    action: '평가·지도점검·팀 운영 중 오늘 실제로 건드릴 화면만 열기',
    output: '오늘 체크할 항목 표시',
  },
  {
    time: '업무 중',
    name: '빠른 수집',
    action: '갑작스러운 지시와 상의는 즉시 처리하지 않고 Keep 또는 팀 운영 대시보드에 먼저 남김',
    output: '흩어진 일을 한 곳에 모음',
  },
  {
    time: '오후 결재 전',
    name: '문서 정리',
    action: '기안·보고서·검토문안은 Work 또는 Codex로 초안 정리 후 직접 판단',
    output: '수정할 문장과 결재 쟁점',
  },
  {
    time: '퇴근 전 10분',
    name: '하루 마감',
    action: '오늘 한 일, 못 한 일, 내일 넘길 일, 감정소모 원인을 기록',
    output: '내일 아침 바로 시작할 목록',
  },
]

const workAreas = [
  {
    title: '27년 사회복지관 평가',
    href: '/evaluation-2027',
    purpose: '평가지표, 증빙, 담당자, 연도별 충족 여부를 누적 관리',
    check: '매일 한 지표씩 학습하고 실제 우리 기관 자료 위치를 기록',
  },
  {
    title: '2026 구청 지도점검',
    href: '/inspection-2026',
    purpose: '9월 18일 확정 점검일까지 자료와 현장 대응 준비',
    check: '완료는 증빙자료 위치와 30초 내 제시 가능 여부까지 확인',
  },
  {
    title: '팀 운영 컨트롤타워',
    href: '/team-command',
    purpose: '보고·상의·결재 흐름, 반복문제, 직원별 피드백을 누적',
    check: '수시 상의가 내 시간을 빼앗는지 기록하고 결재시간 원칙을 유지',
  },
  {
    title: '개인 업무·건강 패턴',
    href: '/team-command',
    purpose: '업무량, 감정소모, 컨디션, 물·화장실·통증 패턴 확인',
    check: '하루를 탓하는 것이 아니라 반복되는 원인을 데이터로 봄',
  },
]

const guardrails = [
  '개인정보가 포함된 원본 파일은 필요한 경우에만 최소 범위로 사용함',
  'Google Drive 원본·최종본은 승인 없이 직접 수정하지 않음',
  'AI가 만든 문장은 결재문서에 넣기 전 과장님 판단으로 최종 확인함',
  '직원 평가·감정 기록은 사실, 반복행동, 업무영향 중심으로 남김',
  '저작권 있는 자료는 전문 복사보다 요약·검토·보완 방향 중심으로 사용함',
]

export default function AiSystemPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-950 text-white no-print">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-emerald-300">CHEONGGOK AI WORK SYSTEM</p>
            <h1 className="text-lg font-bold">AI 업무시스템 사용원칙</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">홈</Link>
            <button onClick={() => window.print()} className="rounded-lg bg-emerald-400 px-3 py-2 font-semibold text-slate-950">출력</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-7 text-white shadow-xl">
          <p className="text-sm font-bold text-emerald-200">핵심 원칙</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">AI는 대신 결정하는 사람이 아니라,<br />일을 놓치지 않게 붙잡아주는 두 번째 작업기억</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            빠른 메모, 일정, 원본 보관, 문서 검토, 대시보드 관리를 역할별로 분리한다. 모든 업무는 수집, 분류, 실행, 검토, 기록의 흐름으로 관리한다.
          </p>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-5">
          {toolRules.map(rule => (
            <article key={rule.tool} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-emerald-700">{rule.tool}</p>
              <h3 className="mt-1 text-sm font-black">{rule.role}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{rule.useFor}</p>
            </article>
          ))}
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">도구별 사용 기준</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-y bg-slate-100 text-slate-600">
                  <th className="w-28 px-3 py-2">도구</th>
                  <th className="px-3 py-2">맡길 일</th>
                  <th className="px-3 py-2">맡기지 않을 일</th>
                  <th className="px-3 py-2">첫 행동</th>
                </tr>
              </thead>
              <tbody>
                {toolRules.map(rule => (
                  <tr key={rule.tool} className="border-b align-top">
                    <td className="px-3 py-2 font-bold">{rule.tool}</td>
                    <td className="px-3 py-2 leading-5 text-slate-700">{rule.useFor}</td>
                    <td className="px-3 py-2 leading-5 text-red-700">{rule.notFor}</td>
                    <td className="px-3 py-2 leading-5 text-emerald-700">{rule.firstAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black">매일 운영 루틴</h3>
            <div className="mt-4 space-y-3">
              {dailyRoutine.map(item => (
                <div key={item.time} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[100px_130px_minmax(0,1fr)_170px]">
                  <div className="text-xs font-bold text-slate-500">{item.time}</div>
                  <div className="text-sm font-black text-slate-900">{item.name}</div>
                  <div className="text-xs leading-5 text-slate-600">{item.action}</div>
                  <div className="text-xs font-bold leading-5 text-emerald-700">{item.output}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h3 className="text-lg font-black text-amber-950">사용 금지선</h3>
            <div className="mt-3 space-y-2">
              {guardrails.map(item => (
                <p key={item} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs leading-5 text-amber-900">{item}</p>
              ))}
            </div>
          </aside>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">고정 업무 영역</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {workAreas.map(area => (
              <Link key={area.title} href={area.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50">
                <p className="text-sm font-black text-slate-900">{area.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{area.purpose}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-emerald-700">매일 확인: {area.check}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">퇴근 전 정리 문장</h3>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            오늘 완료한 일은 무엇인가. 증빙이나 결과물이 남았는가. 내일 반드시 이어갈 일은 3개 이하로 무엇인가. 오늘 내 시간을 빼앗은 일은 무엇이었고, 다음에는 어떤 방식으로 막을 것인가.
          </div>
        </section>
      </div>
    </main>
  )
}
