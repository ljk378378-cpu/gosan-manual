'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { ACTIVITY_START_DATE, activityDateIncluded } from '@/lib/activity-period'

const ActivityPeriodContext = createContext({ includePrevious: false, setIncludePrevious: (value: boolean) => { void value }, includesDate: (date: string) => activityDateIncluded(date) })

export function ActivityPeriodProvider({ children }: { children: ReactNode }) {
  const [includePrevious, setIncludePrevious] = useState(false)
  const includesDate = useCallback((date: string) => activityDateIncluded(date, includePrevious), [includePrevious])
  const value = useMemo(() => ({ includePrevious, setIncludePrevious, includesDate }), [includePrevious, includesDate])
  return <ActivityPeriodContext.Provider value={value}>{children}</ActivityPeriodContext.Provider>
}

export function useActivityPeriod() { return useContext(ActivityPeriodContext) }

export function ActivityPeriodControls() {
  const { includePrevious, setIncludePrevious } = useActivityPeriod()
  return <div className="border-t border-white/10 bg-emerald-950 px-4 py-3 text-xs font-bold text-emerald-100"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2"><p>{ACTIVITY_START_DATE}부터 활동 재시작 · 매일 입력은 한국시간 오늘 기준</p><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={includePrevious} onChange={event => setIncludePrevious(event.target.checked)} />이전 기록 포함</label></div></div>
}
