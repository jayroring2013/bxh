import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { Carousel } from '../components/Carousel'
import { NOVEL_CATEGORIES, ANIME_CATEGORIES, MANGA_CATEGORIES } from '../constants'
import { fetchTrendingNovels, fetchTrendingAnime, fetchTrendingManga } from '../hooks'

export function LandingPage() {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [trendingNovels, setTrendingNovels] = useState([])
  const [trendingAnime, setTrendingAnime] = useState([])
  const [trendingManga, setTrendingManga] = useState([])
  const [loading, setLoading] = useState(true)

  // Carousel slides for social media
  const socialSlides = [
    {
      icon: '💬',
      title: 'Theo dõi team trên Discord',
      description: 'Tham gia cộng đồng, nhận thông báo chương mới và thảo luận cùng fan khác',
      buttons: [
        {
          href: 'https://discord.gg/YOUR_INVITE',
          text: 'Join Discord',
          type: 'discord',
          icon: '🎮'
        }
      ]
    },
    {
      icon: '👍',
      title: 'Like Page Facebook',
      description: 'Cập nhật tin tức, sự kiện và thông báo quan trọng từ LiDex',
      buttons: [
        {
          href: 'https://facebook.com/YOUR_PAGE',
          text: 'Like Page',
          type: 'facebook',
          icon: '📘'
        }
      ]
    },
    {
      icon: '📢',
      title: 'Nhận Thông Báo Mới',
      description: 'Không bỏ lỡ bất kỳ chương mới nào từ light novel, anime, manga yêu thích',
      buttons: [
        {
          href: '#/novels',
          text: 'Khám phá Novel',
          type: 'primary'
        },
        {
          href: '#/anime',
          text: 'Khám phá Anime',
          type: 'secondary'
        }
      ]
    }
  ]

  useEffect(() => {
    async function loadTrending() {
      try {
        const [novels, anime, manga] = await Promise.all([
          fetchTrendingNovels(6),
          fetchTrendingAnime(6),
          fetchTrendingManga(6)
        ])
        setTrendingNovels(novels)
        setTrendingAnime(anime)
        setTrendingManga(manga)
      } catch (error) {
        console.error('Failed to load trending:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTrending()
  }, [])

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              {lang === 'vi' ? 'Chào mừng đến với LiDex' : 'Welcome to LiDex'}
            </h1>
            <p className="hero-subtitle">
              {lang === 'vi' 
                ? 'Trung tâm theo dõi Light Novel, Anime & Manga hàng đầu' 
                : 'Your ultimate Light Novel, Anime & Manga tracking hub'}
            </p>
            <div className="hero-buttons">
              <a href="#/novels" className="btn btn-primary">
                {lang === 'vi' ? 'Khám phá Novel' : 'Browse Novels'}
              </a>
              <a href="#/anime" className="btn btn-secondary">
                {lang === 'vi' ? 'Khám phá Anime' : 'Browse Anime'}
              </a>
              <a href="#/manga" className="btn btn-secondary">
                {lang === 'vi' ? 'Khám phá Manga' : 'Browse Manga'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trung tâm Light Novel, Anime, Manga Section */}
      <section className="center-section">
        <div className="container">
          <h2 className="section-title">
            📚 {lang === 'vi' ? 'Trung tâm Light Novel, Anime, Manga' : 'Light Novel, Anime, Manga Hub'}
          </h2>
          <p className="section-subtitle">
            {lang === 'vi' 
              ? 'Theo dõi, đánh giá và bình chọn cho tác phẩm yêu thích của bạn' 
              : 'Track, rate and vote for your favorite works'}
          </p>

          {/* Social Media Carousel */}
          <div className="social-carousel-wrapper">
            <Carousel 
              slides={socialSlides} 
              autoPlay={true} 
              interval={5000} 
            />
          </div>

          {/* Category Cards */}
          <div className="category-grid">
            <a href="#/novels" className="category-card novel">
              <div className="card-icon">📖</div>
              <h3>Light Novel</h3>
              <p>{lang === 'vi' ? 'Theo dõi tiến độ đọc' : 'Track reading progress'}</p>
            </a>
            <a href="#/anime" className="category-card anime">
              <div className="card-icon">🎬</div>
              <h3>Anime</h3>
              <p>{lang === 'vi' ? 'Lịch phát sóng & đánh giá' : 'Schedule & ratings'}</p>
            </a>
            <a href="#/manga" className="category-card manga">
              <div className="card-icon">📕</div>
              <h3>Manga</h3>
              <p>{lang === 'vi' ? 'Đọc & theo dõi chương mới' : 'Read & track new chapters'}</p>
            </a>
          </div>
        </div>
      </section>

      {/* Trending Novels Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 {lang === 'vi' ? 'Novel Thịnh Hành' : 'Trending Novels'}</h2>
            <a href="#/novels" className="view-all">{lang === 'vi' ? 'Xem tất cả' : 'View All'} →</a>
          </div>
          {loading ? (
            <div className="loading-spinner">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
          ) : (
            <div className="card-grid">
              {trendingNovels.map((novel) => (
                <a key={novel.id} href={`#/novel/${novel.id}`} className="novel-card">
                  <img src={novel.cover || '/placeholder.jpg'} alt={novel.title} className="card-image" />
                  <div className="card-content">
                    <h4 className="card-title">{novel.title}</h4>
                    <p className="card-meta">{novel.num_books || 0} volumes</p>
                    <div className="card-rating">⭐ {novel.score?.toFixed(1) || 'N/A'}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Anime Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🎬 {lang === 'vi' ? 'Anime Thịnh Hành' : 'Trending Anime'}</h2>
            <a href="#/anime" className="view-all">{lang === 'vi' ? 'Xem tất cả' : 'View All'} →</a>
          </div>
          {loading ? (
            <div className="loading-spinner">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
          ) : (
            <div className="card-grid">
              {trendingAnime.map((anime) => (
                <a key={anime.id} href={`#/anime/${anime.id}`} className="anime-card">
                  <img src={anime.cover || '/placeholder.jpg'} alt={anime.title} className="card-image" />
                  <div className="card-content">
                    <h4 className="card-title">{anime.title}</h4>
                    <p className="card-meta">{anime.episodes || '?'} episodes</p>
                    <div className="card-rating">⭐ {anime.score?.toFixed(1) || 'N/A'}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Manga Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">📕 {lang === 'vi' ? 'Manga Thịnh Hành' : 'Trending Manga'}</h2>
            <a href="#/manga" className="view-all">{lang === 'vi' ? 'Xem tất cả' : 'View All'} →</a>
          </div>
          {loading ? (
            <div className="loading-spinner">{lang === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
          ) : (
            <div className="card-grid">
              {trendingManga.map((manga) => (
                <a key={manga.id} href={`#/manga/${manga.id}`} className="manga-card">
                  <img src={manga.cover || '/placeholder.jpg'} alt={manga.title} className="card-image" />
                  <div className="card-content">
                    <h4 className="card-title">{manga.title}</h4>
                    <p className="card-meta">{manga.chapters || '?'} chapters</p>
                    <div className="card-rating">⭐ {manga.score?.toFixed(1) || 'N/A'}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            {lang === 'vi' ? 'Tại sao chọn LiDex?' : 'Why Choose LiDex?'}
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>{lang === 'vi' ? 'Theo dõi tiến độ' : 'Track Progress'}</h3>
              <p>{lang === 'vi' ? 'Quản lý danh sách đọc, xem của bạn' : 'Manage your reading & watching lists'}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗳️</div>
              <h3>{lang === 'vi' ? 'Bình chọn hàng tháng' : 'Monthly Voting'}</h3>
              <p>{lang === 'vi' ? 'Bình chọn cho tác phẩm yêu thích' : 'Vote for your favorite works'}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>{lang === 'vi' ? 'Thông báo mới' : 'New Notifications'}</h3>
              <p>{lang === 'vi' ? 'Nhận thông báo chương mới' : 'Get notified about new chapters'}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>{lang === 'vi' ? 'Đa ngôn ngữ' : 'Multi-language'}</h3>
              <p>{lang === 'vi' ? 'Hỗ trợ Tiếng Việt & English' : 'Vietnamese & English support'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">
            {user 
              ? (lang === 'vi' ? 'Chào mừng trở lại!' : 'Welcome back!')
              : (lang === 'vi' ? 'Bắt đầu hành trình của bạn' : 'Start Your Journey')}
          </h2>
          <p className="cta-subtitle">
            {user 
              ? (lang === 'vi' ? 'Khám phá nội dung mới ngay hôm nay' : 'Discover new content today')
              : (lang === 'vi' ? 'Đăng ký miễn phí để theo dõi tác phẩm yêu thích' : 'Sign up free to track your favorites')}
          </p>
          {!user && (
            <a href="#/auth" className="btn btn-primary btn-large">
              {lang === 'vi' ? 'Đăng ký ngay' : 'Sign Up Now'}
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
