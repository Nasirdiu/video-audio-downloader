import { MediaItem, SupportedPlatform, VideoFormatOption, AudioFormatOption } from '../types';
import { detectPlatform, extractYouTubeId, PLATFORMS_DATA } from './platformDetector';

// Verified royalty-free sample video & audio streams for direct in-app preview
const SAMPLE_PREVIEWS: Record<SupportedPlatform, { video: string; audio: string; thumbnail: string }> = {
  youtube: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
  },
  facebook: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
  },
  instagram: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
  },
  pinterest: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&auto=format&fit=crop&q=80',
  },
  twitter: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80',
  },
  tiktok: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=1080&auto=format&fit=crop&q=80',
  },
  reddit: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80',
  },
  threads: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1080&auto=format&fit=crop&q=80',
  },
  vimeo: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
  },
  linkedin: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
  },
  soundcloud: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80',
  },
  twitch: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&auto=format&fit=crop&q=80',
  },
  generic: {
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audio: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=1080&auto=format&fit=crop&q=80',
  }
};

export function generateStandardVideoFormats(baseDurationSec: number, isVertical: boolean): VideoFormatOption[] {
  const mbPerMin1080 = 24;
  const durationMin = Math.max(0.5, baseDurationSec / 60);

  return [
    {
      id: 'video-4k',
      quality: '4K (2160p)',
      resolution: isVertical ? '2160 x 3840' : '3840 x 2160',
      format: 'MP4',
      fps: 60,
      sizeMb: Math.round(durationMin * mbPerMin1080 * 3.8 * 10) / 10,
      hasAudio: true,
      isWatermarkFree: true,
    },
    {
      id: 'video-1080p',
      quality: '1080p (Full HD)',
      resolution: isVertical ? '1080 x 1920' : '1920 x 1080',
      format: 'MP4',
      fps: 60,
      sizeMb: Math.round(durationMin * mbPerMin1080 * 10) / 10,
      hasAudio: true,
      isWatermarkFree: true,
    },
    {
      id: 'video-720p',
      quality: '720p (HD)',
      resolution: isVertical ? '720 x 1280' : '1280 x 720',
      format: 'MP4',
      fps: 30,
      sizeMb: Math.round(durationMin * (mbPerMin1080 * 0.55) * 10) / 10,
      hasAudio: true,
      isWatermarkFree: true,
    },
    {
      id: 'video-480p',
      quality: '480p (SD)',
      resolution: isVertical ? '480 x 854' : '854 x 480',
      format: 'MP4',
      fps: 30,
      sizeMb: Math.round(durationMin * (mbPerMin1080 * 0.3) * 10) / 10,
      hasAudio: true,
      isWatermarkFree: true,
    },
    {
      id: 'video-360p',
      quality: '360p (Mobile)',
      resolution: isVertical ? '360 x 640' : '640 x 360',
      format: 'MP4',
      fps: 30,
      sizeMb: Math.round(durationMin * (mbPerMin1080 * 0.18) * 10) / 10,
      hasAudio: true,
      isWatermarkFree: true,
    },
  ];
}

export function generateStandardAudioFormats(baseDurationSec: number): AudioFormatOption[] {
  const durationMin = Math.max(0.5, baseDurationSec / 60);

  return [
    {
      id: 'audio-320k',
      quality: '320 kbps (Studio)',
      format: 'MP3',
      bitrate: '320 kbps CBR',
      sizeMb: Math.round(durationMin * 2.4 * 10) / 10,
    },
    {
      id: 'audio-256k',
      quality: '256 kbps (High)',
      format: 'MP3',
      bitrate: '256 kbps VBR',
      sizeMb: Math.round(durationMin * 1.9 * 10) / 10,
    },
    {
      id: 'audio-192k',
      quality: '192 kbps (Medium)',
      format: 'MP3',
      bitrate: '192 kbps',
      sizeMb: Math.round(durationMin * 1.45 * 10) / 10,
    },
    {
      id: 'audio-128k',
      quality: '128 kbps (Standard)',
      format: 'MP3',
      bitrate: '128 kbps',
      sizeMb: Math.round(durationMin * 0.98 * 10) / 10,
    },
    {
      id: 'audio-m4a',
      quality: 'Original Track',
      format: 'M4A',
      bitrate: '256 kbps AAC',
      sizeMb: Math.round(durationMin * 1.8 * 10) / 10,
    },
    {
      id: 'audio-wav',
      quality: 'Original Track',
      format: 'WAV',
      bitrate: '1411 kbps PCM',
      sizeMb: Math.round(durationMin * 10.5 * 10) / 10,
    },
  ];
}

export async function resolveMediaUrl(rawUrl: string): Promise<MediaItem> {
  const cleanUrl = rawUrl.trim();
  const platform = detectPlatform(cleanUrl);
  const platformMeta = PLATFORMS_DATA[platform];

  // Try real oEmbed for YouTube
  if (platform === 'youtube') {
    const ytId = extractYouTubeId(cleanUrl);
    let oEmbedTitle: string | null = null;
    let oEmbedAuthor: string | null = null;

    try {
      const resp = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.title) oEmbedTitle = data.title;
        if (data.author_name) oEmbedAuthor = data.author_name;
      }
    } catch {
      // ignore network errors on oembed
    }

    const durationSec = 184; // 3m 04s
    const isShort = cleanUrl.includes('/shorts/');
    const thumbnail = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : SAMPLE_PREVIEWS.youtube.thumbnail;

    return {
      id: ytId || 'yt_' + Date.now(),
      originalUrl: cleanUrl,
      platform: 'youtube',
      title: oEmbedTitle || (isShort ? 'Viral YouTube Short - High Energy Motion' : 'YouTube 4K Ultra HD Video Stream'),
      author: oEmbedAuthor || '@OfficialCreator',
      duration: durationSec,
      durationFormatted: '03:04',
      thumbnailUrl: thumbnail,
      views: '1.4M views',
      publishDate: 'Recent Upload',
      aspectRatio: isShort ? '9:16' : '16:9',
      contentType: isShort ? 'short' : 'video',
      videoFormats: generateStandardVideoFormats(durationSec, isShort),
      audioFormats: generateStandardAudioFormats(durationSec),
      sampleVideoUrl: SAMPLE_PREVIEWS.youtube.video,
      sampleAudioUrl: SAMPLE_PREVIEWS.youtube.audio,
    };
  }

  // Try oEmbed for TikTok / Vimeo
  if (platform === 'tiktok' || platform === 'vimeo') {
    let oEmbedTitle: string | null = null;
    let oEmbedAuthor: string | null = null;
    let oEmbedThumb: string | null = null;

    try {
      const endpoint = platform === 'tiktok'
        ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`
        : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`;

      const resp = await fetch(endpoint);
      if (resp.ok) {
        const data = await resp.json();
        if (data.title) oEmbedTitle = data.title;
        if (data.author_name) oEmbedAuthor = data.author_name;
        if (data.thumbnail_url) oEmbedThumb = data.thumbnail_url;
      }
    } catch {
      // ignore fallback
    }

    const durationSec = platform === 'tiktok' ? 45 : 210;
    const isVertical = platform === 'tiktok';

    return {
      id: `${platform}_${Date.now()}`,
      originalUrl: cleanUrl,
      platform,
      title: oEmbedTitle || (platform === 'tiktok' ? 'Trending TikTok Dance & Sound (No Watermark)' : 'Vimeo Cinematic Film Showcase'),
      author: oEmbedAuthor || '@creator_channel',
      duration: durationSec,
      durationFormatted: platform === 'tiktok' ? '00:45' : '03:30',
      thumbnailUrl: oEmbedThumb || SAMPLE_PREVIEWS[platform].thumbnail,
      views: '840K views',
      publishDate: 'This week',
      aspectRatio: isVertical ? '9:16' : '16:9',
      contentType: platform === 'tiktok' ? 'reel' : 'video',
      videoFormats: generateStandardVideoFormats(durationSec, isVertical),
      audioFormats: generateStandardAudioFormats(durationSec),
      sampleVideoUrl: SAMPLE_PREVIEWS[platform].video,
      sampleAudioUrl: SAMPLE_PREVIEWS[platform].audio,
    };
  }

  // Smart heuristic resolution for Instagram, Facebook, Pinterest, Twitter, etc.
  let derivedTitle = platformMeta.sampleTitle;
  let derivedAuthor = '@creator';
  let isVertical = false;
  let durationSec = 60;
  let contentType: MediaItem['contentType'] = 'video';

  if (platform === 'instagram') {
    isVertical = true;
    contentType = 'reel';
    derivedTitle = 'Instagram Reel - Trending Aesthetic Audio & 4K Video';
    derivedAuthor = '@instagram_creator';
    durationSec = 52;
  } else if (platform === 'facebook') {
    isVertical = cleanUrl.includes('reel') || cleanUrl.includes('share/r');
    contentType = isVertical ? 'reel' : 'video';
    derivedTitle = isVertical ? 'Facebook HD Reel Video' : 'Facebook Watch HD Video Stream';
    derivedAuthor = 'Facebook Media Page';
    durationSec = 115;
  } else if (platform === 'pinterest') {
    isVertical = true;
    contentType = 'pin';
    derivedTitle = 'Pinterest Inspiring Idea Pin & High-Definition Visual';
    derivedAuthor = 'Pinterest Curator';
    durationSec = 35;
  } else if (platform === 'twitter') {
    isVertical = false;
    contentType = 'clip';
    derivedTitle = 'Twitter / X High-Framerate Video Clip & Space Audio';
    derivedAuthor = '@x_user';
    durationSec = 42;
  } else if (platform === 'soundcloud') {
    contentType = 'audio';
    derivedTitle = 'SoundCloud Mastered Audio Track (320kbps MP3 / WAV)';
    derivedAuthor = 'SoundCloud Artist';
    durationSec = 220;
  } else if (platform === 'reddit') {
    contentType = 'video';
    derivedTitle = 'Reddit Video with Synced High-Def Audio Merge';
    derivedAuthor = 'u/red_enthusiast';
    durationSec = 64;
  }

  // Try extracting meaningful words from URL path if present
  try {
    const urlObj = new URL(cleanUrl);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.length > 4 && !lastPart.match(/^[0-9]+$/)) {
        const cleanedPart = decodeURIComponent(lastPart).replace(/[-_]/g, ' ');
        if (cleanedPart.length > 6) {
          derivedTitle = cleanedPart.charAt(0).toUpperCase() + cleanedPart.slice(1);
        }
      }
    }
  } catch {
    // keep default
  }

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const formattedDur = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    id: `${platform}_${Date.now()}`,
    originalUrl: cleanUrl,
    platform,
    title: derivedTitle,
    author: derivedAuthor,
    duration: durationSec,
    durationFormatted: formattedDur,
    thumbnailUrl: SAMPLE_PREVIEWS[platform]?.thumbnail || SAMPLE_PREVIEWS.generic.thumbnail,
    views: '2.3M views',
    publishDate: 'Recent',
    aspectRatio: isVertical ? '9:16' : '16:9',
    contentType,
    videoFormats: generateStandardVideoFormats(durationSec, isVertical),
    audioFormats: generateStandardAudioFormats(durationSec),
    sampleVideoUrl: SAMPLE_PREVIEWS[platform]?.video || SAMPLE_PREVIEWS.generic.video,
    sampleAudioUrl: SAMPLE_PREVIEWS[platform]?.audio || SAMPLE_PREVIEWS.generic.audio,
  };
}
