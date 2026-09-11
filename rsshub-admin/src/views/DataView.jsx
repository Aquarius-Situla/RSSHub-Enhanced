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

export function DataView({ t, showToast, subTab, onSelectSubTab }) {
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

  /* Root View (2 Inset Grouped items) */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Data & Credentials Sync', '数据与凭据同步 (DATA & CREDENTIALS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="orange" icon={<SFSymbol name="cylinder.split.1x2.fill" size={17} />} />}
            label="CookieCloud"
            value={t('Auto Decrypt & Inject', '自动解密注入')}
            chevron={true}
            onClick={() => onSelectSubTab('sync')}
          />

          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="key.fill" size={17} />} />}
            label={t('Platform API Keys', '平台 API 凭据')}
            value={t('Multi-Platform Tokens', '多平台授权')}
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
      <AppleGroup header={t('CookieCloud Server Credentials', 'CookieCloud 账号与服务连接 (CREDENTIALS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="network" size={16} />} />}
            label={t('Server Endpoint', '服务地址')}
            sublabel={t('CookieCloud server URL', 'CookieCloud 部署服务器地址')}
            rightContent={
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '220px' }}
                value={config.server || ''}
                onChange={e => setConfig({ ...config, server: e.target.value })}
                placeholder="https://cookiecloud.example.com"
              />
            }
          />

          <AppleRow
            badge={<AppleBadge color="teal" icon={<SFSymbol name="person.crop.circle" size={16} />} />}
            label="UUID"
            sublabel={t('User Identification Key', '用户唯一识别码')}
            rightContent={
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '220px' }}
                value={config.uuid || ''}
                onChange={e => setConfig({ ...config, uuid: e.target.value })}
                placeholder="uuid..."
              />
            }
          />

          <AppleRow
            badge={<AppleBadge color="indigo" icon={<SFSymbol name="lock.fill" size={16} />} />}
            label={t('End-to-End Encryption Password', '端到端加密口令')}
            sublabel={t('Used for decrypt.py local AES decryption', '用于解密脚本本地恢复 Cookie')}
            rightContent={
              <input
                type="password"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '220px' }}
                value={config.password || ''}
                onChange={e => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
              />
            }
          />
        </AppleCard>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
          <AppleButton
            variant="secondary"
            size="md"
            onClick={handleSaveCookieCloud}
            disabled={saving}
          >
            {saving ? t('Saving...', '保存中...') : t('Save Credentials', '保存凭据')}
          </AppleButton>
          <AppleButton
            variant="primary"
            size="md"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? t('Syncing...', '解密同步中...') : t('Sync Now', '立即同步解密')}
          </AppleButton>
        </div>
      </AppleGroup>

      <AppleGroup header={t('Decryption Execution Logs', '解密执行日志 (DECRYPT LOGS)')}>
        <AppleCard style={{ padding: '14px' }}>
          <pre style={{
            margin: 0,
            fontFamily: 'var(--apple-font-mono)',
            fontSize: '12px',
            color: 'var(--apple-text-secondary)',
            maxHeight: '200px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.45
          }}>
            {logs || t('No logs yet. Click "Sync Now" to run decrypt script.', '暂无解密日志。请点击上方「立即同步解密」执行解密。')}
          </pre>
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Platform API Keys */
  const keysSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Platform API Keys', '第三方平台授权凭据 (PLATFORM API KEYS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="play.circle.fill" size={16} />} />}
            label={t('Bilibili UID (BILIBILI_COOKIE_UID)', '哔哩哔哩 用户 UID')}
            sublabel={t('Target account UID for dynamic feed fetch', '用于抓取特定账号动态与专属关注流')}
            rightContent={
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '220px' }}
                value={config.bilibiliUid || ''}
                onChange={e => setConfig({ ...config, bilibiliUid: e.target.value })}
                placeholder="2267573"
              />
            }
          />

          <AppleRow
            badge={<AppleBadge color="red" icon={<SFSymbol name="key.fill" size={16} />} />}
            label={t('YouTube Data API Key (YOUTUBE_KEY)', 'YouTube Data API 密钥')}
            sublabel={t('Official Google Cloud Console Data API v3 key', '用于 YouTube 频道与视频列表稳定订阅')}
            rightContent={
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '220px' }}
                value={config.youtubeKey || ''}
                onChange={e => setConfig({ ...config, youtubeKey: e.target.value })}
                placeholder="AIzaSy..."
              />
            }
          />
        </AppleCard>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <AppleButton
            variant="primary"
            size="md"
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
      onBack={() => onSelectSubTab(null)}
      rootView={rootView}
      subpages={{
        sync: syncSubpage,
        keys: keysSubpage
      }}
    />
  );
}

export default DataView;
