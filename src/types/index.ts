export type SupportedPlatform =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'pinterest'
  | 'twitter'
  | 'tiktok'
  | 'reddit'
  | 'threads'
  | 'vimeo'
  | 'linkedin'
  | 'soundcloud'
  | 'twitch'
  | 'generic';

export interface VideoFormatOption {
  id: string;
  quality: '4K (2160p)' | '1440p (2K)' | '1080p (Full HD)' | '720p (HD)' | '480p (SD)' | '360p (Mobile)';
  resolution: string;
  format: 'MP4' | 'WEBM';
  fps: number;
  sizeMb: number;
  hasAudio: boolean;
  isWatermarkFree?: boolean;
}

export interface AudioFormatOption {
  id: string;
  quality: '320 kbps (Studio)' | '256 kbps (High)' | '192 kbps (Medium)' | '128 kbps (Standard)' | 'Original Track';
  format: 'MP3' | 'M4A' | 'WAV' | 'FLAC';
  bitrate: string;
  sizeMb: number;
}

export interface MediaItem {
  id: string;
  originalUrl: string;
  platform: SupportedPlatform;
  title: string;
  author: string;
  authorAvatar?: string;
  duration: number; // in seconds
  durationFormatted: string;
  thumbnailUrl: string;
  views?: string;
  publishDate?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  contentType: 'video' | 'reel' | 'short' | 'audio' | 'pin' | 'clip';
  videoFormats: VideoFormatOption[];
  audioFormats: AudioFormatOption[];
  sampleVideoUrl?: string;
  sampleAudioUrl?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: SupportedPlatform;
  url: string;
  format: string;
  quality: string;
  fileSizeMb: number;
  fileName: string;
  downloadedAt: number;
  thumbnailUrl: string;
  type: 'video' | 'audio' | 'image';
}

export interface BatchItem {
  id: string;
  url: string;
  platform: SupportedPlatform;
  status: 'pending' | 'resolving' | 'ready' | 'downloading' | 'completed' | 'error';
  media?: MediaItem;
  selectedFormat?: string;
  progress: number;
  errorMessage?: string;
}
