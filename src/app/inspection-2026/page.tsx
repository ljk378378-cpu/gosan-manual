'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Status = '미착수' | '진행중' | '확인필요' | '완료'
type Item = {
  id: string
  group: string
  title: string
  evidence: string
  owner: string
  priority: '긴급' | '중요' | '일반'
  source?: string
}

type DetailGuide = { check: string; evidence: string; warning?: string }

const STATUS: Status[] = ['미착수', '진행중', '확인필요', '완료']
const KEY = 'cheonggok-inspection-2026-v1'

const detailGuides: Record<string, DetailGuide[]> = {
  F1: [
    { check:'시설 명칭·주소·시설장·운영주체가 모든 증명서에 동일한가', evidence:'시설신고증, 사업자등록증, 고유번호증, 법인허가증', warning:'시설장 변경 후 신고증이나 고유번호증이 미변경된 사례' },
    { check:'건축물 용도와 실제 사용하는 공간이 일치하는가', evidence:'건축물대장, 토지대장, 시설 평면도·배치도, 임대차 또는 소유 증빙' },
    { check:'시설설치 기준과 종사자 배치기준을 충족하는가', evidence:'시설현황, 연면적 산출, 종사자 정·현원표' },
  ],
  F2: [
    { check:'현행 법령과 2026년 지침을 반영한 최신 규정인가', evidence:'운영규정 원본, 개정 신구대조표, 관련 지침 대조표' },
    { check:'규정 개정에 필요한 내부결재와 법인 승인 절차가 남아 있는가', evidence:'개정 기안, 운영위원회 보고, 이사회 의결 또는 법인 승인 문서' },
    { check:'규정 내용과 실제 업무처리가 일치하는가', evidence:'복무·출장·회계·인사 표본서류', warning:'규정은 있으나 실제 결재·처리가 다른 경우' },
  ],
  F3: [
    { check:'위원이 5명 이상 15명 이하이고 자격별 구성이 적정한가', evidence:'위원 명단, 자격구분, 위촉장, 개인정보 동의' },
    { check:'법인 임원·친인척 등 특수관계 여부를 확인했는가', evidence:'특수관계 확인서, 법인 임원 명단 대조' },
    { check:'회의 개최·성원·의결·서명이 모두 확인되는가', evidence:'소집공문, 참석부, 회의록, 회의자료, 결과보고' },
    { check:'회의 결과를 공개하고 관할기관에 보고했는가', evidence:'공개 화면 캡처, 게시물, 구청 보고 공문' },
  ],
  F4: [
    { check:'법정 비치서류 9종이 현장에서 즉시 제시 가능한가', evidence:'비치서류 목록표와 실제 원본철' },
    { check:'명부·상담기록 등 개인정보 문서는 잠금 보관하는가', evidence:'문서보관 위치표, 잠금장치 현장 확인', warning:'책상·공용공간 개인정보 노출' },
    { check:'운영계획과 예산·결산서가 최신 연도까지 연결되는가', evidence:'2024~2026 운영계획, 예산·추경·결산' },
  ],
  F5: [
    { check:'물품관리자와 물품출납원이 문서로 지정되어 있는가', evidence:'지정 기안·발령, 업무분장표' },
    { check:'연 1회 이상 재물조사를 하고 차이를 조치했는가', evidence:'2024·2025 재물조사 계획·조사표·결과보고·조치결과', warning:'조사표만 있고 결과보고·차이조정이 없는 경우' },
    { check:'비품 실물의 관리번호와 대장 정보가 일치하는가', evidence:'비품관리대장, 표본 실사 사진·목록' },
    { check:'불용 결정·매각·폐기·매각대금 세입처리가 연결되는가', evidence:'불용결정서, 사진, 폐기·매각 증빙, 입금결의' },
    { check:'후원물품이 물품대장과 후원물품대장에 모두 반영됐는가', evidence:'후원물품 수입·사용대장, 비품대장 교차표' },
  ],
  F6: [
    { check:'차량 소유자·등록번호·용도가 현황표와 일치하는가', evidence:'자동차등록증, 차량현황표' },
    { check:'보험·정기검사 유효기간이 점검일 현재 유효한가', evidence:'보험증권, 자동차검사 결과' },
    { check:'운행 목적·거리·운전자·유류 사용량이 합리적으로 연결되는가', evidence:'운행일지, 주유영수증, 유류대장', warning:'휴일·출장·운행기록 없는 주유' },
    { check:'정비·수리의 승인과 검수 증빙이 있는가', evidence:'수리 기안, 견적서, 정비명세서, 카드전표' },
  ],
  D1: [
    { check:'시설 명칭이 부기된 후원금 전용계좌를 사용하는가', evidence:'휴면 포함 전체 계좌목록, 통장사본, 계좌 용도표', warning:'일반 자부담·보조금 계좌와 혼용' },
    { check:'지정·비지정 후원금을 접수 단계부터 구분하는가', evidence:'기탁서, 후원신청서, 수입결의서, 후원자관리 화면' },
    { check:'모든 후원금·품에 영수증을 발급하고 발급대장을 관리하는가', evidence:'영수증 발급대장, 영수증 표본, 국세청 연계자료', warning:'미발급 시 과태료 대상' },
    { check:'후원물품의 수량·평가액·배분처가 추적 가능한가', evidence:'후원물품 수입대장, 사용대장, 수령증, 배분사진' },
  ],
  D2: [
    { check:'후원자에게 연 1회 이상 수입·사용내역을 통보했는가', evidence:'우편·이메일·문자 발송대장, 발송물 표본' },
    { check:'후원금 수입·사용결과를 관할기관에 보고했는가', evidence:'시군구 보고 공문, 사회복지시설정보시스템 보고 화면' },
    { check:'홈페이지와 시설 게시판 양쪽에 공개했는가', evidence:'URL·게시 화면 캡처, 현장 게시 사진, 게시 시작·종료일', warning:'한 곳에만 공개하거나 공개기간 증빙이 없는 경우' },
    { check:'공개자료에서 후원자 개인정보를 제거했는가', evidence:'실제 공개본, 개인정보 마스킹 확인표' },
    { check:'과도한 이월금이 있다면 사유와 사용계획이 있는가', evidence:'이월금 산출표, 사용계획 기안, 차년도 예산 반영' },
  ],
  D3: [
    { check:'지정후원금이 기탁자가 지정한 목적·대상·기간에 사용됐는가', evidence:'기탁서-수입결의-지출결의-결과보고 연결표', warning:'목적 변경 시 사전 동의 근거 필요' },
    { check:'비지정후원금의 직접비·간접비 사용기준을 지켰는가', evidence:'비지정후원금 사용명세, 계정별 분류표, 총계정원장' },
    { check:'업무추진비 등 제한 항목의 지출 근거와 한도를 확인했는가', evidence:'지출결의, 참석자·목적, 비지정후원금 한도 산출표' },
    { check:'후원금을 보조금·자부담·사회보험료와 혼용하지 않았는가', evidence:'계좌별 원장, 통장 거래내역, 계정과목 대조표' },
    { check:'반환·목적변경·잔액처리가 문서로 남아 있는가', evidence:'후원자 동의, 반환결의, 입금확인, 잔액 사용계획' },
  ],
  D4: [
    { check:'2024~2026 사업계획과 예산이 서로 일치하는가', evidence:'사업계획서, 예산서, 세부 산출근거' },
    { check:'계획 변경은 집행 전에 승인받았는가', evidence:'변경기안, 변경예산, 승인 공문', warning:'집행 후 사후결재' },
    { check:'실적·참여자·지출·결과보고 수치가 일치하는가', evidence:'실적서, 출석부, 일지, 결과보고, 총계정원장 교차표' },
  ],
  D5: [
    { check:'교부 목적과 승인된 사업계획대로 집행했는가', evidence:'신청서, 교부결정, 사업계획, 정산보고' },
    { check:'계약·구매·검수 절차와 자부담 출처가 적정한가', evidence:'계약서, 비교견적, 검수조서, 자부담 통장내역' },
    { check:'완료 물품·시설을 자산에 등재했는가', evidence:'비품대장, 자산관리대장, 현장사진' },
    { check:'하자보증과 정기 하자검사·보수를 이행했는가', evidence:'하자보증서, 하자검사조서, 보수 요청·완료자료', warning:'공사 완료 후 하자관리 누락' },
  ],
}

const items: Item[] = [
  { id:'S1', group:'사전 제출', title:'2026 지도점검 준비자료 작성', evidence:'일반현황, 직원현황, 종사자 명부, 임·면직, 가족수당, 회계현황 전체', owner:'총괄', priority:'긴급', source:'2026 붙임1' },
  { id:'S2', group:'사전 제출', title:'세입·세출결산서 내려받기', evidence:'2024.7~2026.6, 사회복지시설정보시스템 원본 엑셀', owner:'회계', priority:'긴급', source:'2026 계획' },
  { id:'S3', group:'사전 제출', title:'총계정원장 내려받기', evidence:'계정별 시트 분리 금지, 하나의 시트로 제출', owner:'회계', priority:'긴급', source:'2025·2026 공통' },
  { id:'S4', group:'사전 제출', title:'현금출납부 내려받기', evidence:'2024.7~2026.6 시스템 원본 엑셀', owner:'회계', priority:'긴급', source:'2026 계획' },
  { id:'F1', group:'시설 운영', title:'시설 기본 신고·등록 서류', evidence:'시설신고증, 사업자등록증, 고유번호증, 건축물대장, 평면도', owner:'총무', priority:'중요' },
  { id:'F2', group:'시설 운영', title:'운영규정 최신본과 개정 이력', evidence:'운영규정, 제·개정 결재, 법인 승인·이사회 근거', owner:'총무', priority:'중요' },
  { id:'F3', group:'시설 운영', title:'운영위원회 구성과 회의', evidence:'위원 명단·위촉, 분기별 회의록, 결과 보고·공개 자료', owner:'총무', priority:'중요' },
  { id:'F4', group:'시설 운영', title:'법정 비치서류 9종 점검', evidence:'정관·허가증·신고증·명부·상담기록·운영계획·예결산·후원대장·건축물대장', owner:'총무', priority:'중요' },
  { id:'F5', group:'시설 운영', title:'물품 및 재물조사', evidence:'물품관리자·출납원 지정, 연 1회 재물조사, 비품대장, 불용품 처리', owner:'회계', priority:'중요' },
  { id:'F6', group:'시설 운영', title:'차량 관리', evidence:'등록증, 보험, 차량운행일지, 유류·정비 증빙, 차량현황표', owner:'총무', priority:'일반', source:'2025 실제 제출자료에 등록증 있음' },
  { id:'H1', group:'종사자 관리', title:'종사자 명부와 인사기록 대조', evidence:'직위·직급·호봉·입사일·복지관 발령일·자격·경력 일치', owner:'인사', priority:'중요' },
  { id:'H2', group:'종사자 관리', title:'임용·면직 전수표', evidence:'2024.7~2026.6 임면직, 전보, 근무기간, 사유, 정규·계약 구분', owner:'인사', priority:'중요' },
  { id:'H3', group:'종사자 관리', title:'채용 공정성 자료', evidence:'공개공고, 지원서, 심사표, 외부위원, 인사위원회 회의록, 결과공지', owner:'인사', priority:'중요' },
  { id:'H4', group:'종사자 관리', title:'호봉책정·승급 근거', evidence:'2025~2026.6 호봉획정표, 경력증명, 인정기준, 승급보고', owner:'인사', priority:'긴급' },
  { id:'H5', group:'종사자 관리', title:'가족수당 이중수령 확인', evidence:'월별 지급액, 배우자 수령 여부 확인서, 가족관계 증빙', owner:'인사', priority:'긴급', source:'2026 양식에서 별도 표 신설' },
  { id:'H6', group:'종사자 관리', title:'급여·수당·시간외근무', evidence:'2025~2026.6 급여명세, 수당 근거, 시간외 명령·실적·지급 대조', owner:'인사', priority:'중요' },
  { id:'H7', group:'종사자 관리', title:'사회보험·퇴직연금', evidence:'가입자명부, 납부확인, 퇴직연금 적립, 1년 미만 퇴직적립금 반납', owner:'회계', priority:'중요' },
  { id:'H8', group:'종사자 관리', title:'법정·보수교육', evidence:'교육계획, 명령, 수료증, 보수교육 및 인권교육 이수', owner:'인사', priority:'일반' },
  { id:'A1', group:'회계·계약', title:'예산·결산 절차', evidence:'예산서·추경·결산서, 운영위원회 보고, 법인 이사회 의결, 구청 제출', owner:'회계', priority:'중요' },
  { id:'A2', group:'회계·계약', title:'수입·지출 증빙 전수 점검', evidence:'결의서, 세금계산서·영수증, 견적·검수, 계좌이체, 결재일 순서', owner:'회계', priority:'긴급' },
  { id:'A3', group:'회계·계약', title:'통장·카드 현황 및 실물', evidence:'용도별 계좌, 보조금 전용카드, 카드발급대장, 보유통장 정리 완료', owner:'회계', priority:'중요' },
  { id:'A4', group:'회계·계약', title:'계약 및 구매 절차', evidence:'비교견적, 계약서, 수의계약 사유, 검수, 계약대장, 이해충돌 여부', owner:'회계', priority:'중요' },
  { id:'A5', group:'회계·계약', title:'보조금 정산 대조', evidence:'2024·2025 총사업비·보조금·자부담·집행액·잔액과 반납 근거', owner:'회계', priority:'긴급' },
  { id:'A6', group:'회계·계약', title:'보험 가입 현황', evidence:'2025·2026 재정보증·배상책임·화재 등 증권, 기간, 한도, 보험료', owner:'회계', priority:'일반' },
  { id:'D1', group:'후원금·사업', title:'후원금 전용계좌와 영수증', evidence:'휴면 포함 통장목록, 지정·비지정 구분, 영수증 발급대장', owner:'후원', priority:'중요' },
  { id:'D2', group:'후원금·사업', title:'후원금 사용 통보·공개', evidence:'연 1회 후원자 통보, 결과보고, 홈페이지·게시판 공개 및 기간 증빙', owner:'후원', priority:'긴급' },
  { id:'D3', group:'후원금·사업', title:'지정·비지정 목적 사용', evidence:'기탁서, 지출결의, 비지정후원금 직접·간접비 기준, 후원물품대장', owner:'후원', priority:'긴급' },
  { id:'D4', group:'후원금·사업', title:'사업계획과 실적', evidence:'2024~2026 사업계획서·실적서, 계획 대비 변경승인·결과보고', owner:'사업', priority:'일반' },
  { id:'D5', group:'후원금·사업', title:'기능보강사업', evidence:'신청·교부·계약·검수·정산, 목적사용, 하자검사·보수, 자산등재', owner:'시설', priority:'중요' },
  { id:'Q1', group:'안전·현장', title:'정기·수시 안전점검', evidence:'점검표, 구청 제출, 보완요구와 완료사진·결재', owner:'시설', priority:'긴급' },
  { id:'Q2', group:'안전·현장', title:'소방·전기·가스·승강기', evidence:'법정검사, 소방계획·훈련, 교육, 지적사항 조치', owner:'시설', priority:'중요' },
  { id:'Q3', group:'안전·현장', title:'현장 동선 사전 점검', evidence:'간판·게시물·진정함·소화기·비상구·개인정보 노출·창고 정리', owner:'총괄', priority:'중요' },
  { id:'Q4', group:'안전·현장', title:'인터뷰 답변과 자료 위치표', evidence:'항목별 담당자, 30초 설명, 원본철·전자폴더 위치, 즉시 제시 가능 여부', owner:'총괄', priority:'중요' },
]

const groups = [...new Set(items.map(i => i.group))]

export default function Inspection2026Page() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [detailChecks, setDetailChecks] = useState<Record<string, boolean>>({})
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [group, setGroup] = useState('전체')
  const [query, setQuery] = useState('')
  const [riskOnly, setRiskOnly] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
      setStatuses(saved.statuses || {})
      setNotes(saved.notes || {})
      setDetailChecks(saved.detailChecks || {})
    } catch { /* ignore malformed local data */ }
  }, [])

  useEffect(() => {
    if (Object.keys(statuses).length || Object.keys(notes).length || Object.keys(detailChecks).length) {
      localStorage.setItem(KEY, JSON.stringify({ statuses, notes, detailChecks }))
    }
  }, [statuses, notes, detailChecks])

  const filtered = useMemo(() => items.filter(item => {
    const text = `${item.title} ${item.evidence} ${item.owner}`.toLowerCase()
    return (group === '전체' || item.group === group) && (!riskOnly || item.priority === '긴급') && text.includes(query.toLowerCase())
  }), [group, query, riskOnly])

  const done = items.filter(i => statuses[i.id] === '완료').length
  const checking = items.filter(i => statuses[i.id] === '확인필요').length
  const percent = Math.round(done / items.length * 100)

  const setStatus = (id: string, value: Status) => setStatuses(prev => ({ ...prev, [id]: value }))

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-950 text-white no-print">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold tracking-[.18em] text-cyan-300">청곡종합사회복지관</p>
            <h1 className="text-lg font-bold">2026 구청 지도점검 준비실</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <Link href="/evaluation-2027" className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10">← 27년 평가</Link>
            <button onClick={() => window.print()} className="rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-950">출력</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7">
        <section className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-7 text-white shadow-xl">
          <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-bold text-red-200">점검확정일 2026. 9. 18.</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-200">사전제출기한 2026. 7. 30.</span>
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight">자료를 찾는 화면이 아니라,<br/>점검관에게 바로 보여주는 준비 화면</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">점검 대상은 2024년 7월부터 2026년 6월까지입니다. 2025년 실제 제출자료를 재사용하되, 빠진 2024년 7월과 2025년 8월 이후 자료를 반드시 이어 붙이세요.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-end justify-between"><span className="text-sm text-slate-300">전체 준비율</span><strong className="text-4xl text-cyan-300">{percent}%</strong></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{width:`${percent}%`}} /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div><b className="block text-xl">{items.length}</b>전체</div><div><b className="block text-xl text-emerald-300">{done}</b>완료</div><div><b className="block text-xl text-amber-300">{checking}</b>확인필요</div></div>
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-bold text-red-600">가장 먼저</p><p className="mt-1 font-bold">4개 사전 제출파일 완성</p><p className="mt-1 text-xs leading-5 text-red-800">준비자료 + 결산서 + 총계정원장(1시트) + 현금출납부</p></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">2025 자료 재사용</p><p className="mt-1 font-bold">작년 제출 묶음을 기준점으로</p><p className="mt-1 text-xs leading-5 text-amber-800">2024.8~2025.7 자료는 보유 확인. 올해 범위에 맞춰 앞뒤 기간 보완</p></div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-bold text-cyan-700">올해 강화</p><p className="mt-1 font-bold">가족수당·현장 비치·자료 위치</p><p className="mt-1 text-xs leading-5 text-cyan-900">배우자 이중수령, 호봉·채용, 통장·카드, 재물조사를 별도 통제</p></div>
        </section>

        <section className="mb-4 rounded-2xl border bg-white p-4 shadow-sm no-print">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {['전체', ...groups].map(g => <button key={g} onClick={() => setGroup(g)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${group === g ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{g}</button>)}
            </div>
            <div className="flex flex-1 gap-2 lg:justify-end">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="서류·항목 검색" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm lg:max-w-xs" />
              <button onClick={()=>setRiskOnly(v=>!v)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold ${riskOnly ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'}`}>긴급만</button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filtered.map(item => {
            const status = statuses[item.id] || '미착수'
            const guides = detailGuides[item.id] || []
            const guideDone = guides.filter((_, index) => detailChecks[`${item.id}:${index}`]).length
            return <article key={item.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${item.priority === '긴급' ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{item.group}</span><span className={`text-[11px] font-bold ${item.priority === '긴급' ? 'text-red-600' : item.priority === '중요' ? 'text-amber-600' : 'text-slate-400'}`}>{item.priority}</span>{item.source && <span className="text-[11px] text-cyan-700">근거: {item.source}</span>}</div>
                  <h3 className="mt-2 font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600"><b className="text-slate-800">확인 증빙</b> · {item.evidence}</p>
                  {guides.length > 0 && <button onClick={()=>setOpenItems(p=>({...p,[item.id]:!p[item.id]}))} className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 no-print">세부 점검 {guideDone}/{guides.length} {openItems[item.id] ? '접기 ↑' : '펼치기 ↓'}</button>}
                  {guides.length > 0 && openItems[item.id] && <div className="mt-3 space-y-2 rounded-xl border border-cyan-100 bg-cyan-50/40 p-3">
                    {guides.map((guide,index) => { const key=`${item.id}:${index}`; return <label key={key} className="flex cursor-pointer gap-3 rounded-lg border bg-white p-3">
                      <input type="checkbox" checked={!!detailChecks[key]} onChange={()=>setDetailChecks(p=>({...p,[key]:!p[key]}))} className="mt-1 h-4 w-4 accent-cyan-700" />
                      <span className="min-w-0"><b className="block text-sm text-slate-800">{guide.check}</b><span className="mt-1 block text-xs leading-5 text-slate-600"><b className="text-cyan-800">필수 증빙</b> · {guide.evidence}</span>{guide.warning && <span className="mt-1 block text-xs font-semibold leading-5 text-red-600">주의 · {guide.warning}</span>}</span>
                    </label>})}
                  </div>}
                  <div className="mt-3 flex items-center gap-2 no-print"><span className="text-xs font-bold text-slate-400">담당 {item.owner}</span><input value={notes[item.id] || ''} onChange={e=>setNotes(p=>({...p,[item.id]:e.target.value}))} placeholder="파일 위치·부족자료·조치 메모" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" /></div>
                  {notes[item.id] && <p className="mt-2 hidden text-xs text-slate-700 print:block">메모: {notes[item.id]}</p>}
                </div>
                <div className="flex items-center lg:justify-end">
                  <select value={status} onChange={e=>setStatus(item.id,e.target.value as Status)} className={`w-full rounded-xl border px-3 py-2 text-sm font-bold ${status === '완료' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === '확인필요' ? 'border-amber-200 bg-amber-50 text-amber-700' : status === '진행중' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{STATUS.map(s=><option key={s}>{s}</option>)}</select>
                </div>
              </div>
            </article>
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
          <h3 className="font-bold text-slate-900">검토한 원자료</h3>
          <p className="mt-2">2026 지도·점검 계획 및 붙임, 2026 준비자료 HWPX, 사회복지시설 점검 체크리스트, 사회복지법인·시설 현지조사 매뉴얼, 2025 지도·점검 계획·통보문, 2025 청곡복지관 실제 사전자료와 회계 제출 묶음.</p>
          <p className="mt-2 text-xs text-slate-400">체크 상태와 메모는 현재 브라우저에 자동 저장됩니다. 개인정보가 포함된 원본은 화면에 올리지 말고 파일 위치만 기록하세요.</p>
        </section>
      </div>
    </main>
  )
}
