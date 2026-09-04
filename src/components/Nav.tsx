'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '홈', icon: '홈' },
  { href: '/evaluation-2027', label: '27년 평가', icon: '평가' },
  { href: '/inspection-2026', label: '지도점검', icon: '점검' },
  { href: '/team-command', label: '팀 운영', icon: '팀' },
  { href: '/ai-system', label: 'AI원칙', icon: 'AI' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-slate-950 text-white no-print">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black rounded bg-emerald-400 px-2 py-1 text-slate-950">AI</span>
            <span className="font-bold text-sm">청곡 AI 업무시스템</span>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-emerald-500 font-bold text-slate-950'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="mr-1 text-xs font-bold">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
