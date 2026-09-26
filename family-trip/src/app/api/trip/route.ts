import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'
const cookieName = 'andong_session'
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
function equal(a: string, b: string) { const aa = Buffer.from(a); const bb = Buffer.from(b); return aa.length === bb.length && timingSafeEqual(aa, bb) }
function sign(value: string) { return createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('hex') }
function authorized(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value || ''
  const [expiry, signature] = token.split('.')
  return !!signature && Number(expiry) > Date.now() && equal(signature, sign(expiry))
}
export async function POST(request: NextRequest) {
  if (!process.env.FAMILY_ACCESS_CODE || !process.env.SESSION_SECRET || !process.env.DATABASE_SECRET) return reply({ error: '공동 저장 설정을 준비 중입니다.' }, 503)
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.headers.get('host')) return reply({error:'허용되지 않은 요청입니다.'},403)
  if (Number(request.headers.get('content-length') || 0) > 100000) return reply({error:'요청이 너무 큽니다.'},413)
  try {
    const raw = await request.text()
    if (raw.length > 100000) return reply({error:'요청이 너무 큽니다.'},413)
    const body = JSON.parse(raw)
    const action = body.action
    const hasSession = authorized(request)
    const login = action === 'family_trip_get' && typeof body.p_access_code === 'string' && equal(body.p_access_code, process.env.FAMILY_ACCESS_CODE)
    if (!hasSession && !login) return reply({error:'가족 암호를 확인해주세요.'},401)
    if (!['family_trip_get','family_trip_save','family_trip_add_comment'].includes(action)) return reply({error:'잘못된 요청입니다.'},400)
    if (action === 'family_trip_save') {
      const s = body.p_state
      if (!s || typeof s.title !== 'string' || !Array.isArray(s.budget) || !Array.isArray(s.tasks) || !Array.isArray(s.decisions) || !Array.isArray(s.schedule?.day1) || !Array.isArray(s.schedule?.day2)) return reply({error:'계획 형식을 확인해주세요.'},400)
      if (s.budget.some((b: {planned:number;actual:number}) => !Number.isFinite(b.planned) || !Number.isFinite(b.actual) || b.planned < 0 || b.actual < 0)) return reply({error:'예산은 0 이상의 금액을 입력해주세요.'},400)
    }
    if (action === 'family_trip_add_comment' && (typeof body.p_body !== 'string' || !body.p_body.trim() || body.p_body.length > 500 || typeof body.p_author !== 'string' || !body.p_author.trim() || body.p_author.length > 40)) return reply({error:'이름과 의견을 확인해주세요.'},400)
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/family_gateway`, {
      method:'POST', cache:'no-store', headers: { 'Content-Type':'application/json', apikey:process.env.SUPABASE_PUBLISHABLE_KEY!, 'x-family-key':process.env.DATABASE_SECRET! },
      body:JSON.stringify({ p_secret:process.env.DATABASE_SECRET, p_action:action, p_state:body.p_state || null, p_author:body.p_author || null, p_body:body.p_body || null }),
    })
    const result = await response.json()
    if (!response.ok) return reply({error: result.message?.includes('CONFLICT') ? '다른 가족이 먼저 수정했습니다. 새로고침한 후 다시 반영해주세요.' : '저장소 연결을 확인해주세요.'},result.message?.includes('CONFLICT')?409:502)
    const res = reply({data:result})
    if (login) { const expiry = String(Date.now()+7*86400000); res.cookies.set(cookieName, `${expiry}.${sign(expiry)}`, {httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',maxAge:7*86400,path:'/'}) }
    return res
  } catch { return reply({error:'요청을 처리하지 못했습니다. 다시 시도해주세요.'},400) }
}
