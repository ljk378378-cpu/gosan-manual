'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen items-center justify-center bg-slate-100 px-5 text-slate-950">
        <main className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-xl">
          <p className="text-xs font-black tracking-[.18em] text-emerald-700">CHEONGGOK AI</p>
          <h1 className="mt-3 text-2xl font-black">화면을 불러오지 못했습니다</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">잠시 후 다시 시도하거나 첫 화면으로 돌아가 주세요.</p>
          <div className="mt-6 grid gap-2">
            <button type="button" onClick={reset} className="rounded-xl bg-emerald-700 px-4 py-3 font-black text-white">
              다시 시도
            </button>
            <a href="/" className="rounded-xl bg-slate-200 px-4 py-3 font-black text-slate-800">
              첫 화면으로
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
