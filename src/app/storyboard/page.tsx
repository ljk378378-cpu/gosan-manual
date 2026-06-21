'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, Part, PartFile, STATUS_LABELS, STATUS_COLORS, TEAM_MEMBERS } from '@/lib/supabase'

const STATUSES = ['pending', 'in_progress', 'review', 'done'] as const

type GuideSection = {
  role: string
  structure: { pages: string; content: string }[]
  cautions: string[]
  data?: string[]
}

const PART_GUIDES: Record<number, GuideSection> = {
  1: {
    role: '독자가 매뉴얼을 손에 들었을 때 가장 먼저 보는 얼굴. 사업명·기관명·발행연도를 담는다.',
    structure: [
      { pages: '1p', content: '사업명 / 청곡종합사회복지관 / 2026 / 재원: 대구사회복지공동모금회' },
    ],
    cautions: ['디자인 작업 — 집필 없음', '기획사에 로고 원본 파일 별도 전달 필요'],
  },
  2: {
    role: '독자가 읽고 싶은 파트를 바로 찾을 수 있도록 구성. 페이지 번호는 최종 원고 확정 후 기입.',
    structure: [
      { pages: '2p', content: '파트별 제목 + 페이지 번호 (최종 확정 후)' },
    ],
    cautions: ['디자인 작업 — 집필 없음', '파트 제목은 확정 구성 그대로 반영'],
  },
  3: {
    role: '독자가 매뉴얼을 펼쳤을 때 가장 먼저 만나는 공식 글. "왜 이 매뉴얼을 세상에 냈는가"를 선언하는 자리.',
    structure: [
      { pages: '1p — 관장 발간사', content: '청곡복지관이 3년간 이 사업에 투자한 이유 / 주민이 연구자가 된다는 것의 의미 / 이 매뉴얼이 다른 지역으로 퍼지길 바라는 근거 있는 기대' },
      { pages: '1p — 수성구청 국장 발간사', content: '지자체가 주민 주도 환경 실험을 지원한 이유 / 고산동 사례가 구 전체 정책에 미친 영향 / 행정·복지관·주민 협력 모델의 의미' },
    ],
    cautions: [
      '두 글은 서로 다른 관점 (복지관 시각 vs 행정 시각)',
      '"감사합니다" 나열형 마무리 금지',
      '각 1페이지, 600자 이내',
    ],
  },
  4: {
    role: '글보다 그림이 주인공인 페이지. 독자가 본문을 읽기 전에 3년 흐름을 한눈에 파악하게 한다.',
    structure: [
      { pages: '2p — 인포그래픽', content: '연도별(2023·2024·2025) 구분선 / 각 연도 핵심 성과 3가지씩 / 참여 인원 변화: 20명→30명→40명 / 참여 기관 수 변화 / 3차년도 산출물: 앱+매뉴얼' },
    ],
    cautions: [
      'Canva에서 인포그래픽 제작 예정 — 텍스트 초안만 제출',
      '각 연도별 핵심 사건을 날짜순으로 5~7개씩 정리',
      '수거량 수치 있으면 반드시 포함',
    ],
  },
  5: {
    role: '이 매뉴얼의 첫 번째 본문. 독자가 "왜 이걸 읽어야 하는가"를 납득하게 만든다. 감동이 아니라 논리로 설득.',
    structure: [
      { pages: '1~2p — 왜 종이팩인가', content: '국내 종이팩 재활용률 수치로 시작 → 고산동 실태 → 종이팩이 제대로 분리되면 어떤 경로와 가치가 생기는가 → 수치로 마무리' },
      { pages: '3~4p — 왜 주민인가', content: '기존 환경 캠페인의 한계 (전문가→주민 일방 전달) / 리빙랩이란: 주민이 연구자가 되는 방식 한 문단 설명 / 1차년도 모집 이후 실제로 벌어진 일 / 주민환경연구원의 말 직접 인용 1개 이상' },
    ],
    cautions: [
      '"환경을 지키고 싶었습니다" 같은 선언형 문장 금지',
      '수치 없는 문단 금지',
      '주민환경연구원 말 최소 1개 직접 인용 (이름 또는 역할 병기)',
    ],
  },
  6: {
    role: '3년 서사의 출발점. "주민이 직접 문제를 발굴했다"는 것과 "왜 종이팩을 선택했는가"가 설득돼야 2·3부로 이어진다.',
    structure: [
      { pages: '1~2p — 고산동은 어떤 동네인가', content: '고산1·2·3동 3개 행정구역의 지역 특성 / 각 동의 주거 형태·인구·환경 인프라 현실 / 왜 이 동네에서 환경리빙랩이 시작됐는가' },
      { pages: '3~4p — 주민환경연구원이 된다는 것', content: '모집 공고 → 지원 → 선발 과정 (기준 포함) / 동별로 모집한 이유 / 20명은 어떤 사람들이었는가 / 발대식: 주민이 연구자로 처음 앉았을 때의 풍경' },
      { pages: '5~6p — 동별 발굴 3가지 환경 문제', content: '고산1동: 우유팩(종이팩) 재활용 문제 / 고산2동: 미세쓰레기 투기 문제 (쓰레갖기) / 고산3동: 공원 생태환경 문제 (뿌리 덮은 나무)' },
      { pages: '7~8p — 왜 종이팩인가', content: '3가지 문제 비교 분석 / 종이팩 선택 이유: 수거→세척→납품 순환 고리, 아파트·카페·학교 확장 가능, 타 지역 복제 가능 / 1차년도 말 주민환경연구원이 내린 결론 직접 인용' },
    ],
    cautions: [
      '동별(1동·2동·3동) 구분 명확히 — 고산동 전체로 뭉뚱그리면 안 됨',
      '날짜 또는 월 단위 시간 표시 반드시 포함',
      '어려움은 숨기지 마세요 — 신뢰성의 근거가 됩니다',
    ],
    data: [
      '모집 기간: 2023.8.14~8.31 / 신청 47명 → 선발 20명',
      '선발: 고산1동 6명, 고산2동 8명, 고산3동 6명',
      '연령: 20대 1명, 40대 7명, 50대 8명, 60대↑ 4명 / 여 15명, 남 5명',
      '발대식: 2023.9.12 / 총 50명 (내빈: 박시하 수성구청 복지국장, 강경철 환경공단 처장 등)',
      '주민역량강화 척도: 64.4 → 76.3 (+18%) / 환경감수성: 74.1 → 85.4 (+15%)',
      '팝업환경도서관 1,260명 / 환경교육아카데미 460명 / 챌린지 1,170명',
      '고산1동 성과: 우유팩분리수거함 시제품 제작(2024.7.16), 설치 협의(신화빌라트·태성맨션·청아람어린이집)',
      '고산2동 성과: 쓰레갖기 캠페인(2024.5.14), 팻말 설치(2024.7.16)',
      '고산3동 성과: 매호공원 식재(2024.6.4), 어린이집 생태교육 52명 (2024.7)',
    ],
  },
  7: {
    role: '성과가 가장 집중된 파트. "주민이 만든 것이 실제로 작동한다"는 것을 증명한 해. 독자가 읽고 "이게 진짜구나"를 느껴야 한다.',
    structure: [
      { pages: '1~2p — 1차→2차 전환', content: '1차년도 한계 분석 (3가지 중 종이팩 선택) / 2차년도 핵심 방향: 실험→모델화 / 주민환경연구원 20명→30명 확대 이유' },
      { pages: '3~5p — 3가지 자원순환 모델', content: '아파트 모델: 수거→세척→집하 구조 / 카페 모델: 소형 상업시설 연계 / 학교 모델: 교육 기관 거점화 / 각 모델별 작동 방식·수거 주기·성과 수치' },
      { pages: '6~7p — 그린고산실천단 거버넌스', content: '주민이 제안하면 행정이 실현하는 구조 / 컨소시엄 6개 기관 역할 분담 / 주민+지자체+전문기관이 함께 작동한 방식' },
      { pages: '8p — 노인 일자리 연결', content: '수거 인력 문제 → 노인 일자리 사업 연결 방법 / 참여 인원·활동 내용·수당 구조 / 사회복지관만이 할 수 있는 이유 명시' },
      { pages: '9~10p — MBC·TBN 방송 활동', content: 'MBC 출연 내용·방영 시기 / TBN교통방송 고정패널 1년: 주제·빈도·주요 내용 / 방송 이후 문의·참여자 증가 수치' },
    ],
    cautions: [
      '3가지 모델(아파트·카페·학교)은 반드시 별도 소제목으로 분리',
      '그린고산실천단 참여 기관 이름 전부 명시',
      '방송 활동은 날짜·채널·주제 구체적으로',
      '"사회복지관만이 할 수 있는 이유"를 노인 일자리 부분에 명시',
    ],
  },
  8: {
    role: '3년 서사의 완결. 독자가 읽고 "이 매뉴얼을 손에 든 내가 이미 플랫폼의 사용자"라는 것을 자연스럽게 느껴야 한다.',
    structure: [
      { pages: '1~2p — 왜 플랫폼인가', content: '2차년도까지의 성과 / 한계: 복지관이 없으면 안 돌아가는 구조 / 질문: 고산동 밖에서, 우리 없이도 작동하게 하려면? / 답: 앱(온라인)+매뉴얼(오프라인)' },
      { pages: '3~5p — 주민이 그린 고산 앱', content: '앱이 필요했던 구체적 문제 / 주요 기능 (수거 거점 위치·일정·참여 인증) / 개발 과정 중 주민 의견 반영 방법 / 출시 후 참여 접근성 변화' },
      { pages: '6~7p — 이 매뉴얼', content: '매뉴얼을 만들기로 결정한 이유 / 담아야 할 것: 3년의 시행착오·작동하는 구조·따라 할 수 있는 방법 / 앱과 매뉴얼을 함께 쓰면 어떻게 되는지' },
      { pages: '8p — 플랫폼이 완성된다는 것', content: '주민 주도·행정 지원·복지관 연결 구조가 도구로 남았다 / 다음 사람이 더 빠르게 시작할 수 있다 / 짧고 힘 있게 마무리' },
    ],
    cautions: [
      '이진규 과장이 3년 전체를 가장 잘 아는 사람으로서 쓰는 것',
      '앱 기능 설명은 기술이 아닌 "주민이 어떻게 쓰는가" 중심',
      '"이를 통해", "더 나아가" 같은 AI 문체 사용 금지',
    ],
  },
  9: {
    role: '"우리 지역에서 해보고 싶다"는 독자가 첫 번째로 펼칠 파트. 앞 파트 스토리를 몰라도 이 파트만 읽고 시작할 수 있어야 한다.',
    structure: [
      { pages: '1~2p — 시작 전 체크리스트', content: '필수 조건: 복지관(또는 유사기관)이 있어야 하는 이유 / 필요 인력: 전담 담당자 몇 명, 어떤 역할 / 예산 범위: 청곡복지관 사례 기준 / 지역 조건: 납품처 연결 가능 여부 확인법' },
      { pages: '3~4p — 1단계: 주민환경연구원 모집', content: '모집 공고 작성 방법 / 모집 대상·선발 기준 공개 / 첫 모임 구성 방법' },
      { pages: '5~6p — 2단계: 수거 거점 구축', content: '거점 선정 기준: 주민 동선·접근성·보관 공간 / 수거함 설치 협의 과정 / 수거 주기 설정 / 청곡복지관 거점 6곳 선정 과정 사례' },
      { pages: '7~8p — 3단계: 세척·집하·납품', content: '세척 방법과 기준 / 집하 장소 확보 방법 / 납품처 연결 방법 (세바퀴 같은 기관 찾는 법) / 수익 구조 설명' },
      { pages: '9~10p — 4단계: 거버넌스 구축', content: '기관 연대 만드는 방법 / 컨소시엄 기관 제안 방법 / 역할 분담 / 지자체(구청)와 협력하는 방법' },
      { pages: '11~12p — 자주 막히는 지점', content: '실제로 막혔던 상황 5가지와 각각의 해결 방법 / 앱+매뉴얼 활용법' },
    ],
    cautions: [
      '각 단계를 "1단계→2단계" 번호로 명확히 구분',
      '"청곡복지관의 경우 ~했습니다" 형식으로 실제 사례 근거 제시',
      '체크박스처럼 쓸 수 있는 목록 형식 적극 활용',
      '"소통을 강화하세요" 대신 "주 1회 카카오톡 단체방에 수거량을 공지했습니다"처럼 구체적으로',
    ],
  },
  10: {
    role: '다른 지역 복지관 담당자·지자체 담당자·중간지원조직을 독자로 쓰는 파트. "3년이 만든 시스템에 민관 협력이 더해지면 무엇이 가능한가"를 전국 사례와 고산동 경험으로 설득한다. 지자체 요구나 비판이 아닌, 이미 협력이 시작됐고 조금씩 확장되면 완전해진다는 가능성 중심 서술.',
    structure: [
      { pages: '1~2p — 3년이 만든 것, 그리고 남은 가능성', content: '청곡복지관·주민환경연구원·그린고산실천단이 구축한 시스템의 현재 완성도 / 공공 인프라(분리수거 체계 편입·수거함 공간·예산 연속성)와 연결되면 달라지는 것 / 이것이 고산동만의 과제가 아닌 전국 공통 지점임을 명시' },
      { pages: '3~5p — 전국 선행사례: 민관 협력이 완성한 자원순환 시스템', content: '사례 1: 주민 주도로 시작해 지자체 공식 사업으로 전환된 타 지역 사례 (성동구·수원 등) / 사례 2: 지자체가 주민 환경 실험을 제도로 수용한 사례 / 공통점: 성과를 먼저 쌓은 민간이 협력 주도권을 가졌고, 고산동이 이미 그 단계에 와 있다는 시사점' },
      { pages: '6~7p — 이미 시작된 협력: 고산동과 수성구청이 함께한 것들', content: '컨소시엄 기관으로 참여한 수성구청 녹색환경과·고산1·2·3동 행정복지센터의 역할 / 협력의 구체적 내용(홍보 지원·공간 협조·거버넌스 참여) / 협력이 만들어낸 실제 변화 수치 또는 사례 / "이미 시작됐고 조금씩 확장되고 있다" 현재 진행형으로 서술' },
      { pages: '8p — 다음 단계: 협력이 깊어지면 무엇이 가능한가', content: '앱+매뉴얼+거버넌스가 갖춰진 지금 공공 인프라가 더해질 때의 파급 효과 / 종이팩 공식 분리수거 편입·주민환경연구원 공공 제도 연결·예산 연속성 확보 시 고산동 모델 확산 속도 / "협력이 한 걸음씩 깊어진다면"으로 마무리 — 요구가 아닌 가능성 제시' },
    ],
    cautions: [
      '지자체를 향한 요구·비판 표현 일절 금지 — "함께하면 더 완전해진다"는 가능성 언어로만',
      '수성구청이 이미 협력해온 것을 먼저, 충분히 강조하세요 (협력 파트너로 인정)',
      '전국 사례는 비교가 아니라 "이 방향이 이미 검증됐다"는 근거로 활용',
      '사례 수치·출처는 이진규 과장이 확인 후 기재 (집필 전 사례 조사 필요)',
    ],
  },
  11: {
    role: '매뉴얼의 마지막 목소리. "우리가 끝냈다"가 아니라 "다음 사람에게 건넨다"는 톤.',
    structure: [
      { pages: '2p (800자 이내)', content: '3년을 함께한 주민환경연구원들에게 한 마디 / 이 매뉴얼을 처음 펼친 낯선 곳의 누군가에게 한 마디 / 프롤로그 질문("왜 주민인가, 왜 종이팩인가")에 대한 답을 간결하게 마무리' },
    ],
    cautions: [
      '감사 인사 나열 금지',
      '"앞으로도 함께해요" 같은 응원형 마무리 금지',
      '마지막 문장이 기억에 남아야 합니다',
    ],
  },
  12: {
    role: '독자가 실제로 쓸 수 있는 자료집. 표 형식으로 정리, 서술형 금지.',
    structure: [
      { pages: '4p', content: '연도별 활동 일지 (2023·2024·2025 주요 활동 표) / 역대 주민환경연구원 명단 (1~3차년도) / 컨소시엄 기관 목록 및 역할 / 주요 용어 설명 / 주민이 그린 고산 앱 다운로드 QR코드' },
    ],
    cautions: [
      '표 형식으로만 정리, 서술형 금지',
      '명단은 이진규 과장에게 최종 확인 후 기재',
    ],
  },
}

export default function StoryboardPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadParts()
    const channel = supabase
      .channel('parts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, () => loadParts())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadParts() {
    const { data } = await supabase.from('parts').select('*').order('order_num')
    if (data) setParts(data)
  }

  async function updatePart(id: number, updates: Partial<Part>) {
    setSaving(true)
    const { error } = await supabase.from('parts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(false)
    if (error) {
      alert('저장 실패: ' + error.message)
      return
    }
    setParts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    setEditing(null)
    loadParts()
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📋 스토리보드</h1>
            <p className="text-sm text-gray-500">파트별 집필가이드와 진행 상황을 함께 확인하세요</p>
          </div>
          {saving && <span className="text-sm text-green-600">저장 중...</span>}
        </div>

        <div className="space-y-4">
          {parts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              guide={PART_GUIDES[part.order_num]}
              isEditing={editing === part.id}
              onEdit={() => setEditing(part.id)}
              onSave={(updates) => updatePart(part.id, updates)}
              onCancel={() => setEditing(null)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function PartCard({ part, guide, isEditing, onEdit, onSave, onCancel }: {
  part: Part
  guide: GuideSection | undefined
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<Part>) => void
  onCancel: () => void
}) {
  const [activeTab, setActiveTab] = useState<'manage' | 'guide'>('manage')
  const [form, setForm] = useState({ title: part.title, subtitle: part.subtitle || '', progress: part.progress, status: part.status, assignee: part.assignee || '', notes: part.notes || '' })
  const [files, setFiles] = useState<PartFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({ title: part.title, subtitle: part.subtitle || '', progress: part.progress, status: part.status, assignee: part.assignee || '', notes: part.notes || '' })
    loadFiles()
  }, [part])

  async function loadFiles() {
    const { data } = await supabase
      .from('part_files')
      .select('*')
      .eq('part_id', part.id)
      .order('uploaded_at', { ascending: false })
    if (data) setFiles(data)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!uploadName.trim()) {
      alert('이름을 먼저 선택하세요')
      e.target.value = ''
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['hwp', 'hwpx'].includes(ext)) {
      alert('HWP 또는 HWPX 파일만 업로드할 수 있습니다')
      e.target.value = ''
      return
    }
    setUploading(true)
    const filePath = `part-${part.order_num}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('manuscripts')
      .upload(filePath, file, { upsert: false })
    if (error) {
      alert('업로드 실패: ' + error.message)
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const { error: dbError } = await supabase.from('part_files').insert({
      part_id: part.id,
      file_name: file.name,
      file_path: filePath,
      uploader: uploadName.trim(),
      file_size: file.size,
    })
    if (dbError) {
      alert('저장 실패: ' + dbError.message)
      await supabase.storage.from('manuscripts').remove([filePath])
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    loadFiles()
  }

  async function deleteFile(pf: PartFile) {
    if (!confirm(`"${pf.file_name}" 파일을 삭제할까요?`)) return
    await supabase.storage.from('manuscripts').remove([pf.file_path])
    await supabase.from('part_files').delete().eq('id', pf.id)
    loadFiles()
  }

  function getDownloadUrl(filePath: string) {
    const { data } = supabase.storage.from('manuscripts').getPublicUrl(filePath)
    return data.publicUrl
  }

  function formatSize(bytes: number | null) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all ${isEditing ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}>
      {/* 카드 헤더 */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{part.page_count}p</span>
              <h3 className="font-bold text-gray-800">{part.title}</h3>
            </div>
            {part.subtitle && <p className="text-sm text-gray-500">{part.subtitle}</p>}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[part.status]}`}>
            {STATUS_LABELS[part.status]}
          </span>
        </div>

        {/* 진행률 바 */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>담당: {part.assignee || '미배정'}</span>
            <span>{part.progress}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${part.progress}%` }} />
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-t border-gray-100 text-sm">
        <button
          onClick={() => { setActiveTab('manage'); if (isEditing) onCancel() }}
          className={`flex-1 py-2 font-medium transition-colors ${activeTab === 'manage' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          관리
        </button>
        {guide && (
          <button
            onClick={() => { setActiveTab('guide'); if (isEditing) onCancel() }}
            className={`flex-1 py-2 font-medium transition-colors ${activeTab === 'guide' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            집필가이드
          </button>
        )}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'manage' && (
        <div className="p-5 pt-4 space-y-4">
          {/* 진행 상황 편집 */}
          <div>
            {part.notes && !isEditing && (
              <p className="mb-3 text-xs text-gray-500 bg-gray-50 rounded p-2">💬 {part.notes}</p>
            )}
            {!isEditing ? (
              <button onClick={onEdit} className="text-xs text-gray-400 hover:text-green-600 border border-gray-200 rounded px-3 py-1.5">
                진행 상황 수정
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">파트 제목</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">부제목</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    placeholder="부제목 (선택)"
                    value={form.subtitle}
                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">담당자</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                      placeholder="이름 입력"
                      value={form.assignee}
                      onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">상태</label>
                    <select
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as Part['status'] }))}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">진행률 {form.progress}%</label>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={form.progress}
                    onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                    className="w-full accent-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">메모</label>
                  <textarea
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm resize-none"
                    rows={2}
                    placeholder="진행 상황, 특이사항 등"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onSave(form)} className="bg-green-700 text-white text-sm px-4 py-1.5 rounded hover:bg-green-800">저장</button>
                  <button onClick={onCancel} className="text-gray-500 text-sm px-4 py-1.5 rounded border hover:bg-gray-50">취소</button>
                </div>
              </div>
            )}
          </div>

          {/* 원고 파일 업로드 */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📎 원고 파일 (HWP)</p>

            {/* 업로드된 파일 목록 */}
            {files.length > 0 && (
              <div className="space-y-2 mb-3">
                {files.map(pf => (
                  <div key={pf.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="text-blue-500 text-sm">📄</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={getDownloadUrl(pf.file_path)}
                        download={pf.file_name}
                        className="text-xs font-medium text-blue-700 hover:underline truncate block"
                      >
                        {pf.file_name}
                      </a>
                      <p className="text-xs text-gray-400">
                        {pf.uploader} · {new Date(pf.uploaded_at).toLocaleDateString('ko-KR')}
                        {pf.file_size ? ` · ${formatSize(pf.file_size)}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFile(pf)}
                      className="text-xs text-red-400 hover:text-red-600 shrink-0"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 업로드 폼 */}
            <div className="flex gap-2 items-center flex-wrap">
              <select
                className="border border-gray-200 rounded px-2 py-1.5 text-xs"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
              >
                <option value="">이름 선택</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
              <label className={`cursor-pointer text-xs px-3 py-1.5 rounded border transition-colors ${uploading ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}>
                {uploading ? '업로드 중...' : '+ HWP 파일 올리기'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".hwp,.hwpx"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guide' && guide && (
        <div className="p-5 pt-4 space-y-4 text-sm">
          {/* 역할 */}
          <div className="bg-green-50 rounded-lg p-3 text-green-900 text-sm leading-relaxed">
            {guide.role}
          </div>

          {/* 구조 */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">구조 · 무엇을 쓸 것인가</p>
            <div className="space-y-2">
              {guide.structure.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1 shrink-0 h-fit font-mono">{s.pages}</span>
                  <p className="text-gray-700 text-xs leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 주의사항 */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">주의사항</p>
            <ul className="space-y-1">
              {guide.cautions.map((c, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2">
                  <span className="text-red-400 shrink-0">✕</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 참고 데이터 (있는 파트만) */}
          {guide.data && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">참고 데이터 (성과공유회 자료집 발췌)</p>
              <ul className="space-y-1">
                {guide.data.map((d, i) => (
                  <li key={i} className="text-xs text-blue-800 bg-blue-50 rounded px-2 py-1 flex gap-2">
                    <span className="shrink-0">📌</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
