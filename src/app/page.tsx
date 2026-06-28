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
  { label: '6주차', dates: '6/23~6/27', task: '팀원 원고 제출·수합', done: false, current: true },
  { label: '7주차', dates: '6/30~7/4', task: '이진규 파트 완성 + 7/3 최종 전달', done: false },
  { label: '8주차', dates: '7/7~7/11', task: '기획사 디자인 검토 + 퇴고', done: false },
  { label: '9주차', dates: '7/14~7/18', task: '7/14 인쇄 의뢰 + 최종 확정', done: false },
  { label: '납품', dates: '7/22(수)', task: '책 수령 🎉', done: false },
  { label: '행사', dates: '7/23(목)', task: '성과공유회 배포', done: false },
]

const DAILY_SCHEDULE = [
  { date: '6/23(화)', task: '김연수 프롤로그·에필로그, 이현직 1부 제출 확인', done: false, today: true },
  { date: '6/24(수)', task: '김정현 2부 제출 확인 + 1차 검토 의견 정리', done: false },
  { date: '6/25(목)', task: '파트별 누락 수치·사진·인용문 보완 요청', done: false },
  { date: '6/26(금)', task: '수정본 수합 + 이진규 파트 초안 정리', done: false },
  { date: '6/27(토)', task: '이승원 4부·부록 제출 확인 + 전체 목차 재점검', done: false },
  { date: '7/1(수)', task: '이진규 타임라인·3부·5부 제출', done: false },
  { date: '7/2(목)', task: '최종 원고 교정 + 기획사 전달 파일 정리', done: false },
  { date: '7/3(금)', task: '기획사 최종 원고 전달', done: false },
  { date: '7/14(화)', task: '인쇄 의뢰', done: false },
]

const CHECKLIST = [
  { emoji: '🔴', title: '7/3(금) 기획사 최종 원고 전달', desc: 'README 기준 핵심 날짜. 7/1 이진규 파트 제출 후 7/2까지 교정·파일 정리를 끝내야 함' },
  { emoji: '🟠', title: '12파트 63p 구성 유지', desc: '내지 표지·목차·부록까지 포함한 최종 구성 기준. 기존 9파트 초안과 혼동 금지' },
  { emoji: '🟠', title: '7/14(화) 인쇄 의뢰', desc: '성과공유회 7/23 배포 역산 일정. 디자인 검토 지연 시 즉시 데일리 채널에 공유' },
  { emoji: '🟡', title: '5부 표현 주의', desc: '수성구청 협력 파트너를 인정하는 가능성 언어 사용. 요구·비판 표현 금지' },
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
              <p className="text-green-300 text-sm mt-2">A4 · 컬러 · 50부 · 약 63페이지 | 최종 원고 전달: 2026년 7월 3일 · 성과공유회 배포: 7월 23일</p>
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
