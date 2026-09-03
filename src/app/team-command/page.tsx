'use client'

import { useEffect, useMemo, useState } from 'react'

type TeamKey = '지역사회조직팀' | '서비스제공팀' | '공통'
type StaffKey = '1차 판단 지원 필요' | '기본업무 누락관리 필요' | '실행형 업무 중심 배정' | '겸직 우선순위 조정 필요' | '공통'
type ReportType = '당일 결재' | '익일 문서 제출' | '익일 사전검토' | '시간외 상의' | '단순 공유' | '즉시보고' | '퇴근 이후 문의'
type ReportStatus = '접수' | '돌려보냄' | '판단완료' | '추적필요' | '완료'
type BurdenReason = '직원안 없음' | '반복누락' | '기한임박' | '역할불명확' | '과장 결정 의존' | '긴급예외'
type BoundaryAction = '직원안 재제출' | '체크리스트 요구' | '정해진 시간 재상담' | '담당자 역할 재확인' | '과장 판단 후 종료' | '즉시 대응'
type QuickTemplate = {
  title: string
  type: ReportType
  burdenReason: BurdenReason
  boundaryAction: BoundaryAction
  status: ReportStatus
  minutes: number
  issue: string
  feedback: string
}
type ConditionRecord = {
  water: number
  restroom: number
  coffee: number
  neckBackPain: number
  fatigue: number
  overload: number
}
type ConditionHistory = Record<string, ConditionRecord>

type ReportRecord = {
  id: string
  date: string
  team: TeamKey
  staff: StaffKey
  type: ReportType
  title: string
  issue: string
  staffOption: string
  requestedDecision: string
  feedback: string
  nextDue: string
  status: ReportStatus
  burdenReason: BurdenReason
  boundaryAction: BoundaryAction
  minutes: number
}

const STORAGE_KEY = 'cheonggok-team-command-reports-v1'
const CONDITION_KEY = 'cheonggok-team-command-condition-v1'
const teamKeys: TeamKey[] = ['지역사회조직팀', '서비스제공팀', '공통']
const staffKeys: StaffKey[] = ['1차 판단 지원 필요', '기본업무 누락관리 필요', '실행형 업무 중심 배정', '겸직 우선순위 조정 필요', '공통']
const reportTypes: ReportType[] = ['당일 결재', '익일 문서 제출', '익일 사전검토', '시간외 상의', '단순 공유', '즉시보고', '퇴근 이후 문의']
const reportStatuses: ReportStatus[] = ['접수', '돌려보냄', '판단완료', '추적필요', '완료']
const burdenReasons: BurdenReason[] = ['직원안 없음', '반복누락', '기한임박', '역할불명확', '과장 결정 의존', '긴급예외']
const boundaryActions: BoundaryAction[] = ['직원안 재제출', '체크리스트 요구', '정해진 시간 재상담', '담당자 역할 재확인', '과장 판단 후 종료', '즉시 대응']
const conditionDefaults: ConditionRecord = {
  water: 0,
  restroom: 0,
  coffee: 0,
  neckBackPain: 0,
  fatigue: 0,
  overload: 0,
}

const teamStructures = [
  {
    name: '지역사회조직팀',
    members: '총 4명',
    composition: '최고선임 1명, 팀원 3명',
    overlap: '팀원 3명 중 2명은 서비스제공팀 겸직',
    risk: '축제, 동아리, 주민조직, 지역행사 업무가 겸직자에게 동시에 몰릴 수 있음',
  },
  {
    name: '서비스제공팀',
    members: '총 5명',
    composition: '팀원 5명',
    overlap: '5명 중 2명은 지역사회조직팀 겸직',
    risk: '서비스제공 기본업무와 조직팀 행사·주민활동 업무가 같은 시기에 겹칠 수 있음',
  },
]

const staffProfiles = [
  {
    name: '1차 판단 지원 필요',
    strength: '업무를 맡아 수행하려는 태도와 책임감',
    risk: '상황 설명 중심 보고가 반복되면 과장에게 판단이 집중됨',
    assignment: '진행상황 취합, 1차 검토표 작성, 선택지 정리',
    guardrail: '보고 시 본인 판단안과 추천안을 함께 제출',
  },
  {
    name: '기본업무 누락관리 필요',
    strength: '특정 역할과 현장 수행에서 강점이 확인됨',
    risk: '기본 행정, 일정, 명단, 예산, 결재문서에서 반복 실수 발생 가능',
    assignment: '강점업무 중심 배치, 단순 반복업무는 체크리스트로 통제',
    guardrail: '제출 전 자가점검표 필수, 실수 반복 항목은 매주 확인',
  },
  {
    name: '실행형 업무 중심 배정',
    strength: '정해진 자료정리, 연락, 준비물, 사진, 참석확인 등 실행형 업무',
    risk: '기획 방향 설정, 피드백 반영, 실행안 전환이 약함',
    assignment: '축제 실행표, 동아리별 역할표, 준비물·연락·당일동선 정리',
    guardrail: '지난 피드백 반영표 없으면 재검토하지 않음',
  },
  {
    name: '겸직 우선순위 조정 필요',
    strength: '두 팀 업무 흐름을 함께 알고 있어 연결업무에 활용 가능',
    risk: '서비스제공팀 업무와 조직팀 업무가 동시에 배정되면 어느 쪽도 완성도가 떨어질 수 있음',
    assignment: '겸직업무는 주간 우선순위를 먼저 확정하고, 같은 날 마감 2개 이상 배정 금지',
    guardrail: '서비스제공팀 업무 영향 여부를 보고서에 함께 표시',
  },
]

const decisionRules = [
  {
    title: '09:00~09:30 당일 결재',
    rule: '과장 결재 후 부장 개별 결재로 올라갈 문서만 처리함. 단순 상의성 문서는 받지 않음',
    question: '이 문서는 오늘 부장 결재로 바로 올라갈 수준인가?',
  },
  {
    title: '16:30 익일 문서 제출 마감',
    rule: '다음 날 결재할 계획서, 결과보고서, 기안문은 16:30까지 제출함',
    question: '내일 결재가 필요한 문서를 마감 전에 올렸는가?',
  },
  {
    title: '17:00~17:30 익일 결재 사전검토',
    rule: '결과보고서 등 꼼꼼한 확인이 필요한 문서만 집중 검토하고 수정 피드백을 줌',
    question: '내일 아침 결재 전에 반드시 확인해야 하는 문서인가?',
  },
  {
    title: '17:30~18:00 과장 정리시간',
    rule: '피드백 기록, 다음 날 결재 순서, 미완료 업무 정리에 사용함',
    question: '이 사안이 오늘 정리시간을 중단해야 할 만큼 긴급한가?',
  },
  {
    title: '그 외 시간 수시보고 제한',
    rule: '긴급이 아니면 메모로 남기고 정해진 결재·사전검토 시간에 처리함',
    question: '지금 과장 업무를 끊고 즉시 판단해야 하는 사안인가?',
  },
  {
    title: '즉시보고 예외',
    rule: '이용자 안전, 민원, 사고, 대외기관 긴급 대응, 당일 행사 차질 사안만 즉시 보고',
    question: '지금 놓치면 피해가 발생하는가?',
  },
  {
    title: '18:00 이후 문의 제한',
    rule: '퇴근 이후 메시지·카톡 문의와 상의는 원칙적으로 받지 않고, 긴급상황만 예외로 처리함',
    question: '내일 근무시간까지 기다릴 수 없는 긴급상황인가?',
  },
]

const scripts = [
  '선생님이 생각한 결론은 무엇인가요?',
  '선택지는 몇 가지이고, 그중 어떤 안을 추천하나요?',
  '제가 지금 결정해야 하는 것은 정확히 무엇인가요?',
  '이 사안은 메모로 남기고 17시 사전검토 시간에 같이 보겠습니다.',
  '내일 결재문서는 오늘 16시 30분까지 먼저 올려주세요.',
  '17시부터 17시 30분까지는 익일 결재문서만 집중해서 보겠습니다.',
  '17시 30분 이후에는 오늘 피드백과 내일 결재 순서를 정리하겠습니다.',
  '지금은 제 업무 집중시간이라 긴급이 아니면 정해진 시간에 보겠습니다.',
  '퇴근 이후 메시지·카톡 상의는 긴급상황이 아니면 다음 근무일에 확인하겠습니다.',
  '지난 피드백 반영표를 붙여서 다시 가져와 주세요.',
]

const burdenChecks = [
  {
    title: '직원안이 없는가',
    signal: '상황 설명만 있고 선택지·추천안·요청 판단이 없으면 과장이 일을 떠안게 됨',
    action: '직원안 재제출로 돌려보냄',
  },
  {
    title: '같은 누락이 반복되는가',
    signal: '구두 피드백을 했는데도 같은 항목이 계속 빠지면 기억 문제가 아니라 관리도구 문제임',
    action: '체크리스트로 전환하고 완료 근거를 받음',
  },
  {
    title: '마감 직전에 들어왔는가',
    signal: '급해서 봐달라는 문서는 대부분 과장이 대신 완성하게 됨',
    action: '긴급 여부를 나누고, 다음 제출기준을 기록함',
  },
  {
    title: '내가 대신 결정하고 있는가',
    signal: '직원이 판단을 배우는 과정 없이 과장이 결론을 내려주면 같은 구조가 반복됨',
    action: '이번 판단만 하고 다음부터 본인 판단안을 조건으로 받음',
  },
]

const quickTemplates: QuickTemplate[] = [
  {
    title: '직원안 없이 상의 들어옴',
    type: '시간외 상의',
    burdenReason: '직원안 없음',
    boundaryAction: '직원안 재제출',
    status: '돌려보냄',
    minutes: 10,
    issue: '상황 설명은 있었으나 직원의 선택지와 추천안이 정리되지 않은 상태로 상의가 들어옴',
    feedback: '본인 판단안과 추천안을 정리한 뒤 정해진 시간에 다시 상의하도록 안내함',
  },
  {
    title: '반복누락 재피드백',
    type: '시간외 상의',
    burdenReason: '반복누락',
    boundaryAction: '체크리스트 요구',
    status: '추적필요',
    minutes: 15,
    issue: '이전에 안내한 내용이 다시 누락되어 추가 확인과 재피드백이 필요했음',
    feedback: '동일 항목 반복누락 방지를 위해 체크리스트 확인 후 재제출하도록 안내함',
  },
  {
    title: '마감임박 문서 검토 요청',
    type: '시간외 상의',
    burdenReason: '기한임박',
    boundaryAction: '정해진 시간 재상담',
    status: '추적필요',
    minutes: 20,
    issue: '충분한 사전검토 시간 없이 마감이 임박한 상태에서 검토 요청이 들어옴',
    feedback: '긴급 여부만 확인하고, 다음부터는 16:30 제출마감 기준을 지키도록 안내함',
  },
  {
    title: '과장 결정 의존',
    type: '시간외 상의',
    burdenReason: '과장 결정 의존',
    boundaryAction: '담당자 역할 재확인',
    status: '추적필요',
    minutes: 15,
    issue: '담당자가 1차 판단을 충분히 정리하지 않고 과장 판단에 의존하는 형태로 상의가 진행됨',
    feedback: '담당자가 먼저 실행안과 추천안을 정리하고 과장은 최종 조정하는 방식으로 안내함',
  },
  {
    title: '긴급예외 즉시대응',
    type: '즉시보고',
    burdenReason: '긴급예외',
    boundaryAction: '즉시 대응',
    status: '판단완료',
    minutes: 20,
    issue: '이용자 안전, 민원, 사고, 대외기관 대응 등 즉시 판단이 필요한 사안으로 보고됨',
    feedback: '긴급 사안으로 판단하여 즉시 확인하고 필요한 조치를 진행함',
  },
]

function todayDateString() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function dateStringDaysAgo(daysAgo: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date)
}

function statusTone(status: ReportStatus) {
  if (status === '완료' || status === '판단완료') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === '추적필요') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === '돌려보냄') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-white text-slate-700'
}

export default function TeamCommandPage() {
  const [records, setRecords] = useState<ReportRecord[]>([])
  const [condition, setCondition] = useState<ConditionRecord>(conditionDefaults)
  const [conditionHistory, setConditionHistory] = useState<ConditionHistory>({})
  const [draft, setDraft] = useState({
    team: '공통' as TeamKey,
    staff: '공통' as StaffKey,
    type: '시간외 상의' as ReportType,
    title: '',
    issue: '',
    staffOption: '',
    requestedDecision: '',
    feedback: '',
    nextDue: '',
    burdenReason: '과장 결정 의존' as BurdenReason,
    boundaryAction: '직원안 재제출' as BoundaryAction,
    minutes: 10,
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setRecords(JSON.parse(raw))
    const conditionRaw = localStorage.getItem(CONDITION_KEY)
    if (conditionRaw) {
      const parsed = JSON.parse(conditionRaw)
      const today = todayDateString()
      const history = typeof parsed.water === 'number' ? { [today]: { ...conditionDefaults, ...parsed } } : parsed
      setConditionHistory(history)
      setCondition({ ...conditionDefaults, ...(history[today] || {}) })
    }
  }, [])

  const stats = useMemo(() => {
    const today = todayDateString()
    const todayRecords = records.filter(record => record.date === today)
    const todayTakeoverRisk = todayRecords.filter(record => record.status === '돌려보냄' || !record.staffOption || record.type === '시간외 상의' || record.type === '퇴근 이후 문의')
    const active = records.filter(record => record.status !== '완료')
    return {
      total: records.length,
      today: todayRecords.length,
      active: active.length,
      returned: records.filter(record => record.status === '돌려보냄').length,
      tracking: records.filter(record => record.status === '추적필요').length,
      takeoverRisk: records.filter(record => record.status === '돌려보냄' || !record.staffOption || record.type === '시간외 상의' || record.type === '퇴근 이후 문의').length,
      todayTakeoverRisk: todayTakeoverRisk.length,
      todayMinutes: todayRecords.reduce((sum, record) => sum + Number(record.minutes || 0), 0),
      todayReturned: todayRecords.filter(record => record.status === '돌려보냄').length,
    }
  }, [records])

  const todaySummary = useMemo(() => {
    const today = todayDateString()
    const todayRecords = records.filter(record => record.date === today)
    const takeoverRecords = todayRecords.filter(record => record.status === '돌려보냄' || !record.staffOption || record.type === '시간외 상의' || record.type === '퇴근 이후 문의')
    const minutes = todayRecords.reduce((sum, record) => sum + Number(record.minutes || 0), 0)
    const recentLines = todayRecords.slice(0, 8).map(record => `- ${record.staff} / ${record.burdenReason || record.type} / ${record.title} / ${record.boundaryAction || record.status} / ${record.minutes || 0}분`)
    return [
      `[${today} 팀 운영 기록]`,
      `오늘 수시보고: ${todayRecords.length}건`,
      `떠안음 위험: ${takeoverRecords.length}건`,
      `돌려보냄: ${todayRecords.filter(record => record.status === '돌려보냄').length}건`,
      `빼앗긴 시간: ${minutes}분`,
      `물: ${condition.water}컵 / 화장실: ${condition.restroom}회 / 커피: ${condition.coffee}잔`,
      `목·등 통증: ${condition.neckBackPain}/10 / 피로도: ${condition.fatigue}/10 / 감정 과부하: ${condition.overload}/10`,
      '',
      '주요 기록',
      recentLines.length ? recentLines.join('\n') : '- 기록 없음',
      '',
      '내일 적용 기준',
      '- 직원안 없는 상의는 받지 않고 재정리 요청',
      '- 반복누락은 구두 피드백보다 체크리스트로 관리',
      '- 마감임박 문서는 긴급 여부만 판단하고 제출기준 재안내',
    ].join('\n')
  }, [condition, records])

  const todayRecords = useMemo(() => {
    const today = todayDateString()
    return records.filter(record => record.date === today)
  }, [records])

  const conditionTrend = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => dateStringDaysAgo(index)).reverse()
    const entries = dates.map(date => ({
      date,
      condition: conditionHistory[date] || conditionDefaults,
    }))
    const recordedEntries = entries.filter(entry =>
      entry.condition.water ||
      entry.condition.restroom ||
      entry.condition.coffee ||
      entry.condition.neckBackPain ||
      entry.condition.fatigue ||
      entry.condition.overload
    )
    const divide = (sum: number) => recordedEntries.length ? (sum / recordedEntries.length).toFixed(1) : '0.0'
    const totals = recordedEntries.reduce((sum, entry) => ({
      water: sum.water + entry.condition.water,
      restroom: sum.restroom + entry.condition.restroom,
      coffee: sum.coffee + entry.condition.coffee,
      neckBackPain: sum.neckBackPain + entry.condition.neckBackPain,
      fatigue: sum.fatigue + entry.condition.fatigue,
      overload: sum.overload + entry.condition.overload,
    }), conditionDefaults)
    return {
      entries,
      recordedDays: recordedEntries.length,
      averages: {
        water: divide(totals.water),
        restroom: divide(totals.restroom),
        coffee: divide(totals.coffee),
        neckBackPain: divide(totals.neckBackPain),
        fatigue: divide(totals.fatigue),
        overload: divide(totals.overload),
      },
    }
  }, [conditionHistory])

  const saveRecord = () => {
    if (!draft.title.trim()) return
    const record: ReportRecord = {
      id: `${Date.now()}`,
      date: todayDateString(),
      team: draft.team,
      staff: draft.staff,
      type: draft.type,
      title: draft.title.trim(),
      issue: draft.issue.trim(),
      staffOption: draft.staffOption.trim(),
      requestedDecision: draft.requestedDecision.trim(),
      feedback: draft.feedback.trim(),
      nextDue: draft.nextDue,
      status: draft.staffOption.trim() ? '접수' : '돌려보냄',
      burdenReason: draft.burdenReason,
      boundaryAction: draft.boundaryAction,
      minutes: Number(draft.minutes) || 0,
    }
    const next = [record, ...records].slice(0, 300)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDraft({
      team: '공통',
      staff: '공통',
      type: '시간외 상의',
      title: '',
      issue: '',
      staffOption: '',
      requestedDecision: '',
      feedback: '',
      nextDue: '',
      burdenReason: '과장 결정 의존',
      boundaryAction: '직원안 재제출',
      minutes: 10,
    })
  }

  const saveQuickRecord = (template: QuickTemplate) => {
    const record: ReportRecord = {
      id: `${Date.now()}`,
      date: todayDateString(),
      team: draft.team,
      staff: draft.staff,
      type: template.type,
      title: template.title,
      issue: template.issue,
      staffOption: '',
      requestedDecision: '',
      feedback: template.feedback,
      nextDue: '',
      status: template.status,
      burdenReason: template.burdenReason,
      boundaryAction: template.boundaryAction,
      minutes: template.minutes,
    }
    const next = [record, ...records].slice(0, 300)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateStatus = (id: string, status: ReportStatus) => {
    const next = records.map(record => record.id === id ? { ...record, status } : record)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const removeRecord = (id: string) => {
    const next = records.filter(record => record.id !== id)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const clearTodayRecords = () => {
    if (!window.confirm('오늘 기록을 모두 삭제할까요?')) return
    const today = todayDateString()
    const next = records.filter(record => record.date !== today)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateCondition = (key: keyof ConditionRecord, value: number) => {
    const today = todayDateString()
    const next = {
      ...condition,
      [key]: Math.max(0, Math.min(10, value)),
    }
    const nextHistory = {
      ...conditionHistory,
      [today]: next,
    }
    setCondition(next)
    setConditionHistory(nextHistory)
    localStorage.setItem(CONDITION_KEY, JSON.stringify(nextHistory))
  }

  const resetCondition = () => {
    const today = todayDateString()
    const nextHistory = {
      ...conditionHistory,
      [today]: conditionDefaults,
    }
    setCondition(conditionDefaults)
    setConditionHistory(nextHistory)
    localStorage.setItem(CONDITION_KEY, JSON.stringify(nextHistory))
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black tracking-[.22em] text-emerald-300">MANAGER COMMAND CENTER</p>
              <h1 className="mt-2 text-3xl font-black">팀 운영 컨트롤타워</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                수시보고, 반복피드백, 결재 전 상의, 직원별 업무 한계를 구조화해서 과장님의 판단 시간을 지키는 화면입니다.
              </p>
            </div>
            <div className="flex gap-2">
              <a href="/evaluation-2027" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">27년 평가 특별반으로 이동</a>
              <button onClick={() => window.print()} className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-950">출력</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">오늘 수시보고</p>
            <p className="mt-2 text-3xl font-black">{stats.today}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">빼앗긴 시간</p>
            <p className="mt-2 text-3xl font-black">{stats.todayMinutes}<span className="ml-1 text-base">분</span></p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-red-600">오늘 떠안음 위험</p>
            <p className="mt-2 text-3xl font-black">{stats.todayTakeoverRisk}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-600">오늘 돌려보냄</p>
            <p className="mt-2 text-3xl font-black">{stats.todayReturned}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-red-600">전체 미완료</p>
            <p className="mt-2 text-3xl font-black">{stats.active}</p>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-sky-100 bg-sky-50 p-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-sky-700">PERSONAL CONDITION</p>
              <h2 className="mt-1 text-xl font-black">오늘 컨디션 체크</h2>
              <p className="mt-1 text-sm leading-6 text-sky-900">물, 화장실, 커피, 통증과 피로를 짧게 눌러 기록합니다. 직원관리 기록과 분리된 개인 확인용입니다.</p>
            </div>
            <button onClick={resetCondition} className="rounded-lg border border-sky-200 bg-white px-4 py-3 text-sm font-black text-sky-800">컨디션 초기화</button>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">물</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button onClick={() => updateCondition('water', condition.water - 1)} className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-lg font-black">-</button>
                <p className="text-2xl font-black text-sky-800">{condition.water}<span className="ml-1 text-sm text-slate-500">컵</span></p>
                <button onClick={() => updateCondition('water', condition.water + 1)} className="h-10 w-10 rounded-lg bg-sky-700 text-lg font-black text-white">+</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">화장실</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button onClick={() => updateCondition('restroom', condition.restroom - 1)} className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-lg font-black">-</button>
                <p className="text-2xl font-black text-sky-800">{condition.restroom}<span className="ml-1 text-sm text-slate-500">회</span></p>
                <button onClick={() => updateCondition('restroom', condition.restroom + 1)} className="h-10 w-10 rounded-lg bg-sky-700 text-lg font-black text-white">+</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">커피</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button onClick={() => updateCondition('coffee', condition.coffee - 1)} className="h-10 w-10 rounded-lg border border-slate-300 bg-white text-lg font-black">-</button>
                <p className="text-2xl font-black text-sky-800">{condition.coffee}<span className="ml-1 text-sm text-slate-500">잔</span></p>
                <button onClick={() => updateCondition('coffee', condition.coffee + 1)} className="h-10 w-10 rounded-lg bg-sky-700 text-lg font-black text-white">+</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">목·등 통증</p>
              <input type="range" min="0" max="10" value={condition.neckBackPain} onChange={event => updateCondition('neckBackPain', Number(event.target.value))} className="mt-4 w-full" />
              <p className="mt-2 text-right text-lg font-black text-sky-800">{condition.neckBackPain}/10</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">피로도</p>
              <input type="range" min="0" max="10" value={condition.fatigue} onChange={event => updateCondition('fatigue', Number(event.target.value))} className="mt-4 w-full" />
              <p className="mt-2 text-right text-lg font-black text-sky-800">{condition.fatigue}/10</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">감정 과부하</p>
              <input type="range" min="0" max="10" value={condition.overload} onChange={event => updateCondition('overload', Number(event.target.value))} className="mt-4 w-full" />
              <p className="mt-2 text-right text-lg font-black text-sky-800">{condition.overload}/10</p>
            </div>
          </div>
          <div className="border-t border-slate-100 p-5">
            <div className="grid gap-3 md:grid-cols-6">
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                <p className="text-xs font-black text-sky-700">기록일</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.recordedDays}<span className="ml-1 text-sm">일</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black text-slate-500">평균 물</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.averages.water}<span className="ml-1 text-sm">컵</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black text-slate-500">평균 커피</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.averages.coffee}<span className="ml-1 text-sm">잔</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black text-slate-500">평균 통증</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.averages.neckBackPain}<span className="ml-1 text-sm">/10</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black text-slate-500">평균 피로</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.averages.fatigue}<span className="ml-1 text-sm">/10</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-black text-slate-500">평균 과부하</p>
                <p className="mt-1 text-xl font-black text-slate-950">{conditionTrend.averages.overload}<span className="ml-1 text-sm">/10</span></p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-xs">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="p-2">날짜</th>
                    <th className="p-2">물</th>
                    <th className="p-2">화장실</th>
                    <th className="p-2">커피</th>
                    <th className="p-2">목·등</th>
                    <th className="p-2">피로</th>
                    <th className="p-2">과부하</th>
                  </tr>
                </thead>
                <tbody>
                  {conditionTrend.entries.map(entry => (
                    <tr key={entry.date} className="border-t border-slate-100">
                      <td className="p-2 font-black text-slate-700">{entry.date}</td>
                      <td className="p-2">{entry.condition.water}컵</td>
                      <td className="p-2">{entry.condition.restroom}회</td>
                      <td className="p-2">{entry.condition.coffee}잔</td>
                      <td className="p-2">{entry.condition.neckBackPain}/10</td>
                      <td className="p-2">{entry.condition.fatigue}/10</td>
                      <td className="p-2">{entry.condition.overload}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-black tracking-[.18em] text-emerald-700">30 SECOND LOG</p>
            <h2 className="mt-1 text-xl font-black">바로 찍는 빠른 기록</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-900">직원이 들어온 순간 길게 쓰지 말고 대상만 고른 뒤 해당 버튼을 누릅니다.</p>
          </div>
          <div className="grid gap-3 border-b border-slate-100 p-5 md:grid-cols-2">
            <select value={draft.team} onChange={event => setDraft(previous => ({ ...previous, team: event.target.value as TeamKey }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold">
              {teamKeys.map(key => <option key={key}>{key}</option>)}
            </select>
            <select value={draft.staff} onChange={event => setDraft(previous => ({ ...previous, staff: event.target.value as StaffKey }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold">
              {staffKeys.map(key => <option key={key}>{key}</option>)}
            </select>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-5">
            {quickTemplates.map(template => (
              <button key={template.title} onClick={() => saveQuickRecord(template)} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50">
                <p className="text-sm font-black text-slate-950">{template.title}</p>
                <p className="mt-2 text-xs font-bold text-red-700">{template.burdenReason}</p>
                <p className="mt-1 text-xs font-bold text-emerald-700">{template.boundaryAction}</p>
                <p className="mt-3 text-xs text-slate-500">기본 {template.minutes}분 기록</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-slate-500">DAILY WRAP-UP</p>
              <h2 className="mt-1 text-xl font-black">퇴근 전 요약</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">오늘 기록을 그대로 복사해서 저에게 보내면 하루 패턴을 분석할 수 있습니다.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={() => navigator.clipboard.writeText(todaySummary)} className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">요약 복사</button>
              <button onClick={clearTodayRecords} className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700">오늘 기록 삭제</button>
            </div>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-5 text-sm leading-6 text-slate-700">{todaySummary}</pre>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white p-4">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">TODAY LOG</p>
            <h2 className="mt-1 text-xl font-black">오늘 기록 바로 삭제</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">예시로 찍은 기록은 여기에서 바로 지울 수 있습니다.</p>
          </div>
          <div className="grid gap-3 p-5">
            {todayRecords.length ? todayRecords.slice(0, 8).map(record => (
              <div key={record.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-black text-slate-950">{record.title}</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{record.staff} · {record.burdenReason} · {record.boundaryAction} · {record.minutes || 0}분</p>
                </div>
                <button onClick={() => removeRecord(record.id)} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-700">삭제</button>
              </div>
            )) : (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">오늘 기록이 없습니다.</p>
            )}
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-100 bg-red-50 p-4">
            <p className="text-xs font-black tracking-[.18em] text-red-700">TAKEOVER PREVENTION</p>
            <h2 className="mt-1 text-xl font-black">내가 또 떠안고 있는지 확인</h2>
            <p className="mt-1 text-sm leading-6 text-red-900">보고를 받는 순간 아래 신호가 보이면 바로 기록하고, 과장 업무로 흡수하지 않습니다.</p>
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-4">
            {burdenChecks.map(check => (
              <div key={check.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-black text-slate-950">{check.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{check.signal}</p>
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black leading-5 text-emerald-800">{check.action}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white p-4">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">TEAM STRUCTURE</p>
            <h2 className="mt-1 text-xl font-black">운영 범위</h2>
            <p className="mt-1 text-sm text-slate-600">두 팀을 함께 관리하되, 겸직 2명의 업무 중복과 마감 충돌을 우선 확인합니다.</p>
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_.75fr]">
            {teamStructures.map(team => (
              <div key={team.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-black text-slate-950">{team.name}</p>
                <p className="mt-2 text-sm font-bold text-emerald-800">{team.members}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{team.composition}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{team.overlap}</p>
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">{team.risk}</p>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-lg font-black text-emerald-950">실제 관리 인원</p>
              <p className="mt-2 text-4xl font-black text-emerald-800">7명</p>
              <p className="mt-2 text-sm leading-6 text-emerald-900">지역사회조직팀 4명 + 서비스제공팀 5명 - 겸직 2명 기준</p>
              <p className="mt-3 text-xs font-bold leading-5 text-emerald-800">겸직자는 두 팀 모두에 보이지만, 실제 업무량은 한 사람에게 누적됩니다.</p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">REPORT GATE</p>
              <h2 className="mt-1 text-xl font-black">보고·상의 접수 기준</h2>
            </div>
            <div className="grid gap-3 p-5">
              {decisionRules.map(rule => (
                <div key={rule.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">{rule.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{rule.rule}</p>
                  <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{rule.question}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-emerald-50 p-4">
              <p className="text-xs font-black tracking-[.18em] text-emerald-700">INTERRUPTION LOG</p>
              <h2 className="mt-1 text-xl font-black">수시보고 기록</h2>
            </div>
            <div className="grid gap-3 p-5">
              <select value={draft.team} onChange={event => setDraft(previous => ({ ...previous, team: event.target.value as TeamKey }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">
                {teamKeys.map(key => <option key={key}>{key}</option>)}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={draft.staff} onChange={event => setDraft(previous => ({ ...previous, staff: event.target.value as StaffKey }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">
                  {staffKeys.map(key => <option key={key}>{key}</option>)}
                </select>
                <select value={draft.type} onChange={event => setDraft(previous => ({ ...previous, type: event.target.value as ReportType }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">
                  {reportTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={draft.burdenReason} onChange={event => setDraft(previous => ({ ...previous, burdenReason: event.target.value as BurdenReason }))} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">
                  {burdenReasons.map(reason => <option key={reason}>{reason}</option>)}
                </select>
                <select value={draft.boundaryAction} onChange={event => setDraft(previous => ({ ...previous, boundaryAction: event.target.value as BoundaryAction }))} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                  {boundaryActions.map(action => <option key={action}>{action}</option>)}
                </select>
              </div>
              <input value={draft.title} onChange={event => setDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="보고 제목" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.issue} onChange={event => setDraft(previous => ({ ...previous, issue: event.target.value }))} placeholder="현재 상황 또는 막힌 지점" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.staffOption} onChange={event => setDraft(previous => ({ ...previous, staffOption: event.target.value }))} placeholder="직원이 제시한 선택지와 추천안. 없으면 돌려보냄으로 기록됩니다." className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.requestedDecision} onChange={event => setDraft(previous => ({ ...previous, requestedDecision: event.target.value }))} placeholder="과장에게 필요한 판단사항" className="min-h-16 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.feedback} onChange={event => setDraft(previous => ({ ...previous, feedback: event.target.value }))} placeholder="제시한 피드백 또는 다음 제출 기준" className="min-h-16 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-center">
                <input type="date" value={draft.nextDue} onChange={event => setDraft(previous => ({ ...previous, nextDue: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input type="number" min="0" step="5" value={draft.minutes} onChange={event => setDraft(previous => ({ ...previous, minutes: Number(event.target.value) }))} placeholder="소요분" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <button onClick={saveRecord} className="rounded-lg bg-emerald-800 px-4 py-3 text-sm font-black text-white">기록 저장</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white p-4">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">STAFF MANAGEMENT MAP</p>
            <h2 className="mt-1 text-xl font-black">직원별 관리방식</h2>
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-3">
            {staffProfiles.map(profile => (
              <div key={profile.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-black text-slate-950">{profile.name}</p>
                <dl className="mt-3 space-y-3 text-sm leading-6">
                  <div><dt className="font-black text-emerald-800">강점</dt><dd className="text-slate-700">{profile.strength}</dd></div>
                  <div><dt className="font-black text-red-700">위험</dt><dd className="text-slate-700">{profile.risk}</dd></div>
                  <div><dt className="font-black text-slate-800">맡길 일</dt><dd className="text-slate-700">{profile.assignment}</dd></div>
                  <div><dt className="font-black text-amber-700">관리기준</dt><dd className="text-slate-700">{profile.guardrail}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">PROTECTED TIME</p>
              <h2 className="mt-1 text-xl font-black">과장 업무시간 보호선</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><b>09:00~09:30</b> 당일 결재. 과장 결재 후 부장 결재로 바로 올라갈 문서만 처리</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4"><b>09:30~16:30</b> 집중업무 시간. 수시보고는 긴급상황만 받고, 일반 상의는 메모로 전환</p>
              <p className="rounded-xl border border-sky-200 bg-sky-50 p-4"><b>16:30</b> 익일 결재문서 제출 마감. 다음 날 결재가 필요한 문서는 이 시간까지 제출</p>
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4"><b>17:00~17:30</b> 익일 결재 사전검토. 결과보고서 등 꼼꼼한 확인이 필요한 문서 피드백</p>
              <p className="rounded-xl border border-violet-200 bg-violet-50 p-4"><b>17:30~18:00</b> 과장 정리시간. 피드백 기록, 다음 날 결재 순서, 미완료 업무 정리</p>
              <p className="rounded-xl border border-red-200 bg-red-50 p-4"><b>18:00 이후</b> 메시지·카톡 문의·상의 제한. 긴급상황만 예외 처리</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">MANAGER SCRIPTS</p>
            <h2 className="mt-1 text-xl font-black">반복해서 사용할 문장</h2>
            <div className="mt-4 space-y-2">
              {scripts.map(script => (
                <p key={script} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-700">{script}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">FOLLOW-UP BOARD</p>
            <h2 className="mt-1 text-xl font-black">최근 보고·피드백 추적</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">일자</th>
                  <th className="p-3">팀</th>
                  <th className="p-3">대상</th>
                  <th className="p-3">유형</th>
                  <th className="p-3">떠안음 원인</th>
                  <th className="p-3">내용</th>
                  <th className="p-3">직원안</th>
                  <th className="p-3">과장 판단</th>
                  <th className="p-3">경계선 조치</th>
                  <th className="p-3">소요</th>
                  <th className="p-3">기한</th>
                  <th className="p-3">상태</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {records.length ? records.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 text-xs font-bold text-slate-500">{record.date}</td>
                    <td className="p-3 text-xs font-black text-emerald-800">{record.team || '공통'}</td>
                    <td className="p-3 font-black">{record.staff}</td>
                    <td className="p-3">{record.type}</td>
                    <td className="p-3 text-xs font-black text-red-700">{record.burdenReason || '-'}</td>
                    <td className="max-w-xs p-3">
                      <p className="font-black">{record.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{record.issue || '상황 기록 없음'}</p>
                    </td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.staffOption || '직원안 없음'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.requestedDecision || record.feedback || '판단사항 없음'}</td>
                    <td className="p-3 text-xs font-black text-emerald-700">{record.boundaryAction || '-'}</td>
                    <td className="p-3 text-xs font-black text-slate-700">{record.minutes || 0}분</td>
                    <td className="p-3 text-xs font-bold text-amber-700">{record.nextDue || '-'}</td>
                    <td className="p-3">
                      <select value={record.status} onChange={event => updateStatus(record.id, event.target.value as ReportStatus)} className={`rounded-lg border px-2 py-2 text-xs font-bold ${statusTone(record.status)}`}>
                        {reportStatuses.map(status => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <button onClick={() => removeRecord(record.id)} className="text-xs font-bold text-slate-400 hover:text-red-600">삭제</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-sm text-slate-500">아직 기록이 없습니다. 오늘부터 수시보고가 들어올 때 대상만 고르고 빠른 기록 버튼을 누르면 됩니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
