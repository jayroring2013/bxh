// ─── Supabase Configuration ──────────────────────────────────
// Replace these with your own values from:
// supabase.com → Your Project → Settings → API
export const SUPABASE_URL  = 'https://zragvkqsslfyarjbjmmz.supabase.co'
export const SUPABASE_ANON = 'sb_publishable_ANQfGg47ThI9uwXyvc9oUQ_QAF575Zd'

const headers = () => ({
  apikey:          SUPABASE_ANON,
  Authorization:  `Bearer ${SUPABASE_ANON}`,
  'Content-Type': 'application/json',
})

// Safe JSON parse — returns null if body is empty (204 No Content)
const safeJson = async (res) => {
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const supabase = {
  async select(table, query = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      headers: headers(),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || `Supabase ${res.status}`)
    }
    return safeJson(res)
  },

  async rpc(fn, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || `Supabase RPC ${res.status}`)
    }
    return safeJson(res)
  },
}
