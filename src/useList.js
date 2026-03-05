import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from './supabase.js'
import { useAuth } from './context/AuthContext.jsx'

const STATUS_LABELS = {
  reading:   'Đang đọc/xem',
  completed: 'Hoàn thành',
  planned:   'Dự định',
  onhold:    'Tạm dừng',
  dropped:   'Bỏ dở',
}
export { STATUS_LABELS }

const sbList = async (token, path, method = 'GET', body = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey:        SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer:        method === 'POST' ? 'resolution=merge-duplicates,return=representation' : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (method === 'DELETE' || res.status === 204) return null
  const text = await res.text()
  if (!res.ok) throw new Error(text || `${res.status}`)
  return text ? JSON.parse(text) : null
}

// Hook for managing a single user's full list
export function useUserList() {
  const { user, token } = useAuth()
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(false)

  const fetchList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await sbList(token, 'user_lists?order=updated_at.desc&limit=500')
      setList(data || [])
    } catch (e) {
      console.error('fetchList error:', e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchList() }, [fetchList])

  const addOrUpdate = async (item) => {
    if (!token) throw new Error('Not logged in')
    const row = {
      user_id:   user.id,
      item_id:   item.item_id,
      item_type: item.item_type,
      title:     item.title,
      cover_url: item.cover_url || null,
      status:    item.status,
      rating:    item.rating    || null,
      review:    item.review    || null,
    }
    const data = await sbList(token, 'user_lists', 'POST', row)
    await fetchList()
    return data
  }

  const remove = async (id) => {
    if (!token) throw new Error('Not logged in')
    await sbList(token, `user_lists?id=eq.${id}`, 'DELETE')
    setList(prev => prev.filter(i => i.id !== id))
  }

  // Check if a specific item is in the list
  const getEntry = (item_id, item_type) =>
    list.find(i => i.item_id === String(item_id) && i.item_type === item_type) || null

  return { list, loading, addOrUpdate, remove, getEntry, refetch: fetchList }
}
