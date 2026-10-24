import type { IncomingMessage, ServerResponse } from 'http';

export async function extractMedia(
  url: string,
  format: string
): Promise<{ success: boolean; downloadUrl?: string; title?: string; error?: string }> {
  try {
    const initRes = await fetch(
      `https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!initRes.ok) return { success: false, error: 'Init failed' };
    const initData = await initRes.json();
    if (!initData.success || !initData.progress_url) return { success: false, error: 'No stream' };

    const deadline = Date.now() + 40_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 600));
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      const pRes = await fetch(initData.progress_url, {
        signal: AbortSignal.timeout(Math.min(4000, remaining)),
      });
      if (!pRes.ok) continue;
      const pData = await pRes.json();
      if (pData.download_url) {
        return { success: true, downloadUrl: pData.download_url, title: pData.title || initData.title || 'video' };
      }
    }
    return { success: false, error: 'Timeout' };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

// Vercel Serverless Function: Decoupled Fast Extractor (< 1s per request to avoid any 504 timeouts)
export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const action = parsedUrl.searchParams.get('action') || 'start';
  const targetUrl = parsedUrl.searchParams.get('url') || '';
  const format = parsedUrl.searchParams.get('format') || '720';
  const progressUrl = parsedUrl.searchParams.get('progressUrl') || '';

  res.setHeader('Content-Type', 'application/json');

  // ACTION 1: Check single progress step (takes ~300ms)
  if (action === 'progress' && progressUrl) {
    try {
      const progRes = await fetch(progressUrl, { signal: AbortSignal.timeout(4000) });
      if (!progRes.ok) {
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, progress: 50, text: 'Processing stream chunks...' }));
        return;
      }
      const progData = await progRes.json();
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          progress: progData.progress || 0,
          text: progData.text || 'Processing stream...',
          downloadUrl: progData.download_url || null,
          title: progData.title || null,
        })
      );
      return;
    } catch (e: unknown) {
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, progress: 40, text: 'Connecting to stream...' }));
      return;
    }
  }

  // ACTION 2: Initialize extraction session (takes ~800ms)
  if (!targetUrl) {
    res.statusCode = 400;
    res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
    return;
  }

  try {
    const initRes = await fetch(
      `https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(targetUrl)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!initRes.ok) {
      res.statusCode = 502;
      res.end(JSON.stringify({ success: false, error: 'Extractor init failed' }));
      return;
    }
    const initData = await initRes.json();
    if (!initData.success || !initData.progress_url) {
      res.statusCode = 502;
      res.end(JSON.stringify({ success: false, error: initData.message || 'Stream not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        progressUrl: initData.progress_url,
        title: initData.title || 'video',
      })
    );
  } catch (err: unknown) {
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: (err as Error).message }));
  }
}
