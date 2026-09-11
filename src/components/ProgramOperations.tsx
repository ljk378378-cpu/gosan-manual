'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type TaskStatus = '미완료' | '진행중' | '완료' | '보류'

type ProgramTask = {
  id: string
  programId: string
  category: string
  sessionLabel: string
  title: string
  dueDate: string
  status: TaskStatus
  owner: string
  evidenceRequired: boolean
  evidenceConfirmed: boolean
  completedAt: string
  note: string
}

type TaskRow = {
  id: string
  program_id: string
  category: string
  session_label: string
  title: string
  due_date: string | null
  status: TaskStatus
  owner: string
  evidence_required: boolean
  evidence_confirmed: boolean
  completed_at: string | null
  note: string
}

type AlertLevel = '기한초과' | '오늘' | '7일 이내' | '날짜 미정' | '예정'

const tasksKey = 'cheonggok-work-program-tasks-v1'

const seedTasks: ProgramTask[] = [
  {
    id: 'life-coupon-hq25-precheck',
    programId: 'life-coupon-2026',
    category: '증빙확인',
    sessionLabel: '사전검사',
    title: 'HQ-25 사전검사 자료와 결과분석 증빙 확인',
    dueDate: '2026-05-31',
    status: '미완료',
    owner: '',
    evidenceRequired: true,
    evidenceConfirmed: false,
    completedAt: '',
    note: '계획서상 5월 실시 항목입니다. 실제 완료했다면 완료와 증빙확인을 모두 표시합니다.',
  },
  {
    id: 'life-coupon-payment-dates',
    programId: 'life-coupon-2026',
    category: '결제',
    sessionLabel: '전체 회기',
    title: '회기별 황금마켓 대금결제일 입력',
    dueDate: '',
    status: '미완료',
    owner: '',
    evidenceRequired: false,
    evidenceConfirmed: false,
    completedAt: '',
    note: '회기별 쿠폰 사용기간 종료 직후 결제일을 정해 아래 회기 등록에서 각각 입력합니다.',
  },
  {
    id: 'life-coupon-hq25-postcheck',
    programId: 'life-coupon-2026',
    category: '성과측정',
    sessionLabel: '사후검사',
    title: 'HQ-25 사후검사 실시 및 결과분석',
    dueDate: '2026-11-30',
    status: '미완료',
    owner: '',
    evidenceRequired: true,
    evidenceConfirmed: false,
    completedAt: '',
    note: '계획서상 11월 실시 항목입니다.',
  },
]

const remainingSessionPlan = [
  {
    id: 'small-4',
    month: '9월',
    dateLabel: '9.24.(목)~9.25.(금)',
    dueDate: '2026-09-24',
    program: '작은만남 4회기 · 생활쿠폰 7회기',
    activity: '나의 생활반경 소개하기',
    method: '집 주변에서 자주 이용하거나 편안함을 느끼는 장소 한 곳을 사진 또는 글로 소개하고, 참여자 간 짧은 의견을 나눔.',
    preparation: '활동안내문, 기록지, 쿠폰 발행대장',
  },
  {
    id: 'step-4',
    month: '9월',
    dateLabel: '9.28.(월)~9.30.(수)',
    dueDate: '2026-09-28',
    program: '하루 한 걸음 4회기 · 생활쿠폰 8회기',
    activity: '익숙한 장소까지 걷기',
    method: '참여자가 스스로 정한 가까운 목적지까지 이동하고, 이동 전후의 기분과 활동 소감을 기록함.',
    preparation: '미션수행일지, 안전안내, 쿠폰 발행대장',
  },
  {
    id: 'small-5',
    month: '10월',
    dateLabel: '10.8.(목)~10.9.(금)',
    dueDate: '2026-10-08',
    program: '작은만남 5회기 · 생활쿠폰 9회기',
    activity: '가을의 일상 한 장 나누기',
    method: '최근 일상에서 기억에 남은 장면이나 활동을 사진·글 중 편한 방법으로 공유하고 서로의 경험을 확인함.',
    preparation: '활동안내문, 기록지, 쿠폰 발행대장',
  },
  {
    id: 'small-6',
    month: '10월',
    dateLabel: '10.22.(목)~10.23.(금)',
    dueDate: '2026-10-22',
    program: '작은만남 6회기 · 생활쿠폰 10회기',
    activity: '생활에 도움이 된 방법 나누기',
    method: '식사, 수면, 외출 등 일상을 유지하는 데 도움이 된 방법 한 가지를 기록하고 참여자 간 응원 의견을 나눔.',
    preparation: '활동안내문, 기록지, 쿠폰 발행대장',
  },
  {
    id: 'step-5',
    month: '10월',
    dateLabel: '10.28.(수)~10.30.(금)',
    dueDate: '2026-10-28',
    program: '하루 한 걸음 5회기 · 생활쿠폰 11회기',
    activity: '생활에 필요한 장소 이용하기',
    method: '편의점, 도서관, 공원 등 생활에 필요한 장소 한 곳을 정해 방문하고 수행 여부와 소감을 기록함.',
    preparation: '미션수행일지, 안전안내, 쿠폰 발행대장',
  },
  {
    id: 'small-7',
    month: '11월',
    dateLabel: '11.19.(목)~11.20.(금)',
    dueDate: '2026-11-19',
    program: '작은만남 7회기 · 생활쿠폰 12회기',
    activity: '올해의 변화 돌아보기',
    method: '사업 참여 전후 달라진 점과 유지하고 싶은 일상을 부담 없는 분량으로 작성하고 마무리 의견을 나눔.',
    preparation: '회고기록지, 만족도조사지, 쿠폰 발행대장',
  },
  {
    id: 'step-6',
    month: '11월',
    dateLabel: '11.25.(수)~11.27.(금)',
    dueDate: '2026-11-25',
    program: '하루 한 걸음 6회기 · 생활쿠폰 13회기',
    activity: '나에게 맞는 일상활동 실천하기',
    method: '앞선 활동 중 본인에게 도움이 된 활동을 다시 선택해 실천하고, 앞으로 이어갈 작은 목표를 정함.',
    preparation: '미션수행일지, HQ-25 사후검사, 만족도조사, 쿠폰 발행대장',
  },
]

const participantNotice = `[생활쿠폰지원사업 9~11월 일정 안내]

안녕하세요. 남은 작은만남과 하루 한 걸음 일정을 안내드립니다.

9월 24일~25일  작은만남 4회기
9월 28일~30일  하루 한 걸음 4회기
10월 8일~9일  작은만남 5회기
10월 22일~23일  작은만남 6회기
10월 28일~30일  하루 한 걸음 5회기
11월 19일~20일  작은만남 7회기
11월 25일~27일  하루 한 걸음 6회기 및 마무리 조사

회기별 자세한 활동방법과 제출기한은 시작 전에 다시 안내드리겠습니다. 참여가 어려운 일정이 있으면 담당자에게 미리 알려주시기 바랍니다.

※ 위 일정은 기관 사정에 따라 조정될 수 있으며, 변경 시 사전에 안내드리겠습니다.`

function koreaToday() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function shiftDate(date: string, days: number) {
  if (!date) return ''
  const value = new Date(`${date}T00:00:00+09:00`)
  value.setDate(value.getDate() + days)
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(value)
}

function daysFromToday(date: string) {
  if (!date) return Number.POSITIVE_INFINITY
  const start = new Date(`${koreaToday()}T00:00:00+09:00`).getTime()
  const end = new Date(`${date}T00:00:00+09:00`).getTime()
  return Math.round((end - start) / 86_400_000)
}

function alertLevel(task: ProgramTask): AlertLevel {
  if (!task.dueDate) return '날짜 미정'
  const days = daysFromToday(task.dueDate)
  if (days < 0) return '기한초과'
  if (days === 0) return '오늘'
  if (days <= 7) return '7일 이내'
  return '예정'
}

function taskFromRow(row: TaskRow): ProgramTask {
  return {
    id: row.id,
    programId: row.program_id,
    category: row.category,
    sessionLabel: row.session_label,
    title: row.title,
    dueDate: row.due_date ?? '',
    status: row.status,
    owner: row.owner,
    evidenceRequired: row.evidence_required,
    evidenceConfirmed: row.evidence_confirmed,
    completedAt: row.completed_at ?? '',
    note: row.note,
  }
}

function loadLocalTasks() {
  if (typeof window === 'undefined') return seedTasks
  const raw = localStorage.getItem(tasksKey)
  if (!raw) return seedTasks
  try {
    return JSON.parse(raw) as ProgramTask[]
  } catch {
    return seedTasks
  }
}

export default function ProgramOperations({ user, programId }: { user: User | null; programId: string }) {
  const [tasks, setTasks] = useState<ProgramTask[]>(loadLocalTasks)
  const [message, setMessage] = useState('')
  const [sessionDraft, setSessionDraft] = useState({
    label: '',
    sessionDate: '',
    missionDueDate: '',
    settlementDate: '',
    resultDueDate: '',
  })
  const [changeDraft, setChangeDraft] = useState({ count: '1', dueDate: '', reason: '참여중단·교체' })

  useEffect(() => {
    if (!user) return
    supabase
      .from('work_program_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .order('due_date', { ascending: true, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) {
          setMessage(`운영일정 클라우드 준비 필요: ${error.message}`)
          return
        }
        const cloudTasks = ((data ?? []) as TaskRow[]).map(taskFromRow)
        if (!cloudTasks.length) return
        const next = cloudTasks
        setTasks(next)
        localStorage.setItem(tasksKey, JSON.stringify(next))
      })
  }, [programId, user])

  const programTasks = useMemo(
    () => tasks.filter(task => task.programId === programId),
    [programId, tasks],
  )
  const activeTasks = useMemo(
    () => programTasks
      .filter(task => task.status !== '완료' && task.status !== '보류')
      .sort((a, b) => {
        const order: Record<AlertLevel, number> = { 기한초과: 0, 오늘: 1, '7일 이내': 2, '날짜 미정': 3, 예정: 4 }
        const levelDiff = order[alertLevel(a)] - order[alertLevel(b)]
        return levelDiff || (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31')
      }),
    [programTasks],
  )

  const counts = useMemo(() => ({
    overdue: activeTasks.filter(task => alertLevel(task) === '기한초과').length,
    today: activeTasks.filter(task => alertLevel(task) === '오늘').length,
    soon: activeTasks.filter(task => alertLevel(task) === '7일 이내').length,
    undated: activeTasks.filter(task => alertLevel(task) === '날짜 미정').length,
  }), [activeTasks])

  function saveLocal(next: ProgramTask[]) {
    setTasks(next)
    localStorage.setItem(tasksKey, JSON.stringify(next))
  }

  async function saveCloud(task: ProgramTask) {
    if (!user) return
    const { error } = await supabase.from('work_program_tasks').upsert({
      user_id: user.id,
      id: task.id,
      program_id: task.programId,
      category: task.category,
      session_label: task.sessionLabel,
      title: task.title,
      due_date: task.dueDate || null,
      status: task.status,
      owner: task.owner,
      evidence_required: task.evidenceRequired,
      evidence_confirmed: task.evidenceConfirmed,
      completed_at: task.completedAt || null,
      note: task.note,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,id' })
    setMessage(error ? `운영일정 저장 실패: ${error.message}` : '운영일정이 클라우드에 저장되었습니다.')
  }

  function saveTask(task: ProgramTask) {
    const next = [...tasks.filter(item => item.id !== task.id), task]
    saveLocal(next)
    saveCloud(task)
  }

  function updateTask(id: string, patch: Partial<ProgramTask>) {
    const current = tasks.find(task => task.id === id)
    if (!current) return
    const nextTask = { ...current, ...patch }
    if (patch.status === '완료') nextTask.completedAt = new Date().toISOString()
    if (patch.status && patch.status !== '완료') nextTask.completedAt = ''
    saveTask(nextTask)
  }

  async function removeTask(id: string) {
    saveLocal(tasks.filter(task => task.id !== id))
    if (!user) return
    const { error } = await supabase.from('work_program_tasks').delete().eq('user_id', user.id).eq('id', id)
    setMessage(error ? `삭제 실패: ${error.message}` : '운영일정을 삭제했습니다.')
  }

  function addSessionWorkflow() {
    if (!sessionDraft.label.trim() || !sessionDraft.sessionDate) {
      setMessage('회기명과 실행일을 먼저 입력해주세요.')
      return
    }
    const idRoot = `${Date.now()}`
    const common = { programId, sessionLabel: sessionDraft.label.trim(), status: '미완료' as TaskStatus, owner: '', evidenceConfirmed: false, completedAt: '' }
    const created: ProgramTask[] = [
      { ...common, id: `${idRoot}-prepare`, category: '회기준비', title: '참여자 변동·장소·쿠폰 준비 확인', dueDate: shiftDate(sessionDraft.sessionDate, -3), evidenceRequired: false, note: '참여자 변경이 있으면 별도 변경업무도 등록합니다.' },
      { ...common, id: `${idRoot}-run`, category: '프로그램실행', title: '회기 실행 및 참여 확인', dueDate: sessionDraft.sessionDate, evidenceRequired: true, note: '참여자 실명은 대시보드에 적지 않고 원본 증빙에서 확인합니다.' },
      { ...common, id: `${idRoot}-mission`, category: '미션지회수', title: '미션지 전원 회수 확인', dueDate: sessionDraft.missionDueDate, evidenceRequired: true, note: '미회수 인원 수만 기록하고 실명은 기록하지 않습니다.' },
      { ...common, id: `${idRoot}-payment`, category: '결제', title: '황금마켓 생활쿠폰 대금결제', dueDate: sessionDraft.settlementDate, evidenceRequired: true, note: '쿠폰 사용기간 종료 후 결제하고 이체·결제 증빙을 확인합니다.' },
      { ...common, id: `${idRoot}-result`, category: '결과·증빙', title: '결과보고 및 회기 증빙 묶음 확인', dueDate: sessionDraft.resultDueDate, evidenceRequired: true, note: '실시기안, 참여확인, 미션지, 지급·결제 증빙, 결과보고를 연결합니다.' },
    ]
    const next = [...tasks, ...created]
    saveLocal(next)
    if (user) Promise.all(created.map(saveCloud))
    setSessionDraft({ label: '', sessionDate: '', missionDueDate: '', settlementDate: '', resultDueDate: '' })
    setMessage(`${created[0].sessionLabel} 운영업무 5개를 만들었습니다.`)
  }

  function addParticipantChange() {
    const count = Number.parseInt(changeDraft.count, 10)
    if (!Number.isFinite(count) || count < 1) {
      setMessage('변경 인원은 1명 이상으로 입력해주세요.')
      return
    }
    const task: ProgramTask = {
      id: `${Date.now()}-participant-change`,
      programId,
      category: '참여자변경',
      sessionLabel: '참여자 관리',
      title: `참여자 변경 ${count}명 반영·보고`,
      dueDate: changeDraft.dueDate,
      status: '미완료',
      owner: '',
      evidenceRequired: true,
      evidenceConfirmed: false,
      completedAt: '',
      note: `${changeDraft.reason}. 실명과 개인사유는 원본 변경서류에만 기록합니다.`,
    }
    saveTask(task)
    setChangeDraft({ count: '1', dueDate: '', reason: '참여중단·교체' })
    setMessage(`참여자 변경업무 ${count}명을 ${changeDraft.dueDate ? `${changeDraft.dueDate} 마감` : '날짜 미정'}으로 등록했습니다.`)
  }

  function addRemainingSchedule() {
    const plannedTasks: ProgramTask[] = remainingSessionPlan.map(item => ({
      id: `life-coupon-plan-${item.id}`,
      programId,
      category: '회기운영',
      sessionLabel: item.program,
      title: item.activity,
      dueDate: item.dueDate,
      status: '미완료',
      owner: '',
      evidenceRequired: true,
      evidenceConfirmed: false,
      completedAt: '',
      note: `${item.dateLabel} · ${item.method} 준비: ${item.preparation}`,
    }))
    const planIds = new Set(plannedTasks.map(task => task.id))
    const next = [...tasks.filter(task => !planIds.has(task.id)), ...plannedTasks]
    saveLocal(next)
    if (user) Promise.all(plannedTasks.map(saveCloud))
    setMessage('남은 7개 회기 제안일정을 오늘의 사업 알림에 반영했습니다.')
  }

  async function copyParticipantNotice() {
    try {
      await navigator.clipboard.writeText(participantNotice)
      setMessage('참여자 단톡방 공지문을 복사했습니다.')
    } catch {
      setMessage('자동 복사가 차단되었습니다. 아래 공지문을 직접 선택해 복사해주세요.')
    }
  }

  async function uploadAllToCloud() {
    if (!user) {
      setMessage('로그인 후 클라우드에 올릴 수 있습니다.')
      return
    }
    await Promise.all(programTasks.map(saveCloud))
    setMessage('현재 운영일정을 클라우드에 모두 반영했습니다.')
  }

  const badgeClass: Record<AlertLevel, string> = {
    기한초과: 'bg-rose-100 text-rose-800',
    오늘: 'bg-red-600 text-white',
    '7일 이내': 'bg-amber-100 text-amber-800',
    '날짜 미정': 'bg-slate-200 text-slate-700',
    예정: 'bg-teal-100 text-teal-800',
  }

  return (
    <>
      <section className="mb-5 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <div className="border-b border-rose-100 bg-rose-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-rose-700">TODAY CONTROL</p>
              <h2 className="mt-1 text-xl font-black text-rose-950">오늘의 사업 알림</h2>
              <p className="mt-1 text-sm font-bold leading-6 text-rose-800">기한초과부터 확인하고, 오늘 할 일과 7일 이내 준비사항만 처리합니다.</p>
            </div>
            <button onClick={uploadAllToCloud} className="rounded-lg border border-rose-300 bg-white px-4 py-3 text-sm font-black text-rose-800">운영일정 클라우드 반영</button>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700">{message}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-2 border-b border-slate-100 p-4 md:grid-cols-4">
          <div className="rounded-xl border border-rose-200 p-3"><p className="text-xs font-black text-rose-700">기한초과</p><p className="mt-1 text-2xl font-black">{counts.overdue}</p></div>
          <div className="rounded-xl border border-red-200 p-3"><p className="text-xs font-black text-red-700">오늘</p><p className="mt-1 text-2xl font-black">{counts.today}</p></div>
          <div className="rounded-xl border border-amber-200 p-3"><p className="text-xs font-black text-amber-700">7일 이내</p><p className="mt-1 text-2xl font-black">{counts.soon}</p></div>
          <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-black text-slate-600">날짜 미정</p><p className="mt-1 text-2xl font-black">{counts.undated}</p></div>
        </div>
        <div className="divide-y divide-slate-100">
          {activeTasks.length ? activeTasks.slice(0, 12).map(task => {
            const level = alertLevel(task)
            return (
              <div key={task.id} className="grid gap-3 p-4 lg:grid-cols-[120px_1fr_150px_130px_70px] lg:items-center">
                <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${badgeClass[level]}`}>{level}</span><p className="mt-2 text-xs font-bold text-slate-500">{task.dueDate || '마감일 입력 필요'}</p></div>
                <div><p className="text-sm font-black text-slate-950">{task.sessionLabel} · {task.title}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-500">{task.category} · {task.note}</p></div>
                <select value={task.status} onChange={event => updateTask(task.id, { status: event.target.value as TaskStatus })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-black">
                  {(['미완료', '진행중', '완료', '보류'] as TaskStatus[]).map(status => <option key={status}>{status}</option>)}
                </select>
                <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${task.evidenceRequired ? 'border-indigo-200 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-400'}`}>
                  <input type="checkbox" checked={task.evidenceConfirmed} disabled={!task.evidenceRequired} onChange={event => updateTask(task.id, { evidenceConfirmed: event.target.checked })} /> 증빙 확인
                </label>
                <button onClick={() => removeTask(task.id)} className="text-xs font-black text-red-700">삭제</button>
              </div>
            )
          }) : <p className="p-8 text-center text-sm font-bold text-slate-500">현재 미완료 운영업무가 없습니다.</p>}
        </div>
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black tracking-[.18em] text-teal-700">SESSION WORKFLOW</p>
          <h2 className="mt-1 text-xl font-black">회기 한 번 등록하기</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">날짜를 한 번 넣으면 준비·실행·미션지 회수·황금마켓 결제·결과증빙 업무가 함께 생성됩니다.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={sessionDraft.label} onChange={event => setSessionDraft(previous => ({ ...previous, label: event.target.value }))} placeholder="회기명 예: 생활쿠폰 7회기" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold sm:col-span-2" />
            <label className="text-xs font-black text-slate-600">프로그램 실행일<input type="date" value={sessionDraft.sessionDate} onChange={event => setSessionDraft(previous => ({ ...previous, sessionDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" /></label>
            <label className="text-xs font-black text-slate-600">미션지 회수 마감<input type="date" value={sessionDraft.missionDueDate} onChange={event => setSessionDraft(previous => ({ ...previous, missionDueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" /></label>
            <label className="text-xs font-black text-slate-600">황금마켓 결제일<input type="date" value={sessionDraft.settlementDate} onChange={event => setSessionDraft(previous => ({ ...previous, settlementDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" /></label>
            <label className="text-xs font-black text-slate-600">결과·증빙 확인 마감<input type="date" value={sessionDraft.resultDueDate} onChange={event => setSessionDraft(previous => ({ ...previous, resultDueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" /></label>
            <button onClick={addSessionWorkflow} className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-black text-white sm:col-span-2">회기 운영업무 5개 만들기</button>
          </div>
        </article>

        <article className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black tracking-[.18em] text-indigo-700">PARTICIPANT CHANGE</p>
          <h2 className="mt-1 text-xl font-black">참여자 변경 등록</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">이름은 넣지 않고 변경 인원과 행정처리 기한만 관리합니다.</p>
          <div className="mt-4 grid gap-3">
            <input type="number" min="1" value={changeDraft.count} onChange={event => setChangeDraft(previous => ({ ...previous, count: event.target.value }))} placeholder="변경 인원" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" />
            <select value={changeDraft.reason} onChange={event => setChangeDraft(previous => ({ ...previous, reason: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold"><option>참여중단·교체</option><option>신규선정</option><option>인원변경 보고</option><option>기타 변경</option></select>
            <label className="text-xs font-black text-slate-600">변경 반영·보고 마감 <span className="font-bold text-slate-400">(선택)</span><input type="date" value={changeDraft.dueDate} onChange={event => setChangeDraft(previous => ({ ...previous, dueDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold" /></label>
            <button onClick={addParticipantChange} className="rounded-lg bg-indigo-700 px-4 py-3 text-sm font-black text-white">변경업무 등록</button>
            {message ? <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-black leading-5 text-indigo-900">{message}</p> : null}
          </div>
        </article>
      </section>

      <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-slate-500">REMAINING SCHEDULE</p>
            <h2 className="mt-1 text-xl font-black">9~11월 남은 회기 일정안</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">계획된 작은만남 7회, 하루 한 걸음 6회, 생활쿠폰 13회를 연말까지 완료하기 위한 제안일정입니다. 기관 일정과 참여자 의견 확인 후 확정합니다.</p>
          </div>
          <button onClick={addRemainingSchedule} className="shrink-0 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">제안일정 7건 업무에 반영</button>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-3">
          {['9월', '10월', '11월'].map(month => (
            <article key={month} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="border-b border-slate-200 pb-3 text-lg font-black">2026년 {month}</h3>
              <div className="mt-3 space-y-3">
                {remainingSessionPlan.filter(item => item.month === month).map(item => (
                  <div key={item.id} className="rounded-lg border border-teal-100 bg-teal-50 p-3">
                    <p className="text-xs font-black text-teal-800">{item.dateLabel}</p>
                    <p className="mt-1 text-sm font-black text-slate-950">{item.program}</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{item.activity}</p>
                  </div>
                ))}
                {month === '11월' ? <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3"><p className="text-xs font-black text-indigo-800">11.27.(금)</p><p className="mt-1 text-sm font-black">HQ-25 사후검사·만족도조사</p><p className="mt-1 text-xs font-bold leading-5 text-slate-600">성과자료 회수 및 누락 확인</p></div> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
        <div className="border-b border-teal-100 bg-teal-50 p-5">
          <p className="text-xs font-black tracking-[.18em] text-teal-700">SESSION PLAN</p>
          <h2 className="mt-1 text-xl font-black">회기별 시행계획</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">참여 부담을 높이지 않으면서 관계형성·외출·일상회복의 흐름이 이어지도록 구성했습니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-600">
              <tr><th className="px-4 py-3 text-left">일정</th><th className="px-4 py-3 text-left">회기</th><th className="px-4 py-3 text-left">활동</th><th className="px-4 py-3 text-left">진행방법</th><th className="px-4 py-3 text-left">준비·증빙</th></tr>
            </thead>
            <tbody>
              {remainingSessionPlan.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border-t border-slate-100 px-4 py-3 font-black whitespace-nowrap">{item.dateLabel}</td>
                  <td className="border-t border-slate-100 px-4 py-3 font-bold">{item.program}</td>
                  <td className="border-t border-slate-100 px-4 py-3 font-black text-teal-800">{item.activity}</td>
                  <td className="border-t border-slate-100 px-4 py-3 font-bold leading-6 text-slate-600">{item.method}</td>
                  <td className="border-t border-slate-100 px-4 py-3 font-bold leading-6 text-slate-600">{item.preparation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
          <div className="border-b border-indigo-100 bg-indigo-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-indigo-700">PARTICIPANT NOTICE</p>
            <h2 className="mt-1 text-xl font-black">참여자 공지용 일정표</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="min-w-[620px] w-full text-sm">
              <thead><tr className="bg-slate-950 text-white"><th className="px-3 py-3 text-left">일정</th><th className="px-3 py-3 text-left">프로그램</th><th className="px-3 py-3 text-left">활동내용</th></tr></thead>
              <tbody>{remainingSessionPlan.map(item => <tr key={`notice-${item.id}`}><td className="border-b border-slate-200 px-3 py-3 font-black whitespace-nowrap">{item.dateLabel}</td><td className="border-b border-slate-200 px-3 py-3 font-bold">{item.program.split(' · ')[0]}</td><td className="border-b border-slate-200 px-3 py-3 font-bold text-slate-600">{item.activity}</td></tr>)}</tbody>
            </table>
          </div>
        </article>
        <article className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-black tracking-[.18em] text-indigo-700">KAKAO NOTICE</p><h2 className="mt-1 text-xl font-black">단톡방 공지문</h2></div>
            <button onClick={copyParticipantNotice} className="shrink-0 rounded-lg bg-indigo-700 px-4 py-2 text-xs font-black text-white">공지문 복사</button>
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm font-bold leading-6 text-slate-700">{participantNotice}</pre>
        </article>
      </section>
    </>
  )
}
