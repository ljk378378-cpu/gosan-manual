'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { supabase, LOCAL_KEY } from '@/lib/supabase'
import { TRIP_SLUG, defaultTrip, won, type TripState } from '@/lib/trip'

const ACCESS_KEY = 'andong-family-trip-access-v1'

export default function ReportPage() {
  const [ready, setReady] = useState(false)
  const [author, setAuthor] = useState('진규')
  const [issued, setIssued] = useState('')
  const [trip, setTrip] = useState<TripState>(defaultTrip)

  useEffect(() => {
    // Browser storage is the external source for this printable snapshot.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthor(localStorage.getItem('andong-family-trip-name-v1') || '진규')
    setIssued(new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }))
    if (!supabase) {
      try { const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); if (saved?.trip) setTrip(saved.trip); setReady(true) } catch { setReady(false) }
      return
    }
    const code = sessionStorage.getItem(ACCESS_KEY)
    if (!code) return
    supabase.rpc('family_trip_get', { p_slug: TRIP_SLUG, p_access_code: code }).then(({ data }) => {
      if (data?.state) { setTrip(data.state as TripState); setReady(true) }
    })
  }, [])

  const total = useMemo(() => trip.budget.reduce((sum, item) => sum + item.planned, 0), [trip.budget])
  const paid = useMemo(() => trip.budget.reduce((sum, item) => sum + (item.paid ? item.actual : 0), 0), [trip.budget])

  if (!ready) return <main className="center-screen"><p>저장된 계획을 확인하려면 대시보드에서 먼저 일정표를 열어주세요.</p><Link href="/">대시보드로 돌아가기</Link></main>

  return (
    <main className="report-shell">
      <div className="report-actions no-print">
        <Link href="/"><ArrowLeft size={17} /> 대시보드</Link>
        <button onClick={() => window.print()}><Printer size={17} /> PDF로 저장·인쇄</button>
      </div>
      <section className="report-cover">
        <span>FAMILY TRAVEL PLAN</span>
        <h1>{trip.title}</h1>
        <p>{trip.subtitle}</p>
        <dl><div><dt>기간</dt><dd>2026. 11. 7.(토) ~ 11. 8.(일)</dd></div><div><dt>장소</dt><dd>경상북도 안동 일원</dd></div><div><dt>숙소</dt><dd>{trip.accommodation || '안동 올웨이즈펜션'}</dd></div><div><dt>인원</dt><dd>총 9명</dd></div><div><dt>작성자</dt><dd>{author}</dd></div><div><dt>작성일</dt><dd>{issued}</dd></div></dl>
      </section>
      <section className="report-section"><h2>가족 구성과 식사 기준</h2><p>{trip.travelers}</p><p>{trip.familyNotes}</p></section>
      <section className="report-section">
        <h2>여행 일정</h2>
        {(['day1', 'day2'] as const).map((day, index) => <div className="report-day" key={day}><h3>DAY {index + 1} · {index === 0 ? '11월 7일 토요일' : '11월 8일 일요일'}</h3>{trip.schedule[day].map(item => <div className="report-schedule-row" key={item.id}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div>)}
      </section>
      <section className="report-section page-break">
        <h2>예상경비</h2>
        <table><thead><tr><th>항목</th><th>예상금액</th><th>실제 지출</th><th>상태</th></tr></thead><tbody>{trip.budget.map(item => <tr key={item.id}><td>{item.title}<small>{item.memo}</small></td><td>{won(item.planned)}</td><td>{item.actual ? won(item.actual) : '-'}</td><td>{item.paid ? '결제 완료' : '예정'}</td></tr>)}</tbody><tfoot><tr><th>합계</th><th>{won(total)}</th><th>{won(paid)}</th><th>미결제 예상 {won(trip.budget.filter(item => !item.paid).reduce((sum, item) => sum + item.planned, 0))}</th></tr></tfoot></table>
      </section>
      <section className="report-section">
        <h2>준비 업무</h2>
        <table><thead><tr><th>준비사항</th><th>담당</th><th>기한</th><th>완료</th></tr></thead><tbody>{trip.tasks.map(task => <tr key={task.id}><td>{task.title}</td><td>{task.owner}</td><td>{task.due}</td><td>{task.done ? '완료' : '준비 중'}</td></tr>)}</tbody></table>
      </section>
      <p className="report-closing">어머니는 아무것도 준비하지 않고, 여행의 주인공으로 즐기시기만 합니다.</p>
    </main>
  )
}
