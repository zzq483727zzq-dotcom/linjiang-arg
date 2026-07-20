import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = normalize(process.cwd()).replace(/\\/g, '/');
const PORT = Number(process.env.PORT) || 5173;

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
  '.txt': 'text/plain; charset=utf-8'
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/' || urlPath.endsWith('/')) urlPath = urlPath + 'index.html';
    urlPath = urlPath.replace(/^[/\\]+/, '');
    const filePath = normalize(join(ROOT, urlPath));
    // 双重检查:Windows-native 与 forward-slash 形式都要试
    const cwdBack = process.cwd().replace(/[/\\]+/g, '\\');
    const cwdFwd = process.cwd().replace(/\\/g, '/');
    if (!filePath.startsWith(cwdBack) && !filePath.startsWith(cwdFwd)) {
      res.writeHead(403); return res.end('forbidden');
    }
    const s = await stat(filePath).catch(() => null);
    if (!s || !s.isFile()) { res.writeHead(404); return res.end('not found'); }
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(500); res.end('server error: ' + e.message);
  }
});

server.listen(PORT, () => console.log(`server on http://localhost:${PORT}`));
