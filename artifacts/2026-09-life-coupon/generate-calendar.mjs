import { writeFileSync } from 'node:fs'

const sessions = [
  { id: 'step-4', name: '하루 한 걸음 4회기', prep: '2026-09-21', start: '2026-09-21', end: '2026-09-23' },
  { id: 'small-4', name: '작은 만남 4회기', prep: '2026-09-23', start: '2026-09-28', end: '2026-09-30' },
  { id: 'small-5', name: '작은 만남 5회기', prep: '2026-10-08', start: '2026-10-13', end: '2026-10-14' },
  { id: 'small-6', name: '작은 만남 6회기', prep: '2026-10-19', start: '2026-10-22', end: '2026-10-23' },
  { id: 'step-5', name: '하루 한 걸음 5회기', prep: '2026-10-26', start: '2026-10-28', end: '2026-10-30' },
  { id: 'small-7', name: '작은 만남 7회기', prep: '2026-11-16', start: '2026-11-19', end: '2026-11-20' },
  { id: 'step-6', name: '하루 한 걸음 6회기', prep: '2026-11-23', start: '2026-11-25', end: '2026-11-27' },
]

function utcStamp(date, time) {
  return new Date(`${date}T${time}+09:00`).toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}Z$/, 'Z')
}

function fold(line) {
  const parts = []
  let current = ''
  for (const character of line) {
    if (Buffer.byteLength(current + character, 'utf8') > 73) {
      const carriedSpace = current.endsWith(' ') ? ' ' : ''
      if (carriedSpace) current = current.slice(0, -1)
      parts.push(current)
      current = ` ${carriedSpace}${character}`
    } else {
      current += character
    }
  }
  parts.push(current)
  return parts.join('\r\n')
}

const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cheonggok//Life Coupon Sessions//KO', 'CALSCALE:GREGORIAN']
const stamp = utcStamp('2026-09-21', '00:00:00')

for (const session of sessions) {
  const checkpoints = session.prep === session.start
    ? [{ date: session.start, label: '준비 및 시작 점검' }]
    : [{ date: session.prep, label: '사전 준비 점검' }, { date: session.start, label: '회기 시작 점검' }]
  checkpoints.push({ date: session.end, label: '기록지 회수 및 증빙 점검' })
  for (const checkpoint of checkpoints) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:life-coupon-${session.id}-${checkpoint.date}@cheonggok`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(checkpoint.date, '08:30:00')}`,
      `DTEND:${utcStamp(checkpoint.date, '08:45:00')}`,
      `SUMMARY:청년안심쿠폰 ${session.name} ${checkpoint.label}`,
      'DESCRIPTION:대시보드에서 참여자 안내\, 미션지\, 쿠폰\, 필수서류를 확인하세요.',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:생활쿠폰 회기 점검',
      'TRIGGER:-PT5M',
      'END:VALARM',
      'END:VEVENT',
    )
  }
}

lines.push('END:VCALENDAR')
writeFileSync('public/programs/life-coupon/2026-schedule.ics', `${lines.map(fold).join('\r\n')}\r\n`, 'utf8')
