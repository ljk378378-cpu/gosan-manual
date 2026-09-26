export const TRIP_SLUG = process.env.NEXT_PUBLIC_FAMILY_TRIP_SLUG || 'mother-70-andong-2026'

export type ScheduleItem = {
  id: string
  time: string
  title: string
  detail: string
  location?: string
  group?: string
}

export type BudgetItem = {
  id: string
  title: string
  planned: number
  actual: number
  paid: boolean
  memo: string
}

export type TaskItem = {
  id: string
  title: string
  owner: string
  due: string
  done: boolean
}

export type DecisionItem = {
  id: string
  title: string
  choice: string
  note: string
  votes: Record<string, 'agree' | 'change'>
}

export type TripState = {
  title: string
  subtitle: string
  startDate: string
  endDate: string
  travelers: string
  schedule: Record<'day1' | 'day2', ScheduleItem[]>
  budget: BudgetItem[]
  tasks: TaskItem[]
  decisions: DecisionItem[]
  updatedAt?: string
}

export type TripComment = {
  id: string
  author: string
  body: string
  created_at: string
}

export const defaultTrip: TripState = {
  title: '엄마의 칠순, 안동 가족여행',
  subtitle: '한 번뿐인 칠순을 우리답게, 편안하고 따뜻하게',
  startDate: '2026-11-07',
  endDate: '2026-11-08',
  travelers: '어머니 1명 · 우리 가족 4명 · 동생 가족 4명 · 총 9명',
  schedule: {
    day1: [
      { id: 'd1-1', time: '09:30', title: '대구·경산 출발', detail: '차량 2대로 출발하고 휴게소 이용 여부는 당일 조정합니다.' },
      { id: 'd1-2', time: '12:00', title: '안동양반촌 점심', detail: '어머니가 좋아하시는 돼지왕갈비로 첫 식사를 합니다.', location: '안동양반촌' },
      { id: 'd1-3', time: '13:30', title: '어머니와 며느리 마사지', detail: '힐링궁전타이 아로마 관리 60분', location: '옥동 힐링궁전타이', group: '힐링팀 3명' },
      { id: 'd1-4', time: '13:30', title: '아빠와 아이들 볼링', detail: '어린이 공과 범퍼레인을 먼저 확인합니다.', location: '월드컵락볼링장', group: '체험팀 6명' },
      { id: 'd1-5', time: '14:50', title: '가족 재집결', detail: '마사지숍 인근에서 만나 숙소로 이동합니다.' },
      { id: 'd1-6', time: '15:20', title: '올웨이즈펜션 체크인', detail: '짐 정리 후 칠순상과 촬영을 준비합니다.', location: '올웨이즈펜션' },
      { id: 'd1-7', time: '16:10', title: '가족사진 촬영', detail: '해가 지기 전에 야외사진부터 찍고 실내 촬영을 이어갑니다.' },
      { id: 'd1-8', time: '17:00', title: '칠순 축하행사', detail: '케이크, 편지, 현금 이벤트, 가족별 사진 순으로 진행합니다.' },
      { id: 'd1-9', time: '18:00', title: '펜션 저녁식사', detail: '바비큐 대신 찜닭·미역국·전·과일을 간편하게 차립니다.' },
    ],
    day2: [
      { id: 'd2-1', time: '08:00', title: '펜션 아침식사', detail: '죽, 달걀, 과일, 요구르트로 가볍게 먹습니다.' },
      { id: 'd2-2', time: '08:40', title: '산책과 추가 촬영', detail: '어머니 컨디션을 우선하고 빠진 사진 조합만 촬영합니다.' },
      { id: 'd2-3', time: '09:40', title: '체크아웃 후 놀팍 출발', detail: '도산면 한국문화테마파크로 이동합니다.' },
      { id: 'd2-4', time: '11:00', title: '놀팍 체험', detail: '아이 4명만 2시간 체험권, 성인 5명은 보호자 입장권을 이용합니다.', location: '안동 놀팍' },
      { id: 'd2-5', time: '13:10', title: '도산면 점심', detail: '간고등어·찜닭·한식 중 예약 가능한 곳으로 확정합니다.' },
      { id: 'd2-6', time: '14:10', title: '대구·경산으로 출발', detail: '추가 관광 없이 어머니와 아이들의 피로도를 우선합니다.' },
    ],
  },
  budget: [
    { id: 'b1', title: '현금 이벤트', planned: 1000000, actual: 0, paid: false, memo: '두 가족 각 50만원' },
    { id: 'b2', title: '올웨이즈펜션', planned: 330000, actual: 330000, paid: true, memo: '공동경비 통장에서 결제 완료' },
    { id: 'b3', title: '양반촌 점심', planned: 180000, actual: 0, paid: false, memo: '9명 기준' },
    { id: 'b4', title: '마사지 3명', planned: 150000, actual: 0, paid: false, memo: '아로마 60분 기준' },
    { id: 'b5', title: '볼링 6명', planned: 60000, actual: 0, paid: false, memo: '현장 요금 재확인' },
    { id: 'b6', title: '펜션 저녁', planned: 100000, actual: 0, paid: false, memo: '포장 한식' },
    { id: 'b7', title: '다음 날 아침', planned: 40000, actual: 0, paid: false, memo: '죽·과일·달걀' },
    { id: 'b8', title: '놀팍', planned: 113000, actual: 0, paid: false, memo: '아이 4명 체험권 + 성인 5명 보호자권' },
    { id: 'b9', title: '둘째 날 점심', planned: 110000, actual: 0, paid: false, memo: '도산면 한식' },
    { id: 'b10', title: '기본형 칠순상', planned: 100000, actual: 0, paid: false, memo: '대여비 확정 필요' },
    { id: 'b11', title: '케이크·꽃', planned: 50000, actual: 0, paid: false, memo: '작은 꽃다발 포함' },
    { id: 'b12', title: '사진 액자', planned: 30000, actual: 0, paid: false, memo: '대표사진 1장' },
    { id: 'b13', title: '유류비·통행료', planned: 100000, actual: 0, paid: false, memo: '차량 2대' },
    { id: 'b14', title: '예비비', planned: 50000, actual: 0, paid: false, memo: '' },
  ],
  tasks: [
    { id: 't1', title: '전체 참석인원과 객실 최종 확인', owner: '진규', due: '2026-10-10', done: false },
    { id: 't2', title: '칠순상 기본형 대여 확정', owner: '우리 가족', due: '2026-10-18', done: false },
    { id: 't3', title: '기존 옷으로 가족 의상 색상 통일', owner: '두 가족', due: '2026-10-18', done: false },
    { id: 't4', title: '양반촌 단체 예약', owner: '동생', due: '2026-10-25', done: false },
    { id: 't5', title: '마사지 3명 예약', owner: '우리 가족', due: '2026-10-25', done: false },
    { id: 't6', title: '볼링장 어린이 공·범퍼레인 확인', owner: '동생', due: '2026-10-25', done: false },
    { id: 't7', title: '놀팍 운영·입장권 확인', owner: '동생', due: '2026-10-31', done: false },
    { id: 't8', title: '저녁 포장음식과 아침 장보기 확정', owner: '동생 가족', due: '2026-10-31', done: false },
    { id: 't9', title: '케이크와 꽃 예약', owner: '우리 가족', due: '2026-10-31', done: false },
    { id: 't10', title: '현금 이벤트 각 가족 50만원 준비', owner: '두 가족', due: '2026-11-04', done: false },
    { id: 't11', title: '아이들 축하편지·영상 준비', owner: '아이들', due: '2026-11-04', done: false },
    { id: 't12', title: '삼각대·충전기·촬영 목록 준비', owner: '사진 담당', due: '2026-11-06', done: false },
  ],
  decisions: [
    { id: 'v1', title: '첫날 저녁', choice: '바비큐 없이 포장 한식으로 준비', note: '점심 갈비와 겹치지 않고 준비 부담을 줄입니다.', votes: {} },
    { id: 'v2', title: '가족 의상', choice: '새로 사지 않고 기존 옷 색상만 통일', note: '흰색·베이지 상의와 검정·청바지 계열을 맞춥니다.', votes: {} },
    { id: 'v3', title: '둘째 날 체험', choice: '아이 4명만 놀팍 체험권 구매', note: '성인 5명은 보호자 입장권을 이용합니다.', votes: {} },
  ],
}

export function won(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

export function dDay(date: string) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return Math.max(0, Math.round((Date.parse(date) - Date.parse(today)) / 86400000))
}
