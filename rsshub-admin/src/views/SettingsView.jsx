import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';
import SFSymbol from '../components/SFSymbols.jsx';

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
                    <SFSymbol name="lock.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Current ACCESS_KEY', '当前访问控制密钥')}</span>
                    <span className="setting-desc">{t('Protects all RSS feeds from unauthorized scraping', '用于 RSS 路由参数鉴权防盗链 (?code=md5)')}</span>
                  </div>
                </div>
                <div className="setting-accessory" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--sys-mono)', fontSize: '13px' }}
                    value={accessKey}
                    onChange={e => setAccessKey(e.target.value)}
                    placeholder={t('Leave empty to disable auth', '留空则不开启访问限制')}
                  />
                </div>
              </div>

              {md5Hash && (
                <div className="setting-item">
                  <div className="setting-main">
                    <div className="ios-badge badge-gray">
                      <SFSymbol name="key.fill" size={16} />
                    </div>
                    <div className="setting-info">
                      <span className="setting-title">{t('Global MD5 Verification Code', '全局 MD5 鉴权摘要')}</span>
                      <span className="setting-desc" style={{ fontFamily: 'var(--sys-mono)', wordBreak: 'break-all' }}>
                        {md5Hash}
                      </span>
                    </div>
                  </div>
                  <div className="setting-accessory">
                    <button
                      type="button"
                      className="ios-btn secondary small"
                      onClick={() => {
                        navigator.clipboard.writeText(md5Hash);
                        showToast(t('MD5 hash copied to clipboard!', 'MD5 校验码已复制！'));
                      }}
                    >
                      {t('Copy', '复制')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="ios-btn secondary"
                onClick={handleGenerateRandomKey}
              >
                🎲 {t('Generate Random Key', '生成强随机密钥')}
              </button>
              <button
                type="button"
                className="ios-btn secondary"
                onClick={handleRestartRsshub}
                disabled={restarting}
              >
                {restarting ? t('Restarting...', '重启中...') : t('Restart RSSHub', '重启 RSSHub')}
              </button>
              <button
                type="button"
                className="ios-btn primary"
                onClick={handleSaveConfig}
                disabled={saving}
              >
                {saving ? t('Saving...', '保存中...') : t('Save ACCESS_KEY', '保存密钥')}
              </button>
            </div>
          </div>

          {/* Reverse Proxy & SSO Advisory Card */}
          <div className="settings-section">
            <div className="settings-section-header">{t('SSO & Reverse Proxy Architecture', '反向代理与单点登录架构')}</div>
            <div className="settings-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="ios-badge badge-blue">
                  <SFSymbol name="network" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>
                    {t('Situla Auth & Nginx Proxy Manager Integration', 'Situla Auth / NPM 反向代理接入指南')}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t(
                      'This management portal is decoupled on internal port 3000. For public access, route through Nginx Proxy Manager with Situla Auth forward authentication headers, keeping RSSHub RSS feed endpoints public and fast.',
                      '本管理门户运行于内部 3000 端口。推荐在 NPM 反代层挂载 Situla Auth 前置认证，管理控制台享受 SSO 保护的同时，外部 RSS 客户端订阅路由直接直通，兼顾极致安全与高速解析。'
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--sys-mono)' }}>
                npm: 127.0.0.1:81 ➔ Forward Auth: http://situla-auth:3000/api/verify ➔ upstream: rsshub-admin:3000
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences SubView */}
      {activeSubTab === 'preferences' && (
        <div>
          {/* Language Preference */}
          <div className="settings-section">
            <div className="settings-section-header">{t('Language & Region', '语言与地区')}</div>
            <div className="settings-card">
              <div className="setting-item" onClick={() => onLanguageChange('auto')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-teal">
                    <SFSymbol name="globe" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Follow System', '跟随系统语言')}</span>
                    <span className="setting-desc">{t('Detect browser language automatically', '自动匹配客户端系统首选语言')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentLang === 'auto' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>

              <div className="setting-item" onClick={() => onLanguageChange('zh')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-orange">
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>中</span>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">简体中文 (Simplified Chinese)</span>
                    <span className="setting-desc">中文界面显示</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentLang === 'zh' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>

              <div className="setting-item" onClick={() => onLanguageChange('en')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-indigo">
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>EN</span>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">English</span>
                    <span className="setting-desc">English user interface</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentLang === 'en' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Appearance */}
          <div className="settings-section">
            <div className="settings-section-header">{t('Appearance & Theme', '外观与主题')}</div>
            <div className="settings-card">
              <div className="setting-item" onClick={() => onThemeChange('auto')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-gray">
                    <SFSymbol name="slider.horizontal.3" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Auto (Match System)', '跟随系统外观')}</span>
                    <span className="setting-desc">{t('Switch automatically based on macOS / iOS system dark mode', '根据操作系统当前明暗模式自动无缝切换')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentTheme === 'auto' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>

              <div className="setting-item" onClick={() => onThemeChange('dark')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-blue">
                    <span style={{ fontSize: '14px' }}>🌙</span>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Dark Mode (Apple Black)', '深色模式 (纯黑/磨砂黑)')}</span>
                    <span className="setting-desc">{t('Authentic Apple OLED black and frosted glass', '原生 Apple 深黑毛玻璃风格')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentTheme === 'dark' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>

              <div className="setting-item" onClick={() => onThemeChange('light')} style={{ cursor: 'pointer' }}>
                <div className="setting-main">
                  <div className="ios-badge badge-yellow">
                    <span style={{ fontSize: '14px' }}>☀️</span>
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Light Mode (Frosted Light)', '浅色模式 (通透浅灰)')}</span>
                    <span className="setting-desc">{t('Crisp high-contrast Apple light mode', '清爽通透的高对比度 Apple 浅色')}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  {currentTheme === 'light' && <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* System & Architecture Info */}
          <div className="settings-section">
            <div className="settings-section-header">{t('System & Architecture', '系统架构与环境')}</div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-purple">
                    <SFSymbol name="server.rack" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">RSSHub Enhanced Core</span>
                    <span className="setting-desc">Dockerized Containerized Microservice Suite</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--sys-mono)' }}>v1.0.0</span>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-main">
                  <div className="ios-badge badge-teal">
                    <SFSymbol name="shield.fill" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{t('Design System', '设计系统规范')}</span>
                    <span className="setting-desc">Apple Human Interface Guidelines (macOS Sonoma / iOS 17)</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>PWA Ready</span>
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
