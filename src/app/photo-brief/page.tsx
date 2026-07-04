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
  img?: string
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
    idx: '01', loc: '1p', title: '관장 인사말 사진', badge: '소삽화', count: '1장',
    need: '청곡종합사회복지관장 — 인물 사진',
    pick: '업로드된 4장 중 lom4i.png가 가장 정면에 가깝고 배경이 단순합니다.',
    place: '본문 좌측 상단 원형 소삽화(35mm), 이름·직함 캡션 동반.',
    folder: '00_발간사', img: 'foreword.jpg',
  },
  {
    idx: '02', loc: '3~5p', title: '3년의 여정 인포그래픽', badge: '미확보', count: '0장',
    need: '연도별 대표 장면 (발대식·수거함 설치·성과공유회 등)',
    pick: '/designer의 타임라인 폴더에 사진이 한 장도 업로드되어 있지 않습니다. 다른 섹션 사진 중 연도가 확인되는 사진(1-3a의 2023.9 발대식 사진 등)을 임시로 돌려쓰거나, 팀에 추가 업로드를 요청해야 합니다.',
    place: '기획사가 인포그래픽으로 재구성 — 사진은 참고 소스',
    folder: '01_타임라인',
  },
  {
    idx: '03', loc: '1-1', title: '고산동은 어떤 동네인가', badge: '소삽화', count: '1장',
    need: '고산동 아파트 단지 전경',
    pick: '후보가 dpysh.jpg 1장뿐입니다. 다른 대안 없이 그대로 채택.',
    place: '1부 도입 전면 배치, 소제목은 사진 하단에 겹침.',
    folder: '03_1부_1', img: '1-1.jpg',
  },
  {
    idx: '04', loc: '1-2', title: '주민환경연구원이 되다', badge: '소삽화', count: '2장',
    need: '강의 듣는 장면 / 현장 조사 장면',
    pick: 'ecx8i.jpg와 pthlm.jpg 두 후보 중 pthlm.jpg가 표정·구도가 더 자연스러워 우선 채택. ecx8i는 보조컷으로 사용 가능.',
    place: '본문 우측 세로 배치, 각 40mm.',
    folder: '03_1부_2', img: '1-2.jpg',
  },
  {
    idx: '05', loc: '1-3', title: '우유백패킹 (고산1동)', badge: '소삽화', count: '1장',
    need: '발대식·활동 현장 그룹샷',
    pick: 'biy0x.jpg — 2023.9 발대식 6인 조인식 장면.',
    place: '소제목 옆 소삽화 40mm.',
    folder: '03_1부_3a', img: '1-3a.jpg',
    warn: '부록 갤러리의 za7v0.jpg와 동일 촬영분(같은 인물·포즈)입니다. 두 곳에 중복 배치하지 말고 한 쪽만 쓰세요.',
  },
  {
    idx: '06', loc: '1-3', title: '쓰레갖기 (고산2동)', badge: '소삽화', count: '1장',
    need: '쓰레기 줍기 활동 현장',
    pick: '후보 te5jw.jpg 1장뿐. 그대로 채택.',
    place: '소제목 옆 소삽화 40mm, 1-3a와 동일 규칙.',
    folder: '03_1부_3b', img: '1-3b.jpg',
  },
  {
    idx: '07', loc: '1-3', title: '뿌리덮은 나무 (고산3동)', badge: '소삽화', count: '1장',
    need: '공원 활동 현장',
    pick: '후보 1hpzm.jpg 1장뿐. 그대로 채택.',
    place: '소제목 옆 소삽화 40mm, 위 두 항목과 동일 규칙.',
    folder: '03_1부_3c', img: '1-3c.jpg',
  },
  {
    idx: '08', loc: '1-4', title: '종이팩을 핵심 주제로', badge: '소삽화', count: '1장',
    need: '종이팩 세척·건조 과정',
    pick: '두 후보(kdjpk.jpg / zxzrq.png) 중 kdjpk.jpg가 실사진, zxzrq.png는 스크린샷이라 실사진 쪽을 본문에 채택.',
    place: '1부 마지막 문단 옆 소삽화 40mm.',
    folder: '03_1부_4', img: '1-4.jpg',
  },
  {
    idx: '09', loc: '2-3', title: '아파트 회수 모델', badge: '반면', count: '2장(택1 게재)',
    need: '수거함 전경 / 이용 장면',
    pick: '7장 중 pbryu.jpg와 rl85g.jpg가 고화질(6~7MB)로 우수. mndi9.jpg·8dcnr.jpg는 저해상도라 제외. pbryu.jpg를 1순위로 채택.',
    place: '본문 하단 반면 배치, 브랜드 스티커 노출 여부 확인.',
    folder: '04_2부_3', img: '2-3.jpg',
  },
  {
    idx: '10', loc: '2-4', title: '카페·유관기관 회수 모델', badge: '소삽화', count: '2장',
    need: '카페 내부 수거함 / 안내 장면',
    pick: '4장 중 8m3ov.jpg가 화질·구도 모두 가장 우수.',
    place: '본문 옆 소삽화 세로 배치.',
    folder: '04_2부_4', img: '2-4.jpg',
  },
  {
    idx: '11', loc: '2-5', title: '학교·교육기관 회수 모델', badge: '소삽화', count: '1장',
    need: '학교 수거함 설치 장면',
    pick: '3장 중 a0rx3.jpg가 83w36.jpg보다 표정·구도가 자연스러움.',
    place: '본문 옆 소삽화 40mm.',
    folder: '04_2부_5', img: '2-5.jpg',
  },
  {
    idx: '12', loc: '2-6', title: '그린고산실천단 거버넌스', badge: '반면', count: '1장',
    need: '정기회의 장면',
    pick: '3장 중 9j9pi.jpg가 6MB 고화질로 현장감이 가장 좋음.',
    place: '본문 상단 반면, 참석자 실명 캡션은 지양.',
    folder: '04_2부_6', img: '2-6.jpg',
  },
  {
    idx: '13', loc: '2-7', title: '노인일자리와 수거 체계', badge: '소삽화', count: '2장',
    need: '수거 작업 장면 / 수거물 쌓인 모습',
    pick: '2장 중 5f59g.jpg 채택. oufvs.jpg(237KB)는 해상도가 낮아 인쇄용 부적합.',
    place: '본문 옆 소삽화 2장.',
    folder: '04_2부_7', img: '2-7.jpg',
    note: '어르신 참여자 게재 동의 확인 필요',
  },
  {
    idx: '14', loc: '2-8', title: '방송과 캠페인으로 확산하다', badge: '소삽화', count: '2장',
    need: 'TBN 방송 출연 장면 / 캠페인 홍보 이미지',
    pick: '2장 중 xvjq4.jpg가 8w574.jpg보다 화질·구도 우수.',
    place: '본문 옆 소삽화, 출처(TBN 대구교통방송) 캡션 필수.',
    folder: '04_2부_8', img: '2-8.jpg',
    note: '방송 캡처는 TBN 측 저작권 확인 필요',
  },
  {
    idx: '15', loc: '3-2', title: '주민이 그린 고산 앱', badge: '소삽화', count: '1장(+스샷 3장)',
    need: '실사용 장면 + 앱 화면 스크린샷',
    pick: '4개 후보 중 caki6.jpg가 실사진. bgggs.jpg·jkozm.jpg는 저해상도, 8uadn.png는 앱 스크린샷이라 별도 프레임 처리.',
    place: '실사진은 본문 소삽화, 스크린샷은 스마트폰 프레임 목업으로 별도 배치.',
    folder: '05_3부_2', img: '3-2.jpg',
  },
  {
    idx: '16', loc: '3-3', title: '주민이 그린 고산 매뉴얼', badge: '소삽화', count: '1장',
    need: '매뉴얼 제작 회의 또는 검토 장면',
    pick: '후보 parvt.jpg 1장뿐. 그대로 채택.',
    place: '본문 옆 소삽화 40mm.',
    folder: '05_3부_3', img: '3-3.jpg',
  },
  {
    idx: '17', loc: '5-3', title: '수성구청 협력 경과', badge: '소삽화', count: '1장',
    need: '수성구청 자원순환과와의 협력 회의·세미나 장면',
    pick: '7장 중 s54s0.jpg 또는 z696g.jpg 최우선 — 명찰에 "배순향" 글자가 판독되어, 본문의 "수성구청 자원순환과 배순향 팀장" 서술과 정확히 일치하는 유일한 사진입니다. 이번 105장 중 가장 확실한 픽입니다.',
    place: '본문 옆 소삽화 40mm, 캡션에 세미나명 표기 권장.',
    folder: '07_5부_3', img: '5-3.jpg',
  },
]

const GALLERY_PICKS = [
  { img: 'gallery1.jpg', fn: '0irco.jpg', cap: '발대식 MOU 전원 조인식 — 참여기관 10곳 대표가 한 프레임에 모두 들어간 유일한 컷. 부록 갤러리의 대표 사진 1순위.' },
  { img: 'gallery2.jpg', fn: 'abef9.jpg', cap: '수거함 설치 현장 — 두 담당자가 실제 작업 중인 자연스러운 순간.' },
  { img: 'gallery3.jpg', fn: 'lsjux.jpg', cap: '종이팩 정류장 설치 완료 후 확인 장면 — 로고·안내문 선명.' },
  { img: 'gallery4.jpg', fn: '00fw4.jpg', cap: '도서관 내 종이팩 분리배출 현장 교육 장면 — 실천 교육 성격이 잘 드러남.' },
]

const OVERVIEW = [
  ['01', '발간사', '관장 인사말', 'lom4i.png', '확정'],
  ['02', '타임라인', '3년의 여정', '—', '미확보'],
  ['03', '1부', '1-1. 고산동은 어떤 동네인가', 'dpysh.jpg', '확정(후보 1장뿐)'],
  ['04', '1부', '1-2. 주민환경연구원이 되다', 'pthlm.jpg', '확정'],
  ['05', '1부', '1-3a. 우유백패킹(고산1동)', 'biy0x.jpg', '중복 주의'],
  ['06', '1부', '1-3b. 쓰레갖기(고산2동)', 'te5jw.jpg', '확정(후보 1장뿐)'],
  ['07', '1부', '1-3c. 뿌리덮은 나무(고산3동)', '1hpzm.jpg', '확정(후보 1장뿐)'],
  ['08', '1부', '1-4. 종이팩을 핵심 주제로', 'kdjpk.jpg', '확정'],
  ['09', '2부', '2-3. 아파트 회수 모델', 'pbryu.jpg', '확정'],
  ['10', '2부', '2-4. 카페·유관기관 회수 모델', '8m3ov.jpg', '확정'],
  ['11', '2부', '2-5. 학교·교육기관 회수 모델', 'a0rx3.jpg', '확정'],
  ['12', '2부', '2-6. 그린고산실천단 거버넌스', '9j9pi.jpg', '확정'],
  ['13', '2부', '2-7. 노인일자리와 수거 체계', '5f59g.jpg', '확정'],
  ['14', '2부', '2-8. 방송과 캠페인으로 확산', 'xvjq4.jpg', '확정'],
  ['15', '3부', '3-2. 주민이 그린 고산 앱', 'caki6.jpg', '확정(png는 스샷)'],
  ['16', '3부', '3-3. 매뉴얼 제작', 'parvt.jpg', '확정(후보 1장뿐)'],
  ['17', '5부', '5-3. 수성구청 협력 경과', 's54s0.jpg', '최우수 매치'],
  ['18', '부록', '활동사진 갤러리', '0irco 외', '선별 필요(60장)'],
]

function EntryCard({ e }: { e: Entry }) {
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
      <div className="grid grid-cols-[150px_1fr] gap-5 max-[560px]:grid-cols-1">
        {e.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/photo-brief/${e.img}`} alt={e.title} className="w-full h-auto rounded-lg border border-gray-200" />
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
            <div className="text-[10px] font-mono tracking-wide text-gray-400 uppercase mb-1">베스트픽 & 이유</div>
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
            <h1 className="text-xl font-bold text-gray-900 mb-1">📷 사진 배치 가이드 v2 (실사진 반영)</h1>
            <p className="text-sm text-gray-500">/designer에 업로드된 실제 사진 105장을 전수 검토해 섹션별 베스트픽을 선정했습니다.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">사진 배치 가이드 v2</h1>
          <p className="text-gray-600 mt-1">주민이 그린 고산 환경리빙랩 매뉴얼 — 실사진 반영판</p>
          <p className="text-sm text-gray-500 mt-3">작성일 2026.7.4 · 청곡종합사회복지관 서비스제공팀 · 이진규</p>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-amber-700 mb-2">v2에서 달라진 점</p>
          <ul className="space-y-1 text-xs text-amber-700">
            <li>· /designer에 업로드된 실제 사진 105장을 다 열어보고 섹션별 베스트픽 1장을 실물 미리보기와 함께 짚었습니다.</li>
            <li>· 프롤로그(P-1, P-2)와 부록 A-6(주민환경연구원 소감)은 사진을 넣지 않기로 결정되어 이번 목록에서 제외했습니다.</li>
            <li>· 타임라인 섹션은 아직 업로드된 사진이 없어 별도 표시했습니다.</li>
            <li>· 얼굴이 나온 사진은 당사자 게재 동의 확인 완료 후 사용 부탁드립니다 — 재확인이 필요한 사진은 각 항목에 표시했습니다.</li>
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
                <th className="text-left px-3 py-2 font-mono">베스트픽</th>
                <th className="text-left px-3 py-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {OVERVIEW.map(row => (
                <tr key={row[0]} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-gray-400">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                  <td className="px-3 py-2">{row[2]}</td>
                  <td className="px-3 py-2 font-mono text-gray-500">{row[3]}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${row[4]?.includes('미확보') ? 'bg-red-100 text-red-600' : row[4]?.includes('중복') || row[4]?.includes('선별') ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {row[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 섹션별 상세 */}
        <h2 className="text-base font-bold text-gray-800 mb-3">섹션별 베스트픽 상세</h2>
        {ENTRIES.map(e => <EntryCard key={e.idx} e={e} />)}

        {/* 갤러리 */}
        <h2 className="text-base font-bold text-gray-800 mt-8 mb-1">부록 — 활동사진 갤러리</h2>
        <p className="text-xs text-gray-500 mb-4">/designer의 gallery 폴더에는 60장이 올라와 있습니다. 특정 절에 귀속되지 않는 전체 활동 기록용이라, 전수 검토 결과 눈에 띈 대표컷 4장을 정리했습니다.</p>
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
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-mono text-[10px] h-fit">동의확인</span>아동 얼굴이 선명한 사진 다수(6t0fm, ay27m, lgj7z, s53ul, htfno 등) — 배포 전 학부모 동의 확인 필요.</li>
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-mono text-[10px] h-fit">오업로드</span>20m5g.jpeg는 실내에서 촛불 켜고 있는 두 아이 사진으로, 사업 내용과 무관한 개인 사진으로 보입니다. 갤러리에서 제외 권장.</li>
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] h-fit">중복</span>za7v0.jpg는 1-3a절의 biy0x.jpg와 동일 촬영분(같은 인물·포즈). 갤러리에서는 다른 사진으로 대체 권장.</li>
            <li className="flex gap-2"><span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] h-fit">문서스캔</span>zn03z.png(구글폼 화면), 0ybea.png(손글씨 인터뷰 보고서) 등은 사진이 아니라 행정서식 스캔본입니다. "활동 근거자료"로 분리 배치 권장.</li>
          </ul>
        </div>

        {/* 체크리스트 */}
        <h2 className="text-base font-bold text-gray-800 mb-3">업로드 전 최종 체크리스트</h2>
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-10">
          {[
            '얼굴이 나온 사진 전부 당사자(또는 보호자) 게재 동의 확인 완료',
            '갤러리의 20m5g.jpeg(오업로드 추정 개인 사진) 제외 여부 확인',
            '1-3a biy0x.jpg / 갤러리 za7v0.jpg 중복 — 한 곳만 사용하도록 정리',
            '타임라인 섹션 사진 추가 업로드 요청(현재 0장)',
            '방송 캡처(2-8절) TBN 저작권 확인',
            '앱 스크린샷은 고화질 원본 PNG로 별도 정리',
            '문서 스캔(zn03z, 0ybea 등)은 사진 갤러리와 분리 배치',
          ].map((t, i) => (
            <li key={i} className="flex gap-3 items-start px-4 py-3 text-sm text-gray-700">
              <span className="w-4 h-4 border border-gray-300 rounded shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>

        <div className="text-center text-xs text-gray-400 pb-8">
          주민이 그린 고산 환경리빙랩 매뉴얼 · 사진 배치 가이드 v2 · 청곡종합사회복지관 서비스제공팀
        </div>
      </div>
    </div>
  )
}
