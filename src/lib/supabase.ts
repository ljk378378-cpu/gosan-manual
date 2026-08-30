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

export type DesignReviewItem = {
  id: number
  severity: 'critical' | 'photo' | 'content' | 'format'
  page_ref: string | null
  title: string
  description: string
  author: string
  is_done: boolean
  created_at: string
}

export const SEVERITY_INFO: Record<DesignReviewItem['severity'], { label: string; color: string; dot: string }> = {
  critical: { label: '🔴 최우선', color: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-600' },
  photo: { label: '🟠 사진', color: 'bg-orange-50 border-orange-200 text-orange-800', dot: 'bg-orange-500' },
  content: { label: '🟡 내용 확인', color: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
  format: { label: '⚪ 서식/기타', color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
}

export type PartFile = {
  id: number
  part_id: number
  file_name: string
  file_path: string
  uploader: string
  file_size: number | null
  uploaded_at: string
}

export type Evaluation2027Item = {
  user_id: string
  code: string
  status_by_year: Record<string, string>
  evidence_checks: Record<string, boolean>
  note: string
  owner: string
  due: string | null
  location: string
  rationale: string
  missing: string
  updated_at: string
}

export type Evaluation2027AiTask = {
  user_id: string
  id: string
  date: string
  title: string
  lane: string
  status: string
  urgency: string
  approval: boolean
  source: string
  output: string
  memo: string
  due: string | null
  updated_at: string
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}
