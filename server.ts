import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { setupSocketIO } from './server/socket-server.js';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// 初始化 Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // 确保数据目录存在
  const dataDir = join(process.cwd(), 'data');
  await mkdir(dataDir, { recursive: true });
  
  // 创建 HTTP 服务器
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // 设置 Socket.IO
  setupSocketIO(httpServer);
  
  // 启动服务器
  httpServer.listen(port, hostname, () => {
    console.log(`
🚀 Server ready on http://${hostname}:${port}
📡 Socket.IO ready for WebSocket connections
💾 Database initialized
🎯 Environment: ${dev ? 'development' : 'production'}
    `);
  });
});
