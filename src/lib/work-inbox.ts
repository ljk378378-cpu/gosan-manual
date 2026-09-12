export type WorkInboxCategory = '아이디어' | '지시사항' | '상급자 전달' | '갑작스러운 요청'
export type WorkInboxTeam = '서비스제공팀' | '지역사회조직팀' | '공통'
export type WorkInboxDue = '오늘' | '이번 주' | '날짜 없음'
export type WorkInboxStatus = '미확인' | '내가 처리' | '직원에게 전달' | '일정 등록' | '사업에 연결' | '완료'

export type WorkInboxItem = {
  id: string
  category: WorkInboxCategory
  content: string
  team: WorkInboxTeam
  due: WorkInboxDue
  dueDate: string
  status: WorkInboxStatus
  createdAt: string
  updatedAt: string
}

export type WorkInboxRow = {
  id: string
  category: WorkInboxCategory
  content: string
  team: WorkInboxTeam
  due_kind: WorkInboxDue
  due_date: string | null
  status: WorkInboxStatus
  created_at: string
  updated_at: string
}

export const workInboxKey = 'cheonggok-work-inbox-v1'
export const workInboxCategories: WorkInboxCategory[] = ['아이디어', '지시사항', '상급자 전달', '갑작스러운 요청']
export const workInboxTeams: WorkInboxTeam[] = ['공통', '서비스제공팀', '지역사회조직팀']
export const workInboxDueOptions: WorkInboxDue[] = ['오늘', '이번 주', '날짜 없음']
export const workInboxStatuses: WorkInboxStatus[] = ['미확인', '내가 처리', '직원에게 전달', '일정 등록', '사업에 연결', '완료']

export function koreaDate(value = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(value)
}

export function dueDateFor(option: WorkInboxDue) {
  if (option === '날짜 없음') return ''
  const date = new Date()
  if (option === '이번 주') {
    const daysUntilSunday = (7 - date.getDay()) % 7
    date.setDate(date.getDate() + daysUntilSunday)
  }
  return koreaDate(date)
}

export function workInboxFromRow(row: WorkInboxRow): WorkInboxItem {
  return {
    id: row.id,
    category: row.category,
    content: row.content || '',
    team: row.team,
    due: row.due_kind,
    dueDate: row.due_date || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mergeWorkInboxItems(incoming: WorkInboxItem[], current: WorkInboxItem[]) {
  const merged = new Map<string, WorkInboxItem>()
  ;[...incoming, ...current].forEach(item => {
    const saved = merged.get(item.id)
    if (!saved || item.updatedAt > saved.updatedAt) merged.set(item.id, item)
  })
  return Array.from(merged.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 500)
}
