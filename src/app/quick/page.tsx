'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type QuickType = 'expense' | 'health_a' | 'health_b' | 'water' | 'medicine_morning' | 'medicine_night'
type PayMethod = '현대 M카드' | '신한카드' | '롯데카드' | '국민카드' | '현금' | '체크카드' | '계좌이체'

type QuickEvent = {
  id: string
  type: QuickType
  occurredAt: string
  recordedAt: string
  amount?: number
  title?: string
  method?: PayMethod
}

type MoneyRecord = {
  id: string
  date: string
  type: '기타'
  method: PayMethod
  amount: number
  title: string
  reason: string
  keep: boolean
}

const quickKey = 'cheonggok-quick-events-v1'
const moneyKey = 'cheonggok-money-leak-v1'
const lastMethodKey = 'cheonggok-quick-last-method-v1'
const payMethods: PayMethod[] = ['현대 M카드', '신한카드', '롯데카드', '국민카드', '현금', '체크카드', '계좌이체']
const quickAmounts = [4500, 10000, 20000, 30000]

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function dateInKorea(value = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(value)
}

function timeInKorea(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function won(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function eventLabel(event: QuickEvent) {
  if (event.type === 'expense') return `${event.title || '소비'} · ${won(event.amount || 0)}`
  if (event.type === 'health_a') return '1번 체크'
  if (event.type === 'health_b') return '2번 체크'
  if (event.type === 'water') return '물 마시기'
  if (event.type === 'medicine_morning') return '아침 · 협심증약'
  return '자기 전 · 탈모약'
}

export default function QuickPage() {
  const [events, setEvents] = useState<QuickEvent[]>([])
  const [panel, setPanel] = useState<'none' | 'expense' | 'health'>('none')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState<PayMethod>('현대 M카드')
  const [notice, setNotice] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEvents(load(quickKey, []))
      const savedMethod = localStorage.getItem(lastMethodKey) as PayMethod | null
      if (savedMethod && payMethods.includes(savedMethod)) setMethod(savedMethod)
    })
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      cancelAnimationFrame(frame)
      data.subscription.unsubscribe()
    }
  }, [])

  const todayEvents = useMemo(
    () => events.filter(event => dateInKorea(new Date(event.occurredAt)) === dateInKorea()),
    [events],
  )
  const healthACount = todayEvents.filter(event => event.type === 'health_a').length
  const healthBCount = todayEvents.filter(event => event.type === 'health_b').length
  const waterCount = todayEvents.filter(event => event.type === 'water').length
  const morningMedicineDone = todayEvents.some(event => event.type === 'medicine_morning')
  const nightMedicineDone = todayEvents.some(event => event.type === 'medicine_night')
  const expenseTotal = todayEvents
    .filter(event => event.type === 'expense')
    .reduce((sum, event) => sum + (event.amount || 0), 0)

  function saveEvents(next: QuickEvent[]) {
    setEvents(next)
    localStorage.setItem(quickKey, JSON.stringify(next))
  }

  function handleHealth(type: Exclude<QuickType, 'expense'>) {
    if (type === 'medicine_morning' && morningMedicineDone) return
    if (type === 'medicine_night' && nightMedicineDone) return
    const now = new Date().toISOString()
    const event: QuickEvent = { id: crypto.randomUUID(), type, occurredAt: now, recordedAt: now }
    saveEvents([event, ...events].slice(0, 500))
    setNotice(`${eventLabel(event)} 기록 완료 · ${timeInKorea(now)}`)
  }

  async function handleExpense() {
    const parsedAmount = Number(amount.replaceAll(',', '').replace(/[^0-9]/g, ''))
    if (!parsedAmount) {
      setNotice('금액을 입력해 주세요.')
      return
    }
    if (!title.trim()) {
      setNotice('어디에 썼는지 입력해 주세요.')
      return
    }

    setSaving(true)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const expenseTitle = title.trim()
    const event: QuickEvent = {
      id,
      type: 'expense',
      occurredAt: now,
      recordedAt: now,
      amount: parsedAmount,
      title: expenseTitle,
      method,
    }
    const moneyRecord: MoneyRecord = {
      id,
      date: dateInKorea(),
      type: '기타',
      method,
      amount: parsedAmount,
      title: expenseTitle,
      reason: '빠른 기록에서 입력',
      keep: false,
    }
    const moneyRecords = load<MoneyRecord[]>(moneyKey, [])
    localStorage.setItem(moneyKey, JSON.stringify([moneyRecord, ...moneyRecords].slice(0, 500)))
    localStorage.setItem(lastMethodKey, method)
    saveEvents([event, ...events].slice(0, 500))

    if (user) {
      const { error } = await supabase.from('money_spends').upsert({
        user_id: user.id,
        id: moneyRecord.id,
        spend_date: moneyRecord.date,
        type: moneyRecord.type,
        method: moneyRecord.method,
        amount: moneyRecord.amount,
        title: moneyRecord.title,
        reason: moneyRecord.reason,
        keep: moneyRecord.keep,
        updated_at: now,
      }, { onConflict: 'user_id,id' })
      if (error) {
        setNotice(`기기에는 저장됐지만 클라우드 저장에 실패했습니다: ${error.message}`)
        setSaving(false)
        return
      }
    }

    setAmount('')
    setTitle('')
    setNotice(`소비 기록 완료 · ${won(parsedAmount)} · ${user ? '클라우드 저장' : '이 기기 저장'} · ${timeInKorea(now)}`)
    setSaving(false)
  }

  async function undoLatest() {
    const latest = events[0]
    if (!latest) return
    if (latest.type === 'expense' && user) {
      const { error } = await supabase.from('money_spends').delete().eq('user_id', user.id).eq('id', latest.id)
      if (error) {
        setNotice(`취소하지 못했습니다: ${error.message}`)
        return
      }
    }
    if (latest.type === 'expense') {
      const moneyRecords = load<MoneyRecord[]>(moneyKey, [])
      localStorage.setItem(moneyKey, JSON.stringify(moneyRecords.filter(record => record.id !== latest.id)))
    }
    saveEvents(events.slice(1))
    setNotice('마지막 기록을 취소했습니다.')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Nav />
      <main className="mx-auto max-w-lg px-4 py-5 pb-24">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-xs font-black tracking-[.2em] text-emerald-300">QUICK LOG</p>
          <h1 className="mt-2 text-3xl font-black">빠른 기록</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            설명보다 기록이 먼저입니다. 기본 화면에는 민감한 항목명을 표시하지 않습니다.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-black text-slate-900">
            소비 기록: {user ? '클라우드 연결됨' : '현재 기기에 저장'}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            {user
              ? '휴대폰과 컴퓨터의 소비점검에서 같은 기록을 확인합니다. 건강 기록은 개인정보 보호를 위해 이 기기에만 저장합니다.'
              : '휴대폰과 컴퓨터에서 함께 보려면 소비점검에서 먼저 로그인하세요. 로그인 전 기록도 나중에 올릴 수 있습니다.'}
          </p>
          {!user ? <Link href="/money" className="mt-2 inline-block text-xs font-black text-emerald-700 underline underline-offset-4">소비점검 로그인</Link> : null}
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPanel(panel === 'expense' ? 'none' : 'expense')}
            className="min-h-32 rounded-3xl border border-lime-200 bg-lime-50 p-5 text-left shadow-sm active:scale-[.98]"
          >
            <span className="text-3xl">₩</span>
            <strong className="mt-4 block text-lg font-black text-lime-950">소비 기록</strong>
            <span className="mt-1 block text-xs font-bold text-lime-800">금액부터 바로</span>
          </button>
          <button
            type="button"
            onClick={() => setPanel(panel === 'health' ? 'none' : 'health')}
            className="min-h-32 rounded-3xl border border-sky-200 bg-sky-50 p-5 text-left shadow-sm active:scale-[.98]"
          >
            <span className="text-3xl">＋</span>
            <strong className="mt-4 block text-lg font-black text-sky-950">건강 체크</strong>
            <span className="mt-1 block text-xs font-bold text-sky-800">필요할 때만 열기</span>
          </button>
        </section>

        {panel === 'expense' ? (
          <section className="mt-4 rounded-3xl border border-lime-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">소비 금액</h2>
              <button type="button" onClick={() => setPanel('none')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">닫기</button>
            </div>
            <div className="mt-4 flex items-center rounded-2xl border-2 border-lime-300 bg-lime-50 px-4">
              <input
                inputMode="numeric"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder="금액"
                className="min-w-0 flex-1 bg-transparent py-4 text-3xl font-black outline-none placeholder:text-lime-300"
              />
              <span className="font-black text-lime-900">원</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {quickAmounts.map(value => (
                <button key={value} type="button" onClick={() => setAmount(String(value))} className="rounded-xl bg-lime-100 px-2 py-3 text-sm font-black text-lime-950 active:bg-lime-200">
                  {value >= 10000 ? `${value / 10000}만` : `${value / 1000}천`}
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="어디에 썼나요? (필수)"
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-lime-500"
            />
            <select value={method} onChange={event => setMethod(event.target.value as PayMethod)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">
              {payMethods.map(item => <option key={item}>{item}</option>)}
            </select>
            <button type="button" disabled={saving} onClick={handleExpense} className="mt-3 w-full rounded-2xl bg-lime-500 py-4 text-lg font-black text-slate-950 active:bg-lime-400 disabled:bg-slate-300 disabled:text-slate-500">
              {saving ? '저장 중' : '저장'}
            </button>
          </section>
        ) : null}

        {panel === 'health' ? (
          <section className="mt-4 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">개인 기록</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">세부 명칭은 화면에 노출하지 않습니다.</p>
              </div>
              <button type="button" onClick={() => setPanel('none')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">닫기</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleHealth('health_a')} className="min-h-28 rounded-2xl bg-sky-500 p-4 text-white active:bg-sky-400">
                <span className="block text-3xl">○</span>
                <strong className="mt-2 block text-lg font-black">1번 체크</strong>
              </button>
              <button type="button" onClick={() => handleHealth('health_b')} className="min-h-28 rounded-2xl bg-indigo-500 p-4 text-white active:bg-indigo-400">
                <span className="block text-3xl">◇</span>
                <strong className="mt-2 block text-lg font-black">2번 체크</strong>
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <button type="button" onClick={() => handleHealth('water')} className="rounded-2xl bg-cyan-100 p-4 text-left text-cyan-950 active:bg-cyan-200">
                <strong className="block text-lg font-black">물 마시기 · 오늘 {waterCount}회</strong>
                <span className="mt-1 block text-xs font-bold text-cyan-700">마실 때마다 한 번씩</span>
              </button>
              <button type="button" disabled={morningMedicineDone} onClick={() => handleHealth('medicine_morning')} className="rounded-2xl bg-amber-100 p-4 text-left text-amber-950 active:bg-amber-200 disabled:bg-emerald-100 disabled:text-emerald-900">
                <strong className="block text-lg font-black">{morningMedicineDone ? '✓ 아침 복용완료' : '아침 · 협심증약'}</strong>
              </button>
              <button type="button" disabled={nightMedicineDone} onClick={() => handleHealth('medicine_night')} className="rounded-2xl bg-violet-100 p-4 text-left text-violet-950 active:bg-violet-200 disabled:bg-emerald-100 disabled:text-emerald-900">
                <strong className="block text-lg font-black">{nightMedicineDone ? '✓ 자기 전 복용완료' : '자기 전 · 탈모약'}</strong>
              </button>
            </div>
          </section>
        ) : null}

        {notice ? (
          <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-emerald-950 px-4 py-3 text-white shadow-sm">
            <p className="text-sm font-bold">{notice}</p>
            {events.length ? <button type="button" onClick={undoLatest} className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-xs font-black">실행 취소</button> : null}
          </section>
        ) : null}

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[.16em] text-slate-400">TODAY</p>
              <h2 className="mt-1 text-lg font-black">오늘 기록</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">소비 {user ? '클라우드' : '기기'} · 건강 기기</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-lime-50 p-3"><strong className="block text-lg font-black text-lime-950">{won(expenseTotal)}</strong><span className="text-xs font-bold text-lime-800">소비</span></div>
            <div className="rounded-2xl bg-sky-50 p-3"><strong className="block text-lg font-black text-sky-950">{healthACount}</strong><span className="text-xs font-bold text-sky-800">건강 1</span></div>
            <div className="rounded-2xl bg-indigo-50 p-3"><strong className="block text-lg font-black text-indigo-950">{healthBCount}</strong><span className="text-xs font-bold text-indigo-800">건강 2</span></div>
            <div className="rounded-2xl bg-cyan-50 p-3"><strong className="block text-lg font-black text-cyan-950">{waterCount}</strong><span className="text-xs font-bold text-cyan-800">물</span></div>
            <div className="rounded-2xl bg-amber-50 p-3"><strong className="block text-lg font-black text-amber-950">{morningMedicineDone ? '완료' : '-'}</strong><span className="text-xs font-bold text-amber-800">아침 약</span></div>
            <div className="rounded-2xl bg-violet-50 p-3"><strong className="block text-lg font-black text-violet-950">{nightMedicineDone ? '완료' : '-'}</strong><span className="text-xs font-bold text-violet-800">자기 전 약</span></div>
          </div>
          <div className="mt-4 space-y-2">
            {events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                <span className="text-sm font-bold text-slate-800">{eventLabel(event)}</span>
                <span className="text-xs font-semibold text-slate-500">{timeInKorea(event.occurredAt)}</span>
              </div>
            ))}
            {!events.length ? <p className="py-4 text-center text-sm font-semibold text-slate-400">아직 기록이 없습니다.</p> : null}
          </div>
        </section>

        <div className="mt-4 flex justify-center">
          <Link href="/money" className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-black text-slate-700">소비점검에서 자세히 보기</Link>
        </div>
      </main>
    </div>
  )
}
