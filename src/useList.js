import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from './supabase.js'
import { useAuth } from './context/AuthContext.jsx'

export const STATUS_OPTIONS = [
  { key: 'reading',   color: '#06B6D4', vi: 'Đang đọc/xem', en: 'Reading / Watching' },
  { key: 'planned',   color: '#A78BFA', vi: 'Dự định đọc',   en: 'Plan to Read'       },
  { key: 'completed', color: '#4ADE80', vi: 'Hoàn thành',    en: 'Completed'           },
  { key: 'onhold',    color: '#F59E0B', vi: 'Tạm dừng',      en: 'On Hold'             },
  { key: 'dropped',   color: '#F87171', vi: 'Bỏ dở',         en: 'Dropped'             },
]

export const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map(s => [s.key, s.en])
)

// ── REST helpers ──────────────────────────────────────────────
const api = async (token, path, method = 'GET', body = null, extra = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey:         SUPABASE_ANON,
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer:         method === 'POST' ? 'return=representation' : undefined,
      ...extra,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (method === 'DELETE' || res.status === 204) return null
  const text = await res.text()
  if (!res.ok) throw new Error(text || `${res.status}`)
  return text ? JSON.parse(text) : null
}

const DEFAULT_NAMES = {
  novel: 'My Novels',
  anime: 'My Anime',
  manga: 'My Manga',
}

// ── Main hook ─────────────────────────────────────────────────
export function useUserList() {
  const { user, token } = useAuth()
  const [lists,   setLists]   = useState([])   // user_lists rows
  const [entries, setEntries] = useState([])   // user_list_entries rows
  const [loading, setLoading] = useState(false)

  // ── Fetch all lists + entries ──
  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [ls, es] = await Promise.all([
        api(token, 'user_lists?order=created_at.asc'),
        api(token, 'user_list_entries?order=updated_at.desc&limit=1000'),
      ])
      setLists(ls  || [])
      setEntries(es || [])
    } catch (e) {
      console.error('fetchAll error:', e)
    } finally {
      setLoading(false)
    }
  }, [token])

  // ── Listen for manual refetch triggers (e.g. from MyListPage edit) ──
  useEffect(() => {
    const handler = () => fetchAll()
    window.addEventListener('nt_refetch_list', handler)
    return () => window.removeEventListener('nt_refetch_list', handler)
  }, [fetchAll])

  // ── Init: create default lists if none exist ──
  useEffect(() => {
    if (!token || !user) return
    fetchAll().then(async () => {
      // Create defaults via RPC
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_default_lists`, {
          method:  'POST',
          headers: {
            apikey:         SUPABASE_ANON,
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ p_user_id: user.id }),
        })
        await fetchAll()
      } catch {}
    })
  }, [token, user?.id])

  // ── Create a new custom list ──
  const createList = async (name, item_type = 'all') => {
    if (!token) throw new Error('Not logged in')
    const rows = await api(token, 'user_lists', 'POST', {
      user_id: user.id, name, is_default: false, item_type,
    })
    await fetchAll()
    return Array.isArray(rows) ? rows[0] : rows
  }

  // ── Delete a list (and all its entries) ──
  const deleteList = async (listId) => {
    if (!token) throw new Error('Not logged in')
    await api(token, `user_lists?id=eq.${listId}`, 'DELETE')
    setLists(prev => prev.filter(l => l.id !== listId))
    setEntries(prev => prev.filter(e => e.list_id !== listId))
  }

  // ── Add or update an entry in a list ──
  const addToList = async ({ listId, item_id, item_type, title, cover_url, status, rating, review }) => {
    if (!token) throw new Error('Not logged in')

    // Check if already in this list
    const existing = entries.find(
      e => e.list_id === listId && e.item_id === String(item_id) && e.item_type === item_type
    )

    const row = {
      list_id:   listId,
      user_id:   user.id,
      item_id:   String(item_id),
      item_type,
      title,
      cover_url: cover_url || null,
      status,
      rating:    rating  || null,
      review:    review  || null,
    }

    if (existing) {
      // Update
      await api(token, `user_list_entries?id=eq.${existing.id}`, 'PATCH', {
        status, rating: rating || null, review: review || null,
      }, { Prefer: 'return=minimal' })
    } else {
      await api(token, 'user_list_entries', 'POST', row)
    }

    await fetchAll()
    return { wasExisting: !!existing }
  }

  // ── Remove entry from a list ──
  const removeFromList = async (entryId) => {
    if (!token) throw new Error('Not logged in')
    await api(token, `user_list_entries?id=eq.${entryId}`, 'DELETE')
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  // ── Get all entries for a specific item across all lists ──
  const getItemEntries = (item_id, item_type) =>
    entries.filter(e => e.item_id === String(item_id) && e.item_type === item_type)

  // ── Get the default list for a given type ──
  const getDefaultList = (item_type) =>
    lists.find(l => l.is_default && l.item_type === item_type)
      || lists.find(l => l.name === DEFAULT_NAMES[item_type])
      || lists[0]
      || null

  // ── Legacy compat: getEntry (for QuickAddButton) ──
  const getEntry = (item_id, item_type) =>
    entries.find(e => e.item_id === String(item_id) && e.item_type === item_type) || null

  // ── Legacy compat: addOrUpdate (picks default list) ──
  const addOrUpdate = async (item) => {
    const defaultList = getDefaultList(item.item_type)
    if (!defaultList) throw new Error('No list found')
    return addToList({
      listId:    defaultList.id,
      item_id:   item.item_id,
      item_type: item.item_type,
      title:     item.title,
      cover_url: item.cover_url,
      status:    item.status,
      rating:    item.rating,
      review:    item.review,
    })
  }

  // ── Legacy compat: remove by entry id ──
  const remove = (entryId) => removeFromList(entryId)

  return {
    lists, entries, loading,
    createList, deleteList,
    addToList, removeFromList,
    getItemEntries, getDefaultList, getEntry,
    // legacy
    addOrUpdate, remove,
    refetch: fetchAll,
  }
}
