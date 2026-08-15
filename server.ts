import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/server/api.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Proxy to MongoDB Backend (port 5000)
  app.use('/api', async (req, res) => {
    try {
      const targetUrl = `http://localhost:5000/api${req.url}`;
      
      // Clean up headers to prevent hanging on content-length mismatch
      const cleanHeaders: Record<string, string> = {};
      Object.entries(req.headers).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (value !== undefined && lowerKey !== 'content-length' && lowerKey !== 'connection' && lowerKey !== 'host') {
          cleanHeaders[key] = String(value);
        }
      });
      cleanHeaders['host'] = 'localhost:5000';

      // Axios configuration to forward request
      const response = await (await import('axios')).default({
        method: req.method,
        url: targetUrl,
        data: req.method !== 'GET' && req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        headers: cleanHeaders,
        validateStatus: () => true,
        responseType: 'arraybuffer',
      });

      // Forward response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value !== undefined && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, String(value));
        }
      });

      res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error('API Proxy Error:', error.message);
      res.status(500).json({ status: 'error', message: 'Proxy failed to reach backend server' });
    }
  });




  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://localhost:${PORT}/\n`);
    console.log(`  ComplianceFlow Application is active and running on http://localhost:${PORT}`);
  });
}

startServer();
