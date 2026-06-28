'use client'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

type PlacementType = '전면' | '반면' | '소삽화' | '인포그래픽' | '스크린샷'
type GatherStatus = 'none' | 'partial' | 'done'

type PhotoItem = {
  id: string
  section: string
  part: string
  placement: PlacementType
  count: number
  photos: string[]
  notes?: string
  reuse?: string
}

const PHOTO_GUIDE: PhotoItem[] = [
  {
    id: 'cover-foreword',
    section: '발간사',
    part: '발간사 (1p)',
    placement: '소삽화',
    count: 1,
    photos: ['관장 김순애 사진 (증명사진 또는 활동 현장)'],
    notes: '기존 보유 확인. 행사·회의 등 자연스러운 장면 선호',
  },
  {
    id: 'timeline-1',
    section: '타임라인',
    part: '타임라인 (3~5p)',
    placement: '인포그래픽',
    count: 6,
    photos: [
      '주민환경연구원 발대식 장면 (1차년도)',
      '쓰레갖기 활동 현장 (1차년도)',
      '아파트 수거함 설치·전경 (2차년도)',
      '그린고산실천단 회의 장면 (2차년도)',
      '앱 화면 스크린샷 또는 사용 장면 (3차년도)',
      '성과공유회 현장 (3차년도)',
    ],
    notes: '기획사가 타임라인 인포그래픽 제작 시 사진 옆 삽화로 배치',
  },
  {
    id: 'prologue-1',
    section: '프롤로그',
    part: 'P-1. 왜 종이팩인가',
    placement: '반면',
    count: 1,
    photos: ['수거함에 쌓인 종이팩 더미 (세척 전후 비교 가능하면 더 좋음)'],
    notes: '대안: 종이팩 분리배출 안내 표지판 또는 수거함 외관',
  },
  {
    id: 'prologue-2',
    section: '프롤로그',
    part: 'P-2. 왜 주민인가',
    placement: '반면',
    count: 1,
    photos: ['주민환경연구원 2~3명이 함께 있는 현장 사진'],
    notes: '얼굴 나와도 되는 분들 확인 필요. 개인정보 동의 여부 확인',
  },
  {
    id: '1-1',
    section: '1부',
    part: '1-1. 고산동은 어떤 동네인가',
    placement: '전면',
    count: 1,
    photos: ['고산동 아파트 단지 전경 (외부에서 찍은 항공뷰 또는 도로변 전경)'],
    notes: '대안: 동네 골목·상가·공원 등 지역 특성 보여주는 사진',
  },
  {
    id: '1-2',
    section: '1부',
    part: '1-2. 주민환경연구원이 되다',
    placement: '소삽화',
    count: 2,
    photos: [
      '강의·교육 듣는 주민연구원 장면',
      '현장 조사 나간 장면 (수첩 들고 동네 돌아다니는 등)',
    ],
  },
  {
    id: '1-3a',
    section: '1부',
    part: '1-3. 우유백패킹 (고산1동)',
    placement: '소삽화',
    count: 1,
    photos: ['배낭에 종이팩 담아 이동하는 장면 또는 활동 결과물'],
  },
  {
    id: '1-3b',
    section: '1부',
    part: '1-3. 쓰레갖기 (고산2동)',
    placement: '소삽화',
    count: 1,
    photos: ['쓰레기 줍는 활동 현장 (도구·장갑 착용 장면)'],
  },
  {
    id: '1-3c',
    section: '1부',
    part: '1-3. 뿌리덮은 나무 (고산3동)',
    placement: '소삽화',
    count: 1,
    photos: ['공원에서 활동하는 장면 또는 공원 전경'],
  },
  {
    id: '1-4',
    section: '1부',
    part: '1-4. 종이팩을 핵심 주제로',
    placement: '소삽화',
    count: 1,
    photos: ['종이팩 세척·건조 과정 (싱크대 세척 또는 건조대 거치 장면)'],
  },
  {
    id: '2-3',
    section: '2부',
    part: '2-3. 아파트 회수 모델',
    placement: '반면',
    count: 2,
    photos: [
      '아파트 단지 내 수거함 전경 (설치 완료 상태)',
      '주민이 수거함에 종이팩 넣는 장면',
    ],
  },
  {
    id: '2-4',
    section: '2부',
    part: '2-4. 카페·유관기관 회수 모델',
    placement: '소삽화',
    count: 2,
    photos: [
      '카페 내부 수거함 (테이크아웃컵 수거함 옆 종이팩 수거함)',
      '카페 사장님 또는 직원이 안내하는 장면',
    ],
  },
  {
    id: '2-5',
    section: '2부',
    part: '2-5. 학교·교육기관 회수 모델',
    placement: '소삽화',
    count: 1,
    photos: ['학교 급식실 또는 복도 수거함 설치 장면'],
  },
  {
    id: '2-6',
    section: '2부',
    part: '2-6. 그린고산실천단 거버넌스',
    placement: '반면',
    count: 1,
    photos: ['그린고산실천단 정기회의 장면 (테이블에 앉아 논의하는 모습)'],
  },
  {
    id: '2-7',
    section: '2부',
    part: '2-7. 노인일자리와 수거 체계',
    placement: '소삽화',
    count: 2,
    photos: [
      '어르신들이 수거 작업하는 장면 (집하 장소)',
      '수거된 종이팩 묶음·포대 쌓인 모습',
    ],
  },
  {
    id: '2-8',
    section: '2부',
    part: '2-8. 방송과 캠페인으로 확산하다',
    placement: '소삽화',
    count: 2,
    photos: [
      'TBN 라디오 방송 스튜디오 또는 출연 장면 (또는 방송 캡처 이미지)',
      '환경감수성향상챌린지 온라인 홍보 이미지 캡처',
    ],
    notes: '방송 캡처는 TBN 측 저작권 확인 필요',
  },
  {
    id: '3-2',
    section: '3부',
    part: '3-2. 주민이 그린 고산 앱',
    placement: '스크린샷',
    count: 3,
    photos: [
      '앱 메인 화면 스크린샷',
      '수거함 위치 지도 화면 스크린샷',
      '수거량 기록 화면 스크린샷',
    ],
    notes: '앱 캡처본 고화질 PNG로 별도 제공 필요. 스마트폰 목업 형태로 기획사 편집',
  },
  {
    id: '3-3',
    section: '3부',
    part: '3-3. 주민이 그린 고산 매뉴얼',
    placement: '소삽화',
    count: 1,
    photos: ['매뉴얼 제작 회의 장면 또는 초안 검토 장면'],
  },
  {
    id: '4-2',
    section: '4부',
    part: '4-2. 주민환경연구원 모집',
    placement: '소삽화',
    count: 1,
    photos: ['모집 홍보물 부착 장면 또는 설명회·발대식 현장'],
    reuse: '1-2 사진 재활용 가능',
  },
  {
    id: '4-3',
    section: '4부',
    part: '4-3. 수거 거점 구축 (아파트·카페·학교)',
    placement: '소삽화',
    count: 3,
    photos: [
      '아파트 수거함 전경',
      '카페 수거함',
      '학교 수거함',
    ],
    reuse: '2-3, 2-4, 2-5 사진 그대로 재활용 — 별도 촬영 불필요',
  },
  {
    id: '4-4',
    section: '4부',
    part: '4-4. 세척·집하·납품 구조',
    placement: '소삽화',
    count: 2,
    photos: [
      '싱크대에서 종이팩 세척하는 장면',
      '집하 장소에 쌓인 종이팩 묶음 (천마산업 납품 직전 상태)',
    ],
    notes: '흐름도(사진+화살표 조합)로 배치하면 이해도 높음 — 기획사와 협의',
  },
  {
    id: '5-1',
    section: '5부',
    part: '5-1. 3년의 성과',
    placement: '인포그래픽',
    count: 0,
    photos: [],
    notes: '수치 인포그래픽 — 기획사 제작. 사진 불필요. 부록 A-1 참여 현황표 수치 그대로 활용',
  },
  {
    id: '5-3',
    section: '5부',
    part: '5-3. 수성구청 협력 경과',
    placement: '소삽화',
    count: 1,
    photos: ['2차년도 성과 세미나 현장 (배순향 팀장 토론 장면) 또는 2026.6.23 회의 장면'],
    notes: '최근 회의 사진 있으면 가장 좋음. 공식 사진 없으면 회의 장면 연출 촬영 고려',
  },
  {
    id: 'appendix-a6',
    section: '부록',
    part: 'A-6. 주민환경연구원 소감',
    placement: '소삽화',
    count: 5,
    photos: [
      '이하준 주민환경연구원 활동 사진',
      '남혜신 주민환경연구원 활동 사진',
      '남기룡 주민환경연구원 활동 사진',
      '장미경 주민환경연구원 활동 사진',
      '최미화 주민환경연구원 활동 사진',
    ],
    notes: '10명 전원 또는 대표 3~4장. 개인정보(사진 게재) 동의 여부 반드시 확인 필요',
  },
]

const PLACEMENT_COLORS: Record<PlacementType, string> = {
  전면: 'bg-purple-100 text-purple-700',
  반면: 'bg-blue-100 text-blue-700',
  소삽화: 'bg-gray-100 text-gray-600',
  인포그래픽: 'bg-orange-100 text-orange-700',
  스크린샷: 'bg-teal-100 text-teal-700',
}

const SECTION_ORDER = ['발간사', '타임라인', '프롤로그', '1부', '2부', '3부', '4부', '5부', '부록']

const STATUS_CONFIG: Record<GatherStatus, { label: string; color: string; next: GatherStatus }> = {
  none: { label: '미수합', color: 'bg-red-100 text-red-600', next: 'partial' },
  partial: { label: '수합 중', color: 'bg-yellow-100 text-yellow-700', next: 'done' },
  done: { label: '수합 완료', color: 'bg-green-100 text-green-700', next: 'none' },
}

export default function PhotoGuidePage() {
  const [statuses, setStatuses] = useState<Record<string, GatherStatus>>({})
  const [filter, setFilter] = useState<'all' | GatherStatus>('all')
  const [sectionFilter, setSectionFilter] = useState<string>('전체')

  useEffect(() => {
    const saved = localStorage.getItem('photo-guide-statuses')
    if (saved) setStatuses(JSON.parse(saved))
  }, [])

  function cycleStatus(id: string) {
    const current = statuses[id] ?? 'none'
    const next = STATUS_CONFIG[current].next
    const updated = { ...statuses, [id]: next }
    setStatuses(updated)
    localStorage.setItem('photo-guide-statuses', JSON.stringify(updated))
  }

  const totalPhotos = PHOTO_GUIDE.reduce((s, i) => s + i.count, 0)
  const doneCount = PHOTO_GUIDE.filter(i => statuses[i.id] === 'done').reduce((s, i) => s + i.count, 0)
  const partialCount = PHOTO_GUIDE.filter(i => statuses[i.id] === 'partial').length

  const filtered = PHOTO_GUIDE.filter(item => {
    const statusMatch = filter === 'all' || (statuses[item.id] ?? 'none') === filter
    const sectionMatch = sectionFilter === '전체' || item.section === sectionFilter
    return statusMatch && sectionMatch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">📸 사진 가이드</h1>
          <p className="text-sm text-gray-500">섹션별 필요 사진 목록 — 디자이너 전달 전 수합 현황 관리</p>
        </div>

        {/* 진행 요약 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-6 items-center">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>수합 진행률</span>
              <span className="font-medium text-gray-700">{doneCount} / {totalPhotos}장</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalPhotos ? (doneCount / totalPhotos) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-green-700">{totalPhotos > 0 ? Math.round((doneCount / totalPhotos) * 100) : 0}%</div>
            <div className="text-xs text-gray-400">완료</div>
          </div>
        </div>

        {/* 요약 뱃지 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">전체 섹션 {PHOTO_GUIDE.length}개</span>
          <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">미수합 {PHOTO_GUIDE.filter(i => !statuses[i.id] || statuses[i.id] === 'none').length}개</span>
          <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">수합 중 {partialCount}개</span>
          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">완료 {PHOTO_GUIDE.filter(i => statuses[i.id] === 'done').length}개</span>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(['all', 'none', 'partial', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === f ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? '전체 보기' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-5 flex-wrap">
          {['전체', ...SECTION_ORDER].map(s => (
            <button
              key={s}
              onClick={() => setSectionFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                sectionFilter === s ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 카드 목록 */}
        <div className="space-y-3">
          {filtered.map(item => {
            const status = statuses[item.id] ?? 'none'
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={item.id} className={`bg-white rounded-xl border p-4 transition-all ${
                status === 'done' ? 'border-green-200 opacity-70' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-semibold text-gray-400 uppercase">{item.section}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLACEMENT_COLORS[item.placement]}`}>
                        {item.placement}
                      </span>
                      {item.count > 0 && (
                        <span className="text-xs text-gray-400">{item.count}장</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-800">{item.part}</p>
                  </div>
                  {item.count > 0 && (
                    <button
                      onClick={() => cycleStatus(item.id)}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${cfg.color} hover:opacity-80`}
                    >
                      {cfg.label}
                    </button>
                  )}
                  {item.count === 0 && (
                    <span className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-400">기획사 제작</span>
                  )}
                </div>

                {item.photos.length > 0 && (
                  <ul className="space-y-1 mb-2">
                    {item.photos.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-300 mt-0.5 shrink-0">▸</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {item.reuse && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">재활용</span>
                    <span className="text-xs text-gray-500">{item.reuse}</span>
                  </div>
                )}

                {item.notes && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <span className="text-xs text-amber-600 font-medium shrink-0">※</span>
                    <span className="text-xs text-gray-500">{item.notes}</span>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">해당 조건에 맞는 항목이 없습니다</div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">📌 디자이너 전달 전 체크사항</p>
          <ul className="space-y-1">
            {[
              '얼굴이 나온 사진은 반드시 당사자 동의 확인',
              '앱 스크린샷은 고화질 PNG로 별도 폴더 정리',
              '방송 캡처는 TBN 저작권 확인',
              '타임라인 6장 + 각 파트 사진은 섹션별 폴더로 분류해 전달',
            ].map((t, i) => (
              <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                <span className="shrink-0">·</span><span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
