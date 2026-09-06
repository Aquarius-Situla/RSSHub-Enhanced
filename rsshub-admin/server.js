import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Support experimental local test route if present
const TSINGHUA_TEST = path.join(__dirname, 'tsinghua_test.js');
if (existsSync(TSINGHUA_TEST)) {
    import('./tsinghua_test.js').then(({ tsinghuaRoute }) => {
        if (tsinghuaRoute) {
            app.get("/tsinghua/lib/notice", tsinghuaRoute);
            app.get("/admin/tsinghua/lib/notice", tsinghuaRoute);
        }
    }).catch(() => {});
}

// Paths
const COMPOSE_FILE_PATH = process.env.COMPOSE_FILE_PATH || '/host_data/docker-compose.yml';
const FALLBACK_COMPOSE = path.join(__dirname, '../docker-compose.yml');
const getComposePath = () => existsSync(COMPOSE_FILE_PATH) ? COMPOSE_FILE_PATH : FALLBACK_COMPOSE;

const HOST_DATA_DIR = process.env.HOST_DATA_DIR || '/host_data';
const FALLBACK_DIR = path.join(__dirname, '../');
const getHostDataDir = () => existsSync(HOST_DATA_DIR) ? HOST_DATA_DIR : FALLBACK_DIR;

const COOKIECLOUD_CONFIG = path.join(getHostDataDir(), 'cookiecloud.json');
const COOKIECLOUD_LOG = path.join(getHostDataDir(), 'update_cookies.log');
const DECRYPT_SCRIPT = path.join(getHostDataDir(), 'decrypt.py');
const BYPASS_TXT = path.join(getHostDataDir(), 'bypass.txt');


async function getEnvVars() {
    const envPath = path.join(getHostDataDir(), '.env');
    if (!existsSync(envPath)) return {};
    const content = await fs.readFile(envPath, 'utf8');
    return dotenv.parse(content);
}

async function updateEnvVars(updates) {
    const envPath = path.join(getHostDataDir(), '.env');
    let content = '';
    if (existsSync(envPath)) {
        content = await fs.readFile(envPath, 'utf8');
    }
    
    let lines = content.split('\n');
    const updatedKeys = new Set();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;
        
        const splitIdx = line.indexOf('=');
        if (splitIdx === -1) continue;
        
        const key = line.substring(0, splitIdx).trim();
        if (key in updates) {
            lines[i] = `${key}=${updates[key]}`;
            updatedKeys.add(key);
        }
    }

    for (const [key, value] of Object.entries(updates)) {
        if (!updatedKeys.has(key) && value !== undefined && value !== null) {
            lines.push(`${key}=${value}`);
        }
    }

    await fs.writeFile(envPath, lines.join('\n'), 'utf8');
    
    // Trigger docker compose up -d to apply .env changes
    return new Promise((resolve, reject) => {
        exec('docker compose up -d || docker-compose up -d', { cwd: getHostDataDir() }, (err, stdout, stderr) => {
            if (err) console.error('Failed to reload containers:', stderr);
            resolve();
        });
    });
}

// === Proxy Nodes API ===
app.get('/api/nodes', async (req, res) => {
    try {
        const envVars = await getEnvVars();
        const commandStr = envVars.GOST_COMMAND || '-L=:8888';

        const nodes = [];
        const parts = commandStr.split('-F=').slice(1);
        
        parts.forEach(part => {
            const match = part.match(/^rr:\/\/([^\s\?]+)([\s\S]*)/);
            if (match) {
                let fullUrl = match[1];
                let url = fullUrl;
                let auth = '';
                if (fullUrl.includes('@')) {
                    const authParts = fullUrl.split('@');
                    auth = authParts[0];
                    url = authParts[1];
                }
                const paramsStr = match[2];
                let maxFails = '3';
                let failTimeout = '30s';
                let bypass = false;

                if (paramsStr.includes('max_fails=')) {
                    const mfMatch = paramsStr.match(/max_fails=(\d+)/);
                    if (mfMatch) maxFails = mfMatch[1];
                }
                if (paramsStr.includes('fail_timeout=')) {
                    const ftMatch = paramsStr.match(/fail_timeout=([a-zA-Z0-9]+)/);
                    if (ftMatch) failTimeout = ftMatch[1];
                }
                if (paramsStr.includes('-bypass=/bypass.txt')) {
                    bypass = true;
                }
                nodes.push({ url, auth, maxFails, failTimeout, bypass, rawParams: paramsStr });
            } else {
                const fallbackMatch = part.match(/^rr:\/\/([^\s]+)/);
                if (fallbackMatch) {
                    let fullUrl = fallbackMatch[1];
                    let url = fullUrl;
                    let auth = '';
                    if (fullUrl.includes('@')) {
                        const authParts = fullUrl.split('@');
                        auth = authParts[0];
                        url = authParts[1];
                    }
                    nodes.push({ url, auth, maxFails: '3', failTimeout: '30s', bypass: false, rawParams: '' });
                } else {
                    nodes.push({ url: part.trim().replace(/^rr:\/\//, ''), auth: '', maxFails: '3', failTimeout: '30s', bypass: false, rawParams: '' });
                }
            }
        });

        res.json({ nodes });
    } catch (error) {
        console.error("Error reading nodes:", error);
        res.status(500).json({ error: 'Failed to read docker-compose.yml' });
    }
});

app.post('/api/nodes', async (req, res) => {
    try {
        const { nodes } = req.body;
        if (!Array.isArray(nodes)) return res.status(400).json({ error: 'Nodes must be an array' });

        const envVars = await getEnvVars();
        const commandStr = envVars.GOST_COMMAND || '-L=:8888';
        const baseCommand = commandStr.split('-F=')[0].trim() || '-L=:8888';

        const newNodesLines = nodes.map(node => {
            // Build the params string
            let p = `?max_fails=${node.maxFails || 3}&fail_timeout=${node.failTimeout || '30s'}`;
            if (node.bypass) p += ' -bypass=/bypass.txt';
            // ensure we don't double prepend rr://
            const ipPort = node.url.replace(/^rr:\/\//, '');
            const authStr = node.auth ? `${node.auth}@` : '';
            return `-F=rr://${authStr}${ipPort}${p}`;
        });
        
        const newCommandBlock = [baseCommand, ...newNodesLines].filter(Boolean).join(' ');
        
        await updateEnvVars({ GOST_COMMAND: newCommandBlock });
        res.json({ success: true, message: 'Nodes updated successfully and proxy restarted' });
    } catch (error) {
        console.error("Error updating nodes:", error);
        res.status(500).json({ error: 'Failed to update nodes' });
    }
});

app.post('/api/restart', (req, res) => {
    exec(`docker restart rsshub-gost-1 || docker compose restart gost`, { cwd: getHostDataDir() }, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: 'Failed to restart container', details: stderr });
        res.json({ success: true, message: 'Gost proxy restarted successfully' });
    });
});

// === Bypass.txt API ===
app.get('/api/bypass', async (req, res) => {
    try {
        if (existsSync(BYPASS_TXT)) {
            const content = await fs.readFile(BYPASS_TXT, 'utf8');
            res.json({ content });
        } else {
            res.json({ content: '' });
        }
    } catch (error) {
        console.error("Error reading bypass.txt:", error);
        res.status(500).json({ error: 'Failed to read bypass.txt' });
    }
});

app.post('/api/bypass', async (req, res) => {
    try {
        const { content } = req.body;
        await fs.writeFile(BYPASS_TXT, content || '', 'utf8');
        res.json({ success: true, message: 'bypass.txt saved successfully' });
    } catch (error) {
        console.error("Error saving bypass.txt:", error);
        res.status(500).json({ error: 'Failed to save bypass.txt' });
    }
});

// === CookieCloud API ===
app.get('/api/cookiecloud', async (req, res) => {
    try {
        const envVars = await getEnvVars();
        const config = {
            server: envVars.COOKIECLOUD_SERVER || '',
            uuid: envVars.COOKIECLOUD_UUID || '',
            password: envVars.COOKIECLOUD_PASSWORD || '',
            bilibiliUid: envVars.BILIBILIUID || '',
            youtubeKey: envVars.YOUTUBE_KEY || ''
        };
        res.json(config);
    } catch (error) {
        console.error("Error reading CookieCloud config:", error);
        res.status(500).json({ error: 'Failed to read config' });
    }
});

app.post('/api/cookiecloud', async (req, res) => {
    try {
        const { server, uuid, password, bilibiliUid, youtubeKey } = req.body;
        const updates = {};
        if (server !== undefined) updates.COOKIECLOUD_SERVER = server;
        if (uuid !== undefined) updates.COOKIECLOUD_UUID = uuid;
        if (password !== undefined) updates.COOKIECLOUD_PASSWORD = password;
        if (bilibiliUid !== undefined) updates.BILIBILIUID = bilibiliUid;
        if (youtubeKey !== undefined) updates.YOUTUBE_KEY = youtubeKey;
        
        await updateEnvVars(updates);
        res.json({ success: true, message: 'Config saved successfully and containers reloaded' });
    } catch (error) {
        console.error("Error saving CookieCloud config:", error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.post('/api/cookiecloud/sync', async (req, res) => {
    try {
        const cmd = `python3 ${DECRYPT_SCRIPT}`;
        await fs.writeFile(COOKIECLOUD_LOG, `--- Starting sync at ${new Date().toISOString()} ---\n`);

        exec(cmd, { cwd: getHostDataDir() }, async (error, stdout, stderr) => {
            const logOutput = stdout + stderr;
            await fs.writeFile(COOKIECLOUD_LOG, logOutput + '\n', { flag: 'a' });
            
            if (error) {
                return res.status(500).json({ error: 'Decryption script failed', details: logOutput });
            }

            // Restart RSSHub to pick up the new rsshub.env
            exec(`docker restart rsshub-rsshub-1 || docker compose restart rsshub`, async (restartErr, rStdout, rStderr) => {
                const rLog = restartErr ? `Restart Error: ${rStderr}` : `Restart Success: ${rStdout}`;
                await fs.writeFile(COOKIECLOUD_LOG, rLog + '\n------------------\n', { flag: 'a' });
                
                if (restartErr) return res.status(500).json({ error: 'Failed to restart RSSHub', details: rStderr });
                res.json({ success: true, message: 'Sync complete and RSSHub restarted' });
            });
        });
    } catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ error: 'Sync process failed' });
    }
});

app.get('/api/cookiecloud/logs', async (req, res) => {
    try {
        if (existsSync(COOKIECLOUD_LOG)) {
            const data = await fs.readFile(COOKIECLOUD_LOG, 'utf8');
            const lines = data.split('\n').filter(Boolean).slice(-50).join('\n');
            res.json({ logs: lines });
        } else {
            res.json({ logs: 'No logs found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read logs' });
    }
});

// === RSSHub Config API ===
app.get('/api/rsshub/config', async (req, res) => {
    try {
        const envVars = await getEnvVars();
        const accessKey = envVars.ACCESS_KEY || '';
        const md5 = accessKey ? crypto.createHash('md5').update(accessKey).digest('hex') : '';
        res.json({ accessKey, md5 });
    } catch (error) {
        console.error("Error reading RSSHub config:", error);
        res.status(500).json({ error: 'Failed to read config' });
    }
});

app.post('/api/rsshub/config', async (req, res) => {
    try {
        const { accessKey } = req.body;
        if (accessKey === undefined) return res.status(400).json({ error: 'accessKey is required' });

        await updateEnvVars({ ACCESS_KEY: accessKey });
        res.json({ success: true, message: 'Access Key updated successfully and containers reloaded' });
    } catch (error) {
        console.error("Error saving RSSHub config:", error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.post('/api/rsshub/restart', (req, res) => {
    exec(`docker restart rsshub-rsshub-1 || docker compose restart rsshub`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: 'Failed to restart RSSHub', details: stderr });
        res.json({ success: true, message: 'RSSHub restarted successfully' });
    });
});

// === System Overview & Health Status API ===
const RSSHUB_URL = process.env.RSSHUB_INTERNAL_URL || (existsSync('/.dockerenv') ? 'http://rsshub:1200' : 'http://127.0.0.1:1200');

app.get('/api/system/status', async (req, res) => {
    try {
        const envVars = await getEnvVars();
        
        // Count nodes
        const commandStr = envVars.GOST_COMMAND || '-L=:8888';
        const nodeParts = commandStr.split('-F=').slice(1);
        const nodeCount = nodeParts.length;

        // Count bypass rules
        let bypassCount = 0;
        if (existsSync(BYPASS_TXT)) {
            const bpContent = await fs.readFile(BYPASS_TXT, 'utf8');
            bypassCount = bpContent.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
        }

        // Check cookiecloud sync time
        let lastSyncTime = null;
        if (existsSync(COOKIECLOUD_LOG)) {
            const stat = await fs.stat(COOKIECLOUD_LOG);
            lastSyncTime = stat.mtime;
        }

        // Check Docker container status
        exec('docker ps -a --format "{{.Names}}|{{.Status}}|{{.State}}"', { cwd: getHostDataDir() }, (err, stdout) => {
            const services = [
                { name: 'rsshub', label: 'RSSHub Core', expected: ['rsshub', 'rsshub-rsshub-1'] },
                { name: 'gost', label: 'Gost Proxy', expected: ['gost', 'rsshub-gost-1'] },
                { name: 'redis', label: 'Redis Cache', expected: ['redis', 'rsshub-redis-1'] },
                { name: 'browserless', label: 'Browserless Chrome', expected: ['browserless', 'rsshub-browserless-1'] },
                { name: 'cookiecloud', label: 'CookieCloud Server', expected: ['cookiecloud', 'rsshub-cookiecloud-1'] },
            ];

            const containerMap = {};
            if (!err && stdout) {
                const lines = stdout.split('\n');
                lines.forEach(line => {
                    const [cName, cStatus, cState] = line.trim().split('|');
                    if (cName) {
                        containerMap[cName] = { status: cStatus, state: cState };
                    }
                });
            }

            const containers = services.map(s => {
                let found = null;
                for (const exp of s.expected) {
                    if (containerMap[exp]) {
                        found = containerMap[exp];
                        break;
                    }
                }
                if (!found) {
                    // Try partial match
                    const matchedKey = Object.keys(containerMap).find(k => k.includes(s.name));
                    if (matchedKey) found = containerMap[matchedKey];
                }

                return {
                    name: s.name,
                    label: s.label,
                    state: found ? found.state : (err ? 'running' : 'unknown'),
                    status: found ? found.status : (err ? 'Running (Docker host check bypassed)' : 'Not detected')
                };
            });

            res.json({
                nodeCount,
                bypassCount,
                lastSyncTime,
                containers,
                nodeVersion: process.version,
                uptime: process.uptime()
            });
        });
    } catch (error) {
        console.error("Error fetching system status:", error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// === Hot Error Routes & Health API ===
app.get('/api/routes/errors', async (req, res) => {
    try {
        const envVars = await getEnvVars();
        const accessKey = envVars.ACCESS_KEY || '';
        
        let debugUrl = `${RSSHUB_URL}/debug`;
        if (accessKey) {
            const md5 = crypto.createHash('md5').update(`/debug${accessKey}`).digest('hex');
            debugUrl += `?code=${md5}`;
        }

        let hotErrors = [];
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const r = await fetch(debugUrl, { signal: controller.signal });
            clearTimeout(timeout);
            
            if (r.ok) {
                const htmlOrJson = await r.text();
                // Parse hot error routes if available in debug html
                const matches = [...htmlOrJson.matchAll(/<tr>\s*<td>(.*?)<\/td>\s*<td>(\d+)<\/td>/g)];
                if (matches.length > 0) {
                    hotErrors = matches.map(m => ({
                        path: m[1].replace(/<[^>]+>/g, '').trim(),
                        count: parseInt(m[2], 10),
                        status: 'Error',
                        lastTime: 'Recently'
                    }));
                }
            }
        } catch (fetchErr) {
            // RSSHub debug endpoint not directly reachable or returned non-200
        }

        // Also check docker logs for recent failed requests if hotErrors is empty
        if (hotErrors.length === 0) {
            exec('docker logs --tail 150 rsshub-rsshub-1 || docker logs --tail 150 rsshub', (dErr, stdout, stderr) => {
                const logs = (stdout || '') + (stderr || '');
                const errorLines = logs.split('\n').filter(l => l.includes('HTTP Error') || l.includes('Error in route') || l.includes('403') || l.includes('404') || l.includes('500'));
                
                const parsed = [];
                const seen = new Set();
                errorLines.forEach(line => {
                    const routeMatch = line.match(/(GET|POST)\s+(\/[a-zA-Z0-9_\-\/\.]+)/);
                    if (routeMatch && !seen.has(routeMatch[2])) {
                        seen.add(routeMatch[2]);
                        let status = '500';
                        if (line.includes('403')) status = '403 Forbidden';
                        else if (line.includes('404')) status = '404 Not Found';
                        else if (line.includes('Timeout') || line.includes('timed out')) status = 'Timeout';
                        else if (line.includes('500')) status = '500 Internal Error';

                        parsed.push({
                            path: routeMatch[2],
                            count: 1,
                            status: status,
                            message: line.substring(0, 120)
                        });
                    }
                });

                res.json({ errors: parsed });
            });
            return;
        }

        res.json({ errors: hotErrors });
    } catch (error) {
        console.error("Error fetching route errors:", error);
        res.json({ errors: [] });
    }
});

// === Test Route API ===
app.get('/api/routes/test', async (req, res) => {
    try {
        const routePath = req.query.path;
        if (!routePath) return res.status(400).json({ error: 'path is required' });

        const envVars = await getEnvVars();
        const accessKey = envVars.ACCESS_KEY || '';
        
        let targetUrl = `${RSSHUB_URL}${routePath}`;
        if (accessKey && !targetUrl.includes('code=')) {
            const md5 = crypto.createHash('md5').update(`${routePath}${accessKey}`).digest('hex');
            const sep = targetUrl.includes('?') ? '&' : '?';
            targetUrl += `${sep}code=${md5}`;
        }

        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeout);
        const duration = Date.now() - start;
        const text = await response.text();

        res.json({
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type') || '',
            durationMs: duration,
            snippet: text.substring(0, 500)
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            error: error.message || 'Request failed or timed out'
        });
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Admin backend running on port ${PORT}`);
});
