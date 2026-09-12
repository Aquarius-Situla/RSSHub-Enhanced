/* ============================================================================
 * DataView.jsx — AquaKit CookieCloud Sync & Platform API Credentials
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React, { useState, useEffect } from 'react';
import SFSymbol from '../components/SFSymbols.jsx';
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleButton,
  AppleNavStack
} from '../components/AquaKit.jsx';
import telemetryCache from '../utils/telemetryCache.js';

export function DataView({ t, showToast, subTab, onSelectSubTab, onBack }) {
  const cachedCookieCloud = telemetryCache.get('cookiecloud') || {};

  const [config, setConfig] = useState({
    server: cachedCookieCloud.server || '',
    uuid: cachedCookieCloud.uuid || '',
    password: cachedCookieCloud.password || '',
    bilibiliUid: cachedCookieCloud.bilibiliUid || '',
    youtubeKey: cachedCookieCloud.youtubeKey || ''
  });
  const [logs, setLogs] = useState(cachedCookieCloud.logs || '');
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!cachedCookieCloud.server);

  useEffect(() => {
    fetch('api/cookiecloud')
      .then(r => r.json())
      .then(d => {
        setConfig(prev => ({ ...prev, ...d }));
        telemetryCache.set('cookiecloud', { ...(telemetryCache.get('cookiecloud') || {}), ...d });
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = () => {
    fetch('api/cookiecloud/logs')
      .then(r => r.json())
      .then(d => {
        setLogs(d.logs || '');
        telemetryCache.set('cookiecloud', { ...(telemetryCache.get('cookiecloud') || {}), logs: d.logs || '' });
      })
      .catch(() => {});
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
    if (!window.confirm(t('Execute decrypt script and restart RSSHub?', '确定执行解密脚本并注入 Cookie 吗？'))) return;
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

  /* Root View: Data & Credentials Navigation List */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Data & Credentials Sync', '数据与凭据同步 (DATA & CREDENTIALS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="orange" icon={<SFSymbol name="cylinder.split.1x2.fill" size={17} />} />}
            label="CookieCloud"
            sublabel={t('Auto decrypt & inject cookies into RSSHub', '自动解密并注入 Cookie 凭据')}
            value={t('Active', '自动解密注入')}
            chevron={true}
            onClick={() => onSelectSubTab('sync')}
          />
          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="key.fill" size={17} />} />}
            label={t('Platform API Keys', '平台 API 凭据')}
            sublabel={t('Bilibili UID, YouTube API keys', '多平台账号 UID 与开发者 Key')}
            value={t('Configured', '多平台授权')}
            chevron={true}
            onClick={() => onSelectSubTab('keys')}
          />
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: CookieCloud */
  const syncSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup
        header={t('CookieCloud Server Credentials', 'CookieCloud 账号与服务连接 (CREDENTIALS)')}
        footer={t(
          'CookieCloud enables encrypted end-to-end sync between browser extensions and RSSHub. The local decrypt script decodes session credentials automatically.',
          'CookieCloud 用于在加密服务端与本地 RSSHub 之间安全同步各平台 Cookie 凭据。解密脚本将通过端到端口令恢复 Session 数据。'
        )}
      >
        <AppleCard>
          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left" style={{ minWidth: '105px', flexShrink: 0 }}>
              <AppleBadge color="blue" icon={<SFSymbol name="network" size={16} />} />
              <span className="apple-row-label">{t('Server', '服务地址')}</span>
            </div>
            <div className="apple-row-right" style={{ flex: 1 }}>
              <input
                type="text"
                className="apple-form-input"
                value={config.server || ''}
                onChange={e => setConfig({ ...config, server: e.target.value })}
                placeholder="https://cookiecloud.example.com"
              />
            </div>
          </div>

          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left" style={{ minWidth: '105px', flexShrink: 0 }}>
              <AppleBadge color="teal" icon={<SFSymbol name="person.crop.circle" size={16} />} />
              <span className="apple-row-label">UUID</span>
            </div>
            <div className="apple-row-right" style={{ flex: 1 }}>
              <input
                type="text"
                className="apple-form-input"
                value={config.uuid || ''}
                onChange={e => setConfig({ ...config, uuid: e.target.value })}
                placeholder="用户识别码 UUID"
              />
            </div>
          </div>

          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left" style={{ minWidth: '105px', flexShrink: 0 }}>
              <AppleBadge color="indigo" icon={<SFSymbol name="lock.fill" size={16} />} />
              <span className="apple-row-label">{t('Password', '端到端密码')}</span>
            </div>
            <div className="apple-row-right" style={{ flex: 1 }}>
              <input
                type="password"
                className="apple-form-input"
                value={config.password || ''}
                onChange={e => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
        </AppleCard>

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <AppleButton
            variant="secondary"
            size="md"
            style={{ flex: 1 }}
            onClick={handleSaveCookieCloud}
            disabled={saving}
          >
            {saving ? t('Saving...', '保存中...') : t('Save Credentials', '保存凭据')}
          </AppleButton>
          <AppleButton
            variant="primary"
            size="md"
            style={{ flex: 1 }}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? t('Syncing...', '解密同步中...') : t('Sync Now', '立即同步解密')}
          </AppleButton>
        </div>
      </AppleGroup>

      <AppleGroup header={t('Decryption Execution Logs', '解密执行日志 (DECRYPT LOGS)')}>
        <div className="apple-terminal-card">
          <div className="apple-terminal-header">
            <div className="apple-terminal-dots">
              <span className="apple-terminal-dot dot-red" />
              <span className="apple-terminal-dot dot-yellow" />
              <span className="apple-terminal-dot dot-green" />
            </div>
            <span className="apple-terminal-title">decrypt.py — stdout</span>
          </div>
          <pre className="apple-terminal-body">
            {logs || t('No logs yet. Tap "Sync Now" to run decrypt script.', '暂无解密日志。请点击上方「立即同步解密」执行解密。')}
          </pre>
        </div>
      </AppleGroup>
    </div>
  );

  /* Subpage: Platform API Keys */
  const keysSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup
        header={t('Platform API Keys', '第三方平台授权凭据 (PLATFORM API KEYS)')}
        footer={t(
          'Configuring official platform API credentials increases request rate limits and prevents anti-scraping blocks on external services.',
          '配置官方平台授权凭据可有效提高网络抓取配额，避免频繁请求触发第三方风控或访问速率限制。'
        )}
      >
        <AppleCard>
          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left" style={{ minWidth: '115px', flexShrink: 0 }}>
              <AppleBadge color="blue" icon={<SFSymbol name="play.circle.fill" size={16} />} />
              <span className="apple-row-label">{t('Bilibili UID', '哔哩哔哩 UID')}</span>
            </div>
            <div className="apple-row-right" style={{ flex: 1 }}>
              <input
                type="text"
                className="apple-form-input"
                value={config.bilibiliUid || ''}
                onChange={e => setConfig({ ...config, bilibiliUid: e.target.value })}
                placeholder="2267573"
              />
            </div>
          </div>

          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left" style={{ minWidth: '115px', flexShrink: 0 }}>
              <AppleBadge color="red" icon={<SFSymbol name="key.fill" size={16} />} />
              <span className="apple-row-label">{t('YouTube Key', 'YouTube 密钥')}</span>
            </div>
            <div className="apple-row-right" style={{ flex: 1 }}>
              <input
                type="text"
                className="apple-form-input"
                value={config.youtubeKey || ''}
                onChange={e => setConfig({ ...config, youtubeKey: e.target.value })}
                placeholder="AIzaSy..."
              />
            </div>
          </div>
        </AppleCard>

        <div style={{ marginTop: '12px' }}>
          <AppleButton
            variant="primary"
            size="md"
            style={{ width: '100%' }}
            onClick={handleSaveKeys}
            disabled={saving}
          >
            {saving ? t('Saving...', '保存中...') : t('Save API Keys', '保存平台凭据')}
          </AppleButton>
        </div>
      </AppleGroup>
    </div>
  );

  return (
    <AppleNavStack
      activeSubpage={subTab}
      onBack={onBack || (() => onSelectSubTab(null))}
      rootView={rootView}
      subpages={{
        sync: syncSubpage,
        keys: keysSubpage
      }}
    />
  );
}

export default DataView;
