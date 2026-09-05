'use client'

import { useEffect, useRef, useState } from 'react'

type PdfCanvasReaderProps = {
  fileUrl: string
  initialPage: number
  scale: number
  title: string
}

export default function PdfCanvasReader({ fileUrl, initialPage, scale, title }: PdfCanvasReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [status, setStatus] = useState('원문을 불러오는 중')
  const [error, setError] = useState('')

  useEffect(() => {
    setCurrentPage(initialPage)
  }, [fileUrl, initialPage])

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

        const viewport = page.getViewport({ scale })
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
  }, [fileUrl, currentPage, scale])

  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-100">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {status}{pageCount ? ` · ${currentPage}/${pageCount}쪽` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            이전쪽
          </button>
          <button
            onClick={() => setCurrentPage(page => pageCount ? Math.min(pageCount, page + 1) : page + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700"
          >
            다음쪽
          </button>
        </div>
      </div>
      <div className="h-[calc(100vh-120px)] min-h-[980px] overflow-auto p-4">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-bold leading-6 text-red-800">
            {error}
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="bg-white shadow-xl" />
          </div>
        )}
      </div>
    </div>
  )
}
