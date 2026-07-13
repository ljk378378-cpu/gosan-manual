'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { supabase, DesignReviewItem, SEVERITY_INFO, TEAM_MEMBERS } from '@/lib/supabase'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const SEVERITY_ORDER: DesignReviewItem['severity'][] = ['critical', 'photo', 'content', 'format']

export default function DesignReviewPage() {
  const [items, setItems] = useState<DesignReviewItem[]>([])
  const [severity, setSeverity] = useState<DesignReviewItem['severity']>('content')
  const [pageRef, setPageRef] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open')

  useEffect(() => {
    load()
    const channel = supabase
      .channel('design-review-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'design_review_items' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function load() {
    const { data } = await supabase
      .from('design_review_items')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setItems(data as DesignReviewItem[])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description || !author) return
    setSubmitting(true)
    const { error } = await supabase.from('design_review_items').insert({
      severity,
      page_ref: pageRef || null,
      title,
      description,
      author,
    })
    if (error) {
      alert('등록 실패: ' + error.message)
    } else {
      setPageRef(''); setTitle(''); setDescription('')
      await load()
    }
    setSubmitting(false)
  }

  async function toggleDone(item: DesignReviewItem) {
    await supabase.from('design_review_items').update({ is_done: !item.is_done }).eq('id', item.id)
    load()
  }

  async function remove(id: number) {
    if (!confirm('이 항목을 삭제할까요?')) return
    await supabase.from('design_review_items').delete().eq('id', id)
    load()
  }

  const filtered = items.filter(i => filter === 'all' ? true : filter === 'open' ? !i.is_done : i.is_done)
  const grouped = SEVERITY_ORDER.map(s => ({ severity: s, items: filtered.filter(i => i.severity === s) })).filter(g => g.items.length > 0)
  const openCount = items.filter(i => !i.is_done).length
  const today = format(new Date(), 'yyyy년 M월 d일 (EEE)', { locale: ko })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print"><Nav /></div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between items-start mb-6 no-print">
          <div>
            <h1 className="text-xl font-bold text-gray-800">✏️ 디자인 수정요청</h1>
            <p className="text-sm text-gray-500">디자인 시안 검토 결과 + 직원 추가 의견 — 디자이너 전달용. 미해결 {openCount}건</p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 whitespace-nowrap"
          >
            🖨️ 인쇄 / PDF 저장
          </button>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={submit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6 no-print">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">➕ 수정사항 추가</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">구분</label>
              <select
                className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                value={severity}
                onChange={e => setSeverity(e.target.value as DesignReviewItem['severity'])}
              >
                {SEVERITY_ORDER.map(s => (
                  <option key={s} value={s}>{SEVERITY_INFO[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">위치 (쪽번호 등)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded px-2 py-2 text-sm"
                placeholder="예: p.42, 표지 시안 1"
                value={pageRef}
                onChange={e => setPageRef(e.target.value)}
              />
            </div>
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
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
                <option value="__custom__">직접 입력...</option>
              </select>
              {author === '__custom__' && (
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-gray-200 rounded px-2 py-2 text-sm mt-1"
                  placeholder="이름 입력"
                  onChange={e => setAuthor(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-600 mb-1 block">제목</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              placeholder="예: 표지 로고 색상이 브랜드 가이드와 다름"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">상세 내용</label>
            <textarea
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-400"
              rows={3}
              placeholder="구체적으로 어디를 어떻게 고쳐야 하는지 적어주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !title || !description || !author}
              className="bg-green-700 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-40"
            >
              {submitting ? '등록 중...' : '수정요청 추가'}
            </button>
          </div>
        </form>

        {/* 필터 */}
        <div className="flex gap-2 mb-4 no-print">
          {(['open', 'done', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f ? 'bg-green-700 text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'open' ? `미해결 (${items.filter(i => !i.is_done).length})` : f === 'done' ? `해결됨 (${items.filter(i => i.is_done).length})` : `전체 (${items.length})`}
            </button>
          ))}
        </div>

        {/* 인쇄 표지 */}
        <div className="hidden print:block text-center border-b pb-6 mb-6">
          <div className="text-3xl mb-2">✏️</div>
          <h1 className="text-xl font-bold text-gray-900">주민이 그린 고산 환경리빙랩 매뉴얼 — 디자인 수정요청</h1>
          <p className="text-xs text-gray-500 mt-2">작성일: {today} · 청곡종합사회복지관 · 디자이너 전달용</p>
        </div>

        {/* 목록 */}
        <div id="review-content" className="space-y-6">
          {grouped.map(g => (
            <section key={g.severity}>
              <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${SEVERITY_INFO[g.severity].dot}`} />
                {SEVERITY_INFO[g.severity].label} ({g.items.length})
              </h2>
              <div className="space-y-2">
                {g.items.map(item => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 ${SEVERITY_INFO[item.severity].color} ${item.is_done ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.is_done}
                        onChange={() => toggleDone(item)}
                        className="mt-1 no-print"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.page_ref && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/70 border border-black/10">{item.page_ref}</span>
                          )}
                          <h3 className={`text-sm font-bold ${item.is_done ? 'line-through' : ''}`}>{item.title}</h3>
                          {item.is_done && <span className="text-[10px] font-bold text-green-700">✔ 해결됨</span>}
                        </div>
                        <p className="text-xs mt-1.5 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                        <div className="text-[10px] text-black/40 mt-2 flex justify-between">
                          <span>{item.author}</span>
                          <span>{format(new Date(item.created_at), 'M/d HH:mm', { locale: ko })}</span>
                        </div>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-black/30 hover:text-red-600 text-xs no-print">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 no-print">
              <div className="text-4xl mb-2">✏️</div>
              <div>표시할 항목이 없습니다</div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #review-content { break-inside: auto; }
          #review-content section { break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
