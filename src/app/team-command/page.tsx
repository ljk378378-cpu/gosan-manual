'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type TeamKey = '지역사회조직팀' | '서비스제공팀' | '공통'
type StaffKey = '1차 판단 지원 필요' | '기본업무 누락관리 필요' | '실행형 업무 중심 배정' | '겸직 우선순위 조정 필요' | '공통'
type ReportType = '결재' | '상의' | '공유' | '긴급'
type ReportStatus = '접수' | '돌려보냄' | '판단완료' | '추적필요' | '완료'

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
}

const STORAGE_KEY = 'cheonggok-team-command-reports-v1'
const teamKeys: TeamKey[] = ['지역사회조직팀', '서비스제공팀', '공통']
const staffKeys: StaffKey[] = ['1차 판단 지원 필요', '기본업무 누락관리 필요', '실행형 업무 중심 배정', '겸직 우선순위 조정 필요', '공통']
const reportTypes: ReportType[] = ['결재', '상의', '공유', '긴급']
const reportStatuses: ReportStatus[] = ['접수', '돌려보냄', '판단완료', '추적필요', '완료']

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
    title: '단순 공유',
    rule: '대면보고하지 않고 메신저 또는 업무메모로 남김',
    question: '지금 과장이 즉시 판단해야 하는 사안인가?',
  },
  {
    title: '판단 필요',
    rule: '선택지 2개 이상과 본인 추천안을 포함해 보고',
    question: '본인이 보기에는 어느 안이 맞는가?',
  },
  {
    title: '결재 필요',
    rule: '결재문서, 자가점검표, 피드백 반영표를 함께 제출',
    question: '지난 피드백은 어디에 반영했는가?',
  },
  {
    title: '긴급',
    rule: '이용자 안전, 민원, 사고, 대외기관 대응만 즉시 보고',
    question: '지금 놓치면 피해가 발생하는가?',
  },
]

const scripts = [
  '선생님이 생각한 결론은 무엇인가요?',
  '선택지는 몇 가지이고, 그중 어떤 안을 추천하나요?',
  '제가 지금 결정해야 하는 것은 정확히 무엇인가요?',
  '이 사안은 메모로 남기고 오후 보고시간에 같이 보겠습니다.',
  '지난 피드백 반영표를 붙여서 다시 가져와 주세요.',
]

function todayDateString() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function statusTone(status: ReportStatus) {
  if (status === '완료' || status === '판단완료') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === '추적필요') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === '돌려보냄') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-white text-slate-700'
}

export default function TeamCommandPage() {
  const [records, setRecords] = useState<ReportRecord[]>([])
  const [draft, setDraft] = useState({
    team: '공통' as TeamKey,
    staff: '공통' as StaffKey,
    type: '상의' as ReportType,
    title: '',
    issue: '',
    staffOption: '',
    requestedDecision: '',
    feedback: '',
    nextDue: '',
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setRecords(JSON.parse(raw))
  }, [])

  const stats = useMemo(() => {
    const active = records.filter(record => record.status !== '완료')
    return {
      total: records.length,
      active: active.length,
      returned: records.filter(record => record.status === '돌려보냄').length,
      tracking: records.filter(record => record.status === '추적필요').length,
    }
  }, [records])

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
    }
    const next = [record, ...records].slice(0, 300)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDraft({
      team: '공통',
      staff: '공통',
      type: '상의',
      title: '',
      issue: '',
      staffOption: '',
      requestedDecision: '',
      feedback: '',
      nextDue: '',
    })
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
              <Link href="/evaluation-2027" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">평가 대시보드</Link>
              <button onClick={() => window.print()} className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-950">출력</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-black text-amber-900">운영 원칙</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            이 화면은 직원 평가자료가 아니라 과장님의 업무보호와 팀 운영방식 정리를 위한 내부관리 도구입니다. 직원 실명 대신 역할명으로 기록하고, 민감한 표현은 사실 중심으로 남깁니다.
          </p>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">기록</p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">미완료</p>
            <p className="mt-2 text-3xl font-black">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-red-600">돌려보냄</p>
            <p className="mt-2 text-3xl font-black">{stats.returned}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-600">추적필요</p>
            <p className="mt-2 text-3xl font-black">{stats.tracking}</p>
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
              <input value={draft.title} onChange={event => setDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="보고 제목" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.issue} onChange={event => setDraft(previous => ({ ...previous, issue: event.target.value }))} placeholder="현재 상황 또는 막힌 지점" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.staffOption} onChange={event => setDraft(previous => ({ ...previous, staffOption: event.target.value }))} placeholder="직원이 제시한 선택지와 추천안. 없으면 돌려보냄으로 기록됩니다." className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.requestedDecision} onChange={event => setDraft(previous => ({ ...previous, requestedDecision: event.target.value }))} placeholder="과장에게 필요한 판단사항" className="min-h-16 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <textarea value={draft.feedback} onChange={event => setDraft(previous => ({ ...previous, feedback: event.target.value }))} placeholder="제시한 피드백 또는 다음 제출 기준" className="min-h-16 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <input type="date" value={draft.nextDue} onChange={event => setDraft(previous => ({ ...previous, nextDue: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
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
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><b>09:30~10:00</b> 긴급 결재·오늘 판단만 처리</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4"><b>10:00~15:30</b> 수시보고는 메모로 남기고 즉시 대면 금지</p>
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4"><b>16:30~17:00</b> 진행상황·내일 준비·추적사항 확인</p>
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
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">일자</th>
                  <th className="p-3">팀</th>
                  <th className="p-3">대상</th>
                  <th className="p-3">유형</th>
                  <th className="p-3">내용</th>
                  <th className="p-3">직원안</th>
                  <th className="p-3">과장 판단</th>
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
                    <td className="max-w-xs p-3">
                      <p className="font-black">{record.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{record.issue || '상황 기록 없음'}</p>
                    </td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.staffOption || '직원안 없음'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.requestedDecision || record.feedback || '판단사항 없음'}</td>
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
                    <td colSpan={10} className="p-8 text-center text-sm text-slate-500">아직 기록이 없습니다. 오늘부터 수시보고가 들어올 때 제목과 직원안을 짧게 남기면 됩니다.</td>
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
