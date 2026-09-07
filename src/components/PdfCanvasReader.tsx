'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type PdfCanvasReaderProps = {
  fileUrl: string
  initialPage: number
  scale: number
  title: string
  bookmarks?: { label: string; page: number }[]
}

export default function PdfCanvasReader({ fileUrl, initialPage, scale, title, bookmarks = [] }: PdfCanvasReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageDraft, setPageDraft] = useState(`${initialPage}`)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [status, setStatus] = useState('원문을 불러오는 중')
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(scale)
  const [fitToWidth, setFitToWidth] = useState(true)
  const [viewerWidth, setViewerWidth] = useState(0)

  useEffect(() => {
    setCurrentPage(initialPage)
    setPageDraft(`${initialPage}`)
    setZoom(scale)
    setFitToWidth(true)
  }, [fileUrl, initialPage, scale])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const updateWidth = () => setViewerWidth(viewer.clientWidth)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(viewer)
    return () => observer.disconnect()
  }, [])

  const effectiveZoom = useMemo(() => {
    if (!fitToWidth) return zoom
    if (!viewerWidth) return 1
    return zoom
  }, [fitToWidth, viewerWidth, zoom])

  const goToPage = (page: number) => {
    if (!Number.isFinite(page)) return
    const maxPage = pageCount || page
    const nextPage = Math.min(Math.max(1, Math.round(page)), maxPage)
    setCurrentPage(nextPage)
    setPageDraft(`${nextPage}`)
  }

  useEffect(() => {
    let cancelled = false
    let renderTask: { promise: Promise<void>; cancel?: () => void } | null = null
    let loadingTask: { promise: Promise<any>; destroy?: () => void } | null = null
    let pdfDocument: { destroy?: () => Promise<void> | void } | null = null

    async function renderPage() {
      const canvas = canvasRef.current
      if (!canvas) return

      setStatus('원문을 불러오는 중')
      setError('')

      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()

        loadingTask = pdfjs.getDocument({ url: fileUrl }) as unknown as { promise: Promise<any>; destroy: () => void }
        const pdf = await loadingTask.promise
        pdfDocument = pdf
        if (cancelled) return

        setPageCount(pdf.numPages)
        const safePage = Math.min(Math.max(currentPage, 1), pdf.numPages)
        if (safePage !== currentPage) {
          setCurrentPage(safePage)
          return
        }

        const page = await pdf.getPage(safePage)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1 })
        const usableWidth = Math.max(320, (viewerRef.current?.clientWidth || viewerWidth || 900) - 42)
        const scaleToUse = fitToWidth ? Math.min(Math.max(usableWidth / baseViewport.width, 0.6), 2.4) : effectiveZoom
        const viewport = page.getViewport({ scale: scaleToUse })
        const context = canvas.getContext('2d')
        if (!context) throw new Error('PDF 화면을 준비하지 못했습니다.')

        const outputScale = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, canvas.width, canvas.height)

        const task = page.render({
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        })
        renderTask = task

        await task.promise
        if (!cancelled) setStatus('원문 표시 완료')
      } catch (caught) {
        if (cancelled) return
        const message = caught instanceof Error ? caught.message : 'PDF를 불러오지 못했습니다.'
        if (!message.includes('cancelled')) {
          setError(message)
          setStatus('원문 표시 실패')
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      renderTask?.cancel?.()
      loadingTask?.destroy?.()
      pdfDocument?.destroy?.()
    }
  }, [fileUrl, currentPage, effectiveZoom, fitToWidth, viewerWidth])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100">
      <div className="grid gap-3 border-b border-slate-200 bg-white px-4 py-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {status}{pageCount ? ` · ${currentPage}/${pageCount}쪽` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFitToWidth(true)}
            className={`rounded-lg px-3 py-2 text-xs font-black ${fitToWidth ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
          >
            화면맞춤
          </button>
          <button
            onClick={() => {
              setFitToWidth(false)
              setZoom(value => Math.max(0.75, Number((value - 0.15).toFixed(2))))
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            축소
          </button>
          {[1, 1.25, 1.5, 1.8].map(value => (
            <button
              key={value}
              onClick={() => {
                setFitToWidth(false)
                setZoom(value)
              }}
              className={`rounded-lg px-3 py-2 text-xs font-black ${!fitToWidth && Math.abs(zoom - value) < 0.01 ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
            >
              {Math.round(value * 100)}%
            </button>
          ))}
          <button
            onClick={() => {
              setFitToWidth(false)
              setZoom(value => Math.min(2.4, Number((value + 0.15).toFixed(2))))
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            확대
          </button>
          <button
            onClick={() => setCurrentPage(page => {
              const nextPage = Math.max(1, page - 1)
              setPageDraft(`${nextPage}`)
              return nextPage
            })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            이전쪽
          </button>
          <button
            onClick={() => setCurrentPage(page => {
              const nextPage = pageCount ? Math.min(pageCount, page + 1) : page + 1
              setPageDraft(`${nextPage}`)
              return nextPage
            })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            다음쪽
          </button>
        </div>
      </div>
      <div className="grid gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-500">바로가기</span>
          <select
            value=""
            onChange={event => {
              const page = Number(event.target.value)
              if (page) goToPage(page)
            }}
            className="min-w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="">목차/주제 선택</option>
            {bookmarks.map(item => (
              <option key={`${item.label}-${item.page}`} value={item.page}>
                p.{item.page} {item.label}
              </option>
            ))}
          </select>
        </div>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={event => {
            event.preventDefault()
            goToPage(Number(pageDraft))
          }}
        >
          <span className="text-xs font-black text-slate-500">쪽</span>
          <input
            value={pageDraft}
            onChange={event => setPageDraft(event.target.value)}
            inputMode="numeric"
            className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none"
            aria-label="이동할 쪽 번호"
          />
          <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">이동</button>
        </form>
      </div>
      <div ref={viewerRef} className="h-[min(78vh,1100px)] min-h-[720px] overflow-auto p-3 md:p-5">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-bold leading-6 text-red-800">
            {error}
          </div>
        ) : (
          <div className="flex min-w-full justify-center">
            <canvas ref={canvasRef} className="bg-white shadow-xl" />
          </div>
        )}
      </div>
    </div>
  )
}
