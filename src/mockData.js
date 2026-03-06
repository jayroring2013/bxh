// ─── Mock/Seed External Data ──────────────────────────────────
// These would eventually come from Supabase or sync script

// ── Affiliate / "View On" links per item ─────────────────────
// Format: { [item_id]: { shop?, youtube?, official?, anilist?, mangadex? } }
export const EXTERNAL_LINKS = {
  // Anime (AniList IDs)
  '1':     { youtube: 'https://www.youtube.com/@crunchyroll',       shop: 'https://www.rightstufanime.com' },
  '20':    { youtube: 'https://youtube.com/watch?v=4YDAVE3DLNE',    shop: 'https://www.amazon.com/s?k=naruto+merchandise', anilist: 'https://anilist.co/anime/20' },
  '21':    { youtube: 'https://youtube.com/watch?v=vfMDyVQtDTk',    shop: 'https://www.amazon.com/s?k=one+piece+merchandise' },
  '11061': { youtube: 'https://youtube.com/watch?v=QczyDHSnj6U',    shop: 'https://www.amazon.com/s?k=hunter+x+hunter', anilist: 'https://anilist.co/anime/11061' },
  '16498': { youtube: 'https://youtube.com/watch?v=MGRm4IzK1SQ',    shop: 'https://www.amazon.com/s?k=shingeki+no+kyojin+merch' },
  '101922':{ youtube: 'https://youtube.com/watch?v=AN1J-_DySeA',    shop: 'https://crunchyroll.com' },

  // Manga (MangaDex IDs — first few chars for demo)
  'a96647': { official: 'https://mangaplus.shueisha.co.jp',          shop: 'https://www.amazon.com/s?k=demon+slayer+manga' },
  'c52b2':  { official: 'https://mangaplus.shueisha.co.jp',          shop: 'https://www.amazon.com/s?k=jujutsu+kaisen+manga' },


  // Novels (RanobeDB IDs)
  '1':      { shop: 'https://www.amazon.com/s?k=sword+art+online+light+novel', youtube: 'https://youtube.com/watch?v=6ohYYtxfDCg' },
  '2':      { shop: 'https://www.amazon.com/s?k=overlord+light+novel' },
  '3':      { shop: 'https://www.amazon.com/s?k=re+zero+light+novel', youtube: 'https://youtube.com/watch?v=GmY8TQJCVYI' },
}

// ── Release Schedule mock data ────────────────────────────────
// Would come from AniList/MangaDex schedule endpoints in production

const today = new Date()
const d = (offsetDays, h = 20, m = 0) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offsetDays)
  dt.setHours(h, m, 0, 0)
  return dt.toISOString()
}

export const SCHEDULE_MOCK = [
  // Anime airing schedule
  { id: 'sch_1',  type: 'anime', title: 'Solo Leveling Season 2',          cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170890-AjzPBMNAKi5B.jpg', episode: 8,  airsAt: d(0, 23, 30), status: 'airing',   color: '#06B6D4' },
  { id: 'sch_2',  type: 'anime', title: 'Dandadan',                         cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-2v8GJkSEBaOe.jpg', episode: 12, airsAt: d(1, 22, 0),  status: 'airing',   color: '#06B6D4' },
  { id: 'sch_3',  type: 'anime', title: 'Blue Box',                         cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170942-GNPzBKSgvlFR.jpg', episode: 19, airsAt: d(1, 23, 0),  status: 'airing',   color: '#06B6D4' },
  { id: 'sch_4',  type: 'anime', title: 'Mushoku Tensei III',                cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176310-AkBxVRIEFEiB.jpg', episode: 5,  airsAt: d(2, 22, 30), status: 'airing',   color: '#06B6D4' },
  { id: 'sch_5',  type: 'anime', title: 'Re:Zero S3 Part 2',                cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx176312-sNpOwHAnHAHs.jpg', episode: 16, airsAt: d(3, 23, 30), status: 'airing',   color: '#06B6D4' },
  { id: 'sch_6',  type: 'anime', title: 'Frieren Beyond Journey\'s End S2', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gHFl8fiv0YNR.jpg', episode: 30, airsAt: d(4, 22, 0),  status: 'upcoming', color: '#06B6D4' },
  { id: 'sch_7',  type: 'anime', title: 'Oshi no Ko S3',                    cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166531-AFrfzFTDLxvw.jpg', episode: 1,  airsAt: d(6, 23, 0),  status: 'upcoming', color: '#06B6D4' },
  { id: 'sch_8',  type: 'anime', title: 'Demon Slayer Infinity Castle',      cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg', episode: 1,  airsAt: d(14, 0, 0),  status: 'upcoming', color: '#06B6D4' },

  // Manga chapter releases
  { id: 'sch_9',  type: 'manga', title: 'One Piece',           cover: 'https://mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/c0ee660b-02f5-4792-9237-c7aed28b1900.jpg', chapter: 1137, airsAt: d(0, 12, 0),  status: 'airing', color: '#F43F5E' },
  { id: 'sch_10', type: 'manga', title: 'Jujutsu Kaisen',      cover: 'https://uploads.mangadex.org/covers/c52b2ce3-7f71-4575-8c40-be1e8ddd27cb/1bd71b4f-fffb-4b15-9c2d-6af6ef3fb8f5.jpg', chapter: 272, airsAt: d(1, 10, 0),  status: 'airing', color: '#F43F5E' },
  { id: 'sch_11', type: 'manga', title: 'Chainsaw Man',        cover: 'https://mangadex.org/covers/a77742b1-befd-49a4-bff5-1ad4e6b0ef7b/01e63a73-7009-4a2f-a8f9-4e6a89f1aab1.jpg', chapter: 196, airsAt: d(2, 10, 0),  status: 'airing', color: '#F43F5E' },
  { id: 'sch_12', type: 'manga', title: 'Blue Lock',           cover: 'https://mangadex.org/covers/25bd5dab-d73f-4de9-a0c4-fcff8bc00ce0/c6b8f4b0-d18c-4c85-a08d-df09a03d0b14.jpg', chapter: 298, airsAt: d(3, 10, 0),  status: 'airing', color: '#F43F5E' },
  { id: 'sch_13', type: 'manga', title: 'Spy x Family',        cover: 'https://uploads.mangadex.org/covers/5bf00edd-5c6c-4651-8df9-f3f5d2ece89e/64dd0cce-a8c6-4c57-b3ae-ab1a5a9abf1b.jpg', chapter: 116, airsAt: d(5, 10, 0),  status: 'airing', color: '#F43F5E' },

  // Novel volume releases
  { id: 'sch_14', type: 'novel', title: 'Mushoku Tensei Vol.29',           cover: null, volume: 29, airsAt: d(7, 0, 0),  status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_15', type: 'novel', title: 'Overlord Vol.18',                 cover: null, volume: 18, airsAt: d(10, 0, 0), status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_16', type: 'novel', title: 'Re:Zero Vol.40',                  cover: null, volume: 40, airsAt: d(12, 0, 0), status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_17', type: 'novel', title: 'Sword Art Online Vol.28',         cover: null, volume: 28, airsAt: d(20, 0, 0), status: 'upcoming', color: '#8B5CF6' },

  // ── TEST: within 24h, matches common series in user lists ────
  { id: 'sch_t1', type: 'novel', title: 'Classroom of the Elite',          cover: null, volume: 12,  airsAt: d(0, 15, 0),  status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_t2', type: 'novel', title: 'The Devil Is a Part-Timer!',      cover: null, volume: 22,  airsAt: d(0, 18, 30), status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_t3', type: 'novel', title: 'Aria the Scarlet Ammo',           cover: null, volume: 25,  airsAt: d(0, 21, 0),  status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_t4', type: 'novel', title: 'The Guin Saga',                   cover: null, volume: 130, airsAt: d(1, 9, 0),   status: 'upcoming', color: '#8B5CF6' },
  { id: 'sch_t5', type: 'anime', title: 'Attack on Titan',                 cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-DcCggKPSvF3U.jpg', episode: 88, airsAt: d(0, 20, 0), status: 'airing', color: '#06B6D4' },
  { id: 'sch_t6', type: 'anime', title: 'Overlord',                        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx29803-HGjFGBFAaGPh.jpg', episode: 14, airsAt: d(0, 22, 0), status: 'airing', color: '#06B6D4' },
  { id: 'sch_t7', type: 'anime', title: 'Re:Zero Starting Life in Another World', cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-Aq5q6laqmKMa.jpg', episode: 17, airsAt: d(1, 0, 0), status: 'airing', color: '#06B6D4' },
  { id: 'sch_t8', type: 'manga', title: 'Demon Slayer',                    cover: null, chapter: 210, airsAt: d(0, 16, 0), status: 'airing', color: '#F43F5E' },
  { id: 'sch_t9', type: 'manga', title: 'Sword Art Online',                cover: null, chapter: 45,  airsAt: d(0, 17, 0), status: 'airing', color: '#F43F5E' },
]

// ── Link config ───────────────────────────────────────────────
export const LINK_CONFIG = {
  shop:     { label: '🛒 Shop',     labelVi: '🛒 Mua',       color: '#F59E0B' },
  youtube:  { label: '▶ YouTube',  labelVi: '▶ YouTube',    color: '#EF4444' },
  official: { label: '🔗 Official', labelVi: '🔗 Chính thức', color: '#06B6D4' },
  anilist:  { label: '📊 AniList',  labelVi: '📊 AniList',   color: '#02a9ff' },
  mangadex: { label: '📖 MangaDex', labelVi: '📖 MangaDex',  color: '#F87171' },
}

// Get external links for an item — always includes type default + any specific overrides
export function getExternalLinks(itemId, itemType) {
  const specific = EXTERNAL_LINKS[String(itemId)] || {}
  const defaults = {
    anime: { anilist: `https://anilist.co/anime/${itemId}` },
    manga: { mangadex: `https://mangadex.org/title/${itemId}`, official: 'https://mangaplus.shueisha.co.jp' },
    novel: { shop: `https://www.amazon.com/s?k=${encodeURIComponent('light novel')}` },
  }
  return { ...defaults[itemType], ...specific }
}

// Async version: fetches from Supabase item_links table, falls back to static
import { SUPABASE_URL, SUPABASE_ANON } from './supabase.js'
export async function getExternalLinksAsync(itemId, itemType) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/item_links?item_id=eq.${itemId}&item_type=eq.${itemType}&select=shop,youtube,official,raw,anilist,mangadex&limit=1`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    )
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const row = data[0]
      // Remove null/empty fields, merge with defaults
      const dbLinks = Object.fromEntries(Object.entries(row).filter(([,v]) => v))
      return { ...getExternalLinks(itemId, itemType), ...dbLinks }
    }
  } catch {}
  return getExternalLinks(itemId, itemType)
}
