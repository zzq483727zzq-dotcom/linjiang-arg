import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = normalize(process.cwd()).replace(/\\/g, '/');
const PREFERRED = Number(process.env.PORT) || 5173;
const MAX_TRIES = 30;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/' || urlPath.endsWith('/')) urlPath = urlPath + 'index.html';
    urlPath = urlPath.replace(/^[/\\]+/, '');
    const filePath = normalize(join(ROOT, urlPath));
    const cwdBack = process.cwd().replace(/[/\\]+/g, '\\');
    const cwdFwd = process.cwd().replace(/\\/g, '/');
    if (!filePath.startsWith(cwdBack) && !filePath.startsWith(cwdFwd)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    const s = await stat(filePath).catch(() => null);
    if (!s || !s.isFile()) {
      const fb = normalize(join(ROOT, '404.html'));
      const fs2 = await stat(fb).catch(() => null);
      if (fs2 && fs2.isFile()) {
        const data = await readFile(fb);
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(data);
      }
      res.writeHead(404);
      return res.end('not found');
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('server error: ' + e.message);
  }
});

function listen(port, triesLeft) {
  const onError = (err) => {
    server.off('listening', onListening);
    if (err && err.code === 'EADDRINUSE' && triesLeft > 0) {
      const next = port + 1;
      console.error(`端口 ${port} 已被占用，尝试 ${next} …`);
      // 必须换新监听调用；EADDRINUSE 后同一 server 可再 listen 其他端口
      setTimeout(() => listen(next, triesLeft - 1), 50);
      return;
    }
    console.error(err);
    process.exit(1);
  };

  const onListening = () => {
    server.off('error', onError);
    const addr = server.address();
    const p = typeof addr === 'object' && addr ? addr.port : port;
    console.log('');
    console.log(`  本地服务器已启动`);
    console.log(`  ➜  http://localhost:${p}/`);
    if (p !== PREFERRED) {
      console.log(`  （首选端口 ${PREFERRED} 被占用，已自动切换）`);
    }
    console.log('');
  };

  server.once('error', onError);
  server.once('listening', onListening);
  server.listen(port);
}

listen(PREFERRED, MAX_TRIES);
