'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import ProgramOperations from '@/components/ProgramOperations'
import { supabase } from '@/lib/supabase'

type ProgramStatus = '진행중' | '점검필요' | '완료' | '보류'
type ProgramPriority = '높음' | '보통' | '낮음'
type DocumentStatus = '확인필요' | '초안' | '검토중' | '보완필요' | '확인완료'
type LogType = '진행' | '결정' | '이슈' | '회의' | '증빙확인'

type ProgramRecord = {
  id: string
  title: string
  team: string
  owner: string
  driveUrl: string
  period: string
  status: ProgramStatus
  priority: ProgramPriority
  risk: string
  nextAction: string
  memo: string
}

type ProgramDocument = {
  id: string
  programId: string
  stage: string
  title: string
  status: DocumentStatus
  driveUrl: string
  fileType: string
  note: string
}

type ProgramLog = {
  id: string
  programId: string
  date: string
  logType: LogType
  title: string
  content: string
  decision: string
  nextAction: string
}

type ProgramRow = {
  id: string
  title: string
  team: string
  owner: string
  drive_url: string
  period: string
  status: ProgramStatus
  priority: ProgramPriority
  risk: string
  next_action: string
  memo: string
}

type DocumentRow = {
  id: string
  program_id: string
  stage: string
  title: string
  status: DocumentStatus
  drive_url: string
  file_type: string
  note: string
}

type LogRow = {
  id: string
  program_id: string
  log_date: string
  log_type: LogType
  title: string
  content: string
  decision: string
  next_action: string
}

const programsKey = 'cheonggok-work-programs-v1'
const documentsKey = 'cheonggok-work-program-documents-v1'
const logsKey = 'cheonggok-work-program-logs-v1'

const statusOptions: DocumentStatus[] = ['확인필요', '초안', '검토중', '보완필요', '확인완료']
const logTypes: LogType[] = ['진행', '결정', '이슈', '회의', '증빙확인']

const lifeCouponFindings = [
  {
    title: '사업 구조',
    desc: '은둔·고립청년 10명을 대상으로 생활쿠폰, 관계형성, 일상회복, 사전·사후척도검사를 연결한 구조가 확인됩니다.',
    tone: 'border-teal-200 bg-teal-50 text-teal-950',
  },
  {
    title: '성과측정',
    desc: '계획서에는 HQ-25 사전·사후검사가 2026년 5월과 11월로 적혀 있으나, 해당 폴더는 현재 비어 있어 우선 보완 확인이 필요합니다.',
    tone: 'border-amber-200 bg-amber-50 text-amber-950',
  },
  {
    title: '쿠폰 핵심증빙',
    desc: '계획서상 청년안심쿠폰은 총 13회 발행, 40,000원 단가, 발행대장·실시기안·결과보고서가 모니터링 자료로 제시됩니다.',
    tone: 'border-indigo-200 bg-indigo-50 text-indigo-950',
  },
  {
    title: '개인정보 주의',
    desc: '기안문에 개인정보 포함 주의 문구가 있고 신청서·선정명단·발행대장에는 민감정보가 포함될 수 있어 원문 공유와 AI 입력을 제한해야 합니다.',
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
  },
]

const lifeCouponSessionChecks = [
  {
    program: '청년안심쿠폰',
    round: '1회기',
    folder: '발행대장',
    evidence: '발행대장 HWP 확인',
    status: 'PDF 변환필요',
    note: '1인 40,000원 지급 기준과 수령 확인을 개인정보 가림 처리 후 점검해야 합니다.',
  },
  {
    program: '청년안심쿠폰',
    round: '2회기',
    folder: '발행대장',
    evidence: '발행대장 HWP 확인',
    status: 'PDF 변환필요',
    note: '작은만남 2회기 일지에는 10명 전원 쿠폰 지급 내용이 확인됩니다.',
  },
  {
    program: '청년안심쿠폰',
    round: '3회기',
    folder: '발행대장',
    evidence: '발행대장 HWP 확인',
    status: 'PDF 변환필요',
    note: '작은만남 3회기 기록지와 사진 폴더가 있어 활동 증빙 연결 가능성이 높습니다.',
  },
  {
    program: '청년안심쿠폰',
    round: '4회기',
    folder: '발행대장/활동일지',
    evidence: '발행대장 HWP 중복 위치 확인',
    status: '정리필요',
    note: '발행대장 4회기가 발행대장 폴더와 활동일지 폴더 양쪽에 보여 중복 여부 확인이 필요합니다.',
  },
  {
    program: '청년안심쿠폰',
    round: '5회기',
    folder: '발행대장',
    evidence: '발행대장 HWP 확인',
    status: 'PDF 변환필요',
    note: '회기별 결과보고서와 지급대장 연결 여부를 확인해야 합니다.',
  },
  {
    program: '청년안심쿠폰',
    round: '6회기',
    folder: '발행대장',
    evidence: '발행대장 HWP 확인',
    status: 'PDF 변환필요',
    note: '회기별 결과보고서와 지급대장 연결 여부를 확인해야 합니다.',
  },
  {
    program: '작은만남',
    round: '1회기',
    folder: '활동일지',
    evidence: '일지 HWP 확인',
    status: 'PDF 변환필요',
    note: '활동일지 원문이 HWP라 분석 전 PDF/HWPX 변환이 필요합니다.',
  },
  {
    program: '작은만남',
    round: '2회기',
    folder: '활동일지',
    evidence: '일지 PDF 확인',
    status: '내용확인',
    note: '2026.6.18.~6.19. 영화감상, 기록지 작성, 10명 전원 미션 완료, 2회차 쿠폰 지급 확인.',
  },
  {
    program: '작은만남',
    round: '3회기',
    folder: '활동일지',
    evidence: '일지 HWP, 사진 5장, 참여기록지 PDF 확인',
    status: '부분확인',
    note: '참여기록지는 확인됨. 회기 일지 본문은 HWP라 PDF 변환 후 최종 확인 필요.',
  },
  {
    program: '하루 한 걸음',
    round: '1회기',
    folder: '활동일지',
    evidence: '일지 HWP 확인',
    status: 'PDF 변환필요',
    note: '파일 용량이 커서 사진 포함 가능성이 높습니다. 개인정보와 사진 초상권 확인 필요.',
  },
  {
    program: '하루 한 걸음',
    round: '2회기',
    folder: '활동일지',
    evidence: '일지 HWP 확인',
    status: 'PDF 변환필요',
    note: '파일 용량이 커서 사진 포함 가능성이 높습니다. 개인정보와 사진 초상권 확인 필요.',
  },
]

const hwpConversionQueue = [
  '청년생활쿠폰지원사업 지방보조금 교부신청서.hwp',
  '생활쿠폰 신청서(최종).hwp',
  '■리제너레이션 참여자 명단1.hwp',
  '청년안심쿠폰 지원 실시건.hwp',
  '청년안심쿠폰 발행대장(1~6회기).hwp',
  '청년안심쿠폰 작은만남 일지(1·3회기).hwp',
  '청년안심쿠폰 하루한걸음 일지(1·2회기).hwp',
  '청년안심쿠폰 사진 .hwp',
]

const baseProgram: ProgramRecord = {
  id: 'life-coupon-2026',
  title: '생활쿠폰지원사업',
  team: '서비스제공팀',
  owner: '이진규',
  driveUrl: 'https://drive.google.com/drive/folders/17sCTmEe6fJMPGrUFMU-fencFwr_r_AWB',
  period: '2026년',
  status: '진행중',
  priority: '높음',
  risk: '사전·사후척도검사 폴더가 비어 있고, 쿠폰 발행대장·신청서·명단은 HWP 중심이라 PDF/HWPX 변환본 확보가 필요함.',
  nextAction: 'HQ-25 사전검사 자료, 회기별 발행대장 PDF, 실시기안·결과보고서 연결 여부를 우선 확인한다.',
  memo: 'PDF 확인 결과 사업목적, 대상, 모집, 선정, 쿠폰지원, 작은만남, 하루한걸음 구조는 확인됨.',
}

const baseDocuments: ProgramDocument[] = [
  {
    id: 'doc-ai-review-folder',
    programId: 'life-coupon-2026',
    stage: 'AI 점검결과',
    title: '00_AI_점검결과',
    status: '확인완료',
    driveUrl: 'https://drive.google.com/drive/folders/1Nj6-bYB-P5D4b6hdELYhpGc87VSPiZKa',
    fileType: '폴더',
    note: '2026.9.9. 안전한 점검결과 보관용으로 신규 생성. 기존 파일은 이동하거나 변경하지 않음.',
  },
  {
    id: 'doc-root-grant-hwp',
    programId: 'life-coupon-2026',
    stage: '교부신청',
    title: '청년생활쿠폰지원사업 지방보조금 교부신청서.hwp',
    status: '확인필요',
    driveUrl: 'https://drive.google.com/file/d/1Qer_oyP7hECULdFWwFSxOqx-wQ1TqttY/view?usp=drivesdk',
    fileType: 'HWP',
    note: '원본 보관 확인. 내용 분석은 PDF/HWPX 변환 권장.',
  },
  {
    id: 'doc-plan-draft',
    programId: 'life-coupon-2026',
    stage: '0. 단위사업계획서',
    title: '1. (기안)청년안심쿠폰 단위사업실시건_이진규.pdf',
    status: '확인완료',
    driveUrl: 'https://drive.google.com/file/d/1RtE7AbI9RaIQgc-POzNgNi8cXd3FS6Lo/view?usp=drivesdk',
    fileType: 'PDF',
    note: '2026.3.31. 내부결재. 생활쿠폰 지원과 관계형성·정서지원, 일상회복 프로그램 실시 근거 확인. 개인정보 포함 주의 문구 있음.',
  },
  {
    id: 'doc-plan-main',
    programId: 'life-coupon-2026',
    stage: '0. 단위사업계획서',
    title: '2.(계획안)청년생활안심쿠폰 단위사업계획서.pdf',
    status: '검토중',
    driveUrl: 'https://drive.google.com/file/d/1tTkvIsASZsdDBdgyARt9TuI1P7bXcDqD/view?usp=drivesdk',
    fileType: 'PDF',
    note: '대상 10명, 생활쿠폰 5,200,000원, 사전·사후 HQ-25, 작은만남 7회, 하루한걸음 6회 구조 확인. 실제 결과보고·출석부·운영일지 연결 확인 필요.',
  },
  {
    id: 'doc-recruit-folder',
    programId: 'life-coupon-2026',
    stage: '1. 참여자모집 및 선정건',
    title: '모집건 내부기안 및 결과보고 / 선정건',
    status: '검토중',
    driveUrl: 'https://drive.google.com/drive/folders/1Pu75ySfou7Ap4j8b12-Vc7l3Y6ZSZLty',
    fileType: '폴더',
    note: '모집기간 2026.4.6.~4.24., 모집인원 10명, 전화·방문신청, 유관기관 의뢰 구조 확인. 모집 결과보고와 실제 신청서 보관 위치 추가 확인.',
  },
  {
    id: 'doc-scale-folder',
    programId: 'life-coupon-2026',
    stage: '2. 사전사후척도검사',
    title: '사전사후척도검사 폴더',
    status: '보완필요',
    driveUrl: 'https://drive.google.com/drive/folders/1-YPDHdQUkFueZsWl_wdAtpGB3Kgbg9Aq',
    fileType: '빈 폴더',
    note: '계획서상 HQ-25 사전·사후 각 1회, 10명, 결과분석보고서가 모니터링 자료임. 현재 폴더가 비어 있어 최우선 보완 필요.',
  },
  {
    id: 'doc-coupon-issue',
    programId: 'life-coupon-2026',
    stage: '3. 청년안심쿠폰지원',
    title: '실시건 / 발행대장 / 현수막',
    status: '확인필요',
    driveUrl: 'https://drive.google.com/drive/folders/1K6D6RKvSoOor-5GeNuv8qVPeEH9voRYV',
    fileType: '폴더',
    note: '계획서상 총 13회 발행과 발행대장이 핵심 증빙. 발행대장은 HWP 중심이므로 PDF 변환 후 회기별 금액·대상·수령 확인 필요.',
  },
  {
    id: 'doc-small-meeting',
    programId: 'life-coupon-2026',
    stage: "4. 관계형성·정서지원 '작은만남'",
    title: '실시건 / 활동일지',
    status: '확인필요',
    driveUrl: 'https://drive.google.com/drive/folders/1YHAmBANvLU--vvYuUS4gF9E2qBvQx5n9',
    fileType: '폴더',
    note: '회기별 실시기안, 활동일지, 사진, 참여자 확인.',
  },
  {
    id: 'doc-one-step',
    programId: 'life-coupon-2026',
    stage: "5. 일상회복 '하루 한 걸음'",
    title: '실시건 / 활동일지 / 하루한걸음_미션수행일지.docx',
    status: '확인필요',
    driveUrl: 'https://drive.google.com/drive/folders/153e6XlYSOTfIUuesluDL5KjCMkkn-RYf',
    fileType: '폴더+DOCX',
    note: '미션수행일지 양식 있음. 수행 여부와 회수자료 확인.',
  },
  {
    id: 'doc-presentation',
    programId: 'life-coupon-2026',
    stage: '공유자료',
    title: '생활쿠폰지원사업.pptx',
    status: '확인필요',
    driveUrl: 'https://docs.google.com/presentation/d/17gMh-DX-7ypysRaeALQfeA2Z7fXNLBms/edit?usp=drivesdk&ouid=105707870795020752738&rtpof=true&sd=true',
    fileType: 'PPTX',
    note: '보고·공유용 자료로 보임. 최신 내용 반영 여부 확인.',
  },
]

function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function isHwpDocument(document: ProgramDocument) {
  return document.fileType.toUpperCase().includes('HWP') || /\.hwpx?$/i.test(document.title.trim())
}

function getDocumentActionUrl(document: ProgramDocument) {
  if (!isHwpDocument(document)) return document.driveUrl

  const fileId = document.driveUrl.match(/\/file\/d\/([^/?]+)/)?.[1]
    ?? document.driveUrl.match(/[?&]id=([^&]+)/)?.[1]

  return fileId
    ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`
    : document.driveUrl
}

function mergeProgramsWithBase(records: ProgramRecord[]) {
  const merged = new Map<string, ProgramRecord>([[baseProgram.id, baseProgram]])
  records.forEach(program => merged.set(program.id, program))
  return Array.from(merged.values())
}

function mergeDocumentsWithBase(records: ProgramDocument[]) {
  const merged = new Map(baseDocuments.map(document => [document.id, document]))
  records.forEach(document => merged.set(document.id, document))
  return Array.from(merged.values())
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function programFromRow(row: ProgramRow): ProgramRecord {
  return {
    id: row.id,
    title: row.title,
    team: row.team,
    owner: row.owner,
    driveUrl: row.drive_url,
    period: row.period,
    status: row.status,
    priority: row.priority,
    risk: row.risk,
    nextAction: row.next_action,
    memo: row.memo,
  }
}

function documentFromRow(row: DocumentRow): ProgramDocument {
  return {
    id: row.id,
    programId: row.program_id,
    stage: row.stage,
    title: row.title,
    status: row.status,
    driveUrl: row.drive_url,
    fileType: row.file_type,
    note: row.note,
  }
}

function logFromRow(row: LogRow): ProgramLog {
  return {
    id: row.id,
    programId: row.program_id,
    date: row.log_date,
    logType: row.log_type,
    title: row.title,
    content: row.content,
    decision: row.decision,
    nextAction: row.next_action,
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramRecord[]>([])
  const [documents, setDocuments] = useState<ProgramDocument[]>([])
  const [logs, setLogs] = useState<ProgramLog[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState(baseProgram.id)
  const [user, setUser] = useState<User | null>(null)
  const [cloudStatus, setCloudStatus] = useState('로컬 저장')
  const [cloudError, setCloudError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [logDraft, setLogDraft] = useState({
    date: today(),
    logType: '진행' as LogType,
    title: '',
    content: '',
    decision: '',
    nextAction: '',
  })

  useEffect(() => {
    const localPrograms = mergeProgramsWithBase(load(programsKey, [baseProgram]))
    const localDocuments = mergeDocumentsWithBase(load(documentsKey, baseDocuments))
    const localLogs = load(logsKey, [] as ProgramLog[])
    setPrograms(localPrograms)
    setDocuments(localDocuments)
    setLogs(localLogs)

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

  const selectedProgram = programs.find(program => program.id === selectedProgramId) || programs[0] || baseProgram
  const programDocuments = useMemo(
    () => documents.filter(document => document.programId === selectedProgram.id),
    [documents, selectedProgram.id],
  )
  const programLogs = useMemo(
    () => logs.filter(log => log.programId === selectedProgram.id).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, selectedProgram.id],
  )
  const completeCount = programDocuments.filter(document => document.status === '확인완료').length
  const riskCount = programDocuments.filter(document => document.status === '보완필요' || document.status === '확인필요').length
  const progress = programDocuments.length ? Math.round((completeCount / programDocuments.length) * 100) : 0

  function savePrograms(next: ProgramRecord[]) {
    setPrograms(next)
    localStorage.setItem(programsKey, JSON.stringify(next))
  }

  function saveDocuments(next: ProgramDocument[]) {
    setDocuments(next)
    localStorage.setItem(documentsKey, JSON.stringify(next))
  }

  function saveLogs(next: ProgramLog[]) {
    setLogs(next)
    localStorage.setItem(logsKey, JSON.stringify(next))
  }

  async function loadCloud(userId: string) {
    setCloudStatus('클라우드 불러오는 중')
    setCloudError('')
    const [programResult, documentResult, logResult] = await Promise.all([
      supabase.from('work_programs').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('work_program_documents').select('*').eq('user_id', userId).order('stage', { ascending: true }),
      supabase.from('work_program_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }),
    ])
    const firstError = programResult.error || documentResult.error || logResult.error
    if (firstError) {
      setCloudStatus('로컬 저장')
      setCloudError(`클라우드 저장 준비 필요: ${firstError.message}`)
      return
    }
    const cloudPrograms = ((programResult.data ?? []) as ProgramRow[]).map(programFromRow)
    const cloudDocuments = ((documentResult.data ?? []) as DocumentRow[]).map(documentFromRow)
    const cloudLogs = ((logResult.data ?? []) as LogRow[]).map(logFromRow)
    if (cloudPrograms.length) {
      const mergedPrograms = mergeProgramsWithBase(cloudPrograms)
      savePrograms(mergedPrograms)
      setSelectedProgramId(mergedPrograms[0].id)
    }
    if (cloudDocuments.length) saveDocuments(mergeDocumentsWithBase(cloudDocuments))
    if (cloudLogs.length) saveLogs(cloudLogs)
    setCloudStatus(cloudPrograms.length || cloudDocuments.length || cloudLogs.length ? '클라우드 동기화됨' : '클라우드 연결됨 · 기본자료 업로드 필요')
  }

  async function signInWithPassword() {
    if (!email.trim() || !password) return
    setCloudStatus('로그인 중')
    setCloudError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
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

  async function saveCloudProgram(program: ProgramRecord) {
    if (!user) return
    const { error } = await supabase.from('work_programs').upsert({
      user_id: user.id,
      id: program.id,
      title: program.title,
      team: program.team,
      owner: program.owner,
      drive_url: program.driveUrl,
      period: program.period,
      status: program.status,
      priority: program.priority,
      risk: program.risk,
      next_action: program.nextAction,
      memo: program.memo,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,id' })
    if (error) setCloudError(`사업 저장 실패: ${error.message}`)
    else setCloudStatus('클라우드 저장됨')
  }

  async function saveCloudDocument(document: ProgramDocument) {
    if (!user) return
    const { error } = await supabase.from('work_program_documents').upsert({
      user_id: user.id,
      id: document.id,
      program_id: document.programId,
      stage: document.stage,
      title: document.title,
      status: document.status,
      drive_url: document.driveUrl,
      file_type: document.fileType,
      note: document.note,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,id' })
    if (error) setCloudError(`문서 저장 실패: ${error.message}`)
    else setCloudStatus('클라우드 저장됨')
  }

  async function saveCloudLog(log: ProgramLog) {
    if (!user) return
    const { error } = await supabase.from('work_program_logs').upsert({
      user_id: user.id,
      id: log.id,
      program_id: log.programId,
      log_date: log.date,
      log_type: log.logType,
      title: log.title,
      content: log.content,
      decision: log.decision,
      next_action: log.nextAction,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,id' })
    if (error) setCloudError(`기록 저장 실패: ${error.message}`)
    else setCloudStatus('클라우드 저장됨')
  }

  async function uploadLocalToCloud() {
    if (!user) return
    setCloudStatus('기본자료 업로드 중')
    setCloudError('')
    await Promise.all([
      ...programs.map(saveCloudProgram),
      ...documents.map(saveCloudDocument),
      ...logs.map(saveCloudLog),
    ])
    setCloudStatus('클라우드 반영됨')
  }

  function updateProgram(field: keyof ProgramRecord, value: string) {
    const updated = { ...selectedProgram, [field]: value } as ProgramRecord
    const next = programs.map(program => program.id === selectedProgram.id ? updated : program)
    savePrograms(next)
    saveCloudProgram(updated)
  }

  function updateDocument(id: string, patch: Partial<ProgramDocument>) {
    const updated = documents.map(document => document.id === id ? { ...document, ...patch } : document)
    saveDocuments(updated)
    const changed = updated.find(document => document.id === id)
    if (changed) saveCloudDocument(changed)
  }

  function addLog() {
    if (!logDraft.title.trim() && !logDraft.content.trim()) return
    const record: ProgramLog = {
      id: `${Date.now()}`,
      programId: selectedProgram.id,
      date: logDraft.date || today(),
      logType: logDraft.logType,
      title: logDraft.title.trim() || '사업 진행 메모',
      content: logDraft.content.trim(),
      decision: logDraft.decision.trim(),
      nextAction: logDraft.nextAction.trim(),
    }
    saveLogs([record, ...logs].slice(0, 500))
    saveCloudLog(record)
    setLogDraft({ date: today(), logType: '진행', title: '', content: '', decision: '', nextAction: '' })
  }

  async function removeLog(id: string) {
    saveLogs(logs.filter(log => log.id !== id))
    if (!user) return
    const { error } = await supabase.from('work_program_logs').delete().eq('user_id', user.id).eq('id', id)
    if (error) setCloudError(`기록 삭제 실패: ${error.message}`)
    else setCloudStatus('클라우드 삭제됨')
  }

  function resetBaseData() {
    const nextPrograms = [baseProgram, ...programs.filter(program => program.id !== baseProgram.id)]
    const existingIds = new Set(documents.map(document => document.id))
    const nextDocuments = [...documents, ...baseDocuments.filter(document => !existingIds.has(document.id))]
    savePrograms(nextPrograms)
    saveDocuments(nextDocuments)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-5 rounded-2xl bg-slate-950 p-7 text-white shadow-xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black tracking-[.22em] text-teal-300">PROGRAM CONTROL</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">개별사업 컨트롤타워</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                사업별 드라이브 폴더를 기준으로 기안, 계획, 모집, 실시, 활동일지, 결과보고, 증빙자료를 한 화면에서 확인합니다.
                첫 사업은 생활쿠폰지원사업입니다.
              </p>
            </div>
            <a href={selectedProgram.driveUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-teal-400 px-5 py-3 text-center text-sm font-black text-slate-950">
              드라이브 폴더 열기
            </a>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-emerald-700">CLOUD SYNC</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">저장 방식: {cloudStatus}</h2>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
                {user ? `${user.email} 계정으로 연결됨 · 회사와 집에서 같은 사업관리 자료를 봅니다.` : '로그인 전에는 현재 브라우저에만 저장됩니다.'}
              </p>
              {cloudError ? <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700">{cloudError}</p> : null}
            </div>
            {user ? (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => loadCloud(user.id)} className="rounded-lg border border-emerald-300 bg-white px-4 py-3 text-sm font-black text-emerald-800">클라우드 다시 불러오기</button>
                <button onClick={uploadLocalToCloud} className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white">현재 자료 올리기</button>
                <button onClick={resetBaseData} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">기본자료 보강</button>
                <button onClick={signOut} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700">로그아웃</button>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-[220px_160px_auto]">
                <input value={email} onChange={event => setEmail(event.target.value)} placeholder="이메일" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700" />
                <input value={password} onChange={event => setPassword(event.target.value)} type="password" placeholder="비밀번호" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-700" />
                <button onClick={signInWithPassword} className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-black text-white">로그인</button>
              </div>
            )}
          </div>
        </section>

        <section className="mb-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-teal-700">문서 확인률</p>
            <p className="mt-2 text-3xl font-black text-teal-900">{progress}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-500">확인완료</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{completeCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-amber-700">확인·보완 필요</p>
            <p className="mt-2 text-3xl font-black text-amber-900">{riskCount}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-indigo-700">누적 기록</p>
            <p className="mt-2 text-3xl font-black text-indigo-900">{programLogs.length}</p>
          </div>
        </section>

        <ProgramOperations user={user} programId={selectedProgram.id} />

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">FIRST REVIEW</p>
            <h2 className="mt-1 text-xl font-black">생활쿠폰지원사업 1차 분석</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
              드라이브에 이미 PDF로 있는 기안, 계획서, 모집, 선정 자료를 기준으로 확인했습니다.
            </p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {lifeCouponFindings.map(item => (
              <div key={item.title} className={`rounded-xl border p-4 ${item.tone}`}>
                <p className="text-sm font-black">{item.title}</p>
                <p className="mt-2 text-sm font-bold leading-6 opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 border-t border-slate-100 p-5 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-black text-emerald-800">확인된 강점</p>
              <p className="mt-2 text-sm font-bold leading-6 text-emerald-950">
                실시근거, 모집기간, 선정기준, 사업내용, 예산, 산출목표가 계획서 안에 연결되어 있습니다.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-black text-amber-800">우선 확인</p>
              <p className="mt-2 text-sm font-bold leading-6 text-amber-950">
                HQ-25 사전검사, 회기별 결과보고, 출석부, 운영일지, 쿠폰 발행대장 PDF 변환본을 확인해야 합니다.
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-black text-rose-800">AI 입력 제한</p>
              <p className="mt-2 text-sm font-bold leading-6 text-rose-950">
                신청서, 선정명단, 발행대장은 이름·연락처·건강·경제상황 등이 포함될 수 있어 익명화 후 분석합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">사업 목록</h2>
            <div className="mt-4 grid gap-2">
              {programs.map(program => (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`rounded-xl border p-4 text-left transition ${program.id === selectedProgram.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <p className="text-sm font-black text-slate-950">{program.title}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{program.team} · {program.owner}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-black text-amber-800">한글파일 기준</p>
              <p className="mt-2 text-sm font-bold leading-6 text-amber-900">
                HWP는 원문 보관용으로 두고, 검토·분석은 PDF 또는 HWPX 변환본을 함께 두는 방식이 가장 안정적입니다.
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={selectedProgram.title} onChange={event => updateProgram('title', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <input value={selectedProgram.team} onChange={event => updateProgram('team', event.target.value)} placeholder="팀" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <input value={selectedProgram.owner} onChange={event => updateProgram('owner', event.target.value)} placeholder="담당자" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <input value={selectedProgram.period} onChange={event => updateProgram('period', event.target.value)} placeholder="기간" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <select value={selectedProgram.status} onChange={event => updateProgram('status', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700">
                {(['진행중', '점검필요', '완료', '보류'] as ProgramStatus[]).map(status => <option key={status}>{status}</option>)}
              </select>
              <select value={selectedProgram.priority} onChange={event => updateProgram('priority', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700">
                {(['높음', '보통', '낮음'] as ProgramPriority[]).map(priority => <option key={priority}>{priority}</option>)}
              </select>
              <textarea value={selectedProgram.risk} onChange={event => updateProgram('risk', event.target.value)} placeholder="현재 위험요소" className="min-h-24 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-bold outline-none focus:border-amber-700 md:col-span-2" />
              <textarea value={selectedProgram.nextAction} onChange={event => updateProgram('nextAction', event.target.value)} placeholder="다음 조치" className="min-h-20 rounded-lg border border-teal-300 bg-teal-50 p-3 text-sm font-bold outline-none focus:border-teal-700 md:col-span-2" />
              <textarea value={selectedProgram.memo} onChange={event => updateProgram('memo', event.target.value)} placeholder="관리 메모" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm font-bold outline-none focus:border-teal-700 md:col-span-2" />
            </div>
          </section>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
          <div className="border-b border-teal-100 bg-teal-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-teal-700">SESSION CHECK</p>
            <h2 className="mt-1 text-xl font-black text-teal-950">회기별 증빙 체크</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-teal-800">
              드라이브 폴더에서 확인된 자료를 기준으로, 회기별로 PDF 분석 가능 여부와 다음 확인 포인트를 나눴습니다.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">구분</th>
                  <th className="px-4 py-3 text-left">회기</th>
                  <th className="px-4 py-3 text-left">위치</th>
                  <th className="px-4 py-3 text-left">확인자료</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">다음 확인</th>
                </tr>
              </thead>
              <tbody>
                {lifeCouponSessionChecks.map((item, index) => (
                  <tr key={`${item.program}-${item.round}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border-b border-slate-100 px-4 py-3 font-black text-slate-950">{item.program}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-700">{item.round}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-600">{item.folder}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-600">{item.evidence}</td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        item.status === '내용확인' ? 'bg-emerald-100 text-emerald-800'
                          : item.status === '부분확인' ? 'bg-indigo-100 text-indigo-800'
                            : item.status === '정리필요' ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 font-bold leading-6 text-slate-600">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-5">
          <article className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black tracking-[.18em] text-amber-700">HWP TO PDF</p>
            <h2 className="mt-1 text-xl font-black text-amber-950">PDF 변환 대기 목록</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-amber-900">
              HWP 원본은 보존하고, 같은 폴더에 PDF 또는 HWPX 변환본을 추가하면 이후 AI 분석 정확도가 올라갑니다.
            </p>
            <div className="mt-4 grid gap-2">
              {hwpConversionQueue.map(item => (
                <div key={item} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-bold leading-6 text-amber-950">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-black tracking-[.18em] text-slate-500">DOCUMENT FLOW</p>
            <h2 className="mt-1 text-xl font-black">문서·증빙 흐름</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
              PDF와 폴더는 브라우저에서 열고, HWP는 내려받아 기기에 연결된 한글 앱으로 엽니다.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {programDocuments.map(document => (
              <div key={document.id} className="grid gap-3 p-4 lg:grid-cols-[160px_1fr_130px_140px] lg:items-center">
                <div>
                  <p className="text-xs font-black text-slate-500">{document.stage}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{document.fileType}</p>
                </div>
                <div>
                  <a href={document.driveUrl} target="_blank" rel="noreferrer" className="font-black text-slate-950 underline decoration-slate-300 underline-offset-4 hover:text-teal-700">
                    {document.title}
                  </a>
                  <textarea
                    value={document.note}
                    onChange={event => updateDocument(document.id, { note: event.target.value })}
                    className="mt-2 min-h-14 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-bold leading-5 text-slate-600 outline-none focus:border-teal-600"
                  />
                </div>
                <select
                  value={document.status}
                  onChange={event => updateDocument(document.id, { status: event.target.value as DocumentStatus })}
                  className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-black outline-none focus:border-teal-700"
                >
                  {statusOptions.map(status => <option key={status}>{status}</option>)}
                </select>
                <a href={getDocumentActionUrl(document)} target="_blank" rel="noreferrer" className="rounded-lg border border-teal-300 bg-white px-4 py-3 text-center text-sm font-black text-teal-800">
                  {isHwpDocument(document) ? 'HWP 내려받기' : '자료 열기'}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <article className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black tracking-[.18em] text-teal-700">QUICK PROGRAM LOG</p>
            <h2 className="mt-1 text-xl font-black">사업 진행 기록</h2>
            <div className="mt-4 grid gap-3">
              <input type="date" value={logDraft.date} onChange={event => setLogDraft(previous => ({ ...previous, date: event.target.value }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <select value={logDraft.logType} onChange={event => setLogDraft(previous => ({ ...previous, logType: event.target.value as LogType }))} className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700">
                {logTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <input value={logDraft.title} onChange={event => setLogDraft(previous => ({ ...previous, title: event.target.value }))} placeholder="오늘 확인한 것" className="rounded-lg border border-slate-300 px-3 py-3 text-sm font-bold outline-none focus:border-teal-700" />
              <textarea value={logDraft.content} onChange={event => setLogDraft(previous => ({ ...previous, content: event.target.value }))} placeholder="상황 메모" className="min-h-24 rounded-lg border border-slate-300 p-3 text-sm font-bold outline-none focus:border-teal-700" />
              <textarea value={logDraft.decision} onChange={event => setLogDraft(previous => ({ ...previous, decision: event.target.value }))} placeholder="결정한 것" className="min-h-20 rounded-lg border border-slate-300 p-3 text-sm font-bold outline-none focus:border-teal-700" />
              <textarea value={logDraft.nextAction} onChange={event => setLogDraft(previous => ({ ...previous, nextAction: event.target.value }))} placeholder="다음 조치" className="min-h-20 rounded-lg border border-teal-300 bg-teal-50 p-3 text-sm font-bold outline-none focus:border-teal-700" />
              <button onClick={addLog} className="rounded-lg bg-teal-700 px-4 py-3 text-sm font-black text-white">기록 저장</button>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 p-5">
              <h2 className="text-xl font-black">최근 진행 기록</h2>
              <p className="mt-1 text-sm font-bold text-slate-600">회의, 결정, 보완요청, 증빙 확인을 시간순으로 남깁니다.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {programLogs.length ? programLogs.map(log => (
                <div key={log.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-slate-950">{log.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{log.date} · {log.logType}</p>
                    </div>
                    <button onClick={() => removeLog(log.id)} className="text-xs font-black text-red-700">삭제</button>
                  </div>
                  {log.content ? <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{log.content}</p> : null}
                  {log.decision ? <p className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold leading-6 text-indigo-900">결정: {log.decision}</p> : null}
                  {log.nextAction ? <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold leading-6 text-teal-900">다음: {log.nextAction}</p> : null}
                </div>
              )) : (
                <p className="p-8 text-center text-sm font-bold text-slate-500">아직 기록이 없습니다.</p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
