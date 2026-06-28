'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

type LayoutType = '전면배경' | '반면배경' | '틀삽화(대)' | '틀삽화(소)' | '인포그래픽' | '스크린샷' | '갤러리'

type SectionData = {
  id: string
  part: string
  title: string
  layout: LayoutType
  layoutNote: string
  excerpt: string
  photoGuide: string[]
  photoCount: number
  notes?: string
  designerNote?: string
}

type UploadedPhoto = { name: string; url: string; isImage: boolean }

const LAYOUT_COLORS: Record<LayoutType, string> = {
  '전면배경':   'bg-indigo-700 text-white',
  '반면배경':   'bg-violet-600 text-white',
  '틀삽화(대)': 'bg-blue-600 text-white',
  '틀삽화(소)': 'bg-sky-500 text-white',
  '인포그래픽': 'bg-orange-500 text-white',
  '스크린샷':   'bg-teal-600 text-white',
  '갤러리':     'bg-pink-600 text-white',
}

const LAYOUT_DESC: Record<LayoutType, string> = {
  '전면배경':   '텍스트 뒤 전면 배경 — 사진 위에 글이 겹쳐서 나옴',
  '반면배경':   '페이지 절반을 사진이 차지 — 나머지 반에 글 배치',
  '틀삽화(대)': '본문 안 큰 사각 틀 — 사진 한 장이 시선을 끔',
  '틀삽화(소)': '본문 옆 작은 틀 — 여러 장 나란히 배치 가능',
  '인포그래픽': '기획사 제작 — 수치·흐름도 중심, 사진은 보조 삽화',
  '스크린샷':   '앱 화면 캡처 — 스마트폰 목업 프레임 안에 삽입',
  '갤러리':     '활동사진 여러 장 그리드 배치 — 캡션 포함',
}

const SECTIONS: SectionData[] = [
  {
    id: 'foreword',
    part: '발간사',
    title: '관장 발간사 (1p)',
    layout: '틀삽화(소)',
    layoutNote: '발간사 본문 우측 상단 또는 서명 옆 작은 원형·사각 틀에 관장 사진 배치',
    excerpt: '이 매뉴얼은 청곡종합사회복지관이 3년 동안 주민과 함께 대답한 하나의 질문에서 나왔습니다. "우리 동네의 환경 문제는, 결국 누가 풀어야 하는가."',
    photoGuide: ['관장 김순애 사진 — 증명사진 또는 행사·회의 중 자연스러운 장면'],
    photoCount: 1,
    notes: '기존 보유 사진 확인. 정장 착용 사진 선호',
  },
  {
    id: 'timeline',
    part: '타임라인',
    title: '3년의 여정 타임라인 (3~5p)',
    layout: '인포그래픽',
    layoutNote: '기획사가 타임라인 인포그래픽 전면 제작. 각 연도 이벤트 옆에 소삽화 6장 배치',
    excerpt: '1차년도 문제를 발굴하다 (2023.8~2024.7) → 2차년도 모델을 만들다 (2024.8~2025.7) → 3차년도 플랫폼을 만들다 (2025.8~2026.7)',
    photoGuide: [
      '주민환경연구원 발대식 장면 (1차년도 대표)',
      '쓰레갖기 활동 현장 (1차년도 실험)',
      '아파트 수거함 설치·전경 (2차년도 대표)',
      '그린고산실천단 회의 장면 (2차년도 거버넌스)',
      '앱 화면 또는 사용 장면 (3차년도 대표)',
      '성과공유회 현장 (3차년도 마무리)',
    ],
    photoCount: 6,
    designerNote: 'NotebookLM 제작 타임라인 시안 별도 전달 예정. 시안을 참고해 책자 톤에 맞게 재구성해 주세요.',
  },
  {
    id: 'prologue-1',
    part: '프롤로그',
    title: 'P-1. 왜 종이팩인가',
    layout: '전면배경',
    layoutNote: '섹션 첫 페이지 전체를 종이팩 사진이 배경으로 깔림. 제목·첫 문장은 사진 위 흰색 텍스트로 오버레이',
    excerpt: '우리나라에서는 매년 약 7만 톤의 종이팩이 배출된다. 그러나 국내 종이팩 회수율은 전국 평균 약 14.8% 수준에 머문다. 재활용 가능한 자원이 수거 구조와 정보 부족 때문에 폐기물로 처리되고 있다.',
    photoGuide: ['수거함에 쌓인 종이팩 더미 — 세척 전후 비교 가능하면 더 좋음'],
    photoCount: 1,
    notes: '대안: 종이팩 분리배출 안내 표지판 또는 수거함 외관 전경',
  },
  {
    id: 'prologue-2',
    part: '프롤로그',
    title: 'P-2. 왜 주민인가',
    layout: '반면배경',
    layoutNote: '페이지 우측 절반을 주민 활동 사진이 차지. 좌측에 본문 텍스트 배치',
    excerpt: '"고작 우유팩 하나 더 분리배출한다고 해서 기후환경이 달라질까라는 의문도 있었습니다. 하지만 내가 변하고, 가족이 변하고, 같은 환경의식을 가진 사람들이 한 사람씩 모이기 시작하면 결국 변화는 만들어질 수 있다는 것을 직접 경험하게 되었습니다." — 신철주 주민환경연구원',
    photoGuide: ['주민환경연구원 2~3명이 함께 있는 현장 사진 — 활동 중 자연스러운 장면'],
    photoCount: 1,
    notes: '얼굴 노출 동의 여부 반드시 확인',
  },
  {
    id: '1-1',
    part: '1부',
    title: '1-1. 고산동은 어떤 동네인가',
    layout: '전면배경',
    layoutNote: '1부 오프닝 전면. 고산동 전경이 독자의 첫인상을 결정함. 텍스트는 하단 또는 중앙 오버레이',
    excerpt: '고산동은 사람이 살기 좋은 곳이다. 배산임수와 선상지가 발달한 지리적 특성 덕분에 토양이 비옥해 선사시대부터 사람들이 모여 살아온 주거지다. 살기 좋은 분위기 덕분에 주민들 사이의 소통이 활발하고, 마을에 문제가 생기면 주민이 스스로 나서서 지자체와 소통하며 해결하려는 성향이 높다.',
    photoGuide: ['고산동 아파트 단지 전경 — 항공뷰 또는 도로변 전경'],
    photoCount: 1,
    notes: '대안: 욱수천·매호천·망월지 하천 전경 또는 고산·천을산 녹지 사진',
  },
  {
    id: '1-2',
    part: '1부',
    title: '1-2. 주민환경연구원이 되다',
    layout: '틀삽화(소)',
    layoutNote: '본문 중간 소삽화 2장 가로 나란히. 교육 장면 + 현장 조사 장면',
    excerpt: '그린고산실천단과 함께 사업설명회를 열어 취지와 계획을 공유했고, 유동인구가 많은 곳과 유관기관에 홍보물을 배치했다. 그 결과 2주 만에 47명이 지원했고, 모두와 1:1 면담을 진행했다.',
    photoGuide: [
      '강의·교육 듣는 주민환경연구원 장면',
      '현장 조사 나간 장면 — 수첩 들고 동네 돌아다니는 모습',
    ],
    photoCount: 2,
  },
  {
    id: '1-3a',
    part: '1부',
    title: '1-3. 우유백패킹 (고산1동)',
    layout: '틀삽화(소)',
    layoutNote: '\'우유백패킹\' 소제목 옆 소삽화 1장',
    excerpt: '고산1동은 \'우유백패킹\'이라는 이름으로 실험을 기획했다. \'씻고-펼치고-말리고\' 3단계 실천 요령을 담은 카드뉴스와 리플렛을 만들고, 아파트 게시판과 SNS를 통해 주민에게 캠페인을 진행했다. 실험 이후 주민의 종이팩 인식은 평균 4.75점으로 향상됐다.',
    photoGuide: ['배낭에 종이팩 담아 이동하는 장면 또는 우유백패킹 캠페인 현장'],
    photoCount: 1,
  },
  {
    id: '1-3b',
    part: '1부',
    title: '1-3. 쓰레갖기 (고산2동)',
    layout: '틀삽화(소)',
    layoutNote: '\'쓰레갖기\' 소제목 옆 소삽화 1장',
    excerpt: '고산2동의 실험은 도시에서 흔히 지나치는 \'작은 쓰레기\'에서 출발했다. 활동 이후 지역사회 작은 쓰레기 문제 관심도는 3.72점에서 4.45점으로 높아졌다. 이제 그 쓰레기를 인식하고 \'다시 갖고 가는 주민\'이 생겼다.',
    photoGuide: ['쓰레기 줍는 활동 현장 — 집게·장갑 착용, 공원·골목 배경'],
    photoCount: 1,
  },
  {
    id: '1-3c',
    part: '1부',
    title: '1-3. 뿌리덮은 나무 (고산3동)',
    layout: '틀삽화(소)',
    layoutNote: '\'뿌리덮은 나무\' 소제목 옆 소삽화 1장',
    excerpt: '"낙엽은 공원의 이불입니다", "나무뿌리를 덮어주세요" 같은 감성적인 캠페인 문구를 개발했다. 공원생태환경 문제 관심도는 3.60점에서 4.31점으로 높아졌다. 주민이 발견한 문제가 행정의 실행으로 이어진 사례였다.',
    photoGuide: ['매호공원에서 활동하는 장면 또는 공원 나무뿌리·낙엽 전경'],
    photoCount: 1,
  },
  {
    id: '1-4',
    part: '1부',
    title: '1-4. 종이팩 자원순환을 핵심 주제로',
    layout: '틀삽화(소)',
    layoutNote: '종이팩 세척 과정 소삽화 1장 — 독자가 방법을 직관적으로 이해하도록',
    excerpt: '종이팩은 일반 종이와 다르다. 올바르게 분리배출된 종이팩은 수거, 선별, 세척, 압착 과정을 거쳐 재생펄프로 가공되고 화장지 같은 생활용품 원료로 다시 쓰인다. 종이팩 1kg, 약 35개를 재활용하면 50m 두루마리 화장지 3개를 만들 수 있다.',
    photoGuide: ['종이팩 세척·건조 과정 — 싱크대 세척 또는 건조대 거치 장면'],
    photoCount: 1,
  },
  {
    id: '2-3',
    part: '2부',
    title: '2-3. 아파트 회수 모델',
    layout: '틀삽화(대)',
    layoutNote: '큰 틀 사진 1장(수거함 전경) + 소삽화 1장(사용 장면) 나란히. 수거함이 잘 보이는 구도 중요',
    excerpt: '아파트 모델의 핵심은 생활 동선 안에 수거 거점을 두는 것이다. 수거함 설치 이후 아파트 회수량은 2025년 3월부터 12월까지 632.7kg, 2026년 1월부터 5월까지 438.4kg이 회수됐다.',
    photoGuide: [
      '아파트 단지 내 수거함 전경 — 설치 완료 상태, 주변 환경 포함',
      '주민이 수거함에 종이팩 넣는 장면',
    ],
    photoCount: 2,
  },
  {
    id: '2-4',
    part: '2부',
    title: '2-4. 카페·유관기관 회수 모델',
    layout: '틀삽화(소)',
    layoutNote: '카페 내부 수거함 소삽화 1~2장. 카페 분위기와 수거함이 함께 보이도록',
    excerpt: '카페에서는 우유, 생크림, 음료 원재료 사용으로 종이팩이 지속적으로 발생한다. 카페 모델의 장점은 수거 효율만이 아니다. 민간 사업장이 지역 환경 실천의 거점이 될 수 있음을 보여준 모델이었다.',
    photoGuide: [
      '카페 내부 수거함 — 테이크아웃컵 옆에 설치된 종이팩 수거함',
      '카페 사장님 또는 직원이 안내·협력하는 장면',
    ],
    photoCount: 2,
  },
  {
    id: '2-5',
    part: '2부',
    title: '2-5. 학교·교육기관 회수 모델',
    layout: '틀삽화(소)',
    layoutNote: '학교 수거함 소삽화 1장',
    excerpt: '학교·교육기관 회수 모델은 수거량보다 인식 변화에 더 큰 의미를 둔 구조다. 학교는 단순한 수거처가 아니라 교육 거점이었다. 학생들은 종이팩이 폐지가 아니라 별도 분리배출이 필요한 자원이라는 점을 배웠다.',
    photoGuide: ['학교 급식실 또는 복도 수거함 설치 장면'],
    photoCount: 1,
  },
  {
    id: '2-6',
    part: '2부',
    title: '2-6. 그린고산실천단 거버넌스',
    layout: '반면배경',
    layoutNote: '섹션 첫 페이지 반면을 회의 사진이 차지. 공식적이고 협력적인 분위기 전달 중요',
    excerpt: '그린고산실천단의 의미는 자문에 그치지 않았다. 주민이 제안한 아이디어를 실행계획으로 바꾸고, 필요한 기관을 연결하고, 행정 절차와 현장 운영 사이의 간격을 줄이는 역할을 했다. 주민의 실천이 실제 운영 구조로 이어질 수 있었던 배경이다.',
    photoGuide: ['그린고산실천단 정기회의 장면 — 테이블에 앉아 논의하는 모습, 여러 기관 참여자'],
    photoCount: 1,
  },
  {
    id: '2-7',
    part: '2부',
    title: '2-7. 노인일자리와 수거 체계',
    layout: '틀삽화(소)',
    layoutNote: '어르신 활동 소삽화 2장 — 따뜻하고 활기찬 분위기 중요',
    excerpt: '고산동 모델은 이 문제를 지역 노인일자리와 연결해 풀었다. 이 구조는 수거 인력의 지속성을 높였고, 동시에 지역 어르신의 사회참여와 일자리 효과도 만들었다. 사회복지관이 환경 사업을 할 때 가질 수 있는 강점이 여기에 있다.',
    photoGuide: [
      '어르신들이 수거 작업하는 장면 — 집하 장소, 활동복 착용',
      '수거된 종이팩 묶음·포대 쌓인 모습',
    ],
    photoCount: 2,
  },
  {
    id: '2-8',
    part: '2부',
    title: '2-8. 방송과 캠페인으로 확산하다',
    layout: '틀삽화(소)',
    layoutNote: '방송 장면 소삽화 1장 + 홍보 이미지 1장',
    excerpt: 'TBN 대구교통방송 \'류강국의 출발! 대구대행진\' \'지구를 지켜라\' 코너를 통해 고산동의 종이팩 자원순환 활동을 알렸다. 방송 활동은 사업을 복지관 내부 활동에 머무르게 하지 않고, 지역사회 전체의 환경 의제로 확산하는 역할을 했다.',
    photoGuide: [
      'TBN 라디오 방송 출연 장면 또는 방송 캡처 이미지',
      '환경감수성향상챌린지 홍보 이미지 또는 캠페인 현장',
    ],
    photoCount: 2,
    notes: '방송 캡처 사용 시 TBN 측 저작권 확인 필요',
  },
  {
    id: '3-2',
    part: '3부',
    title: '3-2. 주민이 그린 고산 앱',
    layout: '스크린샷',
    layoutNote: '앱 스크린샷 2~3장을 스마트폰 목업 프레임 안에 나란히 배치. 기획사가 목업 프레임 제작',
    excerpt: '세 문제의 공통점은 하나였다. 정보가 흩어져 있었다. 이 정보를 한 곳에 모으고 누구나 쉽게 접근할 수 있는 디지털 창구가 필요했다.',
    photoGuide: [
      '앱 메인 화면 스크린샷 (고화질 PNG)',
      '수거함 위치 지도 화면 스크린샷',
      '수거량 기록 화면 스크린샷',
    ],
    photoCount: 3,
    notes: '앱 캡처는 고화질 PNG로 제공. 화면 해상도 최대로 설정 후 캡처',
    designerNote: '스마트폰 목업 프레임(테두리)은 기획사 제작. 내부 화면 이미지만 제공하면 됩니다.',
  },
  {
    id: '3-3',
    part: '3부',
    title: '3-3. 주민이 그린 고산 매뉴얼',
    layout: '틀삽화(소)',
    layoutNote: '매뉴얼 제작 과정 소삽화 1장',
    excerpt: '왜 책자 형태인가. 디지털 플랫폼이 아무리 정교해도 오프라인 현장에서 바로 펼쳐볼 수 있는 인쇄물의 역할을 완전히 대체하기는 어렵다. 앱이 모바일로 접근하는 사람들을 위한 창구라면, 매뉴얼은 책상 위에 펼쳐두고 따라 할 수 있는 길잡이다.',
    photoGuide: ['매뉴얼 제작 회의 장면 또는 초안 검토 장면'],
    photoCount: 1,
  },
  {
    id: '5-3',
    part: '5부',
    title: '5-3. 수성구청 협력 경과',
    layout: '틀삽화(소)',
    layoutNote: '협력 현장 소삽화 1장 — 민관 협력의 실제 모습 전달',
    excerpt: '2차년도 성과 세미나에서 수성구청 자원순환과 배순향 팀장이 토론자로 참여해, 종이팩 수거 문제를 지자체 차원에서도 검토해볼 수 있다는 의향을 밝혔다. 2026년 6월 23일에는 수성구청이 먼저 자리를 만들었다. 복지관이 먼저 문을 두드린 것이 아니었다.',
    photoGuide: [
      '2차년도 성과 세미나 현장 — 배순향 팀장 토론 장면',
      '또는 2026.6.23 수성구자원회수센터 본부장 회의 장면',
    ],
    photoCount: 1,
    notes: '최근 회의 사진 있으면 가장 좋음. 없으면 세미나 현장 사진으로 대체',
  },
  {
    id: 'gallery',
    part: '부록',
    title: '활동사진 갤러리 (2~4p)',
    layout: '갤러리',
    layoutNote: '3년 활동사진 그리드 배치. 각 사진 아래 짧은 캡션(날짜+활동명) 포함. 2~4페이지 분량',
    excerpt: '3년간 고산동 주민환경연구원과 함께한 활동의 기록입니다. 2023년 발대식부터 2026년 현재까지, 현장에서 함께했던 순간들을 담았습니다.',
    photoGuide: [
      '발대식 장면 (1차년도)',
      '현장 조사 장면 (1차년도)',
      '쓰레갖기·우유백패킹·공원 활동 (1차년도 실험)',
      '수거함 설치 장면 (2차년도)',
      '세 팀 활동 장면 — 팩누리팀·ECO그린팀·요기모다팀',
      '그린고산실천단 회의 장면',
      '어르신 수거 활동 장면',
      '캠페인·홍보 현장',
      '앱 개발 회의 또는 사용 장면',
      '성과공유회 현장 (3차년도)',
      '그 외 인상적인 활동 사진 전반',
    ],
    photoCount: 20,
    notes: '개인 얼굴 노출 사진은 당사자 동의 필수. 사진마다 캡션(날짜·활동명) 함께 정리해 전달',
    designerNote: '그리드 크기와 캡션 레이아웃은 기획사 재량. 20~30장 기준으로 2~4페이지 배치 부탁드립니다.',
  },
]

export default function DesignerPage() {
  const [sectionPhotos, setSectionPhotos] = useState<Record<string, UploadedPhoto[]>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const loadPhotos = useCallback(async () => {
    const results: Record<string, UploadedPhoto[]> = {}
    await Promise.all(
      SECTIONS.map(async (section) => {
        const { data } = await supabase.storage
          .from('manuscripts')
          .list(`photos/${section.id}`, { sortBy: { column: 'updated_at', order: 'desc' } })
        if (!data || data.length === 0) { results[section.id] = []; return }
        const photos = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('manuscripts')
              .createSignedUrl(`photos/${section.id}/${file.name}`, 3600)
            const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
            return {
              name: file.name,
              url: urlData?.signedUrl ?? '',
              isImage: ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext),
            }
          })
        )
        results[section.id] = photos
      })
    )
    setSectionPhotos(results)
  }, [])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  async function handleUpload(sectionId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(sectionId)
    await Promise.all(Array.from(files).map(async (file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const rid = Math.random().toString(36).slice(2, 7)
      const filePath = `photos/${sectionId}/${Date.now()}_${rid}.${ext}`
      await supabase.storage.from('manuscripts').upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
      })
    }))
    await loadPhotos()
    setUploading(null)
    const ref = fileRefs.current[sectionId]
    if (ref) ref.value = ''
  }

  async function handleDelete(sectionId: string, fileName: string) {
    if (!confirm('이 사진을 삭제할까요?')) return
    await supabase.storage.from('manuscripts').remove([`photos/${sectionId}/${fileName}`])
    await loadPhotos()
  }

  async function handleDownload(sectionId: string, fileName: string) {
    const ext = fileName.split('.').pop() ?? 'jpg'
    const displayName = `${sectionId}_${fileName}`
    const { data } = await supabase.storage.from('manuscripts')
      .createSignedUrl(`photos/${sectionId}/${fileName}`, 60, { download: displayName })
    if (data) window.location.href = data.signedUrl
  }

  const totalNeeded = SECTIONS.reduce((s, i) => s + i.photoCount, 0)
  const totalUploaded = Object.values(sectionPhotos).reduce((s, arr) => s + arr.length, 0)
  const pct = totalNeeded > 0 ? Math.min(Math.round((totalUploaded / totalNeeded) * 100), 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">🎨 디자이너 브리핑</h1>
          <p className="text-sm text-gray-500">섹션별 원고 발췌 · 배치 방식 · 사진 가이드 · 사진 파일 첨부 — 이 페이지 URL을 디자이너에게 공유하세요</p>
        </div>

        {/* 진행률 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-5 items-center">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>사진 첨부 현황</span>
              <span className="font-medium text-gray-700">{totalUploaded} / {totalNeeded}장</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-green-700">{pct}%</div>
            <div className="text-xs text-gray-400">첨부 완료</div>
          </div>
        </div>

        {/* 배치 유형 범례 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(Object.entries(LAYOUT_DESC) as [LayoutType, string][]).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LAYOUT_COLORS[k]}`}>{k}</span>
              <span className="text-xs text-gray-500 hidden md:inline">{v}</span>
            </div>
          ))}
        </div>

        {/* 섹션 카드 */}
        <div className="space-y-5">
          {SECTIONS.map(section => {
            const photos = sectionPhotos[section.id] ?? []
            const isUploading = uploading === section.id

            return (
              <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                {/* 컬러 헤더 */}
                <div className={`px-5 py-3 flex items-center justify-between gap-3 ${LAYOUT_COLORS[section.layout]}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold opacity-70 shrink-0 bg-black/10 px-2 py-0.5 rounded">{section.part}</span>
                    <span className="font-bold text-sm truncate">{section.title}</span>
                  </div>
                  <span className="shrink-0 text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">{section.layout}</span>
                </div>

                <div className="p-5 space-y-4">

                  {/* 배치 안내 */}
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                    <span className="text-base shrink-0">📐</span>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">배치 방식</span>
                      <p className="text-sm text-gray-700 mt-0.5">{section.layoutNote}</p>
                    </div>
                  </div>

                  {/* 원고 발췌 */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">원고 발췌</span>
                    <blockquote className="mt-1.5 border-l-4 border-green-400 pl-3 text-sm text-gray-700 leading-relaxed italic">
                      {section.excerpt}
                    </blockquote>
                  </div>

                  {/* 필요 사진 */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">필요 사진 ({section.photoCount}장)</span>
                    <ul className="mt-1.5 space-y-1">
                      {section.photoGuide.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 shrink-0 mt-0.5">▸</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                    {section.notes && (
                      <p className="mt-2 text-xs text-amber-600 flex gap-1"><span>※</span><span>{section.notes}</span></p>
                    )}
                  </div>

                  {/* 디자이너 메모 */}
                  {section.designerNote && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-blue-700 leading-relaxed">
                        <span className="font-bold">🎨 디자이너께 </span>{section.designerNote}
                      </p>
                    </div>
                  )}

                  {/* 업로드된 사진 */}
                  {photos.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">첨부된 사진</span>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {photos.map(photo => (
                          <div key={photo.name} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                            {photo.isImage ? (
                              <img src={photo.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                <span className="text-2xl">📄</span>
                                <span className="text-xs text-gray-500 text-center break-all line-clamp-2">
                                  {photo.name.replace(/^\d+_[a-z0-9]+\./, '파일.')}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDownload(section.id, photo.name)}
                                className="text-white text-xs bg-white/20 hover:bg-white/40 rounded px-2 py-1 transition-colors"
                              >↓ 다운</button>
                              <button
                                onClick={() => handleDelete(section.id, photo.name)}
                                className="text-red-300 text-xs bg-white/20 hover:bg-white/40 rounded px-2 py-1 transition-colors"
                              >✕ 삭제</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 업로드 버튼 */}
                  <label className={`flex items-center justify-center gap-2 cursor-pointer text-sm px-4 py-2.5 rounded-xl border-2 border-dashed transition-colors w-full ${
                    isUploading
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-green-300 text-green-700 hover:bg-green-50'
                  }`}>
                    {isUploading
                      ? '업로드 중...'
                      : photos.length > 0
                        ? `+ 사진 추가 (현재 ${photos.length}장)`
                        : '+ 사진 업로드'}
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.pdf"
                      multiple
                      className="hidden"
                      disabled={isUploading}
                      ref={el => { fileRefs.current[section.id] = el }}
                      onChange={e => handleUpload(section.id, e)}
                    />
                  </label>

                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-green-800">📬 디자이너 전달 방법</p>
          <p className="text-xs text-green-700">이 페이지 URL을 디자이너에게 공유하세요. 섹션별 원고 맥락·배치 방식·사진을 한 화면에서 확인하고 바로 작업에 들어갈 수 있습니다.</p>
          <p className="text-xs font-bold text-green-800 mt-2">📌 전달 전 체크사항</p>
          <ul className="space-y-1 text-xs text-green-700">
            {[
              '얼굴이 나온 사진 — 당사자 동의 확인 완료',
              '앱 스크린샷 — 고화질 PNG로 업로드',
              '방송 캡처 — TBN 저작권 확인',
              '부록 갤러리 사진 — 캡션(날짜+활동명) 파일명에 포함해 업로드',
            ].map((t, i) => (
              <li key={i} className="flex gap-1.5"><span>·</span><span>{t}</span></li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
