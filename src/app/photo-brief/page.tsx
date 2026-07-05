'use client'
import Nav from '@/components/Nav'

type Entry = {
  idx: string
  loc: string
  title: string
  badge: string
  count: string
  need: string
  pick: string
  place: string
  folder: string
  imgs?: { file: string; label: string }[]
  note?: string
  warn?: string
}

const BADGE_COLORS: Record<string, string> = {
  '전면': 'bg-indigo-100 text-indigo-700',
  '반면': 'bg-violet-100 text-violet-700',
  '소삽화': 'bg-gray-100 text-gray-600',
  '인포그래픽': 'bg-orange-100 text-orange-700',
  '스크린샷': 'bg-teal-100 text-teal-700',
  '미확보': 'bg-red-100 text-red-600',
}

const ENTRIES: Entry[] = [
  {
    idx: '00', loc: '표지', title: '표지 대표컷', badge: '전면', count: '3장 중 1장 확정',
    need: '매뉴얼 전체를 상징하는 대표컷 (표지 폴더는 비어 있어 다른 폴더에서 선정)',
    pick: '① 페이스북 6.jpg — 「주민이 Green 고산」발대식 및 위촉식 전체 배너와 일시·장소·주관까지 선명한 18인 단체샷. 정보성·구도·해상도 모두 최상, 최우선 추천. ② 페이스북 4.jpg — 같은 발대식에서 10인이 협약서를 든 조인식 컷, ①과 세트로 좋음. ③ 에너지마을 선진지견학 옥상 태양광 패널 단체샷 — 구도는 인상적이나 브랜드 요소가 없어 보조 후보.',
    place: '표지 전면 배경 또는 상단 1/2 배치. 제목·부제는 사진 위 반투명 박스.',
    folder: '잘나온사진 폴더',
    imgs: [
      { file: 'cover-fb6.jpg', label: '① 발대식 전체' },
      { file: 'cover-fb4.jpg', label: '② 조인식' },
      { file: 'cover-energy.jpg', label: '③ 에너지마을 견학' },
    ],
  },
  {
    idx: '01', loc: '발간사', title: '관장 인사말 사진', badge: '소삽화', count: '2장 중 1장 권장',
    need: '청곡종합사회복지관장 — 인물 사진',
    pick: '① 관장님 사진 — 정면 프로필컷으로 우선 권장. ② 스냅컷 — 자연스러운 표정의 보조 후보.',
    place: '본문 좌측 상단 원형 소삽화(35mm), 이름·직함 캡션 동반.',
    folder: '00_발간사',
    imgs: [
      { file: 'foreword.jpg', label: '① 프로필컷' },
      { file: 'foreword2.jpg', label: '② 스냅컷' },
    ],
  },
  {
    idx: '02', loc: '1-2', title: '주민환경연구원이 탄생하다', badge: '소삽화', count: '2장 중 1장 권장',
    need: '사업설명회 현장',
    pick: '① 1차년도 사업설명회(1) — 전체 분위기가 잘 보여 대표컷으로 권장. ② 사업설명회(2) — 참석 주민 반응 컷, 보조용.',
    place: '본문 우측 반면 배치.',
    folder: '03_1부_2',
    imgs: [
      { file: '1-2a.jpg', label: '① 사업설명회(1)' },
      { file: '1-2b.jpg', label: '② 사업설명회(2)' },
    ],
  },
  {
    idx: '03', loc: '1-3(고산1동)', title: '우유백패킹', badge: '소삽화', count: '1장',
    need: '고산1동 활동 현장',
    pick: '후보가 1장뿐입니다. 그대로 채택.',
    place: '소제목 옆 소삽화 40mm.',
    folder: '03_1부_3a',
    imgs: [{ file: '1-3a.jpg', label: '고산1동 우유백패킹' }],
  },
  {
    idx: '04', loc: '1-3(고산2동)', title: '쓰레갖기', badge: '소삽화', count: '1장',
    need: '고산2동 활동 현장',
    pick: '후보가 1장뿐입니다. 그대로 채택.',
    place: '소제목 옆 소삽화 40mm.',
    folder: '03_1부_3b',
    imgs: [{ file: '1-3b.jpg', label: '고산2동 쓰레갖기' }],
  },
  {
    idx: '05', loc: '1-3(고산3동)', title: '뿌리덮은 나무', badge: '소삽화', count: '1장',
    need: '고산3동 활동 현장',
    pick: '후보가 1장뿐입니다. 그대로 채택.',
    place: '소제목 옆 소삽화 40mm.',
    folder: '03_1부_3c',
    imgs: [{ file: '1-3c.jpg', label: '고산3동 뿌리덮은 나무' }],
  },
  {
    idx: '06', loc: '1-4', title: '종이팩을 핵심 주제로', badge: '소삽화', count: '2장 중 1장 권장',
    need: '종이팩 제출·인증 장면',
    pick: '① 종이팩 제출 실사진 — 현장감이 살아 있어 우선 권장. ② 제출 인증샷 — 보조 후보.',
    place: '1부 마지막 문단 옆 소삽화 40mm.',
    folder: '03_1부_4',
    imgs: [
      { file: '1-4a.jpg', label: '① 종이팩 제출' },
      { file: '1-4b.jpg', label: '② 제출 인증' },
    ],
  },
  {
    idx: '07', loc: '2-2', title: '세 팀으로 나누어 역할을 정하다', badge: '소삽화', count: '4장',
    need: '팩누리 / 에코그린 / 요기모다 3개 팀 활동 장면 + 회수모델 전체 개요',
    pick: '팀별 사진 3장은 어느 한 팀도 누락되지 않도록 병렬 배치 권장. + "회수모델별 종이팩 수거함"(개요컷)은 아파트·카페·학교 3개 모델을 한 프레임에 담은 사진이라 특정 모델(아파트) 절에 넣기보다 이 절의 도입부나 2부 간지(부표지) 배경으로 쓰는 편이 내용과 더 맞습니다.',
    place: '팀 3장은 3단 나란히 + 팀명 캡션. 개요컷은 도입부 상단 또는 2부 간지 배경으로.',
    folder: '04_2부_2',
    imgs: [
      { file: '2-2a.jpg', label: '팩누리 팀' },
      { file: '2-2b.jpg', label: '에코그린 팀' },
      { file: '2-2c.jpg', label: '요기모다 팀' },
      { file: '2-3-overview.jpg', label: '회수모델 3종 개요' },
    ],
  },
  {
    idx: '08', loc: '2-3', title: '아파트 회수 모델', badge: '반면', count: '1장',
    need: '수거함 전경 / 이용 장면',
    pick: '해당 절 전용컷 1장. 그대로 채택.',
    place: '본문 하단 반면 배치.',
    folder: '04_2부_3',
    imgs: [{ file: '2-3.jpg', label: '아파트 회수 모델' }],
  },
  {
    idx: '09', loc: '2-4', title: '카페·유관기관 회수 모델', badge: '소삽화', count: '1장',
    need: '카페 내부 수거함 / 안내 장면',
    pick: '해당 절 전용컷 1장. 그대로 채택.',
    place: '본문 옆 소삽화.',
    folder: '04_2부_4',
    imgs: [{ file: '2-4.jpg', label: '카페 회수 모델' }],
  },
  {
    idx: '10', loc: '2-5', title: '학교·교육기관 회수 모델', badge: '소삽화', count: '1장',
    need: '학교 수거함 설치 장면',
    pick: '해당 절 전용컷 1장. 그대로 채택.',
    place: '본문 옆 소삽화 40mm.',
    folder: '04_2부_5',
    imgs: [{ file: '2-5.jpg', label: '학교·교육기관 회수 모델' }],
  },
  {
    idx: '11', loc: '2-6', title: '그린고산실천단 거버넌스', badge: '반면', count: '1장',
    need: '위촉식 장면',
    pick: 'Green고산실천단 위촉식 컷. 그대로 채택.',
    place: '본문 상단 반면.',
    folder: '04_2부_6',
    imgs: [{ file: '2-6.jpg', label: '위촉식' }],
  },
  {
    idx: '12', loc: '2-7', title: '노인일자리와 수거 체계', badge: '소삽화', count: '2장',
    need: '수거단 출범식 + 시니어클럽 협약 장면',
    pick: '① 종이팩 수거단 출범식 — 실제 일자리 참여 어르신들이 나오는 현장컷. ② 대구수성시니어클럽 협약식 — 노인일자리 연계 기관과의 협약 장면으로, 표지 후보에서 내려 이 절 본문으로 재배치.',
    place: '본문 옆 소삽화 2장, 나란히 배치.',
    folder: '04_2부_7',
    imgs: [
      { file: '2-7.jpg', label: '① 수거단 출범식' },
      { file: '2-7-senior.jpg', label: '② 시니어클럽 협약' },
    ],
    note: '참여자 얼굴 노출 시 게재 동의 확인 필요',
  },
  {
    idx: '13', loc: '2-8', title: '방송과 캠페인으로 확산하다', badge: '소삽화', count: '1장',
    need: 'MBC 라디오 출연 장면',
    pick: 'MBC 즐거운 오후 2시 출연 컷. 그대로 채택.',
    place: '본문 옆 소삽화, 출처(MBC) 캡션 필수.',
    folder: '04_2부_8',
    imgs: [{ file: '2-8.jpg', label: 'MBC 라디오 출연' }],
    note: '방송 캡처는 MBC 측 저작권 확인 필요',
  },
  {
    idx: '14', loc: '3-2', title: '주민이 그린 고산 앱', badge: '스크린샷', count: '2장',
    need: '앱 화면 스크린샷',
    pick: '① 앱 메인 화면 ② 수거함 위치 지도 화면 — 둘 다 스마트폰 프레임 목업으로 나란히 배치 권장.',
    place: '스마트폰 프레임 목업 2개 나란히.',
    folder: '05_3부_2',
    imgs: [
      { file: '3-2a.jpg', label: '① 메인 화면' },
      { file: '3-2b.jpg', label: '② 지도 화면' },
    ],
  },
  {
    idx: '15', loc: '3-3', title: '주민이 그린 고산 매뉴얼', badge: '소삽화', count: '2장 중 1장 권장',
    need: '매뉴얼 제작 회의 또는 검증 활동 장면',
    pick: '① 매뉴얼 제작 회의중인 팩도리팩수니 팀 — 집필 과정이 드러나 우선 권장. ② 앱 검증 활동 — 보조 후보.',
    place: '본문 옆 소삽화 40mm.',
    folder: '05_3부_3',
    imgs: [
      { file: '3-3a.jpg', label: '① 매뉴얼 제작 회의' },
      { file: '3-3b.jpg', label: '② 앱 검증 활동' },
    ],
  },
  {
    idx: '16', loc: '5-3', title: '고산동과 수성구청의 협력 경과', badge: '소삽화', count: '2장 중 1장 권장',
    need: '수성구청 자원순환과와의 협력 회의·세미나 장면',
    pick: '2025.6.25 세미나 컷 — 명찰에 "배순향" 판독 가능, 본문의 "수성구청 자원순환과 배순향 팀장" 서술과 정확히 일치. 구도가 더 정면인 ①을 권장.',
    place: '본문 옆 소삽화 40mm.',
    folder: '07_5부_3',
    imgs: [
      { file: '5-3a.jpg', label: '① 세미나 정면' },
      { file: '5-3b.jpg', label: '② 세미나 측면' },
    ],
  },
  {
    idx: '17', loc: '5-4', title: '협력이 깊어지면 나타나는 변화', badge: '소삽화', count: '1장',
    need: '최근 협력 진행 상황을 보여주는 회의 장면',
    pick: '2026.7.4 최근 내부 회의 컷 — "협력은 진행 중이다"라는 본문 서술을 뒷받침하는 가장 최신 사진. 같은 장면 연속컷이 여러 장 있어 가장 자연스러운 1장만 채택(중복 방지).',
    place: '본문 옆 소삽화 40mm.',
    folder: '07_5부_4',
    imgs: [{ file: '5-4.jpg', label: '최근 회의' }],
  },
]

const GALLERY_PICKS = [
  { img: 'gallery1.jpg', fn: '발대식 (1).jpg', cap: '발대식 MOU 조인식 — 현수막·지구본 소품과 참석자 전원이 한 프레임에.' },
  { img: 'gallery2.jpg', fn: '발대식 (4).jpg', cap: '발대식 대규모 단체샷 — 20여 명이 인증서를 들고 있는 구도.' },
  { img: 'gallery3.jpg', fn: '제1회 환경교육아카데미.jpg', cap: '환경교육아카데미 현장 — 병행활동 소개용 대표컷.' },
  { img: 'gallery4.jpg', fn: '1차 팝업환경도서관.JPG', cap: '팝업환경도서관 현장 — 병행활동(5-1절) 소개용 대표컷.' },
]

const OVERVIEW: [string, string, string, string][] = [
  ['00', '표지', '표지 대표컷', '확정 예정(3장 중 1장)'],
  ['01', '발간사', '관장 인사말', '확정(2장 중 1장 권장)'],
  ['02', '1부', '1-2. 주민환경연구원이 탄생하다', '확정(2장 중 1장 권장)'],
  ['03', '1부', '1-3a. 우유백패킹(고산1동)', '확정(후보 1장뿐)'],
  ['04', '1부', '1-3b. 쓰레갖기(고산2동)', '확정(후보 1장뿐)'],
  ['05', '1부', '1-3c. 뿌리덮은 나무(고산3동)', '확정(후보 1장뿐)'],
  ['06', '1부', '1-4. 종이팩을 핵심 주제로', '확정(2장 중 1장 권장)'],
  ['07', '2부', '2-2. 세 팀으로 나누어 역할을 정하다', '확정(4장)'],
  ['08', '2부', '2-3. 아파트 회수 모델', '확정'],
  ['09', '2부', '2-4. 카페·유관기관 회수 모델', '확정'],
  ['10', '2부', '2-5. 학교·교육기관 회수 모델', '확정'],
  ['11', '2부', '2-6. 그린고산실천단 거버넌스', '확정'],
  ['12', '2부', '2-7. 노인일자리와 수거 체계', '확정(2장)'],
  ['13', '2부', '2-8. 방송과 캠페인으로 확산', '확정'],
  ['14', '3부', '3-2. 주민이 그린 고산 앱', '확정(스크린샷 2장)'],
  ['15', '3부', '3-3. 매뉴얼 제작', '확정(2장 중 1장 권장)'],
  ['16', '5부', '5-3. 수성구청 협력 경과', '최우수 매치'],
  ['17', '5부', '5-4. 협력이 깊어지면 나타나는 변화', '확정(중복 정리)'],
  ['18', '부록', '활동사진 갤러리', '대표컷 4장 선별'],
]

function EntryCard({ e }: { e: Entry }) {
  const cols = e.imgs && e.imgs.length > 0 ? Math.min(e.imgs.length, 4) : 1
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 break-inside-avoid">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <span className="text-xs font-mono text-orange-700">{e.idx} · {e.loc}</span>
          <h3 className="text-base font-bold text-gray-900 mt-0.5">{e.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${BADGE_COLORS[e.badge]}`}>{e.badge}</span>
          <span className="text-xs font-mono text-gray-400">{e.count}</span>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(150px,220px)_1fr] gap-5 max-[560px]:grid-cols-1">
        {e.imgs && e.imgs.length > 0 ? (
          <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {e.imgs.map(im => (
              <div key={im.file} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/photo-brief/${im.file}`} alt={im.label} className="w-full h-auto rounded-lg border border-gray-200" />
                <div className="text-[10px] font-mono text-gray-400 mt-1">{im.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-[4/3] rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center p-2">
            사진 미확보
          </div>
        )}
        <div className="space-y-2.5">
          <div>
            <div className="text-[10px] font-mono tracking-wide text-gray-400 uppercase mb-1">필요 사진</div>
            <div className="text-sm text-gray-800">{e.need}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-wide text-gray-400 uppercase mb-1">후보 & 추천</div>
            <div className="text-sm text-gray-800">{e.pick}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-wide text-gray-400 uppercase mb-1">배치 지침</div>
            <div className="text-sm text-gray-800">{e.place}</div>
          </div>
          <div>
            <span className="text-xs font-mono bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-green-700">{e.folder}</span>
          </div>
        </div>
      </div>
      {e.warn && <div className="mt-3 pt-3 border-t border-dashed border-orange-200 text-xs text-orange-700 font-medium">⚠ {e.warn}</div>}
      {e.note && <div className="mt-3 pt-3 border-t border-dashed border-gray-200 text-xs text-orange-600">⚠ {e.note}</div>}
    </div>
  )
}

export default function PhotoBriefPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print"><Nav /></div>

      <div className="max-w-3xl mx-auto px-4 py-6" id="photo-brief-content">
        <div className="flex items-start justify-between gap-3 mb-5 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">📷 사진 배치 가이드 v3 (실사진 반영)</h1>
            <p className="text-sm text-gray-500">청곡복지관이 직접 재분류한 &quot;메뉴얼 사진&quot; / &quot;메뉴얼 사진2&quot; / &quot;잘나온사진&quot; 폴더 기준으로 전면 갱신했습니다.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 shrink-0"
          >
            🖨️ 인쇄 / PDF 저장
          </button>
        </div>

        {/* 표지 (인쇄용) */}
        <div className="text-center border-b pb-6 mb-6 hidden print:block">
          <div className="text-3xl mb-3">📷</div>
          <h1 className="text-2xl font-bold text-gray-900">사진 배치 가이드 v3</h1>
          <p className="text-gray-600 mt-1">주민이 그린 고산 환경리빙랩 매뉴얼 — 실사진 반영판</p>
          <p className="text-sm text-gray-500 mt-3">작성일 2026.7.5 · 청곡종합사회복지관 서비스제공팀 · 이진규</p>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-amber-700 mb-2">v3에서 달라진 점</p>
          <ul className="space-y-1 text-xs text-amber-700">
            <li>· 앱 서버 임시사진(v2) 기준을 폐기하고, 청곡복지관이 직접 큐레이션한 실사진 폴더 기준으로 전면 교체했습니다.</li>
            <li>· 표지 후보를 발대식 실사진 2장(+에너지마을 견학 1장 보조)으로 좁혔습니다.</li>
            <li>· 2-2절에 3개 팀 사진과 회수모델 개요컷을 새로 채웠고, 개요컷은 아파트 절에서 이 절로 재배치했습니다.</li>
            <li>· 2-7절에 대구수성시니어클럽 협약식 사진을 추가했습니다(기존 표지 후보 중 하나를 재배치).</li>
            <li>· 5-4절 중복 사진을 1장으로 정리했습니다.</li>
            <li>· 프롤로그·부록 A-6(주민환경연구원 소감)·타임라인은 사진 없이 진행합니다(타임라인은 사진 미확보).</li>
          </ul>
        </div>

        {/* 전체 한눈에 보기 */}
        <h2 className="text-base font-bold text-gray-800 mb-3">전체 한눈에 보기</h2>
        <div className="overflow-x-auto border border-gray-200 rounded-xl mb-8">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-3 py-2 font-mono">#</th>
                <th className="text-left px-3 py-2">파트</th>
                <th className="text-left px-3 py-2">위치</th>
                <th className="text-left px-3 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {OVERVIEW.map(row => (
                <tr key={row[0]} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-gray-400">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                  <td className="px-3 py-2">{row[2]}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${row[3]?.includes('미확보') ? 'bg-red-100 text-red-600' : row[3]?.includes('선별') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {row[3]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 섹션별 상세 */}
        <h2 className="text-base font-bold text-gray-800 mb-3">섹션별 후보 & 배치 상세</h2>
        {ENTRIES.map(e => <EntryCard key={e.idx} e={e} />)}

        {/* 갤러리 */}
        <h2 className="text-base font-bold text-gray-800 mt-8 mb-1">부록 — 활동사진 갤러리</h2>
        <p className="text-xs text-gray-500 mb-4">&quot;메뉴얼 사진/7. 부록&quot; 폴더(약 90장) 중 대표성이 가장 뚜렷한 4장입니다. 나머지는 사진 폴더 전체를 참고해 디자인업체가 자유 배치하되, 아래 주의사항을 확인해주세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {GALLERY_PICKS.map(g => (
            <div key={g.img} className="bg-white rounded-lg border border-gray-200 p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/photo-brief/${g.img}`} alt={g.fn} className="w-full rounded mb-1.5" />
              <div className="text-[11px] font-mono text-gray-800 font-bold">{g.fn}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{g.cap}</div>
            </div>
          ))}
        </div>

        {/* 갤러리 주의사항 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <p className="text-xs font-bold text-gray-700 mb-2">갤러리 사용 시 주의사항</p>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-mono text-[10px] h-fit">동의확인</span>아동 얼굴이 선명한 사진(환경교육아카데미, 팝업도서관 등) — 배포 전 학부모 동의 확인 필요.</li>
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] h-fit">문서스캔</span>부록 폴더의 A-4-1~A-4-9 하위 폴더는 사진이 아니라 실행 양식(신청서·설문지·일지 등) 스캔본입니다 — A-4절 &quot;활동 근거자료&quot;로 이미 반영되어 있으니 갤러리와 혼동하지 않도록 분리 배치.</li>
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] h-fit">중복</span>표지 후보(페이스북6·4)와 갤러리 발대식 사진은 같은 행사 촬영분입니다 — 표지에 쓰인 컷은 갤러리에서 중복 배치하지 않도록 정리.</li>
          </ul>
        </div>

        {/* 체크리스트 */}
        <h2 className="text-base font-bold text-gray-800 mb-3">업로드 전 최종 체크리스트</h2>
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-10">
          {[
            '표지 후보 2~3장 중 디자이너와 상의해 최종 1장 확정',
            '얼굴이 나온 사진 전부 당사자(또는 보호자) 게재 동의 확인 완료',
            '표지·갤러리 발대식 사진 중복 사용 여부 정리',
            '방송 캡처(2-8절) MBC 저작권 확인',
            '타임라인 섹션 사진 미확보 — 추가 확보 여부 확인',
            '웹하드에 최종본.pdf/.hwp + 사진 폴더(메뉴얼 사진/메뉴얼 사진2) + 이 페이지 인쇄본 함께 업로드',
          ].map((t, i) => (
            <li key={i} className="flex gap-3 items-start px-4 py-3 text-sm text-gray-700">
              <span className="w-4 h-4 border border-gray-300 rounded shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>

        <div className="text-center text-xs text-gray-400 pb-8">
          주민이 그린 고산 환경리빙랩 매뉴얼 · 사진 배치 가이드 v3 · 청곡종합사회복지관 서비스제공팀
        </div>
      </div>
    </div>
  )
}
