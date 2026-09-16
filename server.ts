import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '25mb' }));

const dataDir = path.join(process.cwd(), 'data', 'workspaces');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function sanitizeAccountId(id: string): string {
  if (!id) return 'guest';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET workspace for a specific authenticated account
app.get('/api/workspace/:accountId', (req, res) => {
  try {
    const accountId = sanitizeAccountId(req.params.accountId);
    const filePath = path.join(dataDir, `${accountId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, notFound: true, accountId });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    const parsed = JSON.parse(content);

    return res.json({
      success: true,
      accountId,
      lastSaved: stats.mtime.toISOString(),
      data: parsed
    });
  } catch (err: any) {
    console.error('Error fetching workspace:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST save workspace for a specific authenticated account
app.post('/api/workspace/:accountId', (req, res) => {
  try {
    const accountId = sanitizeAccountId(req.params.accountId);
    const filePath = path.join(dataDir, `${accountId}.json`);
    const tempPath = path.join(dataDir, `${accountId}.tmp`);
    const payload = req.body?.data;

    if (!payload) {
      return res.status(400).json({ success: false, error: 'No workspace data provided' });
    }

    const dataToSave = {
      ...payload,
      _accountOwner: accountId,
      _lastServerSync: new Date().toISOString()
    };

    fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);

    return res.json({
      success: true,
      accountId,
      lastSaved: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error saving workspace:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST reset workspace for a specific authenticated account
app.post('/api/workspace/:accountId/reset', (req, res) => {
  try {
    const accountId = sanitizeAccountId(req.params.accountId);
    const filePath = path.join(dataDir, `${accountId}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ success: true, accountId, message: 'Workspace reset to default template' });
  } catch (err: any) {
    console.error('Error resetting workspace:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
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
    console.log(`IE Daily Activity server running on http://0.0.0.0:${PORT}`);
  });
}

start();
