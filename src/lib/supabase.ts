import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Part = {
  id: number
  order_num: number
  title: string
  subtitle: string | null
  page_count: number
  assignee: string | null
  progress: number
  status: 'pending' | 'in_progress' | 'review' | 'done'
  notes: string | null
  updated_at: string
}

export type DailyUpdate = {
  id: number
  part_id: number | null
  author: string
  content: string
  update_type: 'progress' | 'issue' | 'milestone'
  created_at: string
  parts?: { title: string }
}

export type Comment = {
  id: number
  author: string
  author_role: 'team' | 'researcher' | 'practitioner'
  part_id: number | null
  content: string
  created_at: string
  parts?: { title: string }
}

export const TEAM_MEMBERS = [
  { name: '이진규', role: '과장', roleLabel: '팀' },
  { name: '이현직', role: '선임사회복지사', roleLabel: '팀' },
  { name: '김정현', role: '사회복지사', roleLabel: '팀' },
  { name: '이승원', role: '사회복지사', roleLabel: '팀' },
  { name: '김연수', role: '전담인력', roleLabel: '팀' },
]

export const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  in_progress: '작성 중',
  review: '검토 중',
  done: '완료',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}
