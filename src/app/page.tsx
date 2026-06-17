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
  { label: '4주차', dates: '6/9~6/13', task: '원고 확정+Canva', done: true },
  { label: '5주차', dates: '6/16~6/20', task: '원고 완성+검토', done: false, current: true },
  { label: '6주차', dates: '6/23~6/27', task: 'Canva 디자인+인쇄 발주', done: false },
  { label: '7월', dates: '7/1~7/15', task: '납품·배포 🎉', done: false },
]

const DAILY_SCHEDULE = [
  { date: '6/17(화)', task: '글쓰기 가이드 팀원 배포 + 프롤로그 착수', done: false, today: true },
  { date: '6/18(수)', task: '프롤로그 초안 완성 → 검토 제출', done: false },
  { date: '6/19(목)', task: '1부·2부 팀원 초안 수집 + 피드백', done: false },
  { date: '6/20(금)', task: '4부(이진규) 착수 + 3부 착수 지시', done: false },
  { date: '6/23(월)', task: '4부 완성 + 전체 원고 현황 점검', done: false },
  { date: '6/24(화)', task: '미완성 파트 집중 수정', done: false },
  { date: '6/25(수)', task: '발간사 초안 작성', done: false },
  { date: '6/26(목)', task: '전체 원고 1차 검토 완료', done: false },
  { date: '6/27(금)', task: 'Canva 디자인 작업 착수', done: false },
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
              <p className="text-green-300 text-sm mt-2">A4 · 컬러 · 50부 · 약 50페이지 | 목표 발간일: 2026년 7월 15일</p>
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
