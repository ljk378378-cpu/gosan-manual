'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CRITERIA_SOURCE, evaluationCriteriaDetails } from '@/data/evaluation2027Criteria'
import { supabase, type Evaluation2027Item } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Status = '미착수' | '확인 중' | '충족' | '부분 충족' | '미충족' | '보완 완료'
type Year = 2024 | 2025 | 2026
type Indicator = {
  code: string
  title: string
  area: string
  priority: boolean
  applies: Year[]
  requirement: string
  evidence: string[]
  nextAction: string
}

const YEARS: Year[] = [2024, 2025, 2026]
const STATUSES: Status[] = ['미착수', '확인 중', '충족', '부분 충족', '미충족', '보완 완료']
const STORAGE_KEY = 'cheonggok-evaluation-2027-status-v1'

const indicators: Indicator[] = [
  { code:'A1', title:'시설 안전관리 노력', area:'A. 시설 및 환경', priority:false, applies:YEARS, requirement:'시설 특성에 맞는 안전관리계획, 자체 모의훈련, 예방교육, 안전점검 후 조치, 소방시설 의무 준수를 확인한다.', evidence:['안전관리계획서','연 2회 모의훈련','예방교육','안전점검·조치','소방시설 자료'], nextAction:'연도별 안전계획과 훈련 결과보고를 우선 수집한다.' },
  { code:'A2', title:'시설 편의증진 노력', area:'A. 시설 및 환경', priority:false, applies:YEARS, requirement:'이용자의 시설 접근과 이용 편의를 위한 법정 편의시설 및 개선 노력을 확인한다.', evidence:['편의시설 현황','법정기준 점검','개선공사·조치자료','현장사진'], nextAction:'본관·분관별 편의시설 체크와 최근 개선 내역을 정리한다.' },
  { code:'A3', title:'시설 환경개선 노력', area:'A. 시설 및 환경', priority:false, applies:YEARS, requirement:'쾌적한 이용환경을 위한 위생·청결·공간관리와 환경개선 실적을 확인한다.', evidence:['환경관리 계획','점검표','방역·위생자료','개선 전후 사진'], nextAction:'연도별 환경점검과 후속조치 기록을 연결한다.' },
  { code:'B1', title:'외부자원개발', area:'B. 재정 및 조직운영', priority:true, applies:YEARS, requirement:'① 3년 외부자원개발 비율, ② 2026년 직원 1인당 프로포절 제출건수, ③ 3년 직원 1인당 체결건수를 각각 산정한다.', evidence:['세입결산서','후원금·외부자원금','공고문·신청서','선정공문·협약서','월별 직원 현황'], nextAction:'연도별 결산과 선정사업을 한 목록으로 만든 뒤 세 산식을 분리 계산한다.' },
  { code:'B2', title:'사업비', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'세출결산서상 사업비 비율을 평가기준에 따라 산정하고 제외사업과 중복 예산을 제거한다.', evidence:['세출결산서','사업비 산출표','제외사업 목록'], nextAction:'3년 결산서의 사업비와 총 세출 기준값을 확정한다.' },
  { code:'B3', title:'직원충원률', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'월별 확보 직원 수와 매년 법정 직원 수를 기준에 맞게 산정한다.', evidence:['월별 급여대장','근로계약서','인사기록','연도별 법정인력 기준'], nextAction:'36개월 월별 직원 현황표를 먼저 작성한다.' },
  { code:'B4', title:'직원근속률', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'평가기준에 따른 대상 직원과 근속 직원 수를 연도별 인사자료로 산정한다.', evidence:['직원명부','입·퇴사 기록','인사발령','근로계약'], nextAction:'대상자 포함·제외 기준을 적용한 인사 변동표를 만든다.' },
  { code:'B5', title:'직원채용의 공정성', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'공개채용, 심사절차, 외부위원 참여 등 채용의 공정성과 관련 기록을 확인한다.', evidence:['채용공고','심사표','면접위원 자료','채용결과 공지','인사위원회 기록'], nextAction:'평가기간 내 채용 건을 전수 목록화한다.' },
  { code:'B6', title:'시설장 및 최고중간관리자의 전문성', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'시설장과 최고중간관리자의 자격·경력·교육·대외 전문활동을 확인한다.', evidence:['자격증','경력증명','교육이수','대외활동 자료'], nextAction:'두 직위의 연도별 재직자와 전문성 자료를 분리한다.' },
  { code:'B7', title:'직원의 전문성', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'직원의 자격 및 관련 경력 등 전문성 확보 수준을 평가기준에 맞게 확인한다.', evidence:['직원명부','자격증','경력증명','업무분장'], nextAction:'재직자별 인정 자격과 경력을 표준 양식으로 정리한다.' },
  { code:'B8', title:'직원 역량 강화', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'직원교육 계획·예산·참여시간과 교육결과의 업무 환류를 확인한다.', evidence:['교육계획','교육예산','출장·참가보고','이수증','환류자료'], nextAction:'직원별 연간 교육시간과 교육비를 집계한다.' },
  { code:'B9', title:'직원복지', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'직원 복지제도, 휴가, 포상, 고충지원 등 복지 향상 노력을 확인한다.', evidence:['운영규정','복지제도 계획','시행기록','직원 의견수렴'], nextAction:'규정에만 있고 실행되지 않은 제도와 실제 실적을 구분한다.' },
  { code:'B10', title:'직원의 인권 및 안전보장', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'직원 인권보장, 고충처리, 안전·보건, 폭력 예방 및 보호체계를 확인한다.', evidence:['관련 규정','교육자료','고충처리 기록','안전보건 자료','보호조치'], nextAction:'규정-교육-사건처리 체계가 연결되는지 점검한다.' },
  { code:'B11', title:'직원의 급여수준 향상 노력', area:'B. 재정 및 조직운영', priority:false, applies:YEARS, requirement:'인건비 기준 준수와 급여수준 향상을 위한 수당·보완 노력을 확인한다.', evidence:['급여대장','호봉표','수당규정','예산·결산'], nextAction:'연도별 보건복지부 기준과 실제 급여를 대조한다.' },
  { code:'C1-1', title:'사례관리 실행체계', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'사례관리 인력·업무분장·운영절차·슈퍼비전 등 실행체계를 확인한다.', evidence:['업무분장','사례관리 지침','회의·슈퍼비전','운영계획'], nextAction:'연도별 사례관리 담당자와 운영체계 변동을 확인한다.' },
  { code:'C1-2', title:'사례관리 인력의 전문성', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'사례관리 인력의 경력, 교육, 슈퍼비전 등 전문성 확보를 확인한다.', evidence:['경력자료','교육이수','내·외부 슈퍼비전','사례회의'], nextAction:'담당자별 교육·슈퍼비전 실적을 연간 집계한다.' },
  { code:'C1-3', title:'사례관리 수행의 전문성', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'접수·사정·계획·개입·점검·평가·종결의 전문적 수행과 이용자 참여를 확인한다.', evidence:['사례기록','사정·계획서','점검·평가','종결기록'], nextAction:'표본사례 후보와 단계별 기록 완결성을 점검한다.' },
  { code:'C1-4', title:'사례관리 협력 연계', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'내·외부 자원연계, 통합사례회의, 협력기관과의 공동개입을 확인한다.', evidence:['연계의뢰·회신','통합사례회의','협약·공문','서비스 연계기록'], nextAction:'사례별 의뢰-회신-개입결과가 연결되는지 확인한다.' },
  { code:'C2-1', title:'프로그램 기획의 전문성', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'욕구와 근거에 기반한 목적·목표·대상·성과지표·평가계획의 적절성을 확인한다.', evidence:['욕구조사','사업계획서','성과목표·지표','평가계획'], nextAction:'연도별 제출 후보 프로그램을 먼저 선정한다.' },
  { code:'C2-2', title:'프로그램 수행과정', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'계획에 따른 수행, 참여자 관리, 과정기록, 변경관리, 중간점검을 확인한다.', evidence:['기안·계획','일지','출석부','과정기록','변경기안'], nextAction:'계획 대비 실제 수행과 변경 승인 흔적을 대조한다.' },
  { code:'C2-3', title:'프로그램 평가', area:'C. 프로그램 및 서비스', priority:false, applies:YEARS, requirement:'성과목표에 맞는 평가도구·결과분석·이용자 의견과 다음 사업 환류를 확인한다.', evidence:['결과보고','성과분석','만족도·척도','평가회의','차년도 반영'], nextAction:'수치만 있는 결과와 실제 환류까지 있는 결과를 구분한다.' },
  { code:'C3-1', title:'지역조직화 실행체계', area:'C. 프로그램 및 서비스', priority:true, applies:YEARS, requirement:'인력·업무분장, 담당자 교육, 내·외부 슈퍼비전, 주민조직 지원을 연도별로 확인한다.', evidence:['조직도·업무분장','담당자별 교육 16시간','내부 월 1회·외부 연 2회 슈퍼비전','주민조직 명부·활동자료'], nextAction:'연도별 담당자 변동과 교육·슈퍼비전 횟수부터 통제표로 만든다.' },
  { code:'C3-2', title:'지역조직화 수행의 전문성', area:'C. 프로그램 및 서비스', priority:true, applies:YEARS, requirement:'주민욕구 반영, 주민 의사결정, 10시간 이상 역량강화, 지역·주민 변화가 확인되어야 한다.', evidence:['욕구조사·간담회','주민 의사결정 기록','역량강화 계획·출석','결과보고·인터뷰·변화자료'], nextAction:'주민 의견이 실제 결정과 변경으로 이어진 사업부터 후보로 선정한다.' },
  { code:'C3-3', title:'지역사회 네트워크', area:'C. 프로그램 및 서비스', priority:true, applies:YEARS, requirement:'복지관 개방, 직원 지역활동, 공식 협약기관과의 공동사업 등 네트워크 실적을 확인한다.', evidence:['시설 개방자료','직원 외부활동','협약서','공동사업 계획·결과'], nextAction:'협약서만 있는 기관과 실제 공동사업 수행기관을 구분한다.' },
  { code:'C4', title:'특성화 사업 성과', area:'C. 프로그램 및 서비스', priority:true, applies:[2026], requirement:'기관 특성을 반영한 비일회성 사업의 계획-수행-평가와 구체적인 정량·정성 성과를 제시한다.', evidence:['사업 선정근거','계획서','과정기록','성과분석 평가서','정량·정성 변화자료'], nextAction:'후보사업을 정하고 C영역 다른 제출사업과 중복 여부를 검토한다.' },
  { code:'C5', title:'이용자 참여 프로그램 개발·운영 성과', area:'C. 프로그램 및 서비스', priority:true, applies:[2026], requirement:'주민 참여 개발 프로그램 2개, 연 3회 이상 회의, 기획자의 실제 참여 10% 이상, 평가 환류를 확인한다.', evidence:['프로그램 2개 계획서','개발·운영 회의록','기획·참여 명단','중간·결과평가','환류 기록'], nextAction:'주민의 제안-결정-실행-평가가 남은 프로그램 2개를 우선 탐색한다.' },
  { code:'C6', title:'지역 돌봄의 통합지원(가점)', area:'C. 프로그램 및 서비스', priority:false, applies:[2026], requirement:'통합지원 관련 회의·서비스 제공 노력 또는 지자체·의료기관·민간기관과의 협력체계 1건 이상을 확인한다.', evidence:['회의·간담회','계획·결과보고','협약서','서비스 연계 의뢰서'], nextAction:'2026년 통합돌봄 관련 참여·연계 실적을 전수 검색한다.' },
  { code:'D1', title:'개인정보 및 민감정보의 보호', area:'D. 이용자의 권리', priority:false, applies:YEARS, requirement:'보호 규정, 안전한 파일관리, 직원교육, 사전 동의체계를 확인한다.', evidence:['개인정보 규정','책임자·취급자 지정','보안점검','직원교육','동의서'], nextAction:'현장 보안 5개 요건과 문서 체계를 함께 점검한다.' },
  { code:'D2', title:'학대예방 및 인권보호', area:'D. 이용자의 권리', priority:false, applies:YEARS, requirement:'학대예방·인권보호 규정, 교육, 신고·대응체계와 이용자 안내를 확인한다.', evidence:['관련 규정','직원·이용자 교육','신고체계','예방활동'], nextAction:'교육 대상·횟수와 실제 대응절차를 대조한다.' },
  { code:'D3', title:'고충처리', area:'D. 이용자의 권리', priority:false, applies:YEARS, requirement:'고충처리 절차, 담당·위원회, 접수·처리·회신, 결과 공개 및 개선을 확인한다.', evidence:['고충처리 규정','접수대장','회의록','처리·회신','결과 안내'], nextAction:'연도별 고충 건수와 무고충 시 의견수렴 활동을 확인한다.' },
  { code:'D4', title:'이용자의 자기결정권', area:'D. 이용자의 권리', priority:false, applies:YEARS, requirement:'서비스 선택, 동의, 참여·중단, 정보제공 등 이용자의 자기결정권 보장을 확인한다.', evidence:['이용계약·동의','서비스 안내','선택·변경 기록','이용자 참여자료'], nextAction:'기관 양식과 실제 이용기록에서 선택권이 드러나는지 확인한다.' },
  { code:'D5', title:'이용자의 권익옹호', area:'D. 이용자의 권리', priority:true, applies:[2026], requirement:'별도 권익옹호 체계와 6단계 실천과정, 정보 제공, 개선 노력, 직원 80% 이상 교육을 확인한다.', evidence:['권익옹호 규정·지침','접수-종결 6단계 기록지','가이드·안내자료','옹호·연계·회의 기록','직원교육 자료'], nextAction:'인권·고충처리와 구분되는 규정과 실제 옹호 기록 존재 여부부터 확인한다.' },
  { code:'E1', title:'중장기 발전계획 수립 및 성과', area:'E. 시설운영전반', priority:true, applies:[2026], requirement:'2026년을 포함한 3년 이상 계획이 2026년 3월 이전 수립되어 있고 분석·과제·점검·성과가 연결되어야 한다.', evidence:['중장기 발전계획서','수립일·결재근거','환경·욕구 분석','연차별 실행계획','점검회의','성과자료'], nextAction:'계획서 존재 여부와 수립·결재일을 가장 먼저 확인한다.' },
  { code:'E2', title:'시설장 리더십', area:'E. 시설운영전반', priority:false, applies:[2026], requirement:'시설 운영방향 제시, 조직관리, 소통, 지역사회 역할과 개선 성과를 정성적으로 확인한다.', evidence:['운영계획','직원·이용자 소통','대외활동','개선사례'], nextAction:'시설장 리더십이 드러나는 대표 사례와 근거를 선정한다.' },
  { code:'E3', title:'현장평가 질적 수준 확인', area:'E. 시설운영전반', priority:false, applies:[2026], requirement:'현장평가에서 기관 운영과 서비스의 질적 수준, 설명의 일관성, 자료 신뢰성을 종합 확인한다.', evidence:['영역별 핵심성과','현장 브리핑','자료 인덱스','공간·서비스 현황'], nextAction:'현장 설명 시나리오와 핵심자료 위치표를 준비한다.' },
  { code:'E4', title:'자체평가의 정확성', area:'E. 시설운영전반', priority:false, applies:[2026], requirement:'자체평가 점수와 현장평가 확인 결과의 일치도를 높이고 근거 없는 자체 인정을 방지한다.', evidence:['자체평가표','항목별 근거목록','교차검토 기록'], nextAction:'담당자 1차 판정과 교차검토자 재판정을 분리 운영한다.' },
]

type StatusMap = Record<string, Partial<Record<Year, Status>>>
type EvidenceMap = Record<string, boolean>
type NoteMap = Record<string, string>
type DetailMap = Record<string, {
  owner?: string
  due?: string
  location?: string
  rationale?: string
  missing?: string
}>
type ViewFilter = '전체' | '중요지표' | '미비서류' | '2026신규' | '메모있음'

const EVIDENCE_KEY = 'cheonggok-evaluation-2027-evidence-v1'
const NOTE_KEY = 'cheonggok-evaluation-2027-notes-v1'
const DETAIL_KEY = 'cheonggok-evaluation-2027-details-v1'

function evidenceKey(code: string, year: Year, evidence: string) {
  return `${code}:${year}:${evidence}`
}

function statusTone(status: Status) {
  if (status === '충족' || status === '보완 완료') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === '부분 충족' || status === '확인 중') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (status === '미충족') return 'border-red-200 bg-red-50 text-red-700'
  return 'border-slate-200 bg-white text-slate-700'
}

export default function Evaluation2027Page() {
  const [statuses, setStatuses] = useState<StatusMap>({})
  const [evidenceChecks, setEvidenceChecks] = useState<EvidenceMap>({})
  const [notes, setNotes] = useState<NoteMap>({})
  const [details, setDetails] = useState<DetailMap>({})
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cloudStatus, setCloudStatus] = useState('로컬 저장')
  const [cloudError, setCloudError] = useState('')
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('전체')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('전체')
  const [sourceReady, setSourceReady] = useState(false)

  useEffect(() => {
    loadLocal()
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser.id)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadCloud(sessionUser.id)
      else setCloudStatus('로컬 저장')
    })
    return () => data.subscription.unsubscribe()
  }, [])

  function loadLocal() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setStatuses(JSON.parse(raw))
    const evidenceRaw = localStorage.getItem(EVIDENCE_KEY)
    if (evidenceRaw) setEvidenceChecks(JSON.parse(evidenceRaw))
    const noteRaw = localStorage.getItem(NOTE_KEY)
    if (noteRaw) setNotes(JSON.parse(noteRaw))
    const detailRaw = localStorage.getItem(DETAIL_KEY)
    if (detailRaw) setDetails(JSON.parse(detailRaw))
  }

  async function loadCloud(userId: string) {
    setCloudStatus('클라우드 불러오는 중')
    setCloudError('')
    const { data, error } = await supabase
      .from('evaluation_2027_items')
      .select('*')
      .eq('user_id', userId)
      .order('code')

    if (error) {
      setCloudStatus('로컬 저장')
      setCloudError(`클라우드 저장 준비 필요: ${error.message}`)
      return
    }

    const rows = (data ?? []) as Evaluation2027Item[]
    if (!rows.length) {
      setCloudStatus('클라우드 연결됨 · 저장자료 없음')
      return
    }

    const nextStatuses: StatusMap = {}
    const nextEvidence: EvidenceMap = {}
    const nextNotes: NoteMap = {}
    const nextDetails: DetailMap = {}

    rows.forEach(row => {
      nextStatuses[row.code] = row.status_by_year as Partial<Record<Year, Status>>
      Object.entries(row.evidence_checks ?? {}).forEach(([key, value]) => {
        nextEvidence[`${row.code}:${key}`] = !!value
      })
      nextNotes[row.code] = row.note ?? ''
      nextDetails[row.code] = {
        owner: row.owner ?? '',
        due: row.due ?? '',
        location: row.location ?? '',
        rationale: row.rationale ?? '',
        missing: row.missing ?? '',
      }
    })

    setStatuses(nextStatuses)
    setEvidenceChecks(nextEvidence)
    setNotes(nextNotes)
    setDetails(nextDetails)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStatuses))
    localStorage.setItem(EVIDENCE_KEY, JSON.stringify(nextEvidence))
    localStorage.setItem(NOTE_KEY, JSON.stringify(nextNotes))
    localStorage.setItem(DETAIL_KEY, JSON.stringify(nextDetails))
    setCloudStatus('클라우드 동기화됨')
  }

  async function signIn() {
    if (!email.trim()) return
    setCloudError('')
    setCloudStatus('로그인 메일 발송 중')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    })
    if (error) {
      setCloudStatus('로컬 저장')
      setCloudError(error.message)
    } else {
      setCloudStatus('메일함에서 로그인 링크 확인')
    }
  }

  async function signInWithPassword() {
    if (!email.trim() || !password) return
    setCloudError('')
    setCloudStatus('비밀번호 로그인 중')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      setCloudStatus('로컬 저장')
      setCloudError(error.message)
    } else {
      setPassword('')
      setCloudStatus('클라우드 연결됨')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setCloudStatus('로컬 저장')
  }

  async function uploadLocalToCloud() {
    if (!user) return
    setCloudStatus('로컬 자료 업로드 중')
    for (const item of indicators) {
      await saveCloudItem(item.code, statuses, evidenceChecks, notes, details)
    }
    setCloudStatus('로컬 자료 클라우드 반영됨')
  }

  function itemEvidenceForCloud(code: string, evidenceState: EvidenceMap) {
    const result: Record<string, boolean> = {}
    Object.entries(evidenceState).forEach(([key, value]) => {
      const prefix = `${code}:`
      if (key.startsWith(prefix)) result[key.slice(prefix.length)] = !!value
    })
    return result
  }

  async function saveCloudItem(code: string, nextStatuses: StatusMap, nextEvidence: EvidenceMap, nextNotes: NoteMap, nextDetails: DetailMap) {
    if (!user) return
    const row = nextDetails[code] ?? {}
    setCloudStatus('클라우드 저장 중')
    const { error } = await supabase.from('evaluation_2027_items').upsert({
      user_id: user.id,
      code,
      status_by_year: nextStatuses[code] ?? {},
      evidence_checks: itemEvidenceForCloud(code, nextEvidence),
      note: nextNotes[code] ?? '',
      owner: row.owner ?? '',
      due: row.due || null,
      location: row.location ?? '',
      rationale: row.rationale ?? '',
      missing: row.missing ?? '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,code' })

    if (error) {
      setCloudStatus('로컬 저장')
      setCloudError(`클라우드 저장 실패: ${error.message}`)
    } else {
      setCloudStatus('클라우드 저장됨')
      setCloudError('')
    }
  }

  const updateStatus = (code: string, year: Year, status: Status) => {
    setStatuses(previous => {
      const next = { ...previous, [code]: { ...previous[code], [year]: status } }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      saveCloudItem(code, next, evidenceChecks, notes, details)
      return next
    })
  }

  const toggleEvidence = (code: string, year: Year, evidence: string) => {
    setEvidenceChecks(previous => {
      const key = evidenceKey(code, year, evidence)
      const next = { ...previous, [key]: !previous[key] }
      localStorage.setItem(EVIDENCE_KEY, JSON.stringify(next))
      saveCloudItem(code, statuses, next, notes, details)
      return next
    })
  }

  const updateNote = (code: string, value: string) => {
    setNotes(previous => {
      const next = { ...previous, [code]: value }
      localStorage.setItem(NOTE_KEY, JSON.stringify(next))
      saveCloudItem(code, statuses, evidenceChecks, next, details)
      return next
    })
  }

  const updateDetail = (code: string, key: keyof DetailMap[string], value: string) => {
    setDetails(previous => {
      const next = { ...previous, [code]: { ...previous[code], [key]: value } }
      localStorage.setItem(DETAIL_KEY, JSON.stringify(next))
      saveCloudItem(code, statuses, evidenceChecks, notes, next)
      return next
    })
  }

  const applicableCells = indicators.reduce((sum, item) => sum + item.applies.length, 0)
  const evidenceCells = indicators.reduce((sum, item) => sum + (item.applies.length * item.evidence.length), 0)
  const checkedEvidence = indicators.reduce((sum, item) => sum + item.applies.reduce((yearSum, year) => yearSum + item.evidence.filter(evidence => evidenceChecks[evidenceKey(item.code, year, evidence)]).length, 0), 0)
  const counts = useMemo(() => {
    const result: Record<Status, number> = { '미착수':0, '확인 중':0, '충족':0, '부분 충족':0, '미충족':0, '보완 완료':0 }
    indicators.forEach(item => item.applies.forEach(year => result[statuses[item.code]?.[year] ?? '미착수']++))
    return result
  }, [statuses])
  const completed = counts['충족'] + counts['보완 완료']
  const progress = Math.round((completed / applicableCells) * 100)
  const evidenceProgress = Math.round((checkedEvidence / evidenceCells) * 100)
  const priorityRiskCount = indicators.filter(item => item.priority && item.applies.some(year => {
    const status = statuses[item.code]?.[year] ?? '미착수'
    return status !== '충족' && status !== '보완 완료'
  })).length
  const filtered = indicators.filter(item => {
    const text = `${item.code} ${item.title} ${item.requirement} ${item.evidence.join(' ')} ${item.nextAction}`.toLowerCase()
    const itemTotal = item.applies.length * item.evidence.length
    const itemDone = item.applies.reduce((sum, year) => sum + item.evidence.filter(evidence => evidenceChecks[evidenceKey(item.code, year, evidence)]).length, 0)
    const hasIncompleteStatus = item.applies.some(year => {
      const status = statuses[item.code]?.[year] ?? '미착수'
      return status === '미착수' || status === '확인 중' || status === '부분 충족' || status === '미충족'
    })
    const matchesView =
      viewFilter === '전체' ||
      (viewFilter === '중요지표' && item.priority) ||
      (viewFilter === '미비서류' && (itemDone < itemTotal || hasIncompleteStatus)) ||
      (viewFilter === '2026신규' && item.applies.length === 1 && item.applies[0] === 2026) ||
      (viewFilter === '메모있음' && (!!notes[item.code]?.trim() || !!details[item.code]?.missing?.trim()))
    return matchesView && (area === '전체' || item.area === area) && text.includes(query.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-[#f3f6f4] text-slate-900">
      <header className="border-b border-emerald-950/10 bg-[#123c2c] text-white">
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-bold tracking-[.2em] text-emerald-200">CHEONGGOK · EVALUATION SPECIAL TEAM</p><h1 className="mt-2 text-2xl font-black md:text-3xl">27년 사회복지관 평가 대비 특별반</h1><p className="mt-2 text-sm text-emerald-100">평가기간 2024. 1. 1. ~ 2026. 12. 31. · 현재 전체 미착수</p></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <button onClick={() => window.print()} className="no-print rounded-lg border border-white/30 bg-white px-4 py-2 text-sm font-black text-emerald-950 shadow-sm">점검표 출력</button>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm"><b>전체 준비율 {progress}%</b><div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-black/20"><div className="h-full bg-emerald-300" style={{width:`${progress}%`}} /></div></div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">
        <div className="mb-5 flex gap-2"><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">27년 평가 특별반</button><Link href="/inspection-2026" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700">2026 수성구청 지도점검 →</Link></div>

        <section className={`mb-5 rounded-xl border p-4 ${sourceReady ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="font-black">기준자료 상태: {sourceReady ? '정오표 반영본 확인 표시' : CRITERIA_SOURCE.status}</p><p className="mt-1 text-sm text-slate-600">현재 상세기준: {CRITERIA_SOURCE.title} · 원문 읽기 전용</p><p className="mt-1 text-xs text-slate-500">최종 기준 예정: evaluation_2027/source/2027년_사회복지관_평가지표_260608_정오표반영.pdf</p></div><button onClick={()=>setSourceReady(v=>!v)} className="rounded-lg border border-current px-3 py-2 text-xs font-bold">{sourceReady ? '확인 표시 취소' : '정오표 파일 동기화 후 확인'}</button></div>
        </section>

        <section className="no-print mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="font-black text-slate-900">저장 방식: {cloudStatus}</p>
              <p className="mt-1 text-sm text-slate-600">
                {user ? `${user.email} 계정으로 로그인됨 · 맥/윈도우에서 같은 계정으로 접속하면 이어서 관리 가능` : '로그인 전에는 현재 브라우저에만 저장됩니다.'}
              </p>
              {cloudError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{cloudError}</p>}
            </div>
            {user ? (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => loadCloud(user.id)} className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-black text-emerald-800">클라우드 다시 불러오기</button>
                <button onClick={uploadLocalToCloud} className="rounded-lg bg-emerald-800 px-3 py-2 text-xs font-black text-white">현재 로컬값 올리기</button>
                <button onClick={signOut} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-600">로그아웃</button>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="이메일 입력"
                    className="min-w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="비밀번호"
                    className="min-w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={signInWithPassword} className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-black text-white">비밀번호 로그인</button>
                  <button onClick={signIn} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-black text-emerald-800">로그인 링크 받기</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[['관리 항목',indicators.length],['적용 셀',applicableCells],['지표 진행률',`${progress}%`],['증빙 진행률',`${evidenceProgress}%`],['확인 중',counts['확인 중']],['부분 충족',counts['부분 충족']],['미충족',counts['미충족']],['중요 미완료',priorityRiskCount]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}
        </section>

        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:flex-row md:items-center"><div><p className="font-black text-emerald-950">B8 직원교육시간을 정리하고 있나요?</p><p className="mt-1 text-sm text-emerald-800">교육별 인정·미인정 판정, 직원별 합계, 부족시간과 증빙 누락을 별도 관리할 수 있습니다.</p></div><Link href="/evaluation-2027/b8-training" className="rounded-lg bg-emerald-800 px-4 py-2 text-center text-sm font-black text-white">B8 교육시간 관리 열기</Link></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="지표·인정요건·증빙 검색" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-700"/>
            <select value={area} onChange={e=>setArea(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>전체</option>{[...new Set(indicators.map(i=>i.area))].map(a=><option key={a}>{a}</option>)}</select>
            <select value={viewFilter} onChange={e=>setViewFilter(e.target.value as ViewFilter)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {(['전체','중요지표','미비서류','2026신규','메모있음'] as ViewFilter[]).map(filter => <option key={filter}>{filter}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-sm">
              <thead className="bg-slate-100 text-left text-xs text-slate-600">
                <tr>
                  <th className="p-3">지표</th>
                  <th className="p-3">준비 작업대</th>
                  {YEARS.map(y=><th key={y} className="p-3">{y}</th>)}
                  <th className="p-3">첫 조치</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const itemTotal = item.applies.length * item.evidence.length
                  const itemDone = item.applies.reduce((sum, year) => sum + item.evidence.filter(evidence => evidenceChecks[evidenceKey(item.code, year, evidence)]).length, 0)
                  const itemProgress = itemTotal ? Math.round((itemDone / itemTotal) * 100) : 0
                  return (
                    <tr key={item.code} className="border-t border-slate-100 align-top">
                      <td className="p-4">
                        <span className="text-base font-black text-emerald-800">{item.code}</span>
                        <p className="mt-1 w-48 font-bold">{item.title}</p>
                        <p className="mt-2 text-xs text-slate-500">{item.area}</p>
                        {item.priority&&<span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">중요 지표</span>}
                      </td>
                      <td className="max-w-3xl p-4">
                        <p className="leading-6 text-slate-700">{item.requirement}</p>
                        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black text-slate-700">증빙 준비율 {itemProgress}% · {itemDone}/{itemTotal}</p>
                            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full bg-emerald-600" style={{width:`${itemProgress}%`}} />
                            </div>
                          </div>
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs font-black text-emerald-900">연도별 증빙 체크 열기</summary>
                            <div className="mt-3 grid gap-3 lg:grid-cols-3">
                              {YEARS.map(year => (
                                <div key={year} className={`rounded-lg border p-3 ${item.applies.includes(year) ? 'border-white bg-white' : 'border-slate-200 bg-slate-100 opacity-60'}`}>
                                  <p className="mb-2 text-xs font-black text-slate-700">{year}</p>
                                  {item.applies.includes(year) ? item.evidence.map(evidence => (
                                    <label key={evidence} className="mb-2 flex items-start gap-2 text-xs leading-5 text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={!!evidenceChecks[evidenceKey(item.code, year, evidence)]}
                                        onChange={() => toggleEvidence(item.code, year, evidence)}
                                        className="mt-1"
                                      />
                                      <span>{evidence}</span>
                                    </label>
                                  )) : <p className="text-xs text-slate-400">비적용</p>}
                                </div>
                              ))}
                            </div>
                          </details>
                          <textarea
                            value={notes[item.code] ?? ''}
                            onChange={event => updateNote(item.code, event.target.value)}
                            placeholder="짧은 진행 메모"
                            className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 outline-none focus:border-emerald-700"
                          />
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            <input
                              value={details[item.code]?.owner ?? ''}
                              onChange={event => updateDetail(item.code, 'owner', event.target.value)}
                              placeholder="담당자 / 확인 요청 대상"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-700"
                            />
                            <input
                              type="date"
                              value={details[item.code]?.due ?? ''}
                              onChange={event => updateDetail(item.code, 'due', event.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-700"
                            />
                            <input
                              value={details[item.code]?.location ?? ''}
                              onChange={event => updateDetail(item.code, 'location', event.target.value)}
                              placeholder="파일 위치 / 실물철 위치"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-700 md:col-span-2"
                            />
                            <textarea
                              value={details[item.code]?.rationale ?? ''}
                              onChange={event => updateDetail(item.code, 'rationale', event.target.value)}
                              placeholder="인정 판단 근거"
                              className="min-h-16 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 outline-none focus:border-emerald-700"
                            />
                            <textarea
                              value={details[item.code]?.missing ?? ''}
                              onChange={event => updateDetail(item.code, 'missing', event.target.value)}
                              placeholder="보완 필요사항 / 불인정 위험"
                              className="min-h-16 rounded-lg border border-amber-200 bg-white p-3 text-xs leading-5 outline-none focus:border-amber-600"
                            />
                          </div>
                        </div>
                        <details className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50">
                          <summary className="cursor-pointer px-4 py-3 text-xs font-black text-emerald-900">평가지표 원문 상세기준 펼치기</summary>
                          <div className="border-t border-emerald-200 bg-white p-4">
                            <p className="mb-3 text-xs font-bold text-slate-500">평가목표 · 평가내용 · 배점기준 · 대상기간 · 인정/미인정 범위 · 평가자료 · 참고사항</p>
                            <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-6 text-slate-700">{evaluationCriteriaDetails[item.code] ?? '상세 원문을 확인 중입니다.'}</pre>
                          </div>
                        </details>
                      </td>
                      {YEARS.map(year=><td key={year} className="w-36 p-4">{item.applies.includes(year)?<select aria-label={`${item.code} ${year} 상태`} value={statuses[item.code]?.[year] ?? '미착수'} onChange={e=>updateStatus(item.code,year,e.target.value as Status)} className={`w-full rounded-lg border px-2 py-2 text-xs font-bold ${statusTone(statuses[item.code]?.[year] ?? '미착수')}`}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>:<span className="inline-block rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-400">비적용</span>}</td>)}
                      <td className="w-64 p-4 leading-6 text-amber-900">{item.nextAction}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
        <p className="mt-4 text-xs leading-5 text-slate-500">상태값은 이 브라우저에만 저장됩니다. Google Drive 및 PDF/HWP 원본은 변경하지 않습니다. ‘미착수’는 증빙이 없다는 판정이 아니라 아직 탐색하지 않았다는 뜻입니다.</p>
      </div>
    </main>
  )
}
