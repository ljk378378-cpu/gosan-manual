'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import {
  dueDateFor,
  mergeWorkInboxItems,
  workInboxCategories,
  workInboxDueOptions,
  workInboxKey,
  workInboxTeams,
  type WorkInboxCategory,
  type WorkInboxDue,
  type WorkInboxItem,
  type WorkInboxTeam,
} from '@/lib/work-inbox'

type HealthType = 'health_a' | 'health_b' | 'water' | 'medicine_morning' | 'medicine_night' | 'sleep' | 'neck_pain' | 'back_pain' | 'weight' | 'exercise'
type QuickType = 'expense' | HealthType
type PayMethod = '현대 M카드' | '신한카드' | '롯데카드' | '국민카드' | '현금' | '체크카드' | '계좌이체'
type LeakType = '식사·외식' | '커피·본인' | '커피·함께' | '커피충전' | '배달음식' | '가족·관계' | '업무도구' | '생활구매' | '기타'

type QuickEvent = {
  id: string
  type: QuickType
  occurredAt: string
  recordedAt: string
  amount?: number
  volumeMl?: number
  title?: string
  method?: PayMethod
  numericValue?: number
  unit?: string
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
}

type MoneyRecord = {
  id: string
  date: string
  type: LeakType
  method: PayMethod
  amount: number
  title: string
  reason: string
  keep: boolean
}

const quickKey = 'cheonggok-quick-events-v1'
const moneyKey = 'cheonggok-money-leak-v1'
const lastMethodKey = 'cheonggok-quick-last-method-v1'
const lastTypeKey = 'cheonggok-quick-last-type-v1'
const payMethods: PayMethod[] = ['현대 M카드', '신한카드', '롯데카드', '국민카드', '현금', '체크카드', '계좌이체']
const leakTypes: LeakType[] = ['식사·외식', '커피·본인', '커피·함께', '커피충전', '배달음식', '가족·관계', '업무도구', '생활구매', '기타']
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

function waterVolume(event: QuickEvent) {
  // 용량 기능 추가 전 기록은 당시 기본값인 250mL로 계산한다.
  return event.volumeMl ?? 250
}

function isHealthEvent(event: QuickEvent): event is QuickEvent & { type: HealthType } {
  return event.type !== 'expense'
}

function healthRow(userId: string, event: QuickEvent & { type: HealthType }) {
  return {
    user_id: userId,
    id: event.id,
    event_type: event.type,
    occurred_at: event.occurredAt,
    recorded_at: event.recordedAt,
    numeric_value: event.numericValue ?? null,
    unit: event.unit ?? null,
    volume_ml: event.volumeMl ?? null,
    updated_at: new Date().toISOString(),
  }
}

function healthEventFromRow(row: HealthEventRow, ownerId: string): QuickEvent {
  return {
    id: row.id,
    type: row.event_type,
    occurredAt: row.occurred_at,
    recordedAt: row.recorded_at,
    numericValue: row.numeric_value ?? undefined,
    unit: row.unit ?? undefined,
    volumeMl: row.volume_ml ?? undefined,
    cloudSynced: true,
    ownerId,
  }
}

function mergeEvents(...groups: QuickEvent[][]) {
  const byId = new Map<string, QuickEvent>()
  groups.flat().forEach(event => byId.set(event.id, event))
  return [...byId.values()]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 1000)
}

function eventLabel(event: QuickEvent) {
  if (event.type === 'expense') return `${event.title || '소비'} · ${won(event.amount || 0)}`
  if (event.type === 'health_a') return '소변'
  if (event.type === 'health_b') return '대변'
  if (event.type === 'water') return `물 ${waterVolume(event)}mL`
  if (event.type === 'medicine_morning') return '아침 · 협심증약'
  if (event.type === 'medicine_night') return '자기 전 · 탈모약'
  if (event.type === 'sleep') return `수면 ${event.numericValue ?? '-'}시간`
  if (event.type === 'neck_pain') return `목 통증 ${event.numericValue ?? '-'}점`
  if (event.type === 'back_pain') return `등 통증 ${event.numericValue ?? '-'}점`
  if (event.type === 'weight') return `체중 ${event.numericValue ?? '-'}kg`
  return `운동 ${event.numericValue ?? '-'}분`
}

export default function QuickPage() {
  const [events, setEvents] = useState<QuickEvent[]>([])
  const [panel, setPanel] = useState<'none' | 'expense' | 'health' | 'work'>('none')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState<PayMethod>('현대 M카드')
  const [expenseType, setExpenseType] = useState<LeakType>('식사·외식')
  const [notice, setNotice] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [workItems, setWorkItems] = useState<WorkInboxItem[]>([])
  const [workCategory, setWorkCategory] = useState<WorkInboxCategory>('상급자 전달')
  const [workTeam, setWorkTeam] = useState<WorkInboxTeam>('공통')
  const [workDue, setWorkDue] = useState<WorkInboxDue>('날짜 없음')
  const [workContent, setWorkContent] = useState('')
  const [workSaving, setWorkSaving] = useState(false)
  const [healthSyncing, setHealthSyncing] = useState(false)
  const [dailyHealth, setDailyHealth] = useState({ sleep: '', neckPain: '', backPain: '', weight: '', exercise: '' })

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEvents(load(quickKey, []))
      setWorkItems(load(workInboxKey, []))
      const savedMethod = localStorage.getItem(lastMethodKey) as PayMethod | null
      if (savedMethod && payMethods.includes(savedMethod)) setMethod(savedMethod)
      const savedType = localStorage.getItem(lastTypeKey) as LeakType | null
      if (savedType && leakTypes.includes(savedType)) setExpenseType(savedType)
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

  useEffect(() => {
    if (!user) return
    const userId = user.id
    let cancelled = false

    async function syncHealthEvents() {
      setHealthSyncing(true)
      const localEvents = load<QuickEvent[]>(quickKey, [])
      const pending = localEvents
        .filter(isHealthEvent)
        .filter(event => !event.cloudSynced && (!event.ownerId || event.ownerId === userId))

      if (pending.length) {
        const { error } = await supabase
          .from('health_events')
          .upsert(pending.map(event => healthRow(userId, event)), { onConflict: 'user_id,id' })
        if (error) {
          if (!cancelled) {
            setNotice(`건강 기록 동기화가 보류됐습니다: ${error.message}`)
            setHealthSyncing(false)
          }
          return
        }
      }

      const { data, error } = await supabase
        .from('health_events')
        .select('id,event_type,occurred_at,recorded_at,numeric_value,unit,volume_ml')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: false })
        .limit(1000)

      if (cancelled) return
      if (error) {
        setNotice(`건강 기록을 불러오지 못했습니다: ${error.message}`)
        setHealthSyncing(false)
        return
      }

      const latestLocal = load<QuickEvent[]>(quickKey, [])
      const expenses = latestLocal.filter(event => event.type === 'expense')
      const pendingIds = new Set(pending.map(event => event.id))
      const stillPending = latestLocal
        .filter(isHealthEvent)
        .filter(event => !event.cloudSynced && !pendingIds.has(event.id) && (!event.ownerId || event.ownerId === userId))
      const cloudEvents = (data as HealthEventRow[]).map(row => healthEventFromRow(row, userId))
      const next = mergeEvents(expenses, stillPending, cloudEvents)
      localStorage.setItem(quickKey, JSON.stringify(next))
      setEvents(next)
      setHealthSyncing(false)
    }

    syncHealthEvents()
    return () => {
      cancelled = true
    }
  }, [user])

  const todayEvents = useMemo(
    () => events.filter(event => dateInKorea(new Date(event.occurredAt)) === dateInKorea()),
    [events],
  )
  const healthACount = todayEvents.filter(event => event.type === 'health_a').length
  const healthBCount = todayEvents.filter(event => event.type === 'health_b').length
  const waterEvents = todayEvents.filter(event => event.type === 'water')
  const waterCount = waterEvents.length
  const waterTotalMl = waterEvents.reduce((sum, event) => sum + waterVolume(event), 0)
  const morningMedicineDone = todayEvents.some(event => event.type === 'medicine_morning')
  const nightMedicineDone = todayEvents.some(event => event.type === 'medicine_night')
  const todayDailyHealth = Object.fromEntries(
    todayEvents
      .filter(event => ['sleep', 'neck_pain', 'back_pain', 'weight', 'exercise'].includes(event.type))
      .map(event => [event.type, event.numericValue]),
  ) as Partial<Record<HealthType, number>>
  const expenseTotal = todayEvents
    .filter(event => event.type === 'expense')
    .reduce((sum, event) => sum + (event.amount || 0), 0)

  function saveEvents(next: QuickEvent[]) {
    setEvents(next)
    localStorage.setItem(quickKey, JSON.stringify(next))
  }

  async function saveHealthRecords(records: Array<QuickEvent & { type: HealthType }>) {
    const current = load<QuickEvent[]>(quickKey, [])
    const localRecords = records.map(record => ({ ...record, cloudSynced: false, ownerId: user?.id }))
    saveEvents(mergeEvents(current, localRecords))

    if (!user) {
      setNotice('건강 기록이 이 기기에 저장됐습니다. 로그인하면 클라우드로 합쳐집니다.')
      return false
    }

    const { error } = await supabase
      .from('health_events')
      .upsert(localRecords.map(event => healthRow(user.id, event)), { onConflict: 'user_id,id' })

    if (error) {
      setNotice(`기기에는 저장됐지만 클라우드 동기화가 보류됐습니다: ${error.message}`)
      return false
    }

    const latest = load<QuickEvent[]>(quickKey, [])
    const savedIds = new Set(records.map(record => record.id))
    const synced = latest.map(event => savedIds.has(event.id) ? { ...event, cloudSynced: true } : event)
    saveEvents(synced)
    return true
  }

  async function handleHealth(type: Exclude<HealthType, 'sleep' | 'neck_pain' | 'back_pain' | 'weight' | 'exercise'>, volumeMl?: number) {
    if (type === 'medicine_morning' && morningMedicineDone) return
    if (type === 'medicine_night' && nightMedicineDone) return
    const now = new Date().toISOString()
    const event: QuickEvent & { type: HealthType } = {
      id: crypto.randomUUID(),
      type,
      occurredAt: now,
      recordedAt: now,
      ...(type === 'water' ? { volumeMl: volumeMl || 120 } : {}),
    }
    const cloudSaved = await saveHealthRecords([event])
    if (cloudSaved) setNotice(`${eventLabel(event)} 기록 완료 · 클라우드 저장 · ${timeInKorea(now)}`)
  }

  async function handleDailyHealth() {
    const definitions: Array<{ key: keyof typeof dailyHealth; type: HealthType; unit: string; min: number; max: number }> = [
      { key: 'sleep', type: 'sleep', unit: '시간', min: 0, max: 24 },
      { key: 'neckPain', type: 'neck_pain', unit: '점', min: 0, max: 10 },
      { key: 'backPain', type: 'back_pain', unit: '점', min: 0, max: 10 },
      { key: 'weight', type: 'weight', unit: 'kg', min: 20, max: 300 },
      { key: 'exercise', type: 'exercise', unit: '분', min: 0, max: 1440 },
    ]
    const invalid = definitions.find(item => {
      if (dailyHealth[item.key] === '') return false
      const value = Number(dailyHealth[item.key])
      return !Number.isFinite(value) || value < item.min || value > item.max
    })
    if (invalid) {
      setNotice('하루 상태의 입력 범위를 확인해 주세요. 통증은 0~10점입니다.')
      return
    }
    const now = new Date().toISOString()
    const date = dateInKorea()
    const records = definitions
      .filter(item => dailyHealth[item.key] !== '')
      .map(item => ({
        id: `${date}-${item.type}`,
        type: item.type,
        occurredAt: now,
        recordedAt: now,
        numericValue: Number(dailyHealth[item.key]),
        unit: item.unit,
      }))
    if (!records.length) {
      setNotice('하루 상태에서 한 항목 이상 입력해 주세요.')
      return
    }
    const cloudSaved = await saveHealthRecords(records)
    if (cloudSaved) setNotice(`하루 상태 ${records.length}개 항목 · 클라우드 저장 완료`)
  }

  async function handleWorkMemo() {
    if (!workContent.trim()) {
      setNotice('업무 메모 내용을 입력해 주세요.')
      return
    }
    setWorkSaving(true)
    const now = new Date().toISOString()
    const item: WorkInboxItem = {
      id: crypto.randomUUID(),
      category: workCategory,
      content: workContent.trim(),
      team: workTeam,
      due: workDue,
      dueDate: dueDateFor(workDue),
      status: '미확인',
      createdAt: now,
      updatedAt: now,
    }
    const next = mergeWorkInboxItems([item], workItems)
    setWorkItems(next)
    localStorage.setItem(workInboxKey, JSON.stringify(next))

    if (user) {
      const { error } = await supabase.from('work_inbox_items').upsert({
        user_id: user.id,
        id: item.id,
        category: item.category,
        content: item.content,
        team: item.team,
        due_kind: item.due,
        due_date: item.dueDate || null,
        status: item.status,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      }, { onConflict: 'user_id,id' })
      if (error) {
        setNotice(`기기에는 저장됐지만 업무 수집함 동기화에 실패했습니다: ${error.message}`)
        setWorkSaving(false)
        return
      }
    }

    setWorkContent('')
    setNotice(`업무 메모 저장 완료 · ${user ? '팀 운영 수집함에 반영' : '이 기기에 저장'}`)
    setWorkSaving(false)
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
      type: expenseType,
      method,
      amount: parsedAmount,
      title: expenseTitle,
      reason: '빠른 기록에서 입력',
      keep: false,
    }
    const moneyRecords = load<MoneyRecord[]>(moneyKey, [])
    localStorage.setItem(moneyKey, JSON.stringify([moneyRecord, ...moneyRecords].slice(0, 500)))
    localStorage.setItem(lastMethodKey, method)
    localStorage.setItem(lastTypeKey, expenseType)
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
    if (isHealthEvent(latest) && user) {
      const { error } = await supabase.from('health_events').delete().eq('user_id', user.id).eq('id', latest.id)
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
            기록 저장: {user ? (healthSyncing ? '클라우드 동기화 중' : '클라우드 연결됨') : '현재 기기에 저장'}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            {user
              ? '소비와 건강 기록을 휴대폰·회사·집에서 같은 자료로 확인합니다. 건강 자료는 로그인한 본인만 볼 수 있습니다.'
              : '로그인 전 기록은 기기에 보관되며, 소비점검에서 로그인하면 본인 클라우드 자료에 합쳐집니다.'}
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
          <button
            type="button"
            onClick={() => setPanel(panel === 'work' ? 'none' : 'work')}
            className="col-span-2 min-h-24 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm active:scale-[.98]"
          >
            <span className="text-2xl">＋</span>
            <strong className="ml-3 text-lg font-black text-amber-950">업무 메모</strong>
            <span className="mt-2 block text-xs font-bold text-amber-800">아이디어·지시·전달사항을 수집함으로</span>
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select aria-label="지출 분류" value={expenseType} onChange={event => setExpenseType(event.target.value as LeakType)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                {leakTypes.map(item => <option key={item}>{item}</option>)}
              </select>
              <select aria-label="결제 수단" value={method} onChange={event => setMethod(event.target.value as PayMethod)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                {payMethods.map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
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
                <strong className="mt-2 block text-lg font-black">소변</strong>
              </button>
              <button type="button" onClick={() => handleHealth('health_b')} className="min-h-28 rounded-2xl bg-indigo-500 p-4 text-white active:bg-indigo-400">
                <span className="block text-3xl">◇</span>
                <strong className="mt-2 block text-lg font-black">대변</strong>
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl bg-cyan-50 p-4 text-cyan-950">
                <strong className="block text-lg font-black">물 마시기 · 오늘 {waterCount}회 · {waterTotalMl.toLocaleString('ko-KR')}mL</strong>
                <span className="mt-1 block text-xs font-bold text-cyan-700">마신 용량을 한 번 누르면 바로 기록됩니다.</span>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[120, 250, 500].map(volume => (
                    <button
                      key={volume}
                      type="button"
                      onClick={() => handleHealth('water', volume)}
                      className={`min-h-14 rounded-xl px-2 py-3 text-base font-black active:scale-[0.98] ${volume === 120 ? 'bg-cyan-600 text-white active:bg-cyan-500' : 'border border-cyan-200 bg-white text-cyan-950 active:bg-cyan-100'}`}
                    >
                      {volume}mL
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" disabled={morningMedicineDone} onClick={() => handleHealth('medicine_morning')} className="rounded-2xl bg-amber-100 p-4 text-left text-amber-950 active:bg-amber-200 disabled:bg-emerald-100 disabled:text-emerald-900">
                <strong className="block text-lg font-black">{morningMedicineDone ? '✓ 아침 복용완료' : '아침 · 협심증약'}</strong>
              </button>
              <button type="button" disabled={nightMedicineDone} onClick={() => handleHealth('medicine_night')} className="rounded-2xl bg-violet-100 p-4 text-left text-violet-950 active:bg-violet-200 disabled:bg-emerald-100 disabled:text-emerald-900">
                <strong className="block text-lg font-black">{nightMedicineDone ? '✓ 자기 전 복용완료' : '자기 전 · 탈모약'}</strong>
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-lg font-black text-slate-950">하루 상태</strong>
                    <span className="mt-1 block text-xs font-bold text-slate-500">아는 항목만 하루 한 번 입력합니다.</span>
                  </div>
                  {Object.keys(todayDailyHealth).length ? <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">오늘 기록됨</span> : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input inputMode="decimal" value={dailyHealth.sleep} onChange={event => setDailyHealth(previous => ({ ...previous, sleep: event.target.value }))} placeholder="수면시간" aria-label="수면시간" className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                  <input inputMode="decimal" value={dailyHealth.weight} onChange={event => setDailyHealth(previous => ({ ...previous, weight: event.target.value }))} placeholder="체중 kg" aria-label="체중" className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                  <input inputMode="numeric" value={dailyHealth.neckPain} onChange={event => setDailyHealth(previous => ({ ...previous, neckPain: event.target.value }))} placeholder="목 통증 0~10" aria-label="목 통증" className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                  <input inputMode="numeric" value={dailyHealth.backPain} onChange={event => setDailyHealth(previous => ({ ...previous, backPain: event.target.value }))} placeholder="등 통증 0~10" aria-label="등 통증" className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                  <input inputMode="numeric" value={dailyHealth.exercise} onChange={event => setDailyHealth(previous => ({ ...previous, exercise: event.target.value }))} placeholder="운동시간 분" aria-label="운동시간" className="col-span-2 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-sky-500" />
                </div>
                <button type="button" onClick={handleDailyHealth} className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm font-black text-white active:bg-slate-700">하루 상태 저장</button>
              </div>
            </div>
          </section>
        ) : null}

        {panel === 'work' ? (
          <section className="mt-4 rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">업무 메모</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">사람 이름보다 해야 할 일을 한 줄로 남깁니다.</p>
              </div>
              <button type="button" onClick={() => setPanel('none')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">닫기</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {workInboxCategories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setWorkCategory(category)}
                  className={`rounded-xl border px-3 py-3 text-sm font-black ${workCategory === category ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <textarea
              value={workContent}
              onChange={event => setWorkContent(event.target.value)}
              placeholder="예: 후원자 선물 견적을 이번 주 안에 다시 확인"
              className="mt-3 min-h-24 w-full rounded-xl border-2 border-amber-200 p-4 text-base font-bold leading-6 outline-none focus:border-amber-500"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select value={workTeam} onChange={event => setWorkTeam(event.target.value as WorkInboxTeam)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                {workInboxTeams.map(team => <option key={team}>{team}</option>)}
              </select>
              <select value={workDue} onChange={event => setWorkDue(event.target.value as WorkInboxDue)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                {workInboxDueOptions.map(due => <option key={due}>{due}</option>)}
              </select>
            </div>
            <button type="button" disabled={workSaving} onClick={handleWorkMemo} className="mt-3 w-full rounded-2xl bg-amber-500 py-4 text-lg font-black text-amber-950 active:bg-amber-400 disabled:bg-slate-300 disabled:text-slate-500">
              {workSaving ? '저장 중' : '업무 수집함에 저장'}
            </button>
            <p className="mt-3 text-center text-xs font-bold text-slate-500">오늘 수집 {workItems.filter(item => dateInKorea(new Date(item.createdAt)) === dateInKorea()).length}건</p>
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
            <span className="text-xs font-bold text-slate-500">소비·건강 {user ? '클라우드' : '기기'}</span>
          </div>
          {Object.keys(todayDailyHealth).length ? (
            <div className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-black text-slate-700">
              {todayDailyHealth.sleep !== undefined ? <span>수면 {todayDailyHealth.sleep}시간</span> : null}
              {todayDailyHealth.neck_pain !== undefined ? <span>목 {todayDailyHealth.neck_pain}점</span> : null}
              {todayDailyHealth.back_pain !== undefined ? <span>등 {todayDailyHealth.back_pain}점</span> : null}
              {todayDailyHealth.weight !== undefined ? <span>체중 {todayDailyHealth.weight}kg</span> : null}
              {todayDailyHealth.exercise !== undefined ? <span>운동 {todayDailyHealth.exercise}분</span> : null}
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-lime-50 p-3"><strong className="block text-lg font-black text-lime-950">{won(expenseTotal)}</strong><span className="text-xs font-bold text-lime-800">소비</span></div>
            <div className="rounded-2xl bg-sky-50 p-3"><strong className="block text-lg font-black text-sky-950">{healthACount}</strong><span className="text-xs font-bold text-sky-800">소변</span></div>
            <div className="rounded-2xl bg-indigo-50 p-3"><strong className="block text-lg font-black text-indigo-950">{healthBCount}</strong><span className="text-xs font-bold text-indigo-800">대변</span></div>
            <div className="rounded-2xl bg-cyan-50 p-3"><strong className="block text-lg font-black text-cyan-950">{waterTotalMl.toLocaleString('ko-KR')}mL</strong><span className="text-xs font-bold text-cyan-800">물 · {waterCount}회</span></div>
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
