'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Nav from '@/components/Nav'

interface Props {
  content: string
}

export default function ManuscriptViewer({ content }: Props) {
  const [search, setSearch] = useState('')
  const [jumpTo, setJumpTo] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  // H1/H2 목차 추출
  const headings = content
    .split('\n')
    .filter(l => /^#{1,2} /.test(l))
    .map(l => {
      const level = l.match(/^(#{1,2})/)?.[1].length ?? 1
      const text = l.replace(/^#{1,2} /, '')
      const id = text.replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '')
      return { level, text, id }
    })

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const highlighted = search.trim()
    ? content.replace(
        new RegExp(`(${search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '**$1**'
      )
    : content

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* 사이드 목차 */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-h-[85vh] overflow-y-auto">
            <div className="font-bold text-gray-700 text-sm mb-3">목차</div>
            <ul className="space-y-1">
              {headings.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`text-left w-full text-xs hover:text-green-700 transition-colors leading-snug py-0.5 ${
                      h.level === 1
                        ? 'font-semibold text-gray-800 mt-2'
                        : 'text-gray-500 pl-3'
                    }`}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          {/* 상단 툴바 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-green-700">← 대시보드</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-semibold text-gray-700">전체 원고 합본</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="본문 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-green-400"
              />
              <button
                onClick={() => window.print()}
                className="text-sm bg-green-700 text-white px-4 py-1.5 rounded-lg hover:bg-green-800 transition-colors"
              >
                인쇄 / PDF
              </button>
            </div>
          </div>

          {/* 마크다운 본문 */}
          <div
            ref={contentRef}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose prose-sm max-w-none
              prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2 prose-h1:mt-10
              prose-h2:text-lg prose-h2:font-bold prose-h2:mt-8
              prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6
              prose-table:text-sm prose-th:bg-gray-50 prose-th:font-semibold
              prose-td:align-top prose-td:py-2
              prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:text-amber-800 prose-blockquote:text-sm
              print:shadow-none print:border-none print:p-0"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children, ...props }) => {
                  const id = String(children).replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '')
                  return <h1 id={id} {...props}>{children}</h1>
                },
                h2: ({ children, ...props }) => {
                  const id = String(children).replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '')
                  return <h2 id={id} {...props}>{children}</h2>
                },
              }}
            >
              {highlighted}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          aside, .no-print { display: none !important; }
          .bg-gray-50 { background: white !important; }
          .rounded-xl, .shadow-sm { border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
