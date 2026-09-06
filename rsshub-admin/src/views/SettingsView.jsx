import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';

export function SettingsView({ t, showToast, initialSubTab, isMobile, currentLang, onLanguageChange, currentTheme, onThemeChange }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'security');
  const [accessKey, setAccessKey] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const fetchConfig = () => {
    fetch('api/rsshub/config')
      .then(r => r.json())
      .then(d => {
        setAccessKey(d.accessKey || '');
        setMd5Hash(d.md5 || '');
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleGenerateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessKey(result);
    showToast(t('Generated strong random Access Key!', '已生成高强度随机访问控制密钥！'));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('api/rsshub/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey })
      });
      const data = await res.json();
      showToast(data.message || t('Access Key updated successfully!', 'ACCESS_KEY 已更新并生效！'));
      fetchConfig();
    } catch (e) {
      showToast(t('Failed to save Access Key', '保存 ACCESS_KEY 失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestartRsshub = async () => {
    if (!window.confirm(t('Restart RSSHub container to apply changes?', '确定要重启 RSSHub 容器使配置即刻生效吗？'))) return;
    setRestarting(true);
    try {
      const res = await fetch('api/rsshub/restart', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || t('RSSHub restarted successfully!', 'RSSHub 容器重启完成！'));
    } catch (e) {
      showToast(t('Failed to restart RSSHub', '重启 RSSHub 失败'));
    } finally {
      setRestarting(false);
    }
  };

  const segmentedOptions = [
    { key: 'security', label: isMobile ? t('Security', '安全') : t('Access & Security', '安全控制') },
    { key: 'preferences', label: isMobile ? t('Preferences', '偏好') : t('System Preferences', '偏好设置') }
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('Security & System Preferences', '安全与系统设置')}</h1>
        <p className="page-subtitle">{t('Configure route access control keys, SSO protection, and display preferences', '配置 RSSHub 访问控制密钥、反代与单点登录安全策略及显示偏好')}</p>
      </div>

      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* Security SubView */}
      {activeSubTab === 'security' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('Access Control (ACCESS_KEY)', '访问控制与密钥管理')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-red">
                    <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Access Control Key (ACCESS_KEY)', '访问控制密钥 (ACCESS_KEY)')}</span>
                    <span className="setting-desc">{t('Protects your RSSHub instance from unauthorized scraping', '防止公开实例被未经授权的高频爬虫滥用消耗资源')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '50%' }}>
                  <input
                    className="ios-input"
                    style={{ fontFamily: 'var(--sys-mono)', fontSize: '13.5px' }}
                    value={accessKey}
                    onChange={e => setAccessKey(e.target.value)}
                    placeholder={t('Enter secure key...', '输入访问密钥...')}
                  />
                  <button
                    className="ios-btn secondary small"
                    onClick={handleGenerateRandomKey}
                    title={t('Generate strong random key', '生成强随机密钥')}
                  >
                    🎲
                  </button>
                </div>
              </div>

              {md5Hash && (
                <div className="setting-item">
                  <div className="setting-main">
                    <div className="ios-badge badge-indigo">
                      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    </div>
                    <div className="setting-info">
                      <span className="setting-title">{t('MD5 Digest (For ?code= authentication)', 'MD5 哈希校验指纹 (用于 ?code=)')}</span>
                      <span className="setting-desc">{t('Query parameter signature required when accessing protected routes', '在阅读器订阅地址后追加 ?code=md5(path + access_key)')}</span>
                    </div>
                  </div>
                  <div className="setting-accessory">
                    <span style={{ fontFamily: 'var(--sys-mono)', fontSize: '13px', background: 'var(--input-bg)', padding: '6px 12px', borderRadius: '6px', userSelect: 'all' }}>
                      {md5Hash}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
            <button className="ios-btn primary" onClick={handleSaveConfig} disabled={saving}>
              💾 {saving ? t('Saving...', '保存中...') : t('Save ACCESS_KEY', '保存访问密钥')}
            </button>
            <button className="ios-btn secondary" onClick={handleRestartRsshub} disabled={restarting}>
              🔄 {restarting ? t('Restarting...', '重启中...') : t('Restart RSSHub', '重启 RSSHub 生效')}
            </button>
          </div>

          {/* Reverse Proxy & SSO Advisory */}
          <div className="settings-section">
            <div className="settings-section-header">{t('SSO & Gateway Security (Situla Auth / NPM)', '单点登录与反向代理安全规范')}</div>
            <div className="settings-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '10px' }}>
                  🛡️ <strong>{t('Zero-File SSO Injection Support', '原生支持 Situla Auth / NPM 单点登录')}：</strong>
                  {t('This portal supports Zero-File SSO Injection via Nginx Proxy Manager. When deployed behind NPM with Situla Auth or HTTP Basic Auth, administration privileges are seamlessly verified at the gateway level.', '本管理系统无缝支持通过 Nginx Proxy Manager 配合 Situla Auth 容器实现零代码单点登录注入与网关层权限隔离。')}
                </p>
                <div style={{ background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '8px', fontFamily: 'var(--sys-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                  location ^~ /admin/ &#123; auth_basic "RSSHub-Admin"; auth_basic_user_file /data/access/1; &#125;
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences SubView */}
      {activeSubTab === 'preferences' && (
        <div>
          <div className="settings-section">
            <div className="settings-section-header">{t('Interface Display Preferences', '界面与显示偏好')}</div>
            <div className="settings-card">
              {/* Language Selection */}
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-blue">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Global Language', '界面语言 (Language)')}</span>
                    <span className="setting-desc">{t('System auto-detect or manual override', '自动根据浏览器指纹或强制指定显示语言')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <select
                    className="ios-input"
                    style={{ width: '130px', padding: '6px 10px', fontSize: '13.5px' }}
                    value={currentLang}
                    onChange={e => onLanguageChange(e.target.value)}
                  >
                    <option value="auto">{t('Auto (System)', '跟随系统')}</option>
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-purple">
                    <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Appearance Theme', '外观主题 (Appearance)')}</span>
                    <span className="setting-desc">{t('Apple dark mode or frosted light mode', '纯正深黑色暗黑模式或高通透浅色模式')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <select
                    className="ios-input"
                    style={{ width: '130px', padding: '6px 10px', fontSize: '13.5px' }}
                    value={currentTheme}
                    onChange={e => onThemeChange(e.target.value)}
                  >
                    <option value="auto">{t('Auto (System)', '跟随系统')}</option>
                    <option value="dark">{t('Dark (Apple Black)', '深色 (黑曜)')}</option>
                    <option value="light">{t('Light (Frosted)', '浅色 (清润)')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* System & Architecture Info */}
          <div className="settings-section">
            <div className="settings-section-header">{t('System & Architecture Info', '系统与架构信息')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-gray">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Application Version', '管理面板版本')}</span>
                    <span className="setting-desc">Apple HIG Design System Edition</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>v2.5.0 (sys-memorial core)</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-teal">
                    <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Underlying Stack', '技术底座与微服务架构')}</span>
                    <span className="setting-desc">Docker Compose / Node.js Express / Vite React 18</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <span style={{ fontSize: '13.5px', color: 'var(--green)', fontWeight: 600 }}>Active</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-orange">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Open Source License', '开源软件许可证')}</span>
                    <span className="setting-desc">GNU General Public License v3.0</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <a
                    href="https://github.com/Aquarius-Situla/RSSHub-Enhanced"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: 'var(--blue)' }}
                  >
                    GPL-3.0 ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsView;
