'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { supabase, Part, STATUS_LABELS, STATUS_COLORS } from '@/lib/supabase'

const WEEKS = [
  { label: '1주차', dates: '5/19~5/23', task: '준비', done: true },
  { label: '2주차', dates: '5/26~5/30', task: '원고 집필 1라운드', done: true },
  { label: '3주차', dates: '6/2~6/6', task: '원고 집필 2라운드', done: true },
  { label: '4주차', dates: '6/9~6/13', task: '원고 1차 수합', done: true },
  { label: '5주차', dates: '6/17~6/20', task: '가이드 배포 + 팀원 재작성', done: true },
  { label: '6주차', dates: '6/23~6/27', task: '팀원 원고 취합(6/23) + 전체 검토·수정', done: false, current: true },
  { label: '7주차', dates: '6/30~7/4', task: '최종 교열 완성 → 6/30(화) 오후 현대기획 납품 ⚠️', done: false },
  { label: '8주차', dates: '7/7~7/11', task: '현대기획 디자인 작업 (7/10 시안 조기 수신 가능)', done: false },
  { label: '9주차', dates: '7/14~7/18', task: '시안 수신(~7/14) → 교정 → 7/16(수) 오후 최종 컨펌 ⚠️', done: false },
  { label: '납품', dates: '7/22(화)', task: '책 수령 🎉', done: false },
  { label: '행사', dates: '7/23(수)', task: '성과공유회 배포', done: false },
]

const DAILY_SCHEDULE = [
  { date: '6/23(월)', task: '팀원 원고 최종 취합 마감 — 전원 제출 확인', done: false, today: true },
  { date: '6/24(화)', task: '전체 내용·흐름 검토 + 파트별 보완 지시', done: false },
  { date: '6/25(수)', task: '보완·수정 반영 + 오탈자 1차 교정', done: false },
  { date: '6/26(목)', task: '오탈자 2차 교정 + 전체 통일성 점검', done: false },
  { date: '6/27(금)', task: '교정 3차 확인 + 주말 최종 재검토 준비', done: false },
  { date: '6/30(화)', task: '⚠️ 최종 완성 원고 현대기획 납품 (오후) — 이후 수정 불가', done: false },
  { date: '7/14(월)', task: '현대기획 시안 수신 마감 → 즉시 교정 시작', done: false },
  { date: '7/16(수)', task: '⚠️ 교정 완료 + 현대기획 최종 컨펌 (오후까지) — 절대 사수', done: false },
  { date: '7/22(화)', task: '책 수령 🎉', done: false },
]

const CHECKLIST = [
  { emoji: '🔴', title: '6/30(화) 오후 현대기획 납품 — 핵심 날짜', desc: '납품 후 수정은 디자인 추가 비용 발생. 오탈자는 반드시 6/30 이전에 완벽하게 마무리' },
  { emoji: '🔴', title: '7/16(수) 오후 최종 컨펌 — 절대 사수', desc: '이 시간을 놓치면 인쇄 일정 밀려 7/22 책 수령 불가 → 7/23 성과공유회 배포 불가. 교정 기간은 최대 2일(7/14~7/16)' },
  { emoji: '🟠', title: '7/10(목) 시안 조기 수신 가능 — 대기 필요', desc: '현대기획이 빠르면 7/10에 시안 발송. 7/7부터 메일·연락 수시 확인. 늦어도 7/14까지 수신' },
  { emoji: '🟠', title: '6/23(월) 원고 미제출자 당일 독촉', desc: '전원 제출 확인 후 오후부터 검토 시작. 미제출 시 당일 오전 연락해 오후까지 수합' },
  { emoji: '🟡', title: '7/14~7/16 교정 기간 사전 준비', desc: '2일 안에 교정 완료해야 함. 해당 기간 다른 일정 최소화. 교정 보조 인력 사전 협의 권장' },
  { emoji: '🟡', title: '현대기획 담당자 직통 연락처 확보', desc: '시안 수신 후 빠른 피드백 위해 카카오톡 연락 가능 여부 사전 확인' },
]

export default function Home() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('parts').select('*').order('order_num').then(({ data }) => {
      if (data) setParts(data)
      setLoading(false)
    })
  }, [])

  const totalPages = parts.reduce((s, p) => s + p.page_count, 0)
  const avgProgress = parts.length ? Math.round(parts.reduce((s, p) => s + p.progress, 0) / parts.length) : 0
  const doneParts = parts.filter(p => p.status === 'done').length

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="bg-green-800 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🌿</div>
            <div>
              <h1 className="text-2xl font-bold">주민이 그린 고산<br />환경리빙랩 매뉴얼</h1>
              <p className="text-green-200 mt-1">주민이 만든 동네 자원순환, 3년의 기록과 실천 가이드</p>
              <p className="text-green-300 text-sm mt-2">A4 · 컬러 · 50부 · 63페이지 | 현대기획 납품: 6/30(화) · 책 수령: 7/22(화) · 성과공유회: 7/23(수)</p>
            </div>
          </div>
        </div>

        {/* 진행 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-700">{avgProgress}%</div>
            <div className="text-sm text-gray-500 mt-1">전체 진행률</div>
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-700">{doneParts}/{parts.length}</div>
            <div className="text-sm text-gray-500 mt-1">파트 완료</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-700">{totalPages}p</div>
            <div className="text-sm text-gray-500 mt-1">총 페이지</div>
          </div>
        </div>

        {/* 주차별 타임라인 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📅 주차별 일정</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {WEEKS.map((w, i) => (
              <div
                key={i}
                className={`flex-shrink-0 rounded-lg p-3 text-center min-w-[100px] ${
                  w.done ? 'bg-green-100 border border-green-300' :
                  w.current ? 'bg-yellow-100 border-2 border-yellow-400' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-xs font-bold ${w.current ? 'text-yellow-700' : w.done ? 'text-green-700' : 'text-gray-500'}`}>
                  {w.done ? '✅' : w.current ? '▶' : '○'} {w.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{w.dates}</div>
                <div className={`text-xs mt-1 font-medium ${w.current ? 'text-yellow-800' : 'text-gray-600'}`}>{w.task}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 주 작업 계획 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📌 이번 주 작업 계획 (이진규 과장)</h2>
          <div className="space-y-2">
            {DAILY_SCHEDULE.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  s.today ? 'bg-yellow-50 border border-yellow-300' :
                  s.done ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-100'
                }`}
              >
                <span className={`text-sm font-bold w-16 shrink-0 ${s.today ? 'text-yellow-700' : s.done ? 'text-green-700' : 'text-gray-400'}`}>
                  {s.done ? '✅' : s.today ? '▶' : '○'} {s.date}
                </span>
                <span className={`text-sm ${s.today ? 'text-yellow-900 font-medium' : s.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {s.task}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 필수 확인사항 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">🚨 필수 확인사항</h2>
          <div className="space-y-3">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex gap-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 체크포인트 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">⚠️ 핵심 체크포인트</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <div key={item.title} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start gap-2">
                  <span className="shrink-0">{item.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{item.title}</div>
                    <div className="text-xs leading-relaxed text-gray-600 mt-1">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 파트별 현황 미리보기 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">📄 파트별 현황</h2>
            <Link href="/storyboard" className="text-sm text-green-700 hover:underline">전체 보기 →</Link>
          </div>
          {loading ? (
            <div className="text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="space-y-2">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center gap-3">
                  <div className="w-36 text-sm text-gray-700 truncate">{part.title}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${part.progress}%` }}
                    />
                  </div>
                  <div className="w-10 text-xs text-right text-gray-500">{part.progress}%</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[part.status]}`}>
                    {STATUS_LABELS[part.status]}
                  </span>
                  <div className="w-16 text-xs text-gray-400">{part.assignee}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 바로가기 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/daily" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-bold text-gray-800">데일리 채널</div>
            <div className="text-sm text-gray-500 mt-1">오늘의 작업 현황과 피드백 공유</div>
          </Link>
          <Link href="/comments" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-bold text-gray-800">의견 게시판</div>
            <div className="text-sm text-gray-500 mt-1">팀원·주민환경연구원 누구나 의견 게재</div>
          </Link>
          <Link href="/storyboard" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold text-gray-800">스토리보드</div>
            <div className="text-sm text-gray-500 mt-1">파트별 담당자·진행률·메모 관리</div>
          </Link>
          <Link href="/report" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
            <div className="text-2xl mb-2">🖨️</div>
            <div className="font-bold text-gray-800">보고서 출력</div>
            <div className="text-sm text-gray-500 mt-1">진행현황 보고서 PDF 출력</div>
          </Link>
        </div>
      </main>
    </div>
  )
}
