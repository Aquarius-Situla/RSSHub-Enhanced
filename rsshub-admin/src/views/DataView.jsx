import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';

export function DataView({ t, showToast, initialSubTab, isMobile }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'sync');
  const [config, setConfig] = useState({
    server: '',
    uuid: '',
    password: '',
    bilibiliUid: '',
    youtubeKey: ''
  });
  const [logs, setLogs] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    fetch('api/cookiecloud')
      .then(r => r.json())
      .then(d => {
        setConfig(d);
        setLoading(false);
      });
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = () => {
    fetch('api/cookiecloud/logs')
      .then(r => r.json())
      .then(d => setLogs(d.logs || ''));
  };

  const handleSaveCookieCloud = async () => {
    setSaving(true);
    try {
      await fetch('api/cookiecloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: config.server,
          uuid: config.uuid,
          password: config.password
        })
      });
      showToast(t('CookieCloud credentials saved!', 'CookieCloud 连接凭据已保存！'));
    } catch (e) {
      showToast(t('Failed to save credentials', '保存凭据失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKeys = async () => {
    setSaving(true);
    try {
      await fetch('api/cookiecloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bilibiliUid: config.bilibiliUid,
          youtubeKey: config.youtubeKey
        })
      });
      showToast(t('Platform API Keys saved!', '第三方平台凭据已保存并生效！'));
    } catch (e) {
      showToast(t('Failed to save API Keys', '保存平台凭据失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!window.confirm(t('Execute decrypt script and restart RSSHub?', '执行解密脚本并重启 RSSHub？'))) return;
    setSyncing(true);
    try {
      await fetch('api/cookiecloud/sync', { method: 'POST' });
      showToast(t('Sync executed successfully!', 'CookieCloud 同步执行完成！'));
      fetchLogs();
    } catch (e) {
      showToast(t('Sync execution failed', '同步执行失败'));
    } finally {
      setSyncing(false);
    }
  };

  const segmentedOptions = [
    { key: 'sync', label: isMobile ? t('Sync', '同步') : t('CookieCloud Sync', 'Cookie 同步') },
    { key: 'keys', label: isMobile ? t('Keys', '密钥') : t('Platform Keys', '平台凭据') }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('Data Sources & Sync Hub', '数据源与凭证中心')}</h1>
        <p className="page-subtitle">{t('Manage CookieCloud automatic decryption and platform API tokens', '管理 CookieCloud 自动解密服务与第三方平台认证凭证')}</p>
      </div>

      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* CookieCloud Sync SubView */}
      {activeSubTab === 'sync' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('CookieCloud Server Credentials', 'CookieCloud 连接凭证')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-orange">
                    <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Server URL', '服务器地址')}</span>
                    <span className="setting-desc">{t('CookieCloud instance endpoint (e.g. http://...)', 'CookieCloud 服务的 HTTP/HTTPS 地址')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '45%' }}>
                  <input
                    className="ios-input"
                    value={config.server}
                    onChange={e => setConfig({ ...config, server: e.target.value })}
                    placeholder="https://cookiecloud.example.com"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-blue">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">UUID</span>
                    <span className="setting-desc">{t('Target account identifier', '用于拉取加密数据的用户唯一标识符')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '45%' }}>
                  <input
                    className="ios-input"
                    value={config.uuid}
                    onChange={e => setConfig({ ...config, uuid: e.target.value })}
                    placeholder="b17ER..."
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-purple">
                    <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Decryption Password', '解密密码')}</span>
                    <span className="setting-desc">{t('AES decryption secret key', '用于客户端解密的端对端通信密码')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '45%' }}>
                  <input
                    className="ios-input"
                    type="password"
                    value={config.password}
                    onChange={e => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
            <button className="ios-btn secondary" onClick={handleSaveCookieCloud} disabled={saving}>
              💾 {saving ? t('Saving...', '保存中...') : t('Save Credentials', '保存凭证')}
            </button>
            <button className="ios-btn primary" onClick={handleSync} disabled={syncing}>
              🔄 {syncing ? t('Syncing...', '正在同步...') : t('Force Sync & Reload', '立即解密并同步')}
            </button>
          </div>

          {/* Terminal Logs Viewer */}
          <div className="settings-section">
            <div className="settings-section-header">{t('Decryption & Sync Log (Console)', '同步与解密控制台日志')}</div>
            <div className="apple-terminal">
              <div className="apple-terminal-header">
                <div className="terminal-dots">
                  <div className="terminal-dot dot-red"></div>
                  <div className="terminal-dot dot-yellow"></div>
                  <div className="terminal-dot dot-green"></div>
                </div>
                <div className="terminal-title">update_cookies.log</div>
                <button
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}
                  onClick={fetchLogs}
                >
                  🔄
                </button>
              </div>
              <div className="apple-terminal-body">
                {logs || t('No synchronization logs recorded yet.', '暂无同步与解密执行日志。')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Keys SubView */}
      {activeSubTab === 'keys' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('Third-Party Service Tokens', '第三方平台认证配置')}</div>
            <div className="settings-card">
              {/* YouTube Key */}
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-red">
                    <svg viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('YouTube Data API v3 Key', 'YouTube API 密钥 (YOUTUBE_KEY)')}</span>
                    <span className="setting-desc">
                      {t('Used for YouTube channels/playlists without bot verification blocks', '用于 YouTube 频道与视频 RSS 解析，防止触发机器人拦截')}
                    </span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '45%' }}>
                  <input
                    className="ios-input"
                    value={config.youtubeKey || ''}
                    onChange={e => setConfig({ ...config, youtubeKey: e.target.value })}
                    placeholder={t('Leave blank if not needed...', '未配置时留空...')}
                  />
                </div>
              </div>

              {/* Bilibili UID */}
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-teal">
                    <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Bilibili UID (BILIBILIUID)', 'Bilibili 账号 UID')}</span>
                    <span className="setting-desc">
                      {t('Matched as BILIBILI_COOKIE_{uid} during automatic cookie injection', '同步时将自动将对应 Cookie 映射至 BILIBILI_COOKIE_{uid}')}
                    </span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '45%' }}>
                  <input
                    className="ios-input"
                    value={config.bilibiliUid || ''}
                    onChange={e => setConfig({ ...config, bilibiliUid: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="ios-btn primary" onClick={handleSaveKeys} disabled={saving}>
              💾 {saving ? t('Saving...', '保存中...') : t('Save API Keys', '保存平台凭据')}
            </button>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="ios-btn secondary"
            >
              🔑 {t('Get Google API Key ↗', '申请 Google API 密钥 ↗')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataView;
