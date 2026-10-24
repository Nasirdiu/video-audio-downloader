import type { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';
import { extractMedia } from './extract.js';

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const targetUrl = parsedUrl.searchParams.get('url') || '';
  const format = parsedUrl.searchParams.get('format') || '1080';
  const customTitle = parsedUrl.searchParams.get('title') || 'download';

  if (!targetUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing "url" parameter');
    return;
  }

  const isAudio = format === 'mp3' || format === 'm4a' || format === 'wav';
  const ext = isAudio ? (format === 'wav' ? 'wav' : 'mp3') : 'mp4';
  const safeTitle = customTitle.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF\s]/g, '').trim().replace(/\s+/g, '_').slice(0, 80) || 'media';
  const fileName = `${safeTitle}.${ext}`;

  try {
    const extracted = await extractMedia(targetUrl, format);
    if (!extracted.success || !extracted.downloadUrl) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Failed to extract media: ${extracted.error || 'Stream not found'}`);
      return;
    }

    const vidRes = await fetch(extracted.downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!vidRes.ok || !vidRes.body) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Failed to fetch extracted stream from upstream server');
      return;
    }

    const contentType = isAudio ? 'audio/mpeg' : 'video/mp4';
    const contentLength = vidRes.headers.get('content-length');

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Pipe stream to browser
    // @ts-expect-error fromWeb supports standard Web Streams
    Readable.fromWeb(vidRes.body).pipe(res);
  } catch (err: unknown) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Error: ${(err as Error).message}`);
  }
}
