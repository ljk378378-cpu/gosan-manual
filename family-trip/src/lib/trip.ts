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
  familyNotes?: string
  rentalChoice?: string
  updatedAt?: string
}

export type TripComment = {
  id: string
  author: string
  body: string
  created_at: string
}

export const defaultTrip: TripState = { title: '', subtitle: '', startDate: '', endDate: '', travelers: '', schedule: {day1: [], day2: []}, budget: [], tasks: [], decisions: [] }

export function won(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

export function dDay(date: string) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return Math.max(0, Math.round((Date.parse(date) - Date.parse(today)) / 86400000))
}
