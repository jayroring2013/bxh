export const LOCALES = {
  en: {
    // Nav
    nav_novels:  'Light Novels',
    nav_anime:   'Anime',
    nav_manga:   'Manga',
    nav_vote:     'Vote',
    nav_ranking:  'Rankings',
    nav_schedule: 'Schedule',
    nav_home:    'Home',

    // Search
    search_novels: 'Search light novels…',
    search_anime:  'Search anime…',
    search_manga:  'Search manga…',
    search_vote:   'Search novels to vote…',

    // Hero
    hero_novels:   'LIGHT NOVEL RANKINGS',
    hero_anime:    'ANIME RANKINGS',
    hero_manga:    'MANGA RANKINGS',
    hero_vote:     'MONTHLY VOTE',
    hero_results:  (q) => `RESULTS FOR "${q.toUpperCase()}"`,
    hero_genre:    (g) => `${g.toUpperCase()} NOVELS`,
    hero_genre_manga: (g) => `${g.toUpperCase()} MANGA`,
    hero_airing:   'CURRENTLY AIRING',
    hero_ongoing:  'ONGOING MANGA',
    hero_found_novels: (n) => `${n.toLocaleString()} series found`,
    hero_found_anime:  (n) => `${n.toLocaleString()} titles found`,
    hero_found_manga:  (n) => `${n.toLocaleString()} titles found`,

    // Filters
    filter_status:      'STATUS',
    filter_format:      'FORMAT',
    filter_demographic: 'DEMOGRAPHIC',
    filter_all:         'All',

    // Sort labels
    sort_newest:    '🆕 Newest',
    sort_oldest:    '📅 Oldest',
    sort_az:        '🔤 A-Z',
    sort_za:        '🔤 Z-A',
    sort_mostvols:  '📚 Most Vols',
    sort_fewest:    '📖 Fewest Vols',
    sort_popular:   '🔥 Popular',
    sort_toprated:  '⭐ Top Rated',
    sort_trending:  '📈 Trending',
    sort_faved:     '❤️ Favourited',
    sort_relevance: '🎯 Relevance',
    sort_latest:    '🆕 Latest',

    // Status labels
    status_all:       'All',
    status_ongoing:   'Ongoing',
    status_completed: 'Completed',
    status_hiatus:    'Hiatus',
    status_cancelled: 'Cancelled',
    status_airing:    'Airing',
    status_finished:  'Finished',
    status_upcoming:  'Upcoming',

    // Card meta
    meta_run:     'RUN',
    meta_vols:    'VOLS',
    meta_score:   'SCORE',
    meta_year:    'YEAR',
    meta_eps:     'EPS',
    meta_ch:      'CH',
    meta_vol:     'VOL',
    meta_demo:    'DEMO',
    meta_follows: 'FOLLOWS',
    meta_lang:    'LANG',

    // Modal
    modal_volumes:   'VOLUMES',
    modal_start:     'START',
    modal_latest:    'LATEST',
    modal_rating:    'RATING',
    modal_episodes:  'EPISODES',
    modal_duration:  'DURATION',
    modal_favs:      'FAVS',
    modal_chapters:  'CHAPTERS',
    modal_themes:    'THEMES',
    modal_publisher: 'PUBLISHER',
    modal_view_ranobe:  '↗ View on RanobeDB',
    modal_view_anilist: '↗ View on AniList',
    modal_view_mangadex:'↗ View on MangaDex',
    modal_web_novel:    '🌐 Web Novel',
    modal_loading:   'Loading details…',

    // Empty / Error
    empty_novels:  'No novels found',
    empty_anime:   'No anime found',
    empty_manga:   'No manga found',
    empty_votes:   'No novels to vote yet',
    empty_sub:     'Try a different filter or search term',
    error_load:    'Failed to load',
    error_retry:   'Retry',

    // Load more
    load_more:     'Load More',
    loading:       'Loading…',

    // Footer
    footer_powered: 'Powered by',

    // Vote page
    vote_title:        'MONTHLY LIGHT NOVEL VOTE',
    vote_sub:          (month, year) => `${month} ${year} Rankings`,
    vote_resets:       (d) => `Resets in ${d} days`,
    vote_cast:         '🗳️ Vote',
    vote_voted:        '✓ Voted',
    vote_rank:         'RANK',
    vote_votes:        'VOTES',
    vote_trend_up:     'Rising',
    vote_trend_down:   'Falling',
    vote_trend_new:    'New',
    vote_trend_same:   'Stable',
    vote_already:      'You already voted for this novel this month',
    vote_success:      'Vote cast!',
    vote_loading:      'Loading rankings…',
    vote_search_hint:  'Search and vote for any light novel',
    vote_tab_rank:     '🏆 Rankings',
    vote_tab_search:   '🔍 Search & Vote',
    vote_month:        ['January','February','March','April','May','June','July','August','September','October','November','December'],

    // Landing
    land_tagline:    'Your hub for Light Novels, Anime & Manga',
    land_sub:        'Discover, track, and vote for your favourites',
    land_enter:      'Explore Now',
    land_novels_desc:'Browse & search thousands of light novels',
    land_anime_desc: 'Top rated & trending anime',
    land_manga_desc: 'Manga rankings powered by MangaDex',
    land_vote_desc:  'Vote for your favourite novel each month',
  },

  vi: {
    // Nav
    nav_novels:  'Light Novel',
    nav_anime:   'Anime',
    nav_manga:   'Manga',
    nav_vote:     'Bình chọn',
    nav_ranking:  'Bảng xếp hạng',
    nav_schedule: 'Lịch phát hành',
    nav_home:    'Trang chủ',

    // Search
    search_novels: 'Tìm kiếm light novel…',
    search_anime:  'Tìm kiếm anime…',
    search_manga:  'Tìm kiếm manga…',
    search_vote:   'Tìm novel để bình chọn…',

    // Hero
    hero_novels:   'BẢNG XẾP HẠNG LIGHT NOVEL',
    hero_anime:    'BẢNG XẾP HẠNG ANIME',
    hero_manga:    'BẢNG XẾP HẠNG MANGA',
    hero_vote:     'BÌNH CHỌN THÁNG NÀY',
    hero_results:  (q) => `KẾT QUẢ TÌM KIẾM "${q.toUpperCase()}"`,
    hero_genre:    (g) => `LIGHT NOVEL ${g.toUpperCase()}`,
    hero_genre_manga: (g) => `MANGA ${g.toUpperCase()}`,
    hero_airing:   'ĐANG PHÁT SÓNG',
    hero_ongoing:  'MANGA ĐANG TIẾN HÀNH',
    hero_found_novels: (n) => `Tìm thấy ${n.toLocaleString()} bộ`,
    hero_found_anime:  (n) => `Tìm thấy ${n.toLocaleString()} tựa`,
    hero_found_manga:  (n) => `Tìm thấy ${n.toLocaleString()} tựa`,

    // Filters
    filter_status:      'TRẠNG THÁI',
    filter_format:      'ĐỊNH DẠNG',
    filter_demographic: 'ĐỐI TƯỢNG',
    filter_all:         'Tất cả',

    // Sort labels
    sort_newest:    '🆕 Mới nhất',
    sort_oldest:    '📅 Cũ nhất',
    sort_az:        '🔤 A-Z',
    sort_za:        '🔤 Z-A',
    sort_mostvols:  '📚 Nhiều tập nhất',
    sort_fewest:    '📖 Ít tập nhất',
    sort_popular:   '🔥 Phổ biến',
    sort_toprated:  '⭐ Đánh giá cao',
    sort_trending:  '📈 Xu hướng',
    sort_faved:     '❤️ Yêu thích',
    sort_relevance: '🎯 Liên quan',
    sort_latest:    '🆕 Mới nhất',

    // Status labels
    status_all:       'Tất cả',
    status_ongoing:   'Đang tiến hành',
    status_completed: 'Hoàn thành',
    status_hiatus:    'Tạm dừng',
    status_cancelled: 'Đã hủy',
    status_airing:    'Đang chiếu',
    status_finished:  'Đã kết thúc',
    status_upcoming:  'Sắp ra mắt',

    // Card meta
    meta_run:     'NĂM',
    meta_vols:    'TẬP',
    meta_score:   'ĐIỂM',
    meta_year:    'NĂM',
    meta_eps:     'TẬP',
    meta_ch:      'CH',
    meta_vol:     'TẬP',
    meta_demo:    'ĐỐI TƯỢNG',
    meta_follows: 'THEO DÕI',
    meta_lang:    'NGÔN NGỮ',

    // Modal
    modal_volumes:   'SỐ TẬP',
    modal_start:     'BẮT ĐẦU',
    modal_latest:    'MỚI NHẤT',
    modal_rating:    'ĐIỂM',
    modal_episodes:  'TẬP PHIM',
    modal_duration:  'THỜI LƯỢNG',
    modal_favs:      'YÊU THÍCH',
    modal_chapters:  'CHƯƠNG',
    modal_themes:    'CHỦ ĐỀ',
    modal_publisher: 'NHÀ XUẤT BẢN',
    modal_view_ranobe:  '↗ Xem trên RanobeDB',
    modal_view_anilist: '↗ Xem trên AniList',
    modal_view_mangadex:'↗ Xem trên MangaDex',
    modal_web_novel:    '🌐 Web Novel',
    modal_loading:   'Đang tải chi tiết…',

    // Empty / Error
    empty_novels:  'Không tìm thấy novel',
    empty_anime:   'Không tìm thấy anime',
    empty_manga:   'Không tìm thấy manga',
    empty_votes:   'Chưa có novel nào để bình chọn',
    empty_sub:     'Thử bộ lọc hoặc từ khóa khác',
    error_load:    'Tải thất bại',
    error_retry:   'Thử lại',

    // Load more
    load_more:     'Tải thêm',
    loading:       'Đang tải…',

    // Footer
    footer_powered: 'Cung cấp bởi',

    // Vote page
    vote_title:        'BÌNH CHỌN LIGHT NOVEL THÁNG NÀY',
    vote_sub:          (month, year) => `Bảng xếp hạng tháng ${month} năm ${year}`,
    vote_resets:       (d) => `Đặt lại sau ${d} ngày`,
    vote_cast:         '🗳️ Bình chọn',
    vote_voted:        '✓ Đã bình chọn',
    vote_rank:         'HẠNG',
    vote_votes:        'PHIẾU',
    vote_trend_up:     'Tăng',
    vote_trend_down:   'Giảm',
    vote_trend_new:    'Mới',
    vote_trend_same:   'Ổn định',
    vote_already:      'Bạn đã bình chọn cho novel này tháng này rồi',
    vote_success:      'Đã bình chọn!',
    vote_loading:      'Đang tải bảng xếp hạng…',
    vote_search_hint:  'Tìm kiếm và bình chọn cho light novel bất kỳ',
    vote_tab_rank:     '🏆 Bảng xếp hạng',
    vote_tab_search:   '🔍 Tìm kiếm & Bình chọn',
    vote_month:        ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],

    // Landing
    land_tagline:    'Trung tâm Light Novel, Anime & Manga của bạn',
    land_sub:        'Khám phá, theo dõi và bình chọn cho tác phẩm yêu thích',
    land_enter:      'Khám phá ngay',
    land_novels_desc:'Duyệt và tìm kiếm hàng nghìn light novel',
    land_anime_desc: 'Anime được đánh giá cao và xu hướng mới nhất',
    land_manga_desc: 'Bảng xếp hạng manga từ MangaDex',
    land_vote_desc:  'Bình chọn cho novel yêu thích mỗi tháng',
  },
}

export const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
