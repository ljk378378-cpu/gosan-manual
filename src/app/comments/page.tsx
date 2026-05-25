'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, Comment, Part, TEAM_MEMBERS } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const ROLE_INFO: Record<string, { label: string; color: string }> = {
  team: { label: '팀', color: 'bg-green-100 text-green-800' },
  researcher: { label: '주민환경연구원', color: 'bg-blue-100 text-blue-800' },
  practitioner: { label: '그린고산실천단', color: 'bg-purple-100 text-purple-800' },
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [author, setAuthor] = useState('')
  const [authorRole, setAuthorRole] = useState<'team' | 'researcher' | 'practitioner'>('team')
  const [partId, setPartId] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadComments()
    supabase.from('parts').select('id, title').order('order_num').then(({ data }) => { if (data) setParts(data as Part[]) })

    const channel = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => loadComments())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, parts(title)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setComments(data as Comment[])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!author || !content) return
    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      author,
      author_role: authorRole,
      content,
      part_id: partId ? Number(partId) : null,
    })
    if (error) {
      alert('게시 실패: ' + error.message)
    } else {
      setContent('')
      await loadComments()
    }
    setSubmitting(false)
  }

  const filtered = filterRole === 'all' ? comments : comments.filter(c => c.author_role === filterRole)

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">💬 의견 게시판</h1>
          <p className="text-sm text-gray-500">팀원·주민환경연구원·그린고산실천단 누구나 의견을 남길 수 있습니다</p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={submit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">✏️ 의견 남기기</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">참여 구분</label>
              <select
                className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value as typeof authorRole)}
              >
                <option value="team">팀 (청곡복지관)</option>
                <option value="researcher">주민환경연구원</option>
                <option value="practitioner">그린고산실천단</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">이름</label>
              {authorRole === 'team' ? (
                <select
                  className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {TEAM_MEMBERS.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                  placeholder="이름을 입력하세요"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-600 mb-1 block">관련 파트 (선택)</label>
            <select
              className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
              value={partId}
              onChange={e => setPartId(e.target.value)}
            >
              <option value="">전체 / 일반의견</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-400"
            rows={4}
            placeholder="매뉴얼 내용에 대한 의견, 제안, 경험담, 응원 메시지 무엇이든 환영합니다 🌿"
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
              {submitting ? '게시 중...' : '의견 남기기'}
            </button>
          </div>
        </form>

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {['all', 'team', 'researcher', 'practitioner'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterRole === r ? 'bg-green-700 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r === 'all' ? `전체 (${comments.length})` : `${ROLE_INFO[r].label} (${comments.filter(c => c.author_role === r).length})`}
            </button>
          ))}
        </div>

        {/* 의견 목록 */}
        <div className="space-y-3">
          {filtered.map(c => {
            const roleInfo = ROLE_INFO[c.author_role]
            return (
              <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                  <span className="font-bold text-sm text-gray-800">{c.author}</span>
                  {c.parts && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.parts.title}</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {format(new Date(c.created_at), 'M/d HH:mm', { locale: ko })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <div>첫 번째 의견을 남겨주세요!</div>
              <div className="text-xs mt-1">팀원, 주민환경연구원, 그린고산실천단 모두 환영합니다 🌿</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
