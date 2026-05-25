'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, Part, TEAM_MEMBERS, STATUS_LABELS, STATUS_COLORS } from '@/lib/supabase'

const STATUSES = ['pending', 'in_progress', 'review', 'done'] as const

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
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📋 스토리보드</h1>
            <p className="text-sm text-gray-500">파트별 담당자, 진행률, 상태를 실시간으로 관리합니다</p>
          </div>
          {saving && <span className="text-sm text-green-600">저장 중...</span>}
        </div>

        <div className="space-y-4">
          {parts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
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

function PartCard({ part, isEditing, onEdit, onSave, onCancel }: {
  part: Part
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<Part>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ progress: part.progress, status: part.status, assignee: part.assignee || '', notes: part.notes || '' })

  useEffect(() => {
    setForm({ progress: part.progress, status: part.status, assignee: part.assignee || '', notes: part.notes || '' })
  }, [part])

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all ${isEditing ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* 파트 번호·제목 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{part.page_count}p</span>
              <h3 className="font-bold text-gray-800">{part.title}</h3>
            </div>
            {part.subtitle && <p className="text-sm text-gray-500">{part.subtitle}</p>}
          </div>

          {/* 상태 뱃지 */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[part.status]}`}>
              {STATUS_LABELS[part.status]}
            </span>
            {!isEditing && (
              <button onClick={onEdit} className="text-xs text-gray-400 hover:text-green-600 border border-gray-200 rounded px-2 py-1">
                수정
              </button>
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>담당: {part.assignee || '미배정'}</span>
            <span>{part.progress}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${part.progress}%` }}
            />
          </div>
        </div>

        {part.notes && !isEditing && (
          <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">💬 {part.notes}</p>
        )}

        {/* 편집 폼 */}
        {isEditing && (
          <div className="mt-4 border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">담당자 (직접 입력)</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                  placeholder="이름 입력 (미정이면 공란)"
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
              <button
                onClick={() => onSave(form)}
                className="bg-green-700 text-white text-sm px-4 py-1.5 rounded hover:bg-green-800"
              >
                저장
              </button>
              <button onClick={onCancel} className="text-gray-500 text-sm px-4 py-1.5 rounded border hover:bg-gray-50">
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
