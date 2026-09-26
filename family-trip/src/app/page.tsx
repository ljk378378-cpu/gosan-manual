'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Heart,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  PencilLine,
  Printer,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { supabase, LOCAL_KEY } from '@/lib/supabase'
import {
  TRIP_SLUG,
  dDay,
  defaultTrip,
  won,
  type TripComment,
  type TripState,
} from '@/lib/trip'

const ACCESS_KEY = 'andong-family-trip-access-v1'
const NAME_KEY = 'andong-family-trip-name-v1'

type RpcTrip = {
  state?: TripState
  comments?: TripComment[]
  updated_at?: string
}

function mapUrl(place: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(place)}`
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function FamilyTripPage() {
  const [trip, setTrip] = useState<TripState>(defaultTrip)
  const [comments, setComments] = useState<TripComment[]>([])
  const [accessCode, setAccessCode] = useState('')
  const [name, setName] = useState('')
  const [loginName, setLoginName] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [commentDraft, setCommentDraft] = useState('')

  useEffect(() => {
    if (!supabase) {
      try {
        const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null')
        if (saved) { setTrip(saved.trip); setComments(saved.comments || []) }
        setName(localStorage.getItem(NAME_KEY) || '진규')
      } catch { setError('저장된 내용을 읽지 못했습니다. 기본 계획을 표시합니다.') }
      setUnlocked(true)
      setLoading(false)
      return
    }
    const savedCode = sessionStorage.getItem(ACCESS_KEY) || ''
    const savedName = localStorage.getItem(NAME_KEY) || ''
    setLoginName(savedName)
    if (!savedCode || !savedName) {
      setLoading(false)
      return
    }
    unlock(savedName, savedCode)
  }, [])

  const plannedTotal = useMemo(() => trip.budget.reduce((sum, item) => sum + item.planned, 0), [trip.budget])
  const paidTotal = useMemo(
    () => trip.budget.reduce((sum, item) => sum + (item.paid ? item.actual : 0), 0),
    [trip.budget],
  )
  const remaining = trip.budget.filter(item => !item.paid).reduce((sum, item) => sum + item.planned, 0)
  const completedTasks = trip.tasks.filter(item => item.done).length

  async function unlock(personName: string, code: string) {
    if (!supabase) return
    if (!personName.trim() || !code.trim()) {
      setError('이름과 가족 암호를 모두 입력해주세요.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('family_trip_get', {
      p_slug: TRIP_SLUG,
      p_access_code: code.trim(),
    })
    if (rpcError || !data) {
      setError('가족 암호가 맞지 않거나 연결이 원활하지 않습니다.')
      setLoading(false)
      return
    }
    const payload = data as RpcTrip
    setTrip(payload.state || defaultTrip)
    setComments(payload.comments || [])
    setName(personName.trim())
    setAccessCode(code.trim())
    setUnlocked(true)
    sessionStorage.setItem(ACCESS_KEY, code.trim())
    localStorage.setItem(NAME_KEY, personName.trim())
    setLoading(false)
  }

  async function reload() {
    if (!accessCode) return
    setLoading(true)
    await unlock(name, accessCode)
  }

  async function saveTrip(nextTrip: TripState, notice = '변경 내용을 가족 일정에 반영했습니다.') {
    if (saving) return false
    if (!supabase) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ trip: nextTrip, comments }))
        setTrip(nextTrip)
        setMessage('이 기기에 저장했습니다.')
        setError('')
        return true
      } catch { setError('저장 공간을 사용할 수 없습니다. 브라우저 설정을 확인해주세요.'); return false }
    }
    const previous = trip
    setTrip(nextTrip)
    setSaving(true)
    setError('')
    const { data, error: rpcError } = await supabase.rpc('family_trip_save', {
      p_slug: TRIP_SLUG,
      p_access_code: accessCode,
      p_state: nextTrip,
    })
    if (rpcError || !data) {
      setTrip(previous)
      setError('저장하지 못했습니다. 잠시 후 다시 시도해주세요.')
      setSaving(false)
      return false
    }
    setTrip(data as TripState)
    setMessage(notice)
    setSaving(false)
    window.setTimeout(() => setMessage(''), 2400)
    return true
  }

  function toggleTask(taskId: string) {
    const nextTrip = {
      ...trip,
      tasks: trip.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task),
    }
    saveTrip(nextTrip, '준비상태를 변경했습니다.')
  }

  function vote(decisionId: string, vote: 'agree' | 'change') {
    const nextTrip = {
      ...trip,
      decisions: trip.decisions.map(decision => decision.id === decisionId
        ? { ...decision, votes: { ...decision.votes, [name]: vote } }
        : decision),
    }
    saveTrip(nextTrip, vote === 'agree' ? '이 결정에 동의했습니다.' : '수정 의견으로 표시했습니다.')
  }

  function updateBudget(id: string, field: 'actual' | 'paid', value: number | boolean) {
    setTrip(current => ({
      ...current,
      budget: current.budget.map(item => item.id === id ? { ...item, [field]: value } : item),
    }))
  }

  async function addComment() {
    if (!commentDraft.trim() || saving) return
    if (!supabase) {
      const next = [...comments, { id: crypto.randomUUID(), author: name, body: commentDraft.trim(), created_at: new Date().toISOString() }]
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ trip, comments: next }))
        setComments(next); setCommentDraft(''); setMessage('이 기기에 의견을 저장했습니다.'); setError('')
      } catch { setError('의견을 저장하지 못했습니다.') }
      return
    }
    setSaving(true)
    const { data, error: rpcError } = await supabase.rpc('family_trip_add_comment', {
      p_slug: TRIP_SLUG,
      p_access_code: accessCode,
      p_author: name,
      p_body: commentDraft.trim(),
    })
    if (rpcError || !data) {
      setError('의견을 남기지 못했습니다.')
      setSaving(false)
      return
    }
    setComments(data as TripComment[])
    setCommentDraft('')
    setMessage('가족 의견을 남겼습니다.')
    setSaving(false)
  }

  async function shareTrip() {
    const shareData = {
      title: trip.title,
      text: `${trip.startDate}~${trip.endDate} 안동 가족여행 일정과 준비상황을 함께 확인해주세요.`,
      url: window.location.href,
    }
    try {
    if (navigator.share) await navigator.share(shareData)
    else {
      await navigator.clipboard.writeText(window.location.href)
      setMessage('가족 공유 링크를 복사했습니다.')
    }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setError('공유하지 못했습니다. 주소창의 링크를 복사해주세요.') }
  }

  if (loading && !unlocked) {
    return <main className="center-screen"><Loader2 className="spin" size={30} /><p>가족여행을 불러오고 있습니다.</p></main>
  }

  if (!unlocked) {
    return (
      <main className="access-page">
        <section className="access-visual" aria-label="안동의 늦가을 풍경">
          <div className="access-copy">
            <span className="eyebrow light">ANDONG FAMILY TRIP</span>
            <h1>엄마의 칠순,<br />안동 가족여행</h1>
            <p>두 가족이 함께 준비하고 한곳에서 확인하는 1박 2일 여행 일정표</p>
          </div>
        </section>
        <section className="access-form-wrap">
          <form className="access-form" onSubmit={event => { event.preventDefault(); unlock(loginName, loginCode) }}>
            <Heart size={30} strokeWidth={1.8} />
            <div>
              <span className="eyebrow">FAMILY ONLY</span>
              <h2>가족 전용 일정표</h2>
              <p>가족들에게 전달받은 암호로 들어오세요.</p>
            </div>
            <label>
              내 이름
              <input value={loginName} onChange={event => setLoginName(event.target.value)} placeholder="예: 진규" autoComplete="name" />
            </label>
            <label>
              가족 암호
              <input type="password" value={loginCode} onChange={event => setLoginCode(event.target.value)} placeholder="가족 암호 입력" autoComplete="current-password" />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button wide" type="submit"><LockKeyhole size={18} /> 일정표 열기</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main>
      <header className="topbar no-print">
        <a className="brand" href="#top"><Heart size={18} fill="currentColor" /> 엄마의 칠순여행</a>
        <nav aria-label="페이지 바로가기">
          <a href="#schedule">일정</a>
          <a href="#budget">예산</a>
          <a href="#tasks">준비</a>
          <a href="#comments">의견</a>
        </nav>
        <div className="top-actions">
          <button disabled={!supabase || loading || saving} className="icon-button" onClick={reload} title="새로고침"><RefreshCw size={18} /></button>
          <button disabled={!supabase} className="icon-button" onClick={shareTrip} title="가족에게 공유"><Share2 size={18} /></button>
        </div>
      </header>

      <section id="top" className="trip-hero">
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow light">2026. 11. 07 SAT - 11. 08 SUN</span>
          <h1>{trip.title}</h1>
          <p>{trip.subtitle}</p>
          <div className="hero-meta">
            <span><MapPin size={17} /> 경북 안동</span>
            <span><Users size={17} /> 총 9명</span>
            <strong>D-{dDay(trip.startDate)}</strong>
          </div>
        </div>
      </section>

      <section className="summary-band" aria-label="여행 준비 요약">
        <div><CalendarDays size={22} /><span>여행일</span><strong>11월 7일 토요일</strong></div>
        <div><CircleDollarSign size={22} /><span>예상 총액</span><strong>{won(plannedTotal)}</strong></div>
        <div><Banknote size={22} /><span>결제 완료</span><strong>{won(paidTotal)}</strong></div>
        <div><ClipboardCheck size={22} /><span>준비 완료</span><strong>{completedTasks}/{trip.tasks.length}</strong></div>
      </section>

      <div className="page-shell">
        {!supabase && <aside className="local-notice"><strong>이 기기에 저장하는 여행 준비장</strong><span>수정 내용은 현재 브라우저에 보관됩니다. 가족 공동 저장·공유는 아직 연결되지 않았습니다.</span></aside>}
        <Link className="report-card" href="/report"><Printer size={24} /><div><strong>여행 계획서 · 보고서 출력</strong><span>일정과 경비, 준비사항을 한 번에 인쇄하거나 PDF로 저장하세요.</span></div><span aria-hidden="true">→</span></Link>
        <section className="intro-row">
          <div>
            <span className="eyebrow">OUR PLAN</span>
            <h2>어머니는 준비 없이<br />즐기시기만 하기</h2>
          </div>
          <p>{trip.travelers}<br />숙박비 33만원은 공동경비 통장에서 결제했습니다. 나머지는 두 가족이 함께 확인하고 준비합니다.</p>
        </section>

        <section className="section-block" aria-labelledby="decisions-heading">
          <div className="section-heading">
            <div><span className="eyebrow">FAMILY CHOICE</span><h2 id="decisions-heading">지금 함께 정할 것</h2></div>
            <p>동의하거나 수정이 필요한 항목만 표시해주세요.</p>
          </div>
          <div className="decision-grid">
            {trip.decisions.map(decision => {
              const agreeCount = Object.values(decision.votes).filter(value => value === 'agree').length
              const changeCount = Object.values(decision.votes).filter(value => value === 'change').length
              const myVote = decision.votes[name]
              return (
                <article className="decision-card" key={decision.id}>
                  <span>{decision.title}</span>
                  <h3>{decision.choice}</h3>
                  <p>{decision.note}</p>
                  <div className="vote-row">
                    <button className={myVote === 'agree' ? 'vote active' : 'vote'} disabled={saving} onClick={() => vote(decision.id, 'agree')}><Check size={17} /> 동의 {agreeCount}</button>
                    <button className={myVote === 'change' ? 'vote change active' : 'vote change'} disabled={saving} onClick={() => vote(decision.id, 'change')}><PencilLine size={16} /> 수정 {changeCount}</button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section id="schedule" className="section-block" aria-labelledby="schedule-heading">
          <div className="section-heading">
            <div><span className="eyebrow">ITINERARY</span><h2 id="schedule-heading">1박 2일 일정</h2></div>
            <Link className="outline-button no-print" href="/report"><Printer size={17} /> 인쇄용 일정표</Link>
          </div>
          <div className="day-grid">
            {(['day1', 'day2'] as const).map((day, index) => (
              <article className="day-column" key={day}>
                <div className="day-title"><span>DAY {index + 1}</span><h3>{index === 0 ? '11월 7일 토요일' : '11월 8일 일요일'}</h3></div>
                <div className="timeline">
                  {trip.schedule[day].map(item => (
                    <div className="timeline-item" key={item.id}>
                      <time>{item.time}</time>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                        <div className="item-meta">
                          {item.group && <span><Users size={14} /> {item.group}</span>}
                          {item.location && <a href={mapUrl(item.location)} target="_blank" rel="noreferrer"><MapPin size={14} /> {item.location}<ExternalLink size={12} /></a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="budget" className="section-block" aria-labelledby="budget-heading">
          <div className="section-heading">
            <div><span className="eyebrow">COMMON FUND</span><h2 id="budget-heading">공동경비</h2></div>
            <button className="primary-button no-print" disabled={saving} onClick={() => saveTrip(trip, '예산 변경 내용을 저장했습니다.')}>
              {saving ? <Loader2 className="spin" size={17} /> : <Check size={17} />} 변경 저장
            </button>
          </div>
          <div className="budget-summary">
            <div><span>전체 예상</span><strong>{won(plannedTotal)}</strong></div>
            <div><span>결제 완료</span><strong>{won(paidTotal)}</strong></div>
            <div className="accent"><span>앞으로 필요</span><strong>{won(remaining)}</strong></div>
          </div>
          <div className="budget-table" role="table" aria-label="여행 예산">
            <div className="budget-row budget-head" role="row"><span>항목</span><span>예상</span><span>실제 지출</span><span>결제</span></div>
            {trip.budget.map(item => (
              <div className="budget-row" role="row" key={item.id}>
                <div><strong>{item.title}</strong><small>{item.memo}</small></div>
                <span>{won(item.planned)}</span>
                <label className="amount-input"><span className="sr-only">{item.title} 실제 지출</span><input inputMode="numeric" value={item.actual || ''} placeholder="0" onChange={event => updateBudget(item.id, 'actual', Number(event.target.value.replace(/\D/g, '')) || 0)} /><i>원</i></label>
                <label className="paid-check"><input type="checkbox" checked={item.paid} onChange={event => updateBudget(item.id, 'paid', event.target.checked)} /><span>{item.paid ? '완료' : '예정'}</span></label>
              </div>
            ))}
          </div>
        </section>

        <section id="tasks" className="section-block" aria-labelledby="tasks-heading">
          <div className="section-heading">
            <div><span className="eyebrow">PREPARATION</span><h2 id="tasks-heading">누가 무엇을 준비하나요</h2></div>
            <strong className="progress-label">{completedTasks}/{trip.tasks.length} 완료</strong>
          </div>
          <div className="progress-track"><span style={{ width: `${(completedTasks / trip.tasks.length) * 100}%` }} /></div>
          <div className="task-list">
            {trip.tasks.map(task => (
              <button className={task.done ? 'task-row done' : 'task-row'} key={task.id} disabled={saving} onClick={() => toggleTask(task.id)}>
                {task.done ? <CheckCircle2 size={22} /> : <span className="empty-check" />}
                <span className="task-main"><strong>{task.title}</strong><small>{task.owner}</small></span>
                <span className="task-due"><Clock3 size={14} /> {task.due.slice(5).replace('-', '.')}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="comments" className="section-block comments-section" aria-labelledby="comments-heading">
          <div className="section-heading">
            <div><span className="eyebrow">FAMILY TALK</span><h2 id="comments-heading">가족 의견</h2></div>
            <span>{comments.length}개 의견</span>
          </div>
          <div className="comment-compose no-print">
            <label className="author-field">작성자<input aria-label="의견 작성자" value={name} onChange={event => { setName(event.target.value); localStorage.setItem(NAME_KEY, event.target.value) }} /></label>
            <textarea value={commentDraft} onChange={event => setCommentDraft(event.target.value)} placeholder="일정, 메뉴, 준비물에 대한 의견을 편하게 남겨주세요." rows={3} maxLength={500} />
            <button className="primary-button" onClick={addComment} disabled={saving || !commentDraft.trim() || !name.trim()}><Send size={17} /> 등록</button>
          </div>
          <div className="comment-list">
            {comments.length === 0 && <div className="empty-comments"><MessageCircle size={24} /><p>아직 남겨진 의견이 없습니다.<br />첫 의견을 남겨주세요.</p></div>}
            {comments.map(comment => (
              <article className="comment-row" key={comment.id}>
                <div className="avatar small">{comment.author.slice(0, 1)}</div>
                <div><strong>{comment.author}</strong><time>{formatDateTime(comment.created_at)}</time><p>{comment.body}</p></div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer><Sparkles size={17} /> 2026년 11월, 엄마와 함께 만드는 우리 가족의 기록</footer>

      {(message || error) && <div role="status" className={error ? 'toast error' : 'toast'}><span>{error || message}</span><button onClick={() => { setMessage(''); setError('') }}><X size={16} /></button></div>}
    </main>
  )
}
