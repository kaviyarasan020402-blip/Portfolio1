/* ==========================================================
   Default site content.
   ----------------------------------------------------------
   This is what EVERY visitor sees, because it ships with the
   files. The admin panel (admin.html) edits a copy that lives
   only in your own browser's storage — use "Export data" there
   and paste the result in here, then re-upload the site, to
   make new work/videos/photo visible to everyone.
   ========================================================== */

const SITE_DEFAULT_PHOTO = 'assets/img/kaviyarasan.jpg';

const SITE_DEFAULT_WORK = [
  {
    id: 'default-work-1',
    title: 'Add your first poster',
    category: 'Posters',
    image: 'assets/img/poster-placeholder.svg',
    description: 'Open admin.html to add posters, thumbnails, or branding work — they\'ll show up here.'
  }
];

const SITE_DEFAULT_VIDEOS = [
  {
    id: 'default-video-1',
    title: 'Brand promo cut',
    description: 'Fast-paced product reel — pacing, transitions, and beat-synced cuts.',
    category: 'Reel · brand promo',
    video_url: 'https://www.instagram.com/reel/Darv9ApxcEl/?igsi=NmcxaGV6czVxZXlk',
    poster_url: ''
  },
  {
    id: 'default-video-2',
    title: 'Add your next reel',
    description: 'Open admin.html and add a title, description and Instagram/YouTube link, or upload a file.',
    category: 'Reel · add link',
    video_url: '#',
    poster_url: ''
  },
  {
    id: 'default-video-3',
    title: 'Add another sample',
    description: 'More reels = a stronger portfolio. Aim for 6–9 total.',
    category: 'Reel · add link',
    video_url: '#',
    poster_url: ''
  }
];
