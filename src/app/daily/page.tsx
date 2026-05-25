'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, DailyUpdate, Part, TEAM_MEMBERS } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const UPDATE_TYPES = [
  { value: 'progress', label: '✅ 진행현황', color: 'bg-blue-100 text-blue-700' },
  { value: 'issue', label: '⚠️ 이슈', color: 'bg-red-100 text-red-700' },
  { value: 'milestone', label: '🎉 마일스톤', color: 'bg-yellow-100 text-yellow-700' },
]

export default function DailyPage() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [author, setAuthor] = useState('')
  const [partId, setPartId] = useState('')
  const [type, setType] = useState('progress')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUpdates()
    supabase.from('parts').select('id, title').order('order_num').then(({ data }) => { if (data) setParts(data as Part[]) })

    const channel = supabase
      .channel('daily-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_updates' }, () => loadUpdates())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadUpdates() {
    const { data } = await supabase
      .from('daily_updates')
      .select('*, parts(title)')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setUpdates(data as DailyUpdate[])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!author || !content) return
    setSubmitting(true)
    await supabase.from('daily_updates').insert({
      author,
      content,
      update_type: type,
      part_id: partId ? Number(partId) : null,
    })
    setContent('')
    setSubmitting(false)
  }

  const grouped = updates.reduce<Record<string, DailyUpdate[]>>((acc, u) => {
    const date = u.created_at.slice(0, 10)
    if (!acc[date]) acc[date] = []
    acc[date].push(u)
    return acc
  }, {})

  const typeInfo = (t: string) => UPDATE_TYPES.find(u => u.value === t) || UPDATE_TYPES[0]

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">📝 데일리 채널</h1>
          <p className="text-sm text-gray-500">매일의 작업 현황·이슈·성과를 실시간으로 공유합니다</p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={submit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">작성자</label>
              <select
                className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
              >
                <option value="">선택하세요</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.name} value={m.name}>{m.name} ({m.role})</option>
                ))}
                <option value="주민환경연구원">주민환경연구원</option>
                <option value="그린고산실천단">그린고산실천단</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">관련 파트 (선택)</label>
              <select
                className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                value={partId}
                onChange={e => setPartId(e.target.value)}
              >
                <option value="">전체</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            {UPDATE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  type === t.value ? t.color + ' border-transparent font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-400"
            rows={3}
            placeholder="오늘의 진행현황, 이슈, 완료 사항을 작성해주세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !author || !content}
              className="bg-green-700 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-40"
            >
              {submitting ? '게시 중...' : '게시하기'}
            </button>
          </div>
        </form>

        {/* 피드 */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <span className="h-px bg-gray-200 flex-1" />
                {format(new Date(date), 'M월 d일 (EEE)', { locale: ko })}
                <span className="h-px bg-gray-200 flex-1" />
              </div>
              <div className="space-y-2">
                {items.map(u => {
                  const info = typeInfo(u.update_type)
                  return (
                    <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
                        <span className="font-bold text-sm text-gray-800">{u.author}</span>
                        {u.parts && <span className="text-xs text-gray-400">· {u.parts.title}</span>}
                        <span className="text-xs text-gray-400 ml-auto">{format(new Date(u.created_at), 'HH:mm')}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{u.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {updates.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <div>첫 번째 데일리 업데이트를 작성해보세요!</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
