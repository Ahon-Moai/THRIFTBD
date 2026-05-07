import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Meta Conversions API (CAPI) Endpoint
  app.post('/api/track', async (req, res) => {
    const { eventName, eventId, userData, customData, sourceUrl } = req.body;
    
    const pixelId = process.env.VITE_META_PIXEL_ID || '1564061235060927';
    const accessToken = process.env.META_ACCESS_TOKEN || 'EAAST3n1jRa8BRT7oMVDiCt0irIwqAXOsSUmM8dZB0wR6yxcQyGkfvfJ7obCdmxpOnjbUvw6UNpZB0GptkbZCgagyexMDLKeKgKFu3sgCTqZCrPjvgNZCXy73jkdLjVLBZAGVZCZA95YVUycbiEueLK0W3ABGZAGwsscQoZBCzoAC1U2OgYM7Pp2UBfysUGyZB2mNzC5kQZDZD';
    const testEventCode = process.env.VITE_META_TEST_EVENT_CODE || 'TEST57052'; // REMOVE THIS FOR PRODUCTION

    if (!pixelId || !accessToken) {
      console.warn('Meta credentials missing. Skipping CAPI event.');
      return res.status(200).json({ success: false, message: 'Missing credentials' });
    }

    try {
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId, // Deduplication key
            event_source_url: sourceUrl || 'https://thriftbd.com',
            action_source: 'website',
            user_data: {
              client_ip_address: req.ip,
              client_user_agent: req.headers['user-agent'],
              ...userData
            },
            custom_data: customData
          }
        ],
        // Test Code - REMOVE BEFORE GOING LIVE
        ...(testEventCode ? { test_event_code: testEventCode } : {})
      };

      await axios.post(
        `https://graph.facebook.com/v17.0/${pixelId}/events`,
        payload,
        { params: { access_token: accessToken } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Meta CAPI Error:', error instanceof Error ? error.message : error);
      res.status(200).json({ success: false, error: 'Failed to send to CAPI' });
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
    // Correct paths for build environment
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
