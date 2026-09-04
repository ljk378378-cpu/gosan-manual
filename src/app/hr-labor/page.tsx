'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Topic = {
  day: number
  area: string
  title: string
  keyPoint: string
  managerQuestion: string
  evidence: string
}

type LearningRecord = {
  id: string
  date: string
  topic: string
  learned: string
  institutionRule: string
  workApply: string
  question: string
}

const STORAGE_KEY = 'cheonggok-hr-labor-learning-v1'

const topics: Topic[] = [
  { day: 1, area: '채용', title: '공개채용과 채용공정성', keyPoint: '채용공고, 심사기준, 면접위원, 결과공지, 개인정보 관리가 하나의 흐름으로 남아야 함', managerQuestion: '최근 채용 건에서 외부위원과 심사표가 모두 남아 있는가?', evidence: '채용공고, 지원서, 심사표, 면접위원 명단, 채용결과 공지' },
  { day: 2, area: '채용', title: '근로계약과 수습기간', keyPoint: '근로계약서에는 업무, 임금, 근로시간, 휴게, 휴일, 계약기간이 명확해야 함', managerQuestion: '계약직과 정규직의 계약서 양식이 실제 근무조건을 정확히 반영하는가?', evidence: '근로계약서, 임용기안, 인사발령, 업무분장표' },
  { day: 3, area: '인사', title: '인사기록과 개인정보', keyPoint: '인사기록은 필요 최소한으로 수집하고 열람권한과 보관위치를 통제해야 함', managerQuestion: '인사서류가 잠금보관되고 전자파일 접근권한이 제한되어 있는가?', evidence: '인사기록카드, 개인정보 동의서, 보관대장, 접근권한 목록' },
  { day: 4, area: '호봉', title: '경력인정과 호봉획정', keyPoint: '경력인정 기준, 증빙, 호봉획정표, 승인절차가 연결되어야 함', managerQuestion: '호봉 산정 근거가 나중에 설명 가능한 수준으로 남아 있는가?', evidence: '경력증명서, 호봉획정표, 인정기준, 승인기안' },
  { day: 5, area: '복무', title: '근로시간과 휴게시간', keyPoint: '실제 근무시간, 휴게시간, 연장근로가 규정과 출퇴근 기록에 맞아야 함', managerQuestion: '직원들의 실제 근무패턴이 복무규정과 다르게 운영되고 있지 않은가?', evidence: '복무규정, 출퇴근기록, 근무명령, 근무표' },
  { day: 6, area: '복무', title: '시간외근무 명령과 인정', keyPoint: '시간외근무는 사전명령, 실제근무, 결과확인, 지급근거가 모두 필요함', managerQuestion: '시간외근무가 관행적으로 승인되거나 결과확인 없이 지급되고 있지 않은가?', evidence: '시간외명령서, 근무실적, 결과보고, 급여대장' },
  { day: 7, area: '휴가', title: '연차휴가 부여와 사용촉진', keyPoint: '연차 산정, 사용내역, 잔여일수, 사용촉진 절차를 연도별로 관리해야 함', managerQuestion: '직원별 연차 잔여일수와 사용촉진 기록이 설명 가능한가?', evidence: '연차대장, 휴가신청서, 사용촉진 공문, 복무자료' },
  { day: 8, area: '휴가', title: '병가·공가·특별휴가', keyPoint: '기관 규정에 근거한 휴가인지, 증빙이 필요한 휴가인지 구분해야 함', managerQuestion: '관행적으로 승인된 휴가가 규정상 근거를 가지고 있는가?', evidence: '운영규정, 복무규정, 휴가신청서, 증빙서류' },
  { day: 9, area: '임금', title: '임금항목과 지급기준', keyPoint: '기본급, 수당, 시간외, 가족수당 등은 지급기준과 실제 지급자료가 맞아야 함', managerQuestion: '수당 지급 기준과 실제 지급내역이 직원별로 일치하는가?', evidence: '보수규정, 급여대장, 수당 지급근거, 예산서' },
  { day: 10, area: '임금', title: '가족수당 이중수령 확인', keyPoint: '배우자 수령 여부와 가족관계 증빙을 확인해 부당수령 위험을 막아야 함', managerQuestion: '가족수당 지급자별 확인서와 증빙이 최신 상태인가?', evidence: '가족수당 신청서, 가족관계증명, 배우자 수령확인서, 급여대장' },
  { day: 11, area: '퇴직', title: '퇴직금과 퇴직연금', keyPoint: '가입, 적립, 퇴직정산, 1년 미만 처리 기준을 명확히 해야 함', managerQuestion: '퇴직연금 적립과 퇴직자 정산자료가 누락 없이 남아 있는가?', evidence: '퇴직연금 가입자료, 적립내역, 퇴직정산서, 반납자료' },
  { day: 12, area: '사회보험', title: '4대보험 가입과 상실', keyPoint: '입퇴사일, 보수월액, 취득·상실신고, 납부자료가 인사자료와 맞아야 함', managerQuestion: '입퇴사자 신고일과 실제 근무기간이 어긋나지 않는가?', evidence: '4대보험 취득상실신고, 납부확인서, 급여대장, 직원명부' },
  { day: 13, area: '교육', title: '법정교육과 보수교육', keyPoint: '필수교육은 대상자, 이수시기, 이수증, 미이수 사유를 관리해야 함', managerQuestion: '누가 어떤 교육을 아직 이수하지 않았는지 바로 말할 수 있는가?', evidence: '교육계획, 교육명령, 이수증, 미이수자 관리표' },
  { day: 14, area: '고충', title: '직원 고충처리', keyPoint: '상담, 접수, 처리, 회신, 개선조치가 절차대로 남아야 함', managerQuestion: '직원 고충이 비공식 대화로만 사라지고 있지 않은가?', evidence: '고충처리 규정, 접수대장, 회의록, 회신자료' },
  { day: 15, area: '인권', title: '직장 내 괴롭힘 예방', keyPoint: '예방교육, 신고절차, 조사, 보호조치, 재발방지 체계가 필요함', managerQuestion: '관리자로서 부적절한 언행이 발생했을 때 즉시 적용할 절차를 알고 있는가?', evidence: '취업규칙, 예방교육, 신고체계, 조사기록, 보호조치' },
  { day: 16, area: '징계', title: '징계 절차와 소명권', keyPoint: '징계는 사유, 조사, 소명기회, 위원회, 결과통보가 절차적으로 정당해야 함', managerQuestion: '감정적 지적과 공식 징계 절차를 구분하고 있는가?', evidence: '인사규정, 조사자료, 소명안내, 인사위원회 회의록' },
  { day: 17, area: '계약직', title: '기간제 근로자 관리', keyPoint: '계약기간, 갱신기준, 업무범위, 차별처우 위험을 관리해야 함', managerQuestion: '계약직 직원의 업무와 처우가 계약서와 실제 운영에서 일치하는가?', evidence: '근로계약서, 갱신기안, 업무분장, 급여자료' },
  { day: 18, area: '겸직·출장', title: '출장과 외부활동', keyPoint: '출장명령, 목적, 결과보고, 여비정산이 연결되어야 함', managerQuestion: '외부회의 참석이 기관 업무성과와 교육·네트워크 증빙으로 남아 있는가?', evidence: '출장명령서, 결과보고, 여비정산, 참석확인자료' },
  { day: 19, area: '규정', title: '운영규정과 실제 운영 일치', keyPoint: '규정에 적힌 내용과 실제 결재·복무·인사처리가 다르면 점검 리스크가 됨', managerQuestion: '규정은 있으나 실제로 지키지 않는 조항은 무엇인가?', evidence: '운영규정, 신구대조표, 실제 처리문서, 개정기안' },
  { day: 20, area: '평가', title: '27년 평가와 인사노무 연결', keyPoint: '직원교육, 채용공정성, 직원복지, 인권안전, 급여수준은 평가와 직접 연결됨', managerQuestion: '평가 B영역에서 인사노무 자료가 어느 정도 준비되어 있는가?', evidence: '평가지표표, 직원교육자료, 채용자료, 복지제도 실행자료' },
  { day: 21, area: '지도점검', title: '구청 지도점검 인사자료', keyPoint: '종사자 명부, 임면직, 호봉, 가족수당, 급여자료는 점검 핵심자료임', managerQuestion: '9.18 지도점검에서 인사자료를 30초 안에 제시할 수 있는가?', evidence: '지도점검 준비자료, 직원명부, 임면직표, 호봉자료' },
  { day: 22, area: '관리자', title: '관리자의 피드백 기록', keyPoint: '반복실수와 업무지도는 감정이 아니라 사실, 기준, 후속조치로 기록해야 함', managerQuestion: '직원 피드백이 나중에 설명 가능한 업무지도 기록으로 남아 있는가?', evidence: '상담기록, 업무피드백 메모, 재제출 기준, 후속확인표' },
  { day: 23, area: '보안', title: '인사노무 자료의 접근권한', keyPoint: '급여, 인사, 징계, 고충 자료는 접근권한과 공유범위를 엄격히 관리해야 함', managerQuestion: '공유폴더에 민감자료가 과도하게 열려 있지 않은가?', evidence: '권한목록, 보안점검표, 파일 위치표, 개인정보 처리방침' },
  { day: 24, area: '인계', title: '퇴사자 인수인계와 자료회수', keyPoint: '퇴사 전 업무인계, 계정회수, 자료반납, 미완료 업무 확인이 필요함', managerQuestion: '퇴사자 업무와 계정이 남아 조직 리스크가 되지 않는가?', evidence: '인수인계서, 계정회수표, 자료반납확인서, 미완료 업무표' },
  { day: 25, area: '예산', title: '인건비 예산과 집행', keyPoint: '인건비, 수당, 사회보험, 퇴직적립금은 예산과 집행이 연결되어야 함', managerQuestion: '인건비 집행 변동 사유를 설명할 수 있는가?', evidence: '예산서, 급여대장, 4대보험, 퇴직연금, 결산자료' },
  { day: 26, area: '서비스규정', title: '서비스 제공과 직원 역할', keyPoint: '서비스 제공 기준과 직원 업무분장이 맞아야 책임소재가 분명해짐', managerQuestion: '서비스규정에서 직원 역할과 실제 수행기록이 연결되는가?', evidence: '서비스규정, 업무분장, 서비스 기록, 사례회의자료' },
  { day: 27, area: '운영규정', title: '위원회와 의사결정', keyPoint: '운영위원회, 인사위원회 등 위원회 의사결정 절차가 규정과 맞아야 함', managerQuestion: '위원회가 필요한 사안을 내부결재만으로 처리한 적은 없는가?', evidence: '운영규정, 위원회 명단, 회의록, 결과보고' },
  { day: 28, area: '리스크', title: '노무 리스크 우선순위', keyPoint: '모든 것을 한 번에 고치기보다 임금, 시간, 괴롭힘, 개인정보부터 봐야 함', managerQuestion: '우리 기관에서 가장 먼저 점검해야 할 노무 리스크 3개는 무엇인가?', evidence: '위험목록, 점검표, 보완계획, 담당자 확인' },
  { day: 29, area: '사례연습', title: '직원상담 상황연습', keyPoint: '상담은 감정 해소가 아니라 사실확인, 기준제시, 다음 행동합의로 마무리해야 함', managerQuestion: '상담 후 직원이 무엇을 언제까지 해야 하는지 명확히 남는가?', evidence: '상담메모, 과업합의, 제출기한, 후속확인' },
  { day: 30, area: '월간정리', title: '한 달 학습 점검', keyPoint: '학습한 내용을 기관 규정, 평가, 지도점검, 팀 운영과 연결해 보완과제를 정리함', managerQuestion: '이번 달 학습을 통해 실제로 바꿀 업무기준은 무엇인가?', evidence: '학습기록, 보완과제, 규정개정 후보, 교육공유자료' },
]

const sourceCards = [
  { title: '보건복지부 사회복지시설 관리안내', detail: '사회복지시설 종사자 관리, 시설운영, 지도점검의 기본 기준자료' },
  { title: '국가법령정보센터', detail: '근로기준법, 남녀고용평등법, 기간제법, 개인정보보호법 등 최신 법령 확인' },
  { title: '고용노동부 자료', detail: '개정 노동관계법, 행정해석, 정책자료, 사례 중심 교육자료 확인' },
  { title: '우리 기관 규정', detail: '운영규정, 복무규정, 인사규정, 보수규정, 서비스규정과 실제 운영 비교' },
]

function todayDateString() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function todayTopicIndex() {
  const start = new Date('2026-09-07T00:00:00+09:00')
  const today = new Date(`${todayDateString()}T00:00:00+09:00`)
  const diff = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000))
  return diff % topics.length
}

export default function HrLaborPage() {
  const [topicIndex, setTopicIndex] = useState(todayTopicIndex())
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [draft, setDraft] = useState({
    learned: '',
    institutionRule: '',
    workApply: '',
    question: '',
  })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setRecords(JSON.parse(raw))
  }, [])

  const topic = topics[topicIndex]
  const todayRecords = useMemo(() => records.filter(record => record.date === todayDateString()), [records])
  const doneTopics = new Set(records.map(record => record.topic)).size
  const progress = Math.round(doneTopics / topics.length * 100)
  const areaCounts = useMemo(() => {
    const counts = new Map<string, number>()
    records.forEach(record => {
      const found = topics.find(item => item.title === record.topic)
      if (found) counts.set(found.area, (counts.get(found.area) || 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [records])

  const saveRecord = () => {
    if (!draft.learned.trim() && !draft.question.trim()) return
    const record: LearningRecord = {
      id: `${Date.now()}`,
      date: todayDateString(),
      topic: topic.title,
      learned: draft.learned.trim(),
      institutionRule: draft.institutionRule.trim(),
      workApply: draft.workApply.trim(),
      question: draft.question.trim(),
    }
    const next = [record, ...records].slice(0, 300)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDraft({ learned: '', institutionRule: '', workApply: '', question: '' })
  }

  const removeRecord = (id: string) => {
    const next = records.filter(record => record.id !== id)
    setRecords(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const summary = [
    `[${todayDateString()} 인사노무 학습]`,
    `오늘 주제: ${topic.title}`,
    `핵심 기준: ${topic.keyPoint}`,
    `관리자 질문: ${topic.managerQuestion}`,
    `확인자료: ${topic.evidence}`,
    '',
    '오늘 기록',
    todayRecords.length ? todayRecords.map(record => `- ${record.topic}: ${record.learned || record.question}`).join('\n') : '- 아직 기록 없음',
  ].join('\n')

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-950 text-white no-print">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-violet-300">HR & LABOR LEARNING</p>
            <h1 className="text-lg font-bold">인사노무 학습실</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">홈</Link>
            <button onClick={() => window.print()} className="rounded-lg bg-violet-300 px-3 py-2 font-semibold text-slate-950">출력</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-7 text-white shadow-xl">
          <p className="text-sm font-bold text-violet-200">관리자 학습 원칙</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">매일 10분, 법령·지침·우리 규정을<br />실제 결재와 직원관리로 연결</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            최신 기준은 공식자료로 확인하고, 우리 기관 운영규정·서비스규정과 실제 업무가 맞는지 기록합니다. 판단이 필요한 사안은 즉시 결론내리지 않고 확인질문으로 남깁니다.
          </p>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">30일 과정</p>
            <p className="mt-2 text-3xl font-black">{topic.day}<span className="text-base text-slate-400">/30</span></p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-violet-700">학습 진행률</p>
            <p className="mt-2 text-3xl font-black">{progress}%</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-emerald-700">누적 기록</p>
            <p className="mt-2 text-3xl font-black">{records.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-700">오늘 기록</p>
            <p className="mt-2 text-3xl font-black">{todayRecords.length}</p>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_420px]">
          <article className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
            <div className="border-b border-violet-100 bg-violet-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-violet-700">TODAY LESSON</p>
              <h2 className="mt-1 text-2xl font-black">{topic.title}</h2>
              <p className="mt-2 text-sm font-bold text-violet-800">{topic.area} · {topic.day}일차</p>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-500">핵심 기준</p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{topic.keyPoint}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-700">관리자 질문</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-900">{topic.managerQuestion}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-black text-emerald-700">확인자료</p>
                <p className="mt-2 text-sm font-bold leading-6 text-emerald-900">{topic.evidence}</p>
              </div>
            </div>
          </article>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black tracking-[.18em] text-slate-500">DAILY RECORD</p>
              <h2 className="mt-1 text-xl font-black">오늘 학습 기록</h2>
            </div>
            <div className="grid gap-3 p-5">
              <textarea value={draft.learned} onChange={event => setDraft(previous => ({ ...previous, learned: event.target.value }))} placeholder="오늘 이해한 핵심" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.institutionRule} onChange={event => setDraft(previous => ({ ...previous, institutionRule: event.target.value }))} placeholder="우리 기관 규정에서 확인할 위치" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.workApply} onChange={event => setDraft(previous => ({ ...previous, workApply: event.target.value }))} placeholder="실제 업무에 적용할 부분" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <textarea value={draft.question} onChange={event => setDraft(previous => ({ ...previous, question: event.target.value }))} placeholder="노무사·부장·규정에서 확인할 질문" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-violet-700" />
              <button onClick={saveRecord} className="rounded-lg bg-violet-800 px-4 py-3 text-sm font-black text-white">학습 기록 저장</button>
            </div>
          </aside>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">30일 학습 커리큘럼</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {topics.map((item, index) => (
                <button key={item.day} onClick={() => setTopicIndex(index)} className={`rounded-xl border p-3 text-left text-sm transition ${index === topicIndex ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:border-violet-200'}`}>
                  <p className="text-xs font-black text-slate-500">{item.day}일차 · {item.area}</p>
                  <p className="mt-1 font-black text-slate-900">{item.title}</p>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">기준자료</h2>
            <div className="mt-4 space-y-3">
              {sourceCards.map(card => (
                <div key={card.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">{card.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{card.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-black text-red-800">주의</p>
              <p className="mt-1 text-xs leading-5 text-red-700">법적 판단이 필요한 사안은 이 화면의 학습기록만으로 확정하지 않고, 최신 법령·지침 또는 노무사 확인을 거칩니다.</p>
            </div>
          </aside>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">오늘 요약</h2>
              <button onClick={() => navigator.clipboard.writeText(summary)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white">요약 복사</button>
            </div>
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{summary}</pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">학습 분포</h2>
            <div className="mt-4 space-y-2">
              {areaCounts.length ? areaCounts.map(([area, count]) => (
                <div key={area} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex justify-between text-sm font-bold"><span>{area}</span><span>{count}건</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, count * 20)}%` }} /></div>
                </div>
              )) : <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">아직 학습기록이 없습니다.</p>}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-black">최근 학습 기록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">일자</th>
                  <th className="p-3">주제</th>
                  <th className="p-3">핵심 이해</th>
                  <th className="p-3">규정 위치</th>
                  <th className="p-3">업무 적용</th>
                  <th className="p-3">확인질문</th>
                  <th className="p-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {records.length ? records.map(record => (
                  <tr key={record.id} className="border-t border-slate-100 align-top">
                    <td className="p-3 text-xs font-bold text-slate-500">{record.date}</td>
                    <td className="p-3 font-black">{record.topic}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.learned || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.institutionRule || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-slate-600">{record.workApply || '-'}</td>
                    <td className="max-w-xs p-3 text-xs leading-5 text-amber-700">{record.question || '-'}</td>
                    <td className="p-3"><button onClick={() => removeRecord(record.id)} className="text-xs font-bold text-slate-400 hover:text-red-600">삭제</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">아직 기록이 없습니다. 오늘 주제를 10분만 보고 첫 기록을 남기면 됩니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
