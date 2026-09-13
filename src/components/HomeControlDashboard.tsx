'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  koreaDate,
  mergeWorkInboxItems,
  workInboxFromRow,
  workInboxKey,
  type WorkInboxItem,
  type WorkInboxRow,
  type WorkInboxStatus,
} from '@/lib/work-inbox'

const workAreas = [
  { href: '/inspection-2026', label: '지도점검', title: '9.18 구청 지도점검', desc: '증빙위치·보완사항·담당자' },
  { href: '/team-command', label: '팀 운영', title: '팀 운영 컨트롤타워', desc: '수시보고·결재·판단대기' },
  { href: '/programs', label: '개별사업', title: '사업 컨트롤타워', desc: '일정·회기·참여자·증빙' },
  { href: '/evaluation-2027', label: '27년 평가', title: '평가 대비 특별반', desc: '지표·담당자·증빙준비율' },
  { href: '/hr-labor', label: '학습', title: '인사노무 학습실', desc: '오늘의 10분 학습과 적용' },
  { href: '/health', label: '건강', title: '건강관리', desc: '물·운동·체중·증상 누적 확인' },
  { href: '/report', label: '보고', title: '보고서 출력', desc: '사업·평가·팀운영 보고자료' },
]

const timeBlocks = [
  { time: '09:00~09:30', title: '당일 결재', desc: '부장 결재로 바로 올라갈 문서만' },
  { time: '09:30~16:30', title: '집중업무', desc: '긴급 외 수시 상의는 빠른기록으로 전환' },
  { time: '16:30', title: '익일 문서 제출 마감', desc: '다음 날 결재할 문서를 직원이 먼저 제출' },
  { time: '17:00~17:30', title: '익일 결재 사전검토', desc: '결과보고서·계획서 피드백' },
  { time: '17:30~18:00', title: '과장 정리시간', desc: '완료·위임·이월만 결정' },
]

const inspectionSteps = [
  { date: '2026-09-14', title: '증빙 위치표 완성', done: '원본철·전자파일 위치를 30초 안에 열 수 있게 정리' },
  { date: '2026-09-15', title: '모의점검', done: '긴급항목 질문과 자료 제시 리허설' },
  { date: '2026-09-16', title: '최종 보완', done: '보완필요 항목만 재확인하고 출력본과 파일 일치' },
  { date: '2026-09-17', title: '점검 전 세팅', done: '점검실·원본철·노트북·담당자 동선 확정' },
  { date: '2026-09-18', title: '구청 지도점검', done: '확정된 자료만 제시하고 추가요청은 바로 기록' },
]

type PrioritySlot = '마감 위험' | '팀을 움직이는 결정' | '내 핵심업무'

type Recommendation = {
  slot: PrioritySlot
  title: string
  reason: string
  href: string
  tone: string
  item?: WorkInboxItem
  candidateIndex?: number
  candidateTotal?: number
}

type ConfirmedPriority = {
  slot: PrioritySlot
  title: string
  reason: string
  href: string
  sourceItemId?: string
  status: '확정' | '완료' | '제외'
  outcome: string
  skipCount: number
  updatedAt: string
}

type PriorityHistory = Record<string, Partial<Record<PrioritySlot, ConfirmedPriority>>>

type PriorityRow = {
  priority_date: string
  slot: PrioritySlot
  title: string
  reason: string
  href: string
  source_item_id: string | null
  status: ConfirmedPriority['status']
  outcome: string
  skip_count: number
  updated_at: string
}

const priorityKey = 'cheonggok-home-priorities-v1'

function readLocalWorkInbox() {
  try {
    const raw = localStorage.getItem(workInboxKey)
    return raw ? JSON.parse(raw) as WorkInboxItem[] : []
  } catch {
    return []
  }
}

function readPriorityHistory() {
  try {
    const raw = localStorage.getItem(priorityKey)
    return raw ? JSON.parse(raw) as PriorityHistory : {}
  } catch {
    return {}
  }
}

function priorityFromRow(row: PriorityRow): ConfirmedPriority {
  return {
    slot: row.slot,
    title: row.title,
    reason: row.reason,
    href: row.href,
    sourceItemId: row.source_item_id || undefined,
    status: row.status,
    outcome: row.outcome || '',
    skipCount: row.skip_count || 0,
    updatedAt: row.updated_at,
  }
}

function mergePriorityHistory(...histories: PriorityHistory[]) {
  const merged: PriorityHistory = {}
  histories.forEach(history => {
    Object.entries(history).forEach(([date, slots]) => {
      const next = { ...(merged[date] || {}) }
      ;(Object.entries(slots) as Array<[PrioritySlot, ConfirmedPriority]>).forEach(([slot, priority]) => {
        const saved = next[slot]
        if (!saved || priority.updatedAt > saved.updatedAt) next[slot] = priority
      })
      merged[date] = next
    })
  })
  return merged
}

function dayDifference(from: string, to: string) {
  const fromTime = new Date(`${from}T12:00:00+09:00`).getTime()
  const toTime = new Date(`${to}T12:00:00+09:00`).getTime()
  return Math.round((toTime - fromTime) / 86_400_000)
}

function koreanDateLabel(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', weekday: 'short',
  }).format(new Date(`${date}T12:00:00+09:00`))
}

function dateOffset(date: string, offset: number) {
  const value = new Date(`${date}T12:00:00+09:00`)
  value.setDate(value.getDate() + offset)
  return koreaDate(value)
}

function weekStart(date: string) {
  const value = new Date(`${date}T12:00:00+09:00`)
  const mondayOffset = value.getDay() === 0 ? -6 : 1 - value.getDay()
  return dateOffset(date, mondayOffset)
}

function itemScore(item: WorkInboxItem, today: string) {
  let score = 0
  if (item.dueDate) {
    const days = dayDifference(today, item.dueDate)
    if (days < 0) score += 120 + Math.abs(days)
    else if (days === 0) score += 100
    else if (days <= 3) score += 75 - days
    else if (days <= 7) score += 45 - days
  }
  if (item.status === '미확인') score += 25
  if (item.status === '내가 처리') score += 20
  if (item.category === '상급자 전달') score += 20
  if (item.category === '지시사항') score += 15
  return score
}

function dueText(item: WorkInboxItem, today: string) {
  if (!item.dueDate) return '기한 미지정'
  const days = dayDifference(today, item.dueDate)
  if (days < 0) return `${Math.abs(days)}일 지연`
  if (days === 0) return '오늘 마감'
  return `${days}일 남음`
}

export default function HomeControlDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [workItems, setWorkItems] = useState<WorkInboxItem[]>([])
  const [confirmedPriorities, setConfirmedPriorities] = useState<Partial<Record<PrioritySlot, ConfirmedPriority>>>({})
  const [priorityHistory, setPriorityHistory] = useState<PriorityHistory>({})
  const [candidateOffsets, setCandidateOffsets] = useState<Record<PrioritySlot, number>>({ '마감 위험': 0, '팀을 움직이는 결정': 0, '내 핵심업무': 0 })
  const [selectingSlot, setSelectingSlot] = useState<PrioritySlot | null>(null)
  const [outcomeDrafts, setOutcomeDrafts] = useState<Partial<Record<PrioritySlot, string>>>({})
  const [syncMessage, setSyncMessage] = useState('기기 자료 확인 중')
  const today = koreaDate()

  useEffect(() => {
    let active = true
    const localItems = readLocalWorkInbox()
    const localPriorityHistory = readPriorityHistory()
    const frame = requestAnimationFrame(() => {
      if (active) {
        setWorkItems(localItems)
        setConfirmedPriorities(localPriorityHistory[today] || {})
        setPriorityHistory(localPriorityHistory)
      }
    })

    async function loadCloud(userId: string) {
      const [workResult, priorityResult] = await Promise.all([
        supabase.from('work_inbox_items').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
        supabase.from('daily_priorities').select('priority_date,slot,title,reason,href,source_item_id,status,outcome,skip_count,updated_at').eq('user_id', userId).order('priority_date', { ascending: false }).limit(180),
      ])
      if (!active) return
      if (workResult.error) {
        setSyncMessage('클라우드 연결 실패·기기 자료 표시')
        return
      }
      const cloudItems = ((workResult.data ?? []) as WorkInboxRow[]).map(workInboxFromRow)
      const merged = mergeWorkInboxItems(cloudItems, localItems)
      setWorkItems(merged)
      localStorage.setItem(workInboxKey, JSON.stringify(merged))
      if (priorityResult.error) {
        setSyncMessage('업무는 연결됨·실행성과는 이 기기 자료 표시')
        return
      }
      const cloudHistory: PriorityHistory = {}
      ;((priorityResult.data ?? []) as PriorityRow[]).forEach(row => {
        cloudHistory[row.priority_date] = { ...(cloudHistory[row.priority_date] || {}), [row.slot]: priorityFromRow(row) }
      })
      const mergedHistory = mergePriorityHistory(cloudHistory, localPriorityHistory)
      setPriorityHistory(mergedHistory)
      setConfirmedPriorities(mergedHistory[today] || {})
      localStorage.setItem(priorityKey, JSON.stringify(mergedHistory))

      const localRows = Object.entries(localPriorityHistory).flatMap(([date, slots]) =>
        (Object.values(slots) as ConfirmedPriority[])
          .filter(priority => {
            const cloudPriority = cloudHistory[date]?.[priority.slot]
            return !cloudPriority || priority.updatedAt > cloudPriority.updatedAt
          })
          .map(priority => ({
          user_id: userId,
          priority_date: date,
          slot: priority.slot,
          title: priority.title,
          reason: priority.reason,
          href: priority.href,
          source_item_id: priority.sourceItemId || null,
          status: priority.status,
          outcome: priority.outcome || '',
          skip_count: priority.skipCount || 0,
          updated_at: priority.updatedAt,
          })),
      )
      if (localRows.length) await supabase.from('daily_priorities').upsert(localRows, { onConflict: 'user_id,priority_date,slot' })
      setSyncMessage('업무·실행성과 클라우드 연결됨')
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser.id)
      else setSyncMessage('이 기기의 업무 기록 표시')
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser.id)
      else setSyncMessage('이 기기의 업무 기록 표시')
    })
    return () => {
      active = false
      cancelAnimationFrame(frame)
      data.subscription.unsubscribe()
    }
  }, [today])

  const activeItems = useMemo(
    () => workItems.filter(item => item.status !== '완료').sort((a, b) => itemScore(b, today) - itemScore(a, today)),
    [today, workItems],
  )

  const recommendationPools = useMemo(() => {
    const nextStep = inspectionSteps.find(step => step.date >= today)
    const inspectionDays = dayDifference(today, '2026-09-18')
    const deadlineFallbacks: Recommendation[] = [
      nextStep && inspectionDays >= 0
        ? { slot: '마감 위험', title: nextStep.title, reason: `${koreanDateLabel(nextStep.date)} 기준 · 완료기준: ${nextStep.done}`, href: '/inspection-2026', tone: 'border-red-300 bg-red-50 text-red-950' }
        : { slot: '마감 위험', title: '27년 평가 증빙 1건 확인', reason: '지표를 읽는 것에서 끝내지 말고 실제 파일 위치까지 확인', href: '/evaluation-2027', tone: 'border-red-300 bg-red-50 text-red-950' },
      { slot: '마감 위험', title: '오늘·이번 주 마감 문서 1건 끝내기', reason: '결재·결과보고·제출자료 중 가장 가까운 기한 1건의 완료본을 남김', href: '/team-command', tone: 'border-red-300 bg-red-50 text-red-950' },
      { slot: '마감 위험', title: '기한 없는 업무 1건에 날짜 지정하기', reason: '수집함에서 미뤄진 업무 하나를 골라 담당자와 완료일을 확정', href: '/team-command', tone: 'border-red-300 bg-red-50 text-red-950' },
    ]

    const deadline = activeItems.filter(item => item.dueDate).map(item => ({
      slot: '마감 위험' as const, title: item.content,
      reason: `${dueText(item, today)} · ${item.team} · 완료기준을 확인하고 처리`,
      href: '/team-command', tone: 'border-red-300 bg-red-50 text-red-950', item,
    }))
    const decision = activeItems.filter(item => item.status === '미확인'
      && ['상급자 전달', '지시사항', '갑작스러운 요청'].includes(item.category)).map(item => ({
      slot: '팀을 움직이는 결정' as const, title: item.content,
      reason: `${item.category} · ${item.team} · 결론·담당자·기한 중 하나를 확정`,
      href: '/team-command', tone: 'border-amber-300 bg-amber-50 text-amber-950', item,
    }))
    const core = activeItems.filter(item => item.status === '사업에 연결' || item.status === '내가 처리'
      || /지도점검|평가|생활쿠폰|사업|결과보고/.test(item.content)).map(item => ({
      slot: '내 핵심업무' as const, title: item.content,
      reason: `${item.team} · ${dueText(item, today)} · 오늘 눈에 보이는 산출물 1개를 남김`,
      href: item.status === '사업에 연결' ? '/programs' : '/team-command',
      tone: 'border-emerald-300 bg-emerald-50 text-emerald-950', item,
    }))

    const pools: Record<PrioritySlot, Recommendation[]> = {
      '마감 위험': [...deadline, ...deadlineFallbacks],
      '팀을 움직이는 결정': [...decision, {
        slot: '팀을 움직이는 결정' as const, title: '팀별 과장 판단 대기 안건 1건만 결론내기',
        reason: '직원의 상의를 대신 처리하지 말고 결론·담당자·기한만 확정',
        href: '/team-command', tone: 'border-amber-300 bg-amber-50 text-amber-950',
      }, {
        slot: '팀을 움직이는 결정' as const, title: '반복 보고 1건을 직원 판단으로 돌려보내기',
        reason: '직원이 선택지와 자기 의견을 먼저 적어 다시 보고하도록 기준을 전달',
        href: '/team-command', tone: 'border-amber-300 bg-amber-50 text-amber-950',
      }, {
        slot: '팀을 움직이는 결정' as const, title: '팀원 1명의 다음 행동만 명확히 하기',
        reason: '긴 피드백 대신 오늘 할 일·완료기준·확인시간을 한 문장으로 정함',
        href: '/team-command', tone: 'border-amber-300 bg-amber-50 text-amber-950',
      }],
      '내 핵심업무': [...core, {
        slot: '내 핵심업무' as const, title: '생활쿠폰지원사업 다음 일정·증빙 1건 확정',
        reason: '순서가 변경된 회기와 다음 결제·미션지 회수 시점 중 하나를 확정',
        href: '/programs', tone: 'border-emerald-300 bg-emerald-50 text-emerald-950',
      }, {
        slot: '내 핵심업무' as const, title: '27년 평가 지표 1개와 실제 증빙 연결하기',
        reason: '담당자·파일 위치·부족한 자료를 확인해 평가 준비를 한 칸 전진',
        href: '/evaluation-2027', tone: 'border-emerald-300 bg-emerald-50 text-emerald-950',
      }, {
        slot: '내 핵심업무' as const, title: '내 사업 1개의 다음 마감과 산출물 확정하기',
        reason: '오늘 직접 남길 수 있는 문서·명단·일정 중 하나를 완료',
        href: '/programs', tone: 'border-emerald-300 bg-emerald-50 text-emerald-950',
      }],
    }
    return pools
  }, [activeItems, today])

  const recommendations = useMemo(() => {
    const chosen = new Set<string>()
    return (['마감 위험', '팀을 움직이는 결정', '내 핵심업무'] as PrioritySlot[]).map(slot => {
      const available = recommendationPools[slot].filter(candidate => !candidate.item || !chosen.has(candidate.item.id))
      const candidateIndex = candidateOffsets[slot] % available.length
      const candidate = available[candidateIndex]
      if (candidate.item) chosen.add(candidate.item.id)
      return { ...candidate, candidateIndex, candidateTotal: available.length }
    })
  }, [candidateOffsets, recommendationPools])

  const overdueCount = activeItems.filter(item => item.dueDate && item.dueDate < today).length
  const todayCount = activeItems.filter(item => item.dueDate === today).length
  const decisionCount = activeItems.filter(item => item.status === '미확인').length
  const unsortedItems = activeItems.filter(item => item.status === '미확인' && !item.dueDate)
  const inspectionDays = dayDifference(today, '2026-09-18')
  const weekStartDate = weekStart(today)
  const period28Start = dateOffset(today, -27)
  const historyEntries = Object.entries(priorityHistory).flatMap(([date, slots]) =>
    (Object.values(slots) as ConfirmedPriority[]).map(priority => ({ date, priority })),
  )
  const weekEntries = historyEntries.filter(entry => entry.date >= weekStartDate && entry.date <= today)
  const period28Entries = historyEntries.filter(entry => entry.date >= period28Start && entry.date <= today)
  const weekPlanned = weekEntries.filter(entry => entry.priority.status !== '제외')
  const weekCompleted = weekPlanned.filter(entry => entry.priority.status === '완료')
  const period28Planned = period28Entries.filter(entry => entry.priority.status !== '제외')
  const period28Completed = period28Planned.filter(entry => entry.priority.status === '완료')
  const weekRate = weekPlanned.length ? Math.round((weekCompleted.length / weekPlanned.length) * 100) : 0
  const period28Rate = period28Planned.length ? Math.round((period28Completed.length / period28Planned.length) * 100) : 0
  const activeDays28 = new Set(period28Planned.map(entry => entry.date)).size
  const changedRecommendations28 = period28Entries.reduce((sum, entry) => sum + (entry.priority.skipCount || 0), 0)
  const slotStats28 = (['마감 위험', '팀을 움직이는 결정', '내 핵심업무'] as PrioritySlot[]).map(slot => {
    const planned = period28Planned.filter(entry => entry.priority.slot === slot)
    const completed = planned.filter(entry => entry.priority.status === '완료')
    return { slot, planned: planned.length, completed: completed.length, rate: planned.length ? Math.round((completed.length / planned.length) * 100) : 0 }
  })
  const weakSlot = [...slotStats28].filter(stat => stat.planned).sort((a, b) => a.rate - b.rate)[0]
  const recentOutcomes = weekCompleted
    .filter(entry => entry.priority.outcome)
    .sort((a, b) => b.priority.updatedAt.localeCompare(a.priority.updatedAt))
    .slice(0, 6)

  async function updateStatus(item: WorkInboxItem, status: WorkInboxStatus) {
    const updated = { ...item, status, updatedAt: new Date().toISOString() }
    setWorkItems(current => {
      const next = mergeWorkInboxItems([updated], current)
      localStorage.setItem(workInboxKey, JSON.stringify(next))
      return next
    })
    if (user) {
      const { error } = await supabase.from('work_inbox_items').upsert({
        user_id: user.id, id: updated.id, category: updated.category, content: updated.content,
        team: updated.team, due_kind: updated.due, due_date: updated.dueDate || null,
        status: updated.status, created_at: updated.createdAt, updated_at: updated.updatedAt,
      }, { onConflict: 'user_id,id' })
      if (error) setSyncMessage('기기에는 저장됨·클라우드 업로드 실패')
    }
  }

  async function saveConfirmedPriorities(next: Partial<Record<PrioritySlot, ConfirmedPriority>>) {
    setConfirmedPriorities(next)
    const nextHistory = { ...priorityHistory, [today]: next }
    setPriorityHistory(nextHistory)
    localStorage.setItem(priorityKey, JSON.stringify(nextHistory))
    if (user) {
      const rows = (Object.values(next) as ConfirmedPriority[]).map(priority => ({
        user_id: user.id,
        priority_date: today,
        slot: priority.slot,
        title: priority.title,
        reason: priority.reason,
        href: priority.href,
        source_item_id: priority.sourceItemId || null,
        status: priority.status,
        outcome: priority.outcome || '',
        skip_count: priority.skipCount || 0,
        updated_at: priority.updatedAt,
      }))
      if (rows.length) {
        const { error } = await supabase.from('daily_priorities').upsert(rows, { onConflict: 'user_id,priority_date,slot' })
        if (error) setSyncMessage('기기에는 저장됨·실행성과 업로드 실패')
      }
    }
  }

  async function confirmPriority(recommendation: Recommendation) {
    const priority: ConfirmedPriority = {
      slot: recommendation.slot,
      title: recommendation.title,
      reason: recommendation.reason,
      href: recommendation.href,
      sourceItemId: recommendation.item?.id,
      status: '확정',
      outcome: '',
      skipCount: candidateOffsets[recommendation.slot],
      updatedAt: new Date().toISOString(),
    }
    await saveConfirmedPriorities({ ...confirmedPriorities, [recommendation.slot]: priority })
    setSelectingSlot(null)
    if (recommendation.item?.status === '미확인') await updateStatus(recommendation.item, '내가 처리')
  }

  async function completePriority(slot: PrioritySlot) {
    const priority = confirmedPriorities[slot]
    if (!priority) return
    const outcome = outcomeDrafts[slot]?.trim() || priority.outcome
    if (!outcome) {
      setSyncMessage('완료 결과를 한 줄 입력한 뒤 완료해 주세요')
      return
    }
    await saveConfirmedPriorities({
      ...confirmedPriorities,
      [slot]: { ...priority, status: '완료', outcome, updatedAt: new Date().toISOString() },
    })
    const sourceItem = priority.sourceItemId ? workItems.find(item => item.id === priority.sourceItemId) : undefined
    if (sourceItem && sourceItem.status !== '완료') await updateStatus(sourceItem, '완료')
  }

  async function excludePriority(recommendation: Recommendation) {
    const priority: ConfirmedPriority = {
      slot: recommendation.slot,
      title: recommendation.title,
      reason: recommendation.reason,
      href: recommendation.href,
      sourceItemId: recommendation.item?.id,
      status: '제외',
      outcome: '',
      skipCount: candidateOffsets[recommendation.slot],
      updatedAt: new Date().toISOString(),
    }
    await saveConfirmedPriorities({ ...confirmedPriorities, [recommendation.slot]: priority })
  }

  async function changeConfirmedPriority(slot: PrioritySlot) {
    const next = { ...confirmedPriorities }
    delete next[slot]
    setConfirmedPriorities(next)
    const nextHistory = { ...priorityHistory, [today]: next }
    setPriorityHistory(nextHistory)
    localStorage.setItem(priorityKey, JSON.stringify(nextHistory))
    setOutcomeDrafts(current => ({ ...current, [slot]: '' }))
    if (user) {
      const { error } = await supabase.from('daily_priorities').delete().eq('user_id', user.id).eq('priority_date', today).eq('slot', slot)
      if (error) setSyncMessage('기기에서는 변경됨·클라우드 변경 실패')
    }
  }

  function showNextRecommendation(slot: PrioritySlot) {
    setCandidateOffsets(current => ({ ...current, [slot]: current[slot] + 1 }))
    setSyncMessage(`${slot}의 다음 추천을 표시했습니다`)
  }

  function directRecommendation(slot: PrioritySlot, item: WorkInboxItem): Recommendation {
    return {
      slot,
      title: item.content,
      reason: `직접 선택 · ${item.team} · ${dueText(item, today)}`,
      href: item.status === '사업에 연결' ? '/programs' : '/team-command',
      tone: slot === '마감 위험' ? 'border-red-300 bg-red-50 text-red-950' : slot === '팀을 움직이는 결정' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950',
      item,
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-7">
      <header className="border-b border-slate-300 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[.16em] text-emerald-700">TODAY CONTROL</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">오늘의 업무 통제실</h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">{koreanDateLabel(today)} · 지금 자료로 오늘의 3가지를 먼저 제안합니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600">{syncMessage}</span>
            <Link href="/quick" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-black text-white">빠른기록</Link>
          </div>
        </div>
      </header>

      <section className="py-6">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs font-black text-emerald-700">아침에 고르지 말고 확정하기</p><h2 className="mt-1 text-xl font-black">오늘 추천 3개</h2></div>
          <Link href="/team-command" className="text-sm font-black text-slate-600 underline decoration-slate-300 underline-offset-4">전체 수집함</Link>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {recommendations.map(recommendation => {
            const confirmed = confirmedPriorities[recommendation.slot]
            const title = confirmed?.title || recommendation.title
            const reason = confirmed?.reason || recommendation.reason
            const href = confirmed?.href || recommendation.href
            const badge = confirmed?.status === '완료' ? '오늘 완료' : confirmed?.status === '제외' ? '오늘 제외' : confirmed ? '오늘 확정됨' : null
            return (
              <article key={recommendation.slot} className={`flex min-h-60 flex-col rounded-lg border p-5 ${recommendation.tone}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black opacity-70">{recommendation.slot}</p>
                  {badge ? <span className={`rounded-md px-2 py-1 text-[11px] font-black ${confirmed?.status === '완료' ? 'bg-emerald-700 text-white' : confirmed?.status === '제외' ? 'bg-slate-600 text-white' : 'bg-white text-slate-700'}`}>{badge}</span> : <span className="text-[11px] font-black opacity-60">추천 {(recommendation.candidateIndex ?? 0) + 1}/{recommendation.candidateTotal ?? recommendationPools[recommendation.slot].length}</span>}
                </div>
                <h3 className="mt-3 text-lg font-black leading-7">{title}</h3>
                <p className="mt-3 flex-1 text-sm font-semibold leading-6 opacity-80">{reason}</p>
                {confirmed?.status === '완료' ? <div className="mt-4 rounded-md bg-white/80 p-3"><p className="text-xs font-black opacity-60">남긴 결과</p><p className="mt-1 text-sm font-black leading-6">{confirmed.outcome}</p></div> : null}
                {confirmed?.status === '확정' ? <input value={outcomeDrafts[recommendation.slot] ?? confirmed.outcome} onChange={event => setOutcomeDrafts(current => ({ ...current, [recommendation.slot]: event.target.value }))} placeholder="완료 결과 한 줄 (필수)" className="mt-4 w-full rounded-md border border-white/80 bg-white px-3 py-3 text-sm font-bold text-slate-950 outline-none" /> : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  {confirmed?.status !== '제외' ? <Link href={href} className="rounded-md bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm">열기</Link> : null}
                  {!confirmed ? <button type="button" onClick={() => confirmPriority(recommendation)} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-white">오늘 확정</button> : null}
                  {!confirmed ? <button type="button" onClick={() => showNextRecommendation(recommendation.slot)} disabled={(recommendation.candidateTotal ?? 0) <= 1} className="rounded-md border border-slate-400 bg-white/70 px-3 py-2 text-sm font-black text-slate-800 disabled:cursor-not-allowed disabled:opacity-40">다른 추천</button> : null}
                  {!confirmed ? <button type="button" onClick={() => setSelectingSlot(recommendation.slot)} className="rounded-md border border-slate-400 bg-white/70 px-3 py-2 text-sm font-black text-slate-800">직접 선택</button> : null}
                  {!confirmed ? <button type="button" onClick={() => excludePriority(recommendation)} className="rounded-md px-3 py-2 text-xs font-black opacity-70 underline underline-offset-4">오늘 제외</button> : null}
                  {confirmed?.status === '확정' ? <button type="button" onClick={() => completePriority(recommendation.slot)} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-black text-white">결과 남기고 완료</button> : null}
                  {confirmed ? <button type="button" onClick={() => changeConfirmedPriority(recommendation.slot)} className="rounded-md border border-slate-400 bg-white/70 px-3 py-2 text-xs font-black text-slate-700">확정 변경</button> : null}
                </div>
              </article>
            )
          })}
        </div>
        {selectingSlot ? <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black text-slate-500">{selectingSlot}</p><h3 className="mt-1 text-base font-black">업무 수집함에서 직접 선택</h3></div><button type="button" onClick={() => setSelectingSlot(null)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black">닫기</button></div>
          {activeItems.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {activeItems.slice(0, 12).map(item => <button key={item.id} type="button" onClick={() => confirmPriority(directRecommendation(selectingSlot, item))} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left hover:border-emerald-400">
              <span className="text-xs font-black text-slate-500">{item.team} · {dueText(item, today)}</span><strong className="mt-1 block text-sm leading-6">{item.content}</strong>
            </button>)}
          </div> : <p className="mt-3 py-5 text-center text-sm font-semibold text-slate-500">선택할 업무가 없습니다. 빠른기록에서 먼저 업무를 남겨주세요.</p>}
        </div> : null}
      </section>

      <section className="grid gap-4 border-y border-slate-300 py-6 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-xs font-black text-emerald-700">WEEKLY RESULT</p>
          <h2 className="mt-1 text-xl font-black">이번 주 실행성과</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{koreanDateLabel(weekStartDate)}부터 오늘까지</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3"><span className="text-xs font-black text-slate-500">확정</span><strong className="mt-2 block text-2xl font-black">{weekPlanned.length}</strong></div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><span className="text-xs font-black text-emerald-700">완료</span><strong className="mt-2 block text-2xl font-black">{weekCompleted.length}</strong></div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3"><span className="text-xs font-black text-cyan-700">완료율</span><strong className="mt-2 block text-2xl font-black">{weekRate}%</strong></div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="text-base font-black">이번 주 남긴 결과</h3><span className="text-xs font-black text-slate-500">{recentOutcomes.length}건</span></div>
          {recentOutcomes.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{recentOutcomes.map(entry => <div key={`${entry.date}-${entry.priority.slot}`} className="py-3"><p className="text-xs font-black text-slate-500">{entry.date} · {entry.priority.slot}</p><p className="mt-1 text-sm font-black leading-6">{entry.priority.outcome}</p></div>)}</div> : <p className="mt-3 border-y border-slate-200 py-7 text-center text-sm font-semibold text-slate-400">완료할 때 결과 한 줄을 남기면 여기에 성취물이 쌓입니다.</p>}
        </div>
      </section>

      <section className="border-b border-slate-300 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black text-indigo-700">28 DAY PATTERN</p><h2 className="mt-1 text-xl font-black">최근 28일 실행패턴</h2></div><p className="text-sm font-bold text-slate-500">{period28Start} ~ {today}</p></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4"><span className="text-xs font-black text-slate-500">실행한 날</span><strong className="mt-2 block text-2xl font-black">{activeDays28}일</strong></div>
          <div className="rounded-lg border border-slate-200 bg-white p-4"><span className="text-xs font-black text-slate-500">확정 업무</span><strong className="mt-2 block text-2xl font-black">{period28Planned.length}건</strong></div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><span className="text-xs font-black text-emerald-700">완료율</span><strong className="mt-2 block text-2xl font-black">{period28Rate}%</strong></div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><span className="text-xs font-black text-amber-700">추천 변경</span><strong className="mt-2 block text-2xl font-black">{changedRecommendations28}회</strong></div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{slotStats28.map(stat => <div key={stat.slot} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{stat.slot}</span><strong className="text-lg">{stat.rate}%</strong></div><p className="mt-2 text-xs font-bold text-slate-500">{stat.completed}/{stat.planned}건 완료</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-800" style={{ width: `${stat.rate}%` }} /></div></div>)}</div>
        <p className="mt-3 text-sm font-semibold text-slate-600">{weakSlot ? `현재 가장 보완할 영역은 ‘${weakSlot.slot}’입니다. 확정한 일을 줄이더라도 완료 결과를 남기는 데 집중합니다.` : '기록이 쌓이면 가장 자주 미완료되는 영역을 여기에서 알려드립니다.'}</p>
      </section>

      <section className="grid border-y border-slate-300 py-6 lg:grid-cols-[1.15fr_.85fr] lg:gap-8">
        <div>
          <h2 className="text-lg font-black">오늘 보호할 시간</h2>
          <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {timeBlocks.map(block => <div key={block.time} className="grid gap-1 py-3 sm:grid-cols-[110px_150px_minmax(0,1fr)] sm:gap-3"><strong className="text-sm">{block.time}</strong><span className="text-sm font-black text-slate-700">{block.title}</span><span className="text-sm font-semibold leading-5 text-slate-500">{block.desc}</span></div>)}
          </div>
        </div>
        <div className="mt-7 lg:mt-0">
          <h2 className="text-lg font-black">지금 알아야 할 수치</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[['기한 초과', overdueCount, 'border-red-200 bg-red-50 text-red-800'], ['오늘 마감', todayCount, 'border-amber-200 bg-amber-50 text-amber-800'], ['판단 대기', decisionCount, 'border-blue-200 bg-blue-50 text-blue-800'], ['기한 미지정', unsortedItems.length, 'border-slate-200 bg-white text-slate-700']].map(([label, value, tone]) => <Link key={String(label)} href="/team-command" className={`min-h-24 rounded-lg border p-4 ${tone}`}><span className="text-xs font-black">{label}</span><strong className="mt-2 block text-2xl font-black text-slate-950">{value}</strong></Link>)}
          </div>
        </div>
      </section>

      <section className="grid gap-7 py-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black text-red-700">이번 주 위험</p><h2 className="mt-1 text-lg font-black">9월 18일 구청 지도점검</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{inspectionDays >= 0 ? `D-${inspectionDays} · 증빙 위치·담당자 답변·최종본 일치를 확인할 시점입니다.` : '점검 후 추가요청과 시정사항을 확인합니다.'}</p>
          <Link href="/inspection-2026" className="mt-4 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-black text-white">지도점검 열기</Link>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">아직 분류하지 않은 빠른기록</h2><span className="text-xs font-black text-slate-500">{unsortedItems.length}건</span></div>
          {unsortedItems.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{unsortedItems.slice(0, 4).map(item => <div key={item.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-black">{item.content}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.category} · {item.team}</p></div><button type="button" onClick={() => updateStatus(item, '직원에게 전달')} className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">위임</button></div>)}</div> : <p className="mt-3 border-y border-slate-200 py-6 text-sm font-semibold text-slate-500">미분류 기록이 없습니다. 업무 중에는 판단하지 말고 빠른기록에만 남깁니다.</p>}
        </div>
      </section>

      <section className="border-t border-slate-300 py-6">
        <h2 className="text-lg font-black">필요할 때만 여는 업무탭</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{workAreas.map(area => <Link key={area.href} href={area.href} className="min-h-28 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400"><p className="text-xs font-black text-slate-500">{area.label}</p><h3 className="mt-2 text-base font-black">{area.title}</h3><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{area.desc}</p></Link>)}</div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-black"><Link href="/money" className="rounded-md border border-slate-300 bg-white px-3 py-2">소비점검</Link><Link href="/health" className="rounded-md border border-slate-300 bg-white px-3 py-2">건강관리</Link><Link href="/quick" className="rounded-md border border-slate-300 bg-white px-3 py-2">건강·소비 빠른기록</Link><Link href="/ai-system" className="rounded-md border border-slate-300 bg-white px-3 py-2">AI 사용원칙</Link></div>
      </section>
    </main>
  )
}
