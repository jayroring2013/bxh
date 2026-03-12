// src/hooks/admin.js
// Centralized API functions for Admin Panel

import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'

// ═══════════════════════════════════════════════════════════
// Generic API Helper
// ═══════════════════════════════════════════════════════════
/**
 * Makes authenticated requests to Supabase REST API
 * @param {string} token - User's auth token
 * @param {string} path - API endpoint path (e.g., 'novels', 'anime')
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {object|null} body - Request body for POST/PATCH
 * @returns {Promise<any>} Response data
 */
const api = async (token, path, method = 'GET', body = null) => {
  const headers = {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: method === 'POST' ? 'return=representation' : undefined,
  }

  // Remove undefined headers
  Object.keys(headers).forEach(key => headers[key] === undefined && delete headers[key])

  const url = `${SUPABASE_URL}/rest/v1/${path}`

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Handle 204 No Content (successful DELETE)
    if (res.status === 204) return null

    const text = await res.text()
    
    if (!res.ok) {
      console.error(`API Error ${res.status}:`, text)
      throw new Error(text || `HTTP ${res.status}`)
    }

    return text ? JSON.parse(text) : null
  } catch (error) {
    console.error(`API Request Failed: ${url}`, error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════
// Dashboard Statistics
// ═══════════════════════════════════════════════════════════
/**
 * Fetches count statistics for dashboard widgets
 * @param {string} token - User's auth token
 * @returns {Promise<object>} Stats object
 */
export async function getDashboardStats(token) {
  try {
    // Fetch counts from each table (using limit=1 to check existence)
    const [novels, anime, manga, votes, users] = await Promise.all([
      api(token, 'novels?select=id&limit=1'),
      api(token, 'anime?select=id&limit=1'),
      api(token, 'manga?select=id&limit=1'),
      api(token, 'novel_votes?select=vote_count'),
      api(token, 'admin_users?select=user_id'),
    ])

    return {
      totalNovels: novels?.length || 0,
      totalAnime: anime?.length || 0,
      totalManga: manga?.length || 0,
      totalVotes: votes?.reduce((sum, v) => sum + (v.vote_count || 0), 0) || 0,
      totalAdmins: users?.length || 0,
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return { totalNovels: 0, totalAnime: 0, totalManga: 0, totalVotes: 0, totalAdmins: 0 }
  }
}

// ═══════════════════════════════════════════════════════════
// Series Management (Novels, Anime, Manga)
// ═══════════════════════════════════════════════════════════
/**
 * Fetches series with optional search and pagination
 * @param {string} token - User's auth token
 * @param {string} type - 'novel', 'anime', or 'manga'
 * @param {string} search - Search query (optional)
 * @param {number} limit - Max results (default 30)
 * @returns {Promise<Array>} List of series
 */
export async function getSeries(token, type, search = '', limit = 30) {
  const enc = encodeURIComponent(search)
  let path = ''

  if (type === 'anime') {
    path = search
      ? `anime?or=(title_english.ilike.%25${enc}%25,title_romaji.ilike.%25${enc}%25)&order=popularity.desc&limit=${limit}`
      : `anime?order=popularity.desc&limit=${limit}`
  } else if (type === 'manga') {
    path = search
      ? `manga?or=(title_en.ilike.%25${enc}%25,title_ja_ro.ilike.%25${enc}%25)&order=follows.desc&limit=${limit}`
      : `manga?order=follows.desc&limit=${limit}`
  } else {
    // novels
    path = search
      ? `novels?title=ilike.%25${enc}%25&order=num_books.desc.nullslast,id.desc&limit=${limit}`
      : `novels?order=num_books.desc.nullslast,id.desc&limit=${limit}`
  }

  return await api(token, path)
}

/**
 * Creates a new series entry
 * @param {string} token - User's auth token
 * @param {string} type - 'novel', 'anime', or 'manga'
 * @param {object} data - Series data object
 * @returns {Promise<object>} Created series
 */
export async function createSeries(token, type, data) {
  return await api(token, type, 'POST', data)
}

/**
 * Updates an existing series
 * @param {string} token - User's auth token
 * @param {string} type - 'novel', 'anime', or 'manga'
 * @param {string|number} id - Series ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated series
 */
export async function updateSeries(token, type, id, data) {
  return await api(token, `${type}?id=eq.${id}`, 'PATCH', data)
}

/**
 * Deletes a series
 * @param {string} token - User's auth token
 * @param {string} type - 'novel', 'anime', or 'manga'
 * @param {string|number} id - Series ID
 * @returns {Promise<null>}
 */
export async function deleteSeries(token, type, id) {
  return await api(token, `${type}?id=eq.${id}`, 'DELETE')
}

// ═══════════════════════════════════════════════════════════
// Item Links Management
// ═══════════════════════════════════════════════════════════
/**
 * Fetches all item links (cross-references between novel/anime/manga)
 * @param {string} token - User's auth token
 * @param {number} limit - Max results (default 200)
 * @returns {Promise<Array>} List of links
 */
export async function getItemLinks(token, limit = 200) {
  return await api(token, `item_links?order=updated_at.desc&limit=${limit}`)
}

/**
 * Creates a new item link
 * @param {string} token - User's auth token
 * @param {object} data - Link data { source_type, source_id, target_type, target_id }
 * @returns {Promise<object>} Created link
 */
export async function createItemLink(token, data) {
  return await api(token, 'item_links', 'POST', data)
}

/**
 * Updates an item link
 * @param {string} token - User's auth token
 * @param {number} id - Link ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated link
 */
export async function updateItemLink(token, id, data) {
  return await api(token, `item_links?id=eq.${id}`, 'PATCH', data)
}

/**
 * Deletes an item link
 * @param {string} token - User's auth token
 * @param {number} id - Link ID
 * @returns {Promise<null>}
 */
export async function deleteItemLink(token, id) {
  return await api(token, `item_links?id=eq.${id}`, 'DELETE')
}

// ═══════════════════════════════════════════════════════════
// Featured Items Management
// ═══════════════════════════════════════════════════════════
/**
 * Fetches all featured items (for homepage highlights)
 * @param {string} token - User's auth token
 * @returns {Promise<Array>} List of featured items
 */
export async function getFeaturedItems(token) {
  return await api(token, 'featured_items?order=sort_order.asc')
}

/**
 * Creates a new featured item
 * @param {string} token - User's auth token
 * @param {object} data - Featured item data { item_type, item_id, sort_order }
 * @returns {Promise<object>} Created featured item
 */
export async function createFeaturedItem(token, data) {
  return await api(token, 'featured_items', 'POST', data)
}

/**
 * Updates a featured item
 * @param {string} token - User's auth token
 * @param {number} id - Featured item ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated featured item
 */
export async function updateFeaturedItem(token, id, data) {
  return await api(token, `featured_items?id=eq.${id}`, 'PATCH', data)
}

/**
 * Deletes a featured item
 * @param {string} token - User's auth token
 * @param {number} id - Featured item ID
 * @returns {Promise<null>}
 */
export async function deleteFeaturedItem(token, id) {
  return await api(token, `featured_items?id=eq.${id}`, 'DELETE')
}

// ═══════════════════════════════════════════════════════════
// Site Announcements
// ═══════════════════════════════════════════════════════════
/**
 * Fetches all site announcements
 * @param {string} token - User's auth token
 * @returns {Promise<Array>} List of announcements
 */
export async function getAnnouncements(token) {
  return await api(token, 'site_announcements?order=created_at.desc')
}

/**
 * Creates a new announcement
 * @param {string} token - User's auth token
 * @param {object} data - Announcement data { title, content, active }
 * @returns {Promise<object>} Created announcement
 */
export async function createAnnouncement(token, data) {
  return await api(token, 'site_announcements', 'POST', data)
}

/**
 * Updates an announcement
 * @param {string} token - User's auth token
 * @param {number} id - Announcement ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated announcement
 */
export async function updateAnnouncement(token, id, data) {
  return await api(token, `site_announcements?id=eq.${id}`, 'PATCH', data)
}

/**
 * Deletes an announcement
 * @param {string} token - User's auth token
 * @param {number} id - Announcement ID
 * @returns {Promise<null>}
 */
export async function deleteAnnouncement(token, id) {
  return await api(token, `site_announcements?id=eq.${id}`, 'DELETE')
}

// ═══════════════════════════════════════════════════════════
// Vote Management
// ═══════════════════════════════════════════════════════════
/**
 * Fetches votes for a specific month/year
 * @param {string} token - User's auth token
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Promise<Array>} List of votes
 */
export async function getVotes(token, month, year) {
  return await api(token, `novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc`)
}

/**
 * Updates vote count (admin override)
 * @param {string} token - User's auth token
 * @param {number} id - Vote record ID
 * @param {number} voteCount - New vote count
 * @returns {Promise<object>} Updated vote record
 */
export async function updateVotes(token, id, voteCount) {
  return await api(token, `novel_votes?id=eq.${id}`, 'PATCH', { vote_count: voteCount })
}

/**
 * Deletes a vote record
 * @param {string} token - User's auth token
 * @param {number} id - Vote record ID
 * @returns {Promise<null>}
 */
export async function deleteVotes(token, id) {
  return await api(token, `novel_votes?id=eq.${id}`, 'DELETE')
}

// ═══════════════════════════════════════════════════════════
// Admin User Management
// ═══════════════════════════════════════════════════════════
/**
 * Fetches all admin users
 * @param {string} token - User's auth token
 * @returns {Promise<Array>} List of admin users
 */
export async function getAdminUsers(token) {
  return await api(token, 'admin_users?select=user_id,granted_at')
}

/**
 * Grants admin privileges to a user
 * @param {string} token - User's auth token
 * @param {string} userId - User ID to grant admin
 * @returns {Promise<object>} Created admin record
 */
export async function grantAdmin(token, userId) {
  return await api(token, 'admin_users', 'POST', { user_id: userId })
}

/**
 * Revokes admin privileges from a user
 * @param {string} token - User's auth token
 * @param {string} userId - User ID to revoke admin
 * @returns {Promise<null>}
 */
export async function revokeAdmin(token, userId) {
  return await api(token, `admin_users?user_id=eq.${userId}`, 'DELETE')
}

/**
 * Checks if current user is an admin
 * @param {string} token - User's auth token
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if admin
 */
export async function checkAdmin(token, userId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    })
    const data = await res.json()
    return data === true
  } catch (error) {
    return false
  }
}

// ═══════════════════════════════════════════════════════════
// Analytics (Optional - for future expansion)
// ═══════════════════════════════════════════════════════════
/**
 * Fetches vote trends over time
 * @param {string} token - User's auth token
 * @param {number} months - Number of months to fetch (default 6)
 * @returns {Promise<Array>} Vote trend data
 */
export async function getVoteTrends(token, months = 6) {
  const now = new Date()
  const results = []
  
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const votes = await getVotes(token, date.getMonth() + 1, date.getFullYear())
    results.unshift({
      month: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      totalVotes: votes?.reduce((s, v) => s + (v.vote_count || 0), 0) || 0,
    })
  }
  
  return results
}

/**
 * Fetches user activity stats
 * @param {string} token - User's auth token
 * @returns {Promise<object>} Activity stats
 */
export async function getUserActivity(token) {
  // This would require additional tables (user_lists, etc.)
  // Placeholder for future implementation
  return {
    activeUsers: 0,
    newListItems: 0,
    newVotes: 0,
  }
}
