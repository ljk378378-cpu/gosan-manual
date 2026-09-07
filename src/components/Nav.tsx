'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈' },
  { href: '/evaluation-2027', label: '27년 평가' },
  { href: '/inspection-2026', label: '지도점검' },
  { href: '/team-command', label: '팀 운영' },
  { href: '/hr-labor', label: '인사노무' },
  { href: '/money', label: '소비점검' },
  { href: '/ai-system', label: 'AI원칙' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-slate-950 text-white no-print">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex min-h-14 flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-black rounded bg-emerald-400 px-2 py-1 text-slate-950">AI</span>
            <span className="font-bold text-sm">청곡 AI 업무시스템</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-bold leading-none transition-colors ${
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'bg-emerald-500 font-bold text-slate-950'
                    : 'bg-white/5 text-slate-200 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
