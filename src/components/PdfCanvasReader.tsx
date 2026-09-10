'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type PdfCanvasReaderProps = {
  fileUrl: string
  initialPage: number
  scale: number
  title: string
  bookmarks?: { label: string; page: number }[]
  spreadView?: boolean
}

type SpreadSide = 'full' | 'left' | 'right'

export default function PdfCanvasReader({ fileUrl, initialPage, scale, title, bookmarks = [], spreadView = false }: PdfCanvasReaderProps) {
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
  const [spreadSide, setSpreadSide] = useState<SpreadSide>(spreadView ? 'right' : 'full')
  const [isCurrentSpread, setIsCurrentSpread] = useState(false)

  useEffect(() => {
    setCurrentPage(initialPage)
    setPageDraft(`${initialPage}`)
    setZoom(scale)
    setFitToWidth(true)
    setSpreadSide(spreadView ? 'right' : 'full')
  }, [fileUrl, initialPage, scale, spreadView])

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

  const goToPreviousPage = () => {
    if (spreadView && isCurrentSpread && spreadSide === 'right') {
      setSpreadSide('left')
      setFitToWidth(true)
      return
    }
    setCurrentPage(page => {
      const previousPage = Math.max(1, page - 1)
      setPageDraft(`${previousPage}`)
      return previousPage
    })
    if (spreadView && spreadSide !== 'full') {
      setSpreadSide('right')
      setFitToWidth(true)
    }
  }

  const goToNextPage = () => {
    if (spreadView && isCurrentSpread && spreadSide === 'left') {
      setSpreadSide('right')
      setFitToWidth(true)
      return
    }
    setCurrentPage(page => {
      const nextPage = pageCount ? Math.min(pageCount, page + 1) : page + 1
      setPageDraft(`${nextPage}`)
      return nextPage
    })
    if (spreadView && spreadSide !== 'full') {
      setSpreadSide('left')
      setFitToWidth(true)
    }
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
        const pageIsSpread = baseViewport.width > baseViewport.height
        setIsCurrentSpread(pageIsSpread)
        const cropSpread = spreadView && spreadSide !== 'full' && pageIsSpread
        const visibleBaseWidth = cropSpread ? baseViewport.width / 2 : baseViewport.width
        const usableWidth = Math.max(320, (viewerRef.current?.clientWidth || viewerWidth || 900) - 42)
        const scaleToUse = fitToWidth ? Math.min(Math.max(usableWidth / visibleBaseWidth, 0.6), 2.4) : effectiveZoom
        const viewport = page.getViewport({ scale: scaleToUse })
        const renderCanvas = cropSpread ? document.createElement('canvas') : canvas
        const context = renderCanvas.getContext('2d')
        if (!context) throw new Error('PDF 화면을 준비하지 못했습니다.')

        const outputScale = window.devicePixelRatio || 1
        renderCanvas.width = Math.floor(viewport.width * outputScale)
        renderCanvas.height = Math.floor(viewport.height * outputScale)
        canvas.width = cropSpread ? Math.floor(renderCanvas.width / 2) : renderCanvas.width
        canvas.height = renderCanvas.height
        canvas.style.width = `${Math.floor(cropSpread ? viewport.width / 2 : viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, renderCanvas.width, renderCanvas.height)

        const task = page.render({
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        })
        renderTask = task

        await task.promise
        if (cropSpread) {
          const visibleContext = canvas.getContext('2d')
          if (!visibleContext) throw new Error('PDF 한쪽 화면을 준비하지 못했습니다.')
          const sourceX = spreadSide === 'right' ? renderCanvas.width / 2 : 0
          visibleContext.setTransform(1, 0, 0, 1, 0, 0)
          visibleContext.clearRect(0, 0, canvas.width, canvas.height)
          visibleContext.drawImage(
            renderCanvas,
            sourceX,
            0,
            renderCanvas.width / 2,
            renderCanvas.height,
            0,
            0,
            canvas.width,
            canvas.height,
          )
        }
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
  }, [fileUrl, currentPage, effectiveZoom, fitToWidth, viewerWidth, spreadSide, spreadView])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-100">
      <div className="grid gap-3 border-b border-slate-200 bg-white px-4 py-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {status}{pageCount ? ` · ${currentPage}/${pageCount}쪽` : ''}{spreadView && isCurrentSpread && spreadSide !== 'full' ? ` · ${spreadSide === 'left' ? '왼쪽 면' : '오른쪽 면'}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {spreadView ? (
            <div className="flex overflow-hidden rounded-lg border border-amber-300 bg-white">
              {([
                { value: 'left', label: '왼쪽 면' },
                { value: 'right', label: '오른쪽 면' },
                { value: 'full', label: '전체 펼침' },
              ] as { value: SpreadSide; label: string }[]).map(item => (
                <button
                  key={item.value}
                  onClick={() => {
                    setSpreadSide(item.value)
                    setFitToWidth(true)
                  }}
                  className={`px-3 py-2 text-xs font-black ${spreadSide === item.value ? 'bg-amber-700 text-white' : 'text-amber-900 hover:bg-amber-50'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
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
            onClick={goToPreviousPage}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            이전쪽
          </button>
          <button
            onClick={goToNextPage}
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
