import { SupportedPlatform } from '../types';

export interface PlatformMetadata {
  id: SupportedPlatform;
  name: string;
  domain: string;
  color: string;
  bgTint: string;
  borderColor: string;
  badgeClass: string;
  supportedTypes: string[];
  sampleUrl: string;
  sampleTitle: string;
  guideUrlExample: string;
}

export const PLATFORMS_DATA: Record<SupportedPlatform, PlatformMetadata> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    domain: 'youtube.com / youtu.be',
    color: '#FF0000',
    bgTint: 'bg-red-500/10 text-red-400 border-red-500/20',
    borderColor: 'border-red-500/30',
    badgeClass: 'text-red-400 bg-red-950/40 border-red-800/40',
    supportedTypes: ['Shorts', '4K / 1080p Videos', 'MP3 Audio', 'Thumbnails'],
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sampleTitle: 'Rick Astley - Never Gonna Give You Up (Official Music Video 4K)',
    guideUrlExample: 'https://youtube.com/shorts/sample123 or https://youtu.be/...'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    domain: 'facebook.com / fb.watch',
    color: '#1877F2',
    bgTint: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500/30',
    badgeClass: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    supportedTypes: ['Reels', 'Watch Videos', 'Stories', 'Original Audio'],
    sampleUrl: 'https://www.facebook.com/reel/1049283920194829',
    sampleTitle: 'Amazing Street Food Crafting Reel - 1080p HD',
    guideUrlExample: 'https://facebook.com/share/r/xyz... or https://fb.watch/...'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    domain: 'instagram.com',
    color: '#E1306C',
    bgTint: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    borderColor: 'border-pink-500/30',
    badgeClass: 'text-pink-400 bg-pink-950/40 border-pink-800/40',
    supportedTypes: ['Reels', 'Feed Videos', 'Carousels', 'Audio Extraction'],
    sampleUrl: 'https://www.instagram.com/reel/C8q_sample98/',
    sampleTitle: 'Cinematic Drone Shot over Dolomites Mountain Range',
    guideUrlExample: 'https://instagram.com/reel/C7... or https://instagram.com/p/...'
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    domain: 'pinterest.com / pin.it',
    color: '#BD081C',
    bgTint: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-500/30',
    badgeClass: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    supportedTypes: ['Video Pins', 'Idea Pins', 'HD Images', 'Pin Audio'],
    sampleUrl: 'https://www.pinterest.com/pin/843721311456789123/',
    sampleTitle: 'Minimalist Interior Architectural Aesthetic - 4K Video Pin',
    guideUrlExample: 'https://pinterest.com/pin/12345... or https://pin.it/xyz'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    domain: 'x.com / twitter.com',
    color: '#1DA1F2',
    bgTint: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    borderColor: 'border-sky-500/30',
    badgeClass: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
    supportedTypes: ['Video Tweets', 'GIF to MP4', 'Spaces Audio', '1080p Clips'],
    sampleUrl: 'https://x.com/SpaceX/status/1789428392019482930',
    sampleTitle: 'Starship Flight Test Booster Catch - 60 FPS HD',
    guideUrlExample: 'https://x.com/username/status/123456789'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    domain: 'tiktok.com',
    color: '#00F2FE',
    bgTint: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    badgeClass: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40',
    supportedTypes: ['No Watermark HD', 'Original MP3', 'Photo Sliders', 'High-FPS'],
    sampleUrl: 'https://www.tiktok.com/@creative_creators/video/7391829482910482910',
    sampleTitle: 'Epic Slow-Motion Wave Surfing in Teahupoʻo (No Watermark)',
    guideUrlExample: 'https://www.tiktok.com/@user/video/73... or https://vt.tiktok.com/...'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    domain: 'reddit.com',
    color: '#FF4500',
    bgTint: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    borderColor: 'border-orange-500/30',
    badgeClass: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
    supportedTypes: ['Merged Audio Video', '1080p Clips', 'Audio MP3'],
    sampleUrl: 'https://www.reddit.com/r/nextfuckinglevel/comments/1e89xyz/insane_robot_acrobatics/',
    sampleTitle: 'Boston Dynamics Atlas Parkour Simulation - Full HD',
    guideUrlExample: 'https://reddit.com/r/subreddit/comments/xyz/...'
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    domain: 'threads.net',
    color: '#A855F7',
    bgTint: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/30',
    badgeClass: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
    supportedTypes: ['Video Posts', '1080p MP4', 'Sound Extraction'],
    sampleUrl: 'https://www.threads.net/@photography/post/C9xZ_sample',
    sampleTitle: 'Cinematic Tokyo Rainy Neon Alleyways',
    guideUrlExample: 'https://www.threads.net/@user/post/C...'
  },
  vimeo: {
    id: 'vimeo',
    name: 'Vimeo',
    domain: 'vimeo.com',
    color: '#1AB7EA',
    bgTint: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    borderColor: 'border-teal-500/30',
    badgeClass: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
    supportedTypes: ['4K Ultra HD', 'Lossless Audio', 'Filmmaker Clips'],
    sampleUrl: 'https://vimeo.com/76979871',
    sampleTitle: 'The Mountain - Award-Winning Timelapse by TSO Photography',
    guideUrlExample: 'https://vimeo.com/123456789'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    color: '#0A66C2',
    bgTint: 'bg-blue-600/10 text-blue-300 border-blue-600/20',
    borderColor: 'border-blue-600/30',
    badgeClass: 'text-blue-300 bg-blue-950/40 border-blue-800/40',
    supportedTypes: ['Post Videos', 'Webinars', 'Audio MP3'],
    sampleUrl: 'https://www.linkedin.com/posts/future-tech-conference_ai-breakthrough-video',
    sampleTitle: 'Quantum Computing Keynote Demo - Tech Expo',
    guideUrlExample: 'https://linkedin.com/posts/...'
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    domain: 'soundcloud.com',
    color: '#FF5500',
    bgTint: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500/30',
    badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    supportedTypes: ['320 kbps MP3', 'Lossless WAV', 'Original Track'],
    sampleUrl: 'https://soundcloud.com/chillhopdotcom/lofi-beats-to-relax-to',
    sampleTitle: 'Lofi Ambient Beats for Deep Focus & Coding (320kbps MP3)',
    guideUrlExample: 'https://soundcloud.com/artist/track-name'
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    domain: 'twitch.tv',
    color: '#9146FF',
    bgTint: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    borderColor: 'border-violet-500/30',
    badgeClass: 'text-violet-400 bg-violet-950/40 border-violet-800/40',
    supportedTypes: ['Clips 1080p 60FPS', 'VOD Excerpts', 'Stream Audio'],
    sampleUrl: 'https://www.twitch.tv/shroud/clip/RelievedTenderPuffinBibleThump',
    sampleTitle: 'Shroud Incredible 1v4 Clutch Shot in CS2 Championship',
    guideUrlExample: 'https://clips.twitch.tv/... or https://twitch.tv/user/clip/...'
  },
  generic: {
    id: 'generic',
    name: 'Web Media Link',
    domain: 'direct url / any website',
    color: '#6366F1',
    bgTint: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    badgeClass: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40',
    supportedTypes: ['Direct MP4', 'Direct MP3', 'Web Stream', 'M3U8 / HLS'],
    sampleUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    sampleTitle: 'Direct Web Media Stream - MP4 1080p',
    guideUrlExample: 'https://example.com/video.mp4 or any video URL'
  }
};

export function detectPlatform(rawUrl: string): SupportedPlatform {
  if (!rawUrl || typeof rawUrl !== 'string') return 'generic';
  const clean = rawUrl.trim().toLowerCase();

  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return 'youtube';
  }
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com') || clean.includes('fb.gg')) {
    return 'facebook';
  }
  if (clean.includes('instagram.com') || clean.includes('instagr.am')) {
    return 'instagram';
  }
  if (clean.includes('pinterest.com') || clean.includes('pin.it')) {
    return 'pinterest';
  }
  if (clean.includes('twitter.com') || clean.includes('x.com') || clean.includes('t.co')) {
    return 'twitter';
  }
  if (clean.includes('tiktok.com') || clean.includes('douyin.com')) {
    return 'tiktok';
  }
  if (clean.includes('reddit.com') || clean.includes('redd.it')) {
    return 'reddit';
  }
  if (clean.includes('threads.net')) {
    return 'threads';
  }
  if (clean.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (clean.includes('linkedin.com')) {
    return 'linkedin';
  }
  if (clean.includes('soundcloud.com')) {
    return 'soundcloud';
  }
  if (clean.includes('twitch.tv')) {
    return 'twitch';
  }

  return 'generic';
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function isValidUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
