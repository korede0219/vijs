/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Proxy Endpoint for OpenRouter
  app.post('/api/ai/chat', async (req, res) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured.' });
    }

    try {
      const { model, messages } = req.body;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://ai.studio/build', // Optional
          'X-Title': 'Prompt Brain', // Optional
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'google/gemini-flash-1.5',
          messages: messages,
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('AI Proxy Error:', error);
      res.status(500).json({ error: 'Failed to communicate with AI provider.' });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
