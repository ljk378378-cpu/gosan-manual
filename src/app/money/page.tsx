'use client'

import { useMemo, useState } from 'react'
import Nav from '@/components/Nav'

type LeakType = '커피충전' | '배달음식' | '가족·관계' | '업무도구' | '생활구매' | '기타'
type PayMethod = '현대 M카드' | '신한카드' | '롯데카드' | '국민카드' | '현금' | '체크카드' | '계좌이체'

type MonthRecord = {
  id: string
  month: string
  income: number
  fixedCost: number
  cardHyundaiTarget: number
  cardHyundaiActual: number
  cardShinhanActual: number
  cardLotteActual: number
  cardKookminActual: number
  coffeeTarget: number
  coffeeActual: number
  memo: string
}

type LeakRecord = {
  id: string
  date: string
  type: LeakType
  method: PayMethod
  amount: number
  title: string
  reason: string
  keep: boolean
}

const monthKey = 'cheonggok-money-month-simple-v1'
const leakKey = 'cheonggok-money-leak-v1'
const leakTypes: LeakType[] = ['커피충전', '배달음식', '가족·관계', '업무도구', '생활구매', '기타']
const payMethods: PayMethod[] = ['현대 M카드', '신한카드', '롯데카드', '국민카드', '현금', '체크카드', '계좌이체']
const personalCards: PayMethod[] = ['현대 M카드', '신한카드']
const sharedCards: PayMethod[] = ['롯데카드', '국민카드']
const quickAmounts = ['5000', '10000', '20000', '30000', '50000']
const quickTemplates: Array<{ label: string; type: LeakType; title: string; amount: string; method: PayMethod }> = [
  { label: '커피 3만', type: '커피충전', title: '커피 충전', amount: '30000', method: '현대 M카드' },
  { label: '커피 5만', type: '커피충전', title: '커피 충전', amount: '50000', method: '현대 M카드' },
  { label: '점심', type: '생활구매', title: '식비', amount: '10000', method: '현대 M카드' },
  { label: '배달', type: '배달음식', title: '배달음식', amount: '20000', method: '현대 M카드' },
  { label: '가족식사', type: '가족·관계', title: '가족식사', amount: '30000', method: '국민카드' },
  { label: '업무물품', type: '업무도구', title: '업무도구 구매', amount: '20000', method: '신한카드' },
]

function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function currentMonth() {
  return today().slice(0, 7)
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function won(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

function parseAmount(value: string) {
  return Number(value.replaceAll(',', '').trim()) || 0
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
  const days = Array.from({ length: lastDate.getDate() }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return `${month}-${day}`
  })
  return [...blanks, ...days]
}

export default function MoneyPage() {
  const [months, setMonths] = useState<MonthRecord[]>(() => load(monthKey, []))
  const [leaks, setLeaks] = useState<LeakRecord[]>(() => load(leakKey, []))
  const [selectedDate, setSelectedDate] = useState(today())
  const [monthDraft, setMonthDraft] = useState({
    month: currentMonth(),
    income: '',
    fixedCost: '',
    cardHyundaiTarget: '500000',
    cardHyundaiActual: '',
    cardShinhanActual: '',
    cardLotteActual: '',
    cardKookminActual: '',
    coffeeTarget: '2',
    coffeeActual: '',
    memo: '',
  })
  const [leakDraft, setLeakDraft] = useState({
    date: today(),
    type: '커피충전' as LeakType,
    method: '현대 M카드' as PayMethod,
    amount: '',
    title: '',
    reason: '',
    keep: false,
  })

  const latest = months[0]
  const visibleMonth = monthDraft.month || currentMonth()
  const currentLeaks = useMemo(() => leaks.filter(item => item.date.startsWith(visibleMonth)), [leaks, visibleMonth])
  const todayLeaks = useMemo(() => leaks.filter(item => item.date === today()), [leaks])
  const selectedLeaks = useMemo(() => leaks.filter(item => item.date === selectedDate), [leaks, selectedDate])
  const calendarDates = useMemo(() => calendarDays(visibleMonth), [visibleMonth])
  const dailyTotals = useMemo(() => {
    return currentLeaks.reduce<Record<string, number>>((totals, item) => {
      totals[item.date] = (totals[item.date] || 0) + item.amount
      return totals
    }, {})
  }, [currentLeaks])
  const leakTotal = currentLeaks.reduce((sum, item) => sum + item.amount, 0)
  const todayTotal = todayLeaks.reduce((sum, item) => sum + item.amount, 0)
  const selectedTotal = selectedLeaks.reduce((sum, item) => sum + item.amount, 0)
  const spentDays = Object.keys(dailyTotals).length
  const averageDailySpend = spentDays ? leakTotal / spentDays : 0
  const typeTotals = leakTypes.map(type => ({
    type,
    total: currentLeaks.filter(item => item.type === type).reduce((sum, item) => sum + item.amount, 0),
  }))
  const methodTotals = payMethods.map(method => ({
    method,
    total: currentLeaks.filter(item => item.method === method).reduce((sum, item) => sum + item.amount, 0),
  }))
  const largestTypeTotal = Math.max(1, ...typeTotals.map(item => item.total))
  const largestMethodTotal = Math.max(1, ...methodTotals.map(item => item.total))
  const todayCardTotal = todayLeaks
    .filter(item => personalCards.includes(item.method) || sharedCards.includes(item.method))
    .reduce((sum, item) => sum + item.amount, 0)
  const monthHyundaiMemoTotal = currentLeaks.filter(item => item.method === '현대 M카드').reduce((sum, item) => sum + item.amount, 0)
  const personalCardActual = latest ? latest.cardHyundaiActual + (latest.cardShinhanActual || 0) : 0
  const sharedCardActual = latest ? (latest.cardLotteActual || 0) + latest.cardKookminActual : 0
  const totalCardActual = personalCardActual + sharedCardActual
  const relationTotal = currentLeaks.filter(item => item.type === '가족·관계').reduce((sum, item) => sum + item.amount, 0)
  const coffeeTotal = currentLeaks.filter(item => item.type === '커피충전').reduce((sum, item) => sum + item.amount, 0)
  const hyundaiOver = latest ? Math.max(0, latest.cardHyundaiActual - latest.cardHyundaiTarget) : 0
  const coffeeOver = latest ? Math.max(0, latest.coffeeActual - latest.coffeeTarget) : 0
  const afterCards = latest ? latest.income - latest.fixedCost - totalCardActual : 0

  const saveMonths = (next: MonthRecord[]) => {
    setMonths(next)
    localStorage.setItem(monthKey, JSON.stringify(next))
  }

  const saveLeaks = (next: LeakRecord[]) => {
    setLeaks(next)
    localStorage.setItem(leakKey, JSON.stringify(next))
  }

  const addMonth = () => {
    const record: MonthRecord = {
      id: `${Date.now()}`,
      month: monthDraft.month || currentMonth(),
      income: parseAmount(monthDraft.income),
      fixedCost: parseAmount(monthDraft.fixedCost),
      cardHyundaiTarget: parseAmount(monthDraft.cardHyundaiTarget),
      cardHyundaiActual: parseAmount(monthDraft.cardHyundaiActual),
      cardShinhanActual: parseAmount(monthDraft.cardShinhanActual),
      cardLotteActual: parseAmount(monthDraft.cardLotteActual),
      cardKookminActual: parseAmount(monthDraft.cardKookminActual),
      coffeeTarget: parseAmount(monthDraft.coffeeTarget),
      coffeeActual: parseAmount(monthDraft.coffeeActual),
      memo: monthDraft.memo.trim(),
    }
    saveMonths([record, ...months.filter(item => item.month !== record.month)].slice(0, 36))
  }

  const addLeak = () => {
    const amount = parseAmount(leakDraft.amount)
    if (!amount || !leakDraft.title.trim()) return
    const record: LeakRecord = {
      id: `${Date.now()}`,
      date: leakDraft.date || today(),
      type: leakDraft.type,
      method: leakDraft.method,
      amount,
      title: leakDraft.title.trim(),
      reason: leakDraft.reason.trim(),
      keep: leakDraft.keep,
    }
    saveLeaks([record, ...leaks].slice(0, 500))
    setSelectedDate(record.date)
    setMonthDraft(previous => ({ ...previous, month: record.date.slice(0, 7) }))
    setLeakDraft({ date: today(), type: '커피충전', method: '현대 M카드', amount: '', title: '', reason: '', keep: false })
  }

  const useQuickTemplate = (template: (typeof quickTemplates)[number]) => {
    setLeakDraft(previous => ({
      ...previous,
      type: template.type,
      method: template.method,
      amount: template.amount,
      title: template.title,
      reason: '',
      keep: false,
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-slate-950 p-7 text-white shadow-xl">
          <p className="text-xs font-bold tracking-[.22em] text-emerald-300">MONEY CONTROL</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">소비패턴 점검실</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            모든 결제를 복잡하게 적는 가계부가 아니라, 이번 달 돈을 흔드는 핵심만 봅니다.
            개인용 카드(현대 M·신한), 공동사용 카드(롯데·국민), 현금 지출과 커피 충전을 함께 점검합니다.
          </p>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">현대 M카드 초과</p>
            <p className={`mt-2 text-2xl font-black ${hyundaiOver ? 'text-red-700' : 'text-emerald-700'}`}>{latest ? won(hyundaiOver) : '-'}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-indigo-700">개인카드 합계</p>
            <p className="mt-2 text-2xl font-black text-indigo-900">{latest ? won(personalCardActual) : '-'}</p>
            <p className="mt-1 text-xs font-bold text-indigo-600">현대 M + 신한</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-violet-700">공동카드 합계</p>
            <p className="mt-2 text-2xl font-black text-violet-900">{latest ? won(sharedCardActual) : '-'}</p>
            <p className="mt-1 text-xs font-bold text-violet-600">롯데 + 국민</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-emerald-700">카드 반영 후 잔액</p>
            <p className={`mt-2 text-2xl font-black ${afterCards < 0 ? 'text-red-700' : 'text-emerald-800'}`}>{latest ? won(afterCards) : '-'}</p>
          </div>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-sky-700">오늘 지출</p>
            <p className="mt-2 text-2xl font-black text-sky-900">{won(todayTotal)}</p>
            <p className="mt-1 text-xs font-bold text-sky-700">카드 {won(todayCardTotal)}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-700">커피 충전 초과</p>
            <p className={`mt-2 text-2xl font-black ${coffeeOver ? 'text-red-700' : 'text-emerald-700'}`}>{latest ? `${coffeeOver}회` : '-'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">이번 달 누수 메모</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{won(leakTotal)}</p>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-emerald-700">QUICK LOG</p>
            <h2 className="mt-1 text-xl font-black text-emerald-950">10초 지출 기록</h2>
            <p className="mt-1 text-sm font-bold text-emerald-800">사용처와 금액만 입력하면 저장됩니다. 자세한 사유는 기억나는 지출만 남깁니다.</p>
          </div>
          <div className="grid gap-3 p-5 lg:grid-cols-[145px_145px_145px_1fr_130px_110px]">
            <input type="date" value={leakDraft.date} onChange={event => setLeakDraft(previous => ({ ...previous, date: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700" />
            <select value={leakDraft.type} onChange={event => setLeakDraft(previous => ({ ...previous, type: event.target.value as LeakType }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700">
              {leakTypes.map(type => <option key={type}>{type}</option>)}
            </select>
            <select value={leakDraft.method} onChange={event => setLeakDraft(previous => ({ ...previous, method: event.target.value as PayMethod }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700">
              {payMethods.map(method => <option key={method}>{method}</option>)}
            </select>
            <input value={leakDraft.title} onChange={event => setLeakDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="어디에 썼는지" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700" />
            <input value={leakDraft.amount} onChange={event => setLeakDraft(previous => ({ ...previous, amount: event.target.value }))} onKeyDown={event => event.key === 'Enter' && addLeak()} placeholder="금액 입력 후 Enter" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700" />
            <button onClick={addLeak} className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white">바로 저장</button>
          </div>
          <div className="grid gap-3 border-t border-slate-100 p-5 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">자주 쓰는 지출</p>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map(template => (
                  <button key={template.label} onClick={() => useQuickTemplate(template)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-500 hover:text-emerald-800">
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">금액만 빠르게 바꾸기</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amount => (
                  <button key={amount} onClick={() => setLeakDraft(previous => ({ ...previous, amount }))} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-500 hover:text-emerald-800">
                    {won(Number(amount))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-[260px_1fr_1fr]">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black tracking-[.18em] text-emerald-300">LIVE TOTAL</p>
              <h2 className="mt-2 text-xl font-black">이번 달 실시간 누적</h2>
              <p className="mt-4 text-3xl font-black">{won(leakTotal)}</p>
              <p className="mt-2 text-xs font-bold text-slate-300">{visibleMonth} · {currentLeaks.length}건 기록 · 기록일 평균 {won(averageDailySpend)}</p>
            </div>
            <div>
              <p className="mb-3 text-xs font-black text-slate-500">분류별 누적</p>
              <div className="grid gap-2">
                {typeTotals.map(item => (
                  <div key={item.type} className="grid grid-cols-[78px_1fr_86px] items-center gap-2">
                    <p className="text-xs font-black text-slate-600">{item.type}</p>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(4, (item.total / largestTypeTotal) * 100)}%` }} />
                    </div>
                    <p className="text-right text-xs font-black text-slate-800">{won(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-black text-slate-500">결제수단별 누적</p>
              <div className="grid gap-2">
                {methodTotals.map(item => (
                  <div key={item.method} className="grid grid-cols-[78px_1fr_86px] items-center gap-2">
                    <p className="text-xs font-black text-slate-600">{item.method}</p>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(4, (item.total / largestMethodTotal) * 100)}%` }} />
                    </div>
                    <p className="text-right text-xs font-black text-slate-800">{won(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-slate-500">SPENDING CALENDAR</p>
              <h2 className="mt-1 text-xl font-black">월간 소비 달력</h2>
              <p className="mt-1 text-sm font-bold text-slate-600">
                {visibleMonth} 합계 {won(leakTotal)} · 기록일 평균 {won(averageDailySpend)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const nextMonth = monthOffset(visibleMonth, -1)
                setMonthDraft(previous => ({ ...previous, month: nextMonth }))
                setSelectedDate(`${nextMonth}-01`)
              }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700">이전달</button>
              <button onClick={() => {
                const nextMonth = currentMonth()
                setMonthDraft(previous => ({ ...previous, month: nextMonth }))
                setSelectedDate(today())
              }} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-black text-emerald-800">이번달</button>
              <button onClick={() => {
                const nextMonth = monthOffset(visibleMonth, 1)
                setMonthDraft(previous => ({ ...previous, month: nextMonth }))
                setSelectedDate(`${nextMonth}-01`)
              }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700">다음달</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-center text-xs font-black text-slate-500">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="py-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDates.map((date, index) => {
              const total = date ? dailyTotals[date] || 0 : 0
              const isSelected = date === selectedDate
              const isToday = date === today()
              return (
                <button
                  key={date || `blank-${index}`}
                  disabled={!date}
                  onClick={() => date && setSelectedDate(date)}
                  className={`min-h-24 border-b border-r border-slate-100 p-2 text-left transition ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500' : 'bg-white hover:bg-slate-50'} ${!date ? 'cursor-default bg-slate-50' : ''}`}
                >
                  {date ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${isToday ? 'bg-slate-950 text-white' : 'text-slate-700'}`}>{Number(date.slice(-2))}</span>
                        {total > 0 ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-800">{currentLeaks.filter(item => item.date === date).length}건</span> : null}
                      </div>
                      <p className={`mt-3 text-sm font-black ${total > 0 ? 'text-slate-950' : 'text-slate-300'}`}>{total > 0 ? won(total) : '-'}</p>
                    </>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[220px_1fr]">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-black text-emerald-700">선택한 날짜</p>
              <p className="mt-2 text-xl font-black text-emerald-950">{selectedDate}</p>
              <p className="mt-1 text-sm font-black text-emerald-800">{won(selectedTotal)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {selectedLeaks.length ? (
                <div className="grid gap-2">
                  {selectedLeaks.map(item => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.title}</p>
                        <p className="text-xs font-bold text-slate-500">{item.method || '결제수단 미기록'} · {item.type} · {item.keep ? '유지 가능' : '조정 후보'}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{won(item.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm font-bold text-slate-500">선택한 날짜에 기록된 지출이 없습니다.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[420px_1fr]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">MONTH CHECK</p>
              <h2 className="mt-1 text-xl font-black">이번 달 5분 점검</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">월 1회 또는 카드값 확인할 때만 입력합니다.</p>
            </div>
            <div className="grid gap-3 p-5">
              <input type="month" value={monthDraft.month} onChange={event => setMonthDraft(previous => ({ ...previous, month: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <input value={monthDraft.income} onChange={event => setMonthDraft(previous => ({ ...previous, income: event.target.value }))} placeholder="이번 달 입금액" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <input value={monthDraft.fixedCost} onChange={event => setMonthDraft(previous => ({ ...previous, fixedCost: event.target.value }))} placeholder="고정지출 합계" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={monthDraft.cardHyundaiTarget} onChange={event => setMonthDraft(previous => ({ ...previous, cardHyundaiTarget: event.target.value }))} placeholder="현대 M카드 목표" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
                <input value={monthDraft.cardHyundaiActual} onChange={event => setMonthDraft(previous => ({ ...previous, cardHyundaiActual: event.target.value }))} placeholder="현대 M카드 실제" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <input value={monthDraft.cardShinhanActual} onChange={event => setMonthDraft(previous => ({ ...previous, cardShinhanActual: event.target.value }))} placeholder="신한카드 실제" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
                <input value={monthDraft.cardLotteActual} onChange={event => setMonthDraft(previous => ({ ...previous, cardLotteActual: event.target.value }))} placeholder="롯데카드 실제" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
                <input value={monthDraft.cardKookminActual} onChange={event => setMonthDraft(previous => ({ ...previous, cardKookminActual: event.target.value }))} placeholder="국민카드 실제" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={monthDraft.coffeeTarget} onChange={event => setMonthDraft(previous => ({ ...previous, coffeeTarget: event.target.value }))} placeholder="커피 충전 목표 횟수" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
                <input value={monthDraft.coffeeActual} onChange={event => setMonthDraft(previous => ({ ...previous, coffeeActual: event.target.value }))} placeholder="커피 충전 실제 횟수" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              </div>
              <textarea value={monthDraft.memo} onChange={event => setMonthDraft(previous => ({ ...previous, memo: event.target.value }))} placeholder="이번 달 특이사항: 경조사, 여행, 가족식사, 병원 등" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <button onClick={addMonth} className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">이번 달 저장</button>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">LEAK MEMO</p>
              <h2 className="mt-1 text-xl font-black">오늘 지출 20초 기록</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">현금이든 카드든 오늘 쓴 돈은 금액과 결제수단만 빠르게 남깁니다. 이유는 필요한 지출만 적습니다.</p>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2">
              <input type="date" value={leakDraft.date} onChange={event => setLeakDraft(previous => ({ ...previous, date: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <select value={leakDraft.type} onChange={event => setLeakDraft(previous => ({ ...previous, type: event.target.value as LeakType }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700">
                {leakTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <select value={leakDraft.method} onChange={event => setLeakDraft(previous => ({ ...previous, method: event.target.value as PayMethod }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700">
                {payMethods.map(method => <option key={method}>{method}</option>)}
              </select>
              <input value={leakDraft.amount} onChange={event => setLeakDraft(previous => ({ ...previous, amount: event.target.value }))} placeholder="금액" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <input value={leakDraft.title} onChange={event => setLeakDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="어디에 썼는지 필수 입력: 예) 직장 앞 커피, 약국, 마트" className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={leakDraft.reason} onChange={event => setLeakDraft(previous => ({ ...previous, reason: event.target.value }))} placeholder="왜 썼는지: 관계상 지출, 스트레스, 가족식사, 업무 불편 해결 등" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700 md:col-span-2" />
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 md:col-span-2">
                <input type="checkbox" checked={leakDraft.keep} onChange={event => setLeakDraft(previous => ({ ...previous, keep: event.target.checked }))} />
                이 지출은 유지해도 되는 지출임
              </label>
              <button onClick={addLeak} className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white md:col-span-2">오늘 지출 저장</button>
            </div>

            <div className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-3">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-black text-red-700">가족·관계</p>
                <p className="mt-2 text-xl font-black text-red-800">{won(relationTotal)}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-700">커피충전</p>
                <p className="mt-2 text-xl font-black text-amber-800">{won(coffeeTotal)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-500">현대카드 메모</p>
                <p className="mt-2 text-xl font-black text-slate-900">{won(monthHyundaiMemoTotal)}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-black">최근 누수 메모</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {leaks.length ? leaks.slice(0, 10).map(item => (
                <div key={item.id} className="grid gap-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black">{item.title}</p>
                    <p className="text-sm font-black">{won(item.amount)}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-500">{item.date} · {item.method} · {item.type} · {item.keep ? '유지 가능' : '조정 후보'}</p>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item.reason || '사유 미기록'}</p>
                  <button onClick={() => saveLeaks(leaks.filter(record => record.id !== item.id))} className="justify-self-start text-xs font-black text-red-700">삭제</button>
                </div>
              )) : (
                <p className="p-8 text-center text-sm font-bold text-slate-500">아직 기록이 없습니다.</p>
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-lg font-black text-amber-950">과장님용 돈 관리 원칙</h2>
            <div className="mt-4 space-y-3 text-sm font-bold leading-6 text-amber-900">
              <p>1. 매일 총액은 적되, 이유는 필요한 것만 씁니다.</p>
              <p>2. 현대카드는 월 목표와 실제를 따로 봅니다.</p>
              <p>3. 커피 충전은 금액과 횟수를 같이 봅니다.</p>
              <p>4. 가족·관계 지출은 나쁘게 보지 않고 따로 봅니다.</p>
              <p>5. 업무 스트레스를 물건으로 해결하려는 순간은 표시합니다.</p>
            </div>
            <p className="mt-4 rounded-xl border border-amber-300 bg-white p-4 text-xs font-bold leading-5 text-amber-900">
              돈을 불리는 첫 단계는 투자보다 카드 초과분과 반복 충전의 속도를 낮추는 일입니다.
            </p>
          </aside>
        </section>
      </main>
    </div>
  )
}
