import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { parseDocument } from 'yaml';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

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

// === Proxy Nodes API ===
app.get('/api/nodes', async (req, res) => {
    try {
        const composePath = getComposePath();
        const file = await fs.readFile(composePath, 'utf8');
        const doc = parseDocument(file);
        
        const gostCommand = doc.getIn(['services', 'gost', 'command']);
        if (!gostCommand) return res.json({ nodes: [] });

        const lines = typeof gostCommand === 'string' ? gostCommand.split('\n') : gostCommand.items.map(i => i.value);
        const nodes = lines.map(line => line.trim())
            .filter(line => line.startsWith('-F='))
            .map(line => {
                const match = line.match(/-F=rr:\/\/([^\s\?]+)(.*)/);
                if (match) {
                    let fullUrl = match[1];
                    let url = fullUrl;
                    let auth = '';
                    if (fullUrl.includes('@')) {
                        const parts = fullUrl.split('@');
                        auth = parts[0];
                        url = parts[1];
                    }
                    const paramsStr = match[2].trim();
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
                    return { url, auth, maxFails, failTimeout, bypass, rawParams: paramsStr };
                }
                const fallbackMatch = line.match(/-F=rr:\/\/([^\s]+)/);
                if (fallbackMatch) {
                    let fullUrl = fallbackMatch[1];
                    let url = fullUrl;
                    let auth = '';
                    if (fullUrl.includes('@')) {
                        const parts = fullUrl.split('@');
                        auth = parts[0];
                        url = parts[1];
                    }
                    return { url, auth, maxFails: '3', failTimeout: '30s', bypass: false, rawParams: '' };
                }
                return { url: line.replace('-F=', '').replace('rr://', ''), auth: '', maxFails: '3', failTimeout: '30s', bypass: false, rawParams: '' };
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

        const composePath = getComposePath();
        const file = await fs.readFile(composePath, 'utf8');
        const doc = parseDocument(file);
        
        let gostCommand = doc.getIn(['services', 'gost', 'command']);
        if (gostCommand === undefined) return res.status(400).json({ error: 'gost service command not found' });

        const currentLines = typeof gostCommand === 'string' ? gostCommand.split('\n') : gostCommand.items.map(i => i.value);
        const baseLines = currentLines.filter(line => !line.trim().startsWith('-F='));
        const newNodesLines = nodes.map(node => {
            // Build the params string
            let p = `?max_fails=${node.maxFails || 3}&fail_timeout=${node.failTimeout || '30s'}`;
            if (node.bypass) p += ' -bypass=/bypass.txt';
            // ensure we don't double prepend rr://
            const ipPort = node.url.replace('rr://', '');
            const authStr = node.auth ? `${node.auth}@` : '';
            return `-F=rr://${authStr}${ipPort}${p}`;
        });
        
        const newCommandBlock = [...baseLines, ...newNodesLines].join('\n');
        doc.setIn(['services', 'gost', 'command'], newCommandBlock);
        
        await fs.writeFile(composePath, doc.toString({ lineWidth: 0 }), 'utf8');
        res.json({ success: true, message: 'Nodes updated successfully' });
    } catch (error) {
        console.error("Error updating nodes:", error);
        res.status(500).json({ error: 'Failed to update docker-compose.yml' });
    }
});

app.post('/api/restart', (req, res) => {
    const composePath = getComposePath();
    exec(`docker restart rsshub-gost-1 || docker compose -f ${composePath} restart gost`, (error, stdout, stderr) => {
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
        let config = { server: '', uuid: '', password: '', bilibiliUid: '', youtubeKey: '' };
        if (existsSync(COOKIECLOUD_CONFIG)) {
            const data = await fs.readFile(COOKIECLOUD_CONFIG, 'utf8');
            config = { ...config, ...JSON.parse(data) };
        }
        
        const composePath = getComposePath();
        const file = await fs.readFile(composePath, 'utf8');
        const doc = parseDocument(file);
        let envs = doc.getIn(['services', 'rsshub', 'environment']);
        if (envs) {
            const envArray = typeof envs === 'string' ? envs.split('\n') : envs.items.map(i => i.value || i.toString());
            const keyLine = envArray.find(line => line.startsWith('YOUTUBE_KEY='));
            if (keyLine) {
                config.youtubeKey = keyLine.replace('YOUTUBE_KEY=', '').trim();
            }
        }
        
        res.json(config);
    } catch (error) {
        console.error("Error reading CookieCloud config:", error);
        res.status(500).json({ error: 'Failed to read config' });
    }
});

app.post('/api/cookiecloud', async (req, res) => {
    try {
        const { server, uuid, password, bilibiliUid, youtubeKey } = req.body;
        await fs.writeFile(COOKIECLOUD_CONFIG, JSON.stringify({ server, uuid, password, bilibiliUid }, null, 2));
        
        if (youtubeKey !== undefined) {
            const composePath = getComposePath();
            const file = await fs.readFile(composePath, 'utf8');
            const doc = parseDocument(file);
            let envs = doc.getIn(['services', 'rsshub', 'environment']);
            if (envs) {
                let envArray = typeof envs === 'string' ? envs.split('\n') : envs.items.map(i => i.value || i.toString());
                envArray = envArray.filter(line => !line.trim().startsWith('YOUTUBE_KEY='));
                if (youtubeKey) envArray.push(`YOUTUBE_KEY=${youtubeKey}`);
                doc.setIn(['services', 'rsshub', 'environment'], envArray);
                await fs.writeFile(composePath, doc.toString({ lineWidth: 0 }), 'utf8');
            }
        }
        
        res.json({ success: true, message: 'Config saved successfully' });
    } catch (error) {
        console.error("Error saving CookieCloud config:", error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.post('/api/cookiecloud/sync', async (req, res) => {
    try {
        let config = { server: '', uuid: '', password: '', bilibiliUid: '' };
        if (existsSync(COOKIECLOUD_CONFIG)) {
            config = JSON.parse(await fs.readFile(COOKIECLOUD_CONFIG, 'utf8'));
        }

        const env = { ...process.env, BILIBILIUID: config.bilibiliUid || '' };
        const cmd = `python3 ${DECRYPT_SCRIPT} "${config.server}" "${config.uuid}" "${config.password}"`;
        
        await fs.writeFile(COOKIECLOUD_LOG, `--- Starting sync at ${new Date().toISOString()} ---\n`, { flag: 'a' });

        exec(cmd, { env, cwd: getHostDataDir() }, async (error, stdout, stderr) => {
            const logOutput = stdout + stderr;
            await fs.writeFile(COOKIECLOUD_LOG, logOutput + '\n', { flag: 'a' });
            
            if (error) {
                return res.status(500).json({ error: 'Decryption script failed', details: logOutput });
            }

            // Restart RSSHub
            const composePath = getComposePath();
            exec(`docker restart rsshub-rsshub-1 || docker compose -f ${composePath} restart rsshub`, async (restartErr, rStdout, rStderr) => {
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
            // Return last 50 lines
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
        const composePath = getComposePath();
        const file = await fs.readFile(composePath, 'utf8');
        const doc = parseDocument(file);
        
        let envs = doc.getIn(['services', 'rsshub', 'environment']);
        let accessKey = '';
        
        if (envs) {
            const envArray = typeof envs === 'string' ? envs.split('\n') : envs.items.map(i => i.value || i.toString());
            const keyLine = envArray.find(line => line.startsWith('ACCESS_KEY='));
            if (keyLine) {
                accessKey = keyLine.replace('ACCESS_KEY=', '').trim();
            }
        }
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

        const composePath = getComposePath();
        const file = await fs.readFile(composePath, 'utf8');
        const doc = parseDocument(file);
        
        let envs = doc.getIn(['services', 'rsshub', 'environment']);
        if (envs) {
            let envArray = typeof envs === 'string' ? envs.split('\n') : envs.items.map(i => i.value || i.toString());
            // Remove existing
            envArray = envArray.filter(line => !line.trim().startsWith('ACCESS_KEY='));
            // Add new
            envArray.push(`ACCESS_KEY=${accessKey}`);
            
            doc.setIn(['services', 'rsshub', 'environment'], envArray);
            await fs.writeFile(composePath, doc.toString({ lineWidth: 0 }), 'utf8');
        }
        
        res.json({ success: true, message: 'Access Key updated successfully' });
    } catch (error) {
        console.error("Error saving RSSHub config:", error);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.post('/api/rsshub/restart', (req, res) => {
    const composePath = getComposePath();
    exec(`docker restart rsshub-rsshub-1 || docker compose -f ${composePath} restart rsshub`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: 'Failed to restart RSSHub', details: stderr });
        res.json({ success: true, message: 'RSSHub restarted successfully' });
    });
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
