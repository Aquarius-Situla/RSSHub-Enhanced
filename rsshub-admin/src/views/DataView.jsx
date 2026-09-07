import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';
import SFSymbol from '../components/SFSymbols.jsx';

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
      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* Sync SubView */}
      {activeSubTab === 'sync' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('CookieCloud Server Credentials', 'CookieCloud 账号与服务连接')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-blue">
                    <SFSymbol name="network" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Server Endpoint', '服务地址')}</span>
                    <span className="setting-desc">{t('Self-hosted or official CookieCloud endpoint', 'CookieCloud 容器地址')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="ios-input"
                    value={config.server || ''}
                    onChange={e => setConfig({ ...config, server: e.target.value })}
                    placeholder="http://cookiecloud:8088"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-purple">
                    <SFSymbol name="key.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">UUID</span>
                    <span className="setting-desc">{t('CookieCloud browser extension user UUID', 'CookieCloud 扩展端生成的设备唯一识别码')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--sys-mono)', fontSize: '13px' }}
                    value={config.uuid || ''}
                    onChange={e => setConfig({ ...config, uuid: e.target.value })}
                    placeholder="e.g. 550e8400-e29b-41d4-..."
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-teal">
                    <SFSymbol name="lock.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('End-to-End Password', '端对端加密密码')}</span>
                    <span className="setting-desc">{t('AES decryption password for synced cookies', '用于本地运行 decrypt.py 解密 Cookie 数据')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="password"
                    className="ios-input"
                    value={config.password || ''}
                    onChange={e => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn secondary"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? t('Syncing...', '同步中...') : t('Force Sync Now', '立即执行解密同步')}
              </button>
              <button
                type="button"
                className="ios-btn primary"
                onClick={handleSaveCookieCloud}
                disabled={saving}
              >
                {saving ? t('Saving...', '保存中...') : t('Save Credentials', '保存配置')}
              </button>
            </div>
          </div>

          {/* Decrypt & Sync Console Viewer */}
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', paddingLeft: '14px', paddingRight: '14px' }}>
              <div className="settings-section-header" style={{ margin: 0, padding: 0 }}>
                {t('Console Output (update_cookies.log)', '解密执行控制台日志 (update_cookies.log)')}
              </div>
              <button
                type="button"
                className="ios-btn secondary"
                style={{ padding: '3px 8px', fontSize: '11.5px' }}
                onClick={fetchLogs}
              >
                {t('Refresh Log', '刷新日志')}
              </button>
            </div>

            <div className="settings-card" style={{ padding: '14px', background: 'rgba(20, 20, 22, 0.95)' }}>
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'var(--sys-mono)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.85)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {logs || t('# No logs recorded yet or log file empty.', '# 暂无日志输出或日志文件为空。')}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Keys SubView */}
      {activeSubTab === 'keys' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('Decoupled Platform API Keys', '独立第三方平台凭据')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-blue">
                    <SFSymbol name="safari.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Bilibili VIP UID (BILIBILIUID)', 'B站大会员 UID')}</span>
                    <span className="setting-desc">{t('Used for 1080P+ high-resolution video streams', '用于 Bilibili 订阅获取 1080P 高清画质')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--sys-mono)' }}
                    value={config.bilibiliUid || ''}
                    onChange={e => setConfig({ ...config, bilibiliUid: e.target.value })}
                    placeholder="e.g. 2267573"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-red">
                    <SFSymbol name="key.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('YouTube Data API Key (YOUTUBE_KEY)', 'YouTube Data API 密钥')}</span>
                    <span className="setting-desc">{t('Official Google Cloud Console Data API v3 key', '用于 YouTube 频道与视频列表稳定订阅')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--sys-mono)', fontSize: '12.5px' }}
                    value={config.youtubeKey || ''}
                    onChange={e => setConfig({ ...config, youtubeKey: e.target.value })}
                    placeholder="AIzaSy..."
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn primary"
                onClick={handleSaveKeys}
                disabled={saving}
              >
                {saving ? t('Saving...', '保存中...') : t('Save API Keys', '保存平台凭据')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataView;
