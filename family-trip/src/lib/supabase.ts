export const LOCAL_KEY = 'andong-family-trip-local-v1'
// Compatibility adapter: credentials stay on the server; browser uses an HttpOnly cookie.
export const supabase = {
  async rpc(action: string, args: Record<string, unknown>) {
    try {
      const response = await fetch('/api/trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...args }) })
      const payload = await response.json()
      return response.ok ? { data: payload.data, error: null } : { data: null, error: { message: payload.error || '요청 실패' } }
    } catch { return { data: null, error: { message: '연결을 확인하고 다시 시도해주세요.' } } }
  },
}
