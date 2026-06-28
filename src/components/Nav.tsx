'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '대시보드', icon: '🏠' },
  { href: '/storyboard', label: '스토리보드', icon: '📋' },
  { href: '/daily', label: '데일리 채널', icon: '📝' },
  { href: '/comments', label: '의견 게시판', icon: '💬' },
  { href: '/designer', label: '디자인 브리핑', icon: '🎨' },
  { href: '/report', label: '보고서 출력', icon: '🖨️' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-green-800 text-white no-print">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="font-bold text-sm">주민이 그린 고산 매뉴얼</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-green-600 font-bold'
                    : 'hover:bg-green-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
