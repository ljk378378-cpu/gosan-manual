'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

type HealthType = 'health_a' | 'health_b' | 'water' | 'medicine_morning' | 'medicine_night' | 'sleep' | 'neck_pain' | 'back_pain' | 'weight' | 'exercise' | 'symptom'

type HealthEvent = {
  id: string
  type: HealthType
  occurredAt: string
  recordedAt: string
  numericValue?: number
  unit?: string
  volumeMl?: number
  detail?: string
  cloudSynced?: boolean
  ownerId?: string
}

type HealthEventRow = {
  id: string
  event_type: HealthType
  occurred_at: string
  recorded_at: string
  numeric_value: number | null
  unit: string | null
  volume_ml: number | null
  detail: string | null
}

const quickKey = 'cheonggok-quick-events-v1'
const healthTypes = new Set<HealthType>([
  'health_a', 'health_b', 'water', 'medicine_morning', 'medicine_night',
  'sleep', 'neck_pain', 'back_pain', 'weight', 'exercise', 'symptom',
])

function koreaDate(value = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(value)
}

function currentMonth() {
  return koreaDate().slice(0, 7)
}

function monthOffset(month: string, offset: number) {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(year, monthIndex - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function calendarDays(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  const firstDate = new Date(year, monthIndex - 1, 1)
  const lastDate = new Date(year, monthIndex, 0)
  const blanks = Array.from({ length: firstDate.getDay() }, () => null)
  const days = Array.from({ length: lastDate.getDate() }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`)
  const result: Array<string | null> = [...blanks, ...days]
  while (result.length % 7) result.push(null)
  return result
}

function koreanDateLabel(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  }).format(new Date(`${date}T12:00:00+09:00`))
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

function loadLocalHealthEvents() {
  try {
    const raw = localStorage.getItem(quickKey)
    if (!raw) return []
    return (JSON.parse(raw) as Array<HealthEvent & { type: string }>).filter(event => healthTypes.has(event.type as HealthType)) as HealthEvent[]
  } catch {
    return []
  }
}

function fromRow(row: HealthEventRow, ownerId: string): HealthEvent {
  return {
    id: row.id,
    type: row.event_type,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    numericValue: row.numeric_value ?? undefined,
    unit: row.unit ?? undefined,
    volumeMl: row.volume_ml ?? undefined,
    detail: row.detail ?? undefined,
    cloudSynced: true,
    ownerId,
  }
}

function mergeEvents(...groups: HealthEvent[][]) {
  const byId = new Map<string, HealthEvent>()
  groups.flat().forEach(event => byId.set(event.id, event))
  return [...byId.values()].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}

function waterVolume(event: HealthEvent) {
  return event.volumeMl ?? 250
}

function eventLabel(event: HealthEvent) {
  if (event.type === 'health_a') return '소변'
  if (event.type === 'health_b') return '대변'
  if (event.type === 'water') return `물 ${waterVolume(event)}mL`
  if (event.type === 'medicine_morning') return '아침 · 협심증약'
  if (event.type === 'medicine_night') return '자기 전 · 탈모약'
  if (event.type === 'exercise') return `헬스장 · ${event.detail || '운동'} ${event.numericValue ?? '-'}분`
  if (event.type === 'weight') return `체중 ${event.numericValue ?? '-'}kg`
  if (event.type === 'sleep') return `수면 ${event.numericValue ?? '-'}시간`
  if (event.type === 'neck_pain') return `목 통증 ${event.numericValue ?? '-'}점`
  if (event.type === 'back_pain') return `등 통증 ${event.numericValue ?? '-'}점`
  return `이상 증상 · ${event.detail || '내용 없음'}`
}

function summarize(events: HealthEvent[]) {
  const waterEvents = events.filter(event => event.type === 'water')
  return {
    waterMl: waterEvents.reduce((sum, event) => sum + waterVolume(event), 0),
    waterCount: waterEvents.length,
    urine: events.filter(event => event.type === 'health_a').length,
    bowel: events.filter(event => event.type === 'health_b').length,
    exercise: events.find(event => event.type === 'exercise'),
    weight: events.find(event => event.type === 'weight'),
    morningMedicine: events.some(event => event.type === 'medicine_morning'),
    nightMedicine: events.some(event => event.type === 'medicine_night'),
  }
}

export default function HealthPage() {
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('건강 기록을 확인하고 있습니다.')
  const [visibleMonth, setVisibleMonth] = useState(currentMonth())
  const [selectedDate, setSelectedDate] = useState(koreaDate())

  useEffect(() => {
    let active = true
    const localEvents = loadLocalHealthEvents()
    const frame = requestAnimationFrame(() => {
      if (active) setEvents(localEvents)
    })

    async function loadCloud(sessionUser: User) {
      setLoading(true)
      const { data, error } = await supabase
        .from('health_events')
        .select('id,event_type,occurred_at,recorded_at,numeric_value,unit,volume_ml,detail')
        .eq('user_id', sessionUser.id)
        .order('occurred_at', { ascending: false })
        .limit(3000)
      if (!active) return
      if (error) {
        setNotice(`클라우드 자료를 불러오지 못해 이 기기의 기록을 표시합니다: ${error.message}`)
        setLoading(false)
        return
      }
      const cloudEvents = (data as HealthEventRow[]).map(row => fromRow(row, sessionUser.id))
      const pendingLocal = localEvents.filter(event => !event.cloudSynced && (!event.ownerId || event.ownerId === sessionUser.id))
      setEvents(mergeEvents(cloudEvents, pendingLocal))
      setNotice('클라우드 건강 기록과 연결되었습니다.')
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser)
      else {
        setNotice('로그인 전이라 이 기기에 저장된 기록을 표시합니다.')
        setLoading(false)
      }
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser)
    })
    return () => {
      active = false
      cancelAnimationFrame(frame)
      data.subscription.unsubscribe()
    }
  }, [])

  const today = koreaDate()
  const calendarDates = useMemo(() => calendarDays(visibleMonth), [visibleMonth])
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, HealthEvent[]> = {}
    events.forEach(event => {
      const date = koreaDate(new Date(event.occurredAt))
      grouped[date] = [...(grouped[date] || []), event]
    })
    return grouped
  }, [events])
  const todayEvents = eventsByDate[today] || []
  const todaySummary = summarize(todayEvents)
  const selectedEvents = eventsByDate[selectedDate] || []
  const selectedSummary = summarize(selectedEvents)
  const monthEvents = events.filter(event => koreaDate(new Date(event.occurredAt)).startsWith(visibleMonth))
  const exerciseDays = new Set(monthEvents.filter(event => event.type === 'exercise').map(event => koreaDate(new Date(event.occurredAt)))).size
  const recordedDays = new Set(monthEvents.map(event => koreaDate(new Date(event.occurredAt)))).size
  const monthWater = monthEvents.filter(event => event.type === 'water').reduce((sum, event) => sum + waterVolume(event), 0)
  const latestWeight = events.find(event => event.type === 'weight')

  function changeMonth(offset: number) {
    const next = monthOffset(visibleMonth, offset)
    setVisibleMonth(next)
    setSelectedDate(next === currentMonth() ? today : `${next}-01`)
  }

  async function deleteEvent(event: HealthEvent) {
    if (!window.confirm(`${eventLabel(event)} 기록을 삭제할까요?`)) return
    if (user) {
      const { error } = await supabase.from('health_events').delete().eq('user_id', user.id).eq('id', event.id)
      if (error) {
        setNotice(`삭제하지 못했습니다: ${error.message}`)
        return
      }
    }
    const next = events.filter(item => item.id !== event.id)
    setEvents(next)
    try {
      const raw = localStorage.getItem(quickKey)
      const localEvents = raw ? JSON.parse(raw) as Array<{ id: string }> : []
      localStorage.setItem(quickKey, JSON.stringify(localEvents.filter(item => item.id !== event.id)))
    } catch {
      // 클라우드 삭제는 완료되었으므로 화면 상태를 유지한다.
    }
    setNotice('건강 기록을 삭제했습니다.')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-7">
        <header className="rounded-lg bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-cyan-300">HEALTH CONTROL</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">건강관리</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">빠르게 남긴 기록을 날짜별로 확인합니다. 기록 자체보다 물·운동·체중·증상의 흐름을 보는 화면입니다.</p>
            </div>
            <Link href="/quick" className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-400 px-4 text-sm font-black text-slate-950">빠른기록 열기</Link>
          </div>
        </header>

        <section className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-black">{loading ? '자료 불러오는 중' : notice}</p><p className="mt-1 text-xs font-semibold text-slate-500">{user ? '로그인한 본인의 건강자료만 표시됩니다.' : '다른 기기 자료를 보려면 소비점검에서 로그인하세요.'}</p></div>
          {!user ? <Link href="/money" className="text-sm font-black text-cyan-800 underline underline-offset-4">로그인</Link> : null}
        </section>

        <section className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black text-cyan-700">TODAY</p><h2 className="mt-1 text-xl font-black">오늘 상태</h2><p className="mt-1 text-sm font-bold text-slate-500">{koreanDateLabel(today)}</p></div>
            <p className="text-xs font-bold text-slate-500">오늘 입력한 기록만 표시</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div className="min-h-24 rounded-lg border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-black text-cyan-800">물</p><strong className="mt-2 block text-xl font-black">{todaySummary.waterMl.toLocaleString('ko-KR')}mL</strong><span className="text-xs font-bold text-cyan-700">{todaySummary.waterCount}회</span></div>
            <div className="min-h-24 rounded-lg border border-sky-200 bg-sky-50 p-4"><p className="text-xs font-black text-sky-800">소변</p><strong className="mt-2 block text-xl font-black">{todaySummary.urine}회</strong></div>
            <div className="min-h-24 rounded-lg border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-black text-indigo-800">대변</p><strong className="mt-2 block text-xl font-black">{todaySummary.bowel}회</strong></div>
            <div className="min-h-24 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black text-emerald-800">운동</p><strong className="mt-2 block text-base font-black">{todaySummary.exercise ? `${todaySummary.exercise.detail || '운동'} ${todaySummary.exercise.numericValue}분` : '-'}</strong></div>
            <div className="min-h-24 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black text-amber-800">아침 약</p><strong className="mt-2 block text-xl font-black">{todaySummary.morningMedicine ? '완료' : '-'}</strong></div>
            <div className="min-h-24 rounded-lg border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-black text-violet-800">자기 전 약</p><strong className="mt-2 block text-xl font-black">{todaySummary.nightMedicine ? '완료' : '-'}</strong></div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div><p className="text-xs font-black tracking-[.16em] text-cyan-700">HEALTH CALENDAR</p><h2 className="mt-1 text-xl font-black">월간 건강 달력</h2><p className="mt-1 text-sm font-bold text-slate-500">{visibleMonth} · 기록 {recordedDays}일 · 운동 {exerciseDays}일</p></div>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => changeMonth(-1)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black">이전달</button>
              <button type="button" onClick={() => { setVisibleMonth(currentMonth()); setSelectedDate(today) }} className="rounded-md border border-cyan-300 bg-white px-3 py-2 text-sm font-black text-cyan-800">이번달</button>
              <button type="button" onClick={() => changeMonth(1)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black">다음달</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center text-xs font-black text-slate-500">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDates.map((date, index) => {
              const dayEvents = date ? eventsByDate[date] || [] : []
              const summary = summarize(dayEvents)
              const isSelected = date === selectedDate
              const isToday = date === today
              return (
                <button
                  key={date || `blank-${index}`}
                  type="button"
                  disabled={!date}
                  onClick={() => date && setSelectedDate(date)}
                  className={`min-h-24 border-b border-r border-slate-100 p-1.5 text-left sm:min-h-32 sm:p-2 ${!date ? 'bg-slate-50' : isSelected ? 'bg-cyan-50 ring-2 ring-inset ring-cyan-500' : 'bg-white hover:bg-slate-50'}`}
                >
                  {date ? <>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black sm:h-7 sm:w-7 sm:text-sm ${isToday ? 'bg-slate-950 text-white' : 'text-slate-700'}`}>{Number(date.slice(-2))}</span>
                    {dayEvents.length ? <div className="mt-1 space-y-0.5 text-[9px] font-black leading-3 sm:mt-2 sm:text-[11px] sm:leading-4">
                      {summary.waterMl ? <p className="text-cyan-700">물 {summary.waterMl >= 1000 ? `${(summary.waterMl / 1000).toFixed(1)}L` : `${summary.waterMl}mL`}</p> : null}
                      {summary.exercise ? <p className="text-emerald-700">운동 {summary.exercise.numericValue}분</p> : null}
                      <p className="text-slate-500">기록 {dayEvents.length}건</p>
                    </div> : null}
                  </> : null}
                </button>
              )
            })}
          </div>

          <div className="grid gap-4 border-t border-slate-200 p-4 lg:grid-cols-[260px_1fr] lg:p-5">
            <aside className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs font-black text-cyan-700">선택한 날짜</p>
              <h3 className="mt-1 text-lg font-black">{koreanDateLabel(selectedDate)}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold">
                <p>물 <strong className="block text-base">{selectedSummary.waterMl.toLocaleString('ko-KR')}mL</strong></p>
                <p>운동 <strong className="block text-base">{selectedSummary.exercise ? `${selectedSummary.exercise.numericValue}분` : '-'}</strong></p>
                <p>소변 <strong className="block text-base">{selectedSummary.urine}회</strong></p>
                <p>대변 <strong className="block text-base">{selectedSummary.bowel}회</strong></p>
              </div>
            </aside>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="text-base font-black">상세 기록</h3><span className="text-xs font-black text-slate-500">{selectedEvents.length}건</span></div>
              {selectedEvents.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                {selectedEvents.map(event => <div key={event.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="text-sm font-black">{eventLabel(event)}</p><p className="mt-1 text-xs font-bold text-slate-500">{timeLabel(event.occurredAt)}</p></div>
                  <button type="button" onClick={() => deleteEvent(event)} className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700">삭제</button>
                </div>)}
              </div> : <p className="mt-3 border-y border-slate-200 py-8 text-center text-sm font-semibold text-slate-400">이 날짜에는 건강 기록이 없습니다.</p>}
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-black text-slate-500">이번 달 물</p><strong className="mt-2 block text-2xl font-black">{(monthWater / 1000).toFixed(1)}L</strong></div>
          <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-black text-slate-500">이번 달 운동</p><strong className="mt-2 block text-2xl font-black">{exerciseDays}일</strong></div>
          <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-black text-slate-500">최근 체중</p><strong className="mt-2 block text-2xl font-black">{latestWeight?.numericValue ? `${latestWeight.numericValue}kg` : '-'}</strong></div>
        </section>
      </main>
    </div>
  )
}
