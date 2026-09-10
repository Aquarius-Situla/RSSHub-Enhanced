import React, { useState, useEffect } from 'react';
import SFSymbol from '../components/SFSymbols.jsx';

export function SettingsView({
  t,
  showToast,
  subTab,
  onSelectSubTab,
  isMobile,
  currentLang,
  onLanguageChange,
  currentTheme,
  onThemeChange
}) {
  const [accessKey, setAccessKey] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

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

  const handleGenerateRandomKey = (e) => {
    e.stopPropagation();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessKey(result);
    showToast(t('Generated strong random Access Key!', '已生成高强度随机访问控制密钥！'));
  };

  const handleSaveConfig = async (e) => {
    e.stopPropagation();
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
    } catch (err) {
      showToast(t('Failed to save Access Key', '保存 ACCESS_KEY 失败'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestartRsshub = async (e) => {
    e.stopPropagation();
    if (!window.confirm(t('Restart RSSHub container to apply changes?', '确定要重启 RSSHub 容器使配置即刻生效吗？'))) return;
    setRestarting(true);
    try {
      const res = await fetch('api/rsshub/restart', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || t('RSSHub restarted successfully!', 'RSSHub 容器重启完成！'));
    } catch (err) {
      showToast(t('Failed to restart RSSHub', '重启 RSSHub 失败'));
    } finally {
      setRestarting(false);
    }
  };

  const handleCopyMd5 = (e) => {
    e.stopPropagation();
    if (!md5Hash) return;
    navigator.clipboard.writeText(md5Hash);
    showToast(t('MD5 hash copied to clipboard!', 'MD5 校验码已复制！'));
  };

  const getLangLabel = (code) => {
    if (code === 'zh') return '简体中文';
    if (code === 'en') return 'English';
    return t('Auto (System)', '自动 (跟随系统)');
  };

  const getThemeLabel = (theme) => {
    if (theme === 'dark') return t('Dark Mode', '深色模式');
    if (theme === 'light') return t('Light Mode', '浅色模式');
    return t('Follow System', '跟随系统');
  };

  // Sub-page: Language
  if (subTab === 'lang') {
    return (
      <div className="fade-in">
        <div className="ios-section-header">{t('Language & Region', '语言与地区 (LANGUAGE)')}</div>
        <div className="ios-card">
          <div
            className={`ios-option-item ${currentLang === 'auto' ? 'selected' : ''}`}
            onClick={() => onLanguageChange('auto')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">{t('Follow System', '自动')}</span>
              <span className="lang-secondary-desc">{t('Follow browser language · Auto', '跟随浏览器首选语言')}</span>
            </div>
            {currentLang === 'auto' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div
            className={`ios-option-item ${currentLang === 'zh' ? 'selected' : ''}`}
            onClick={() => onLanguageChange('zh')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">简体中文</span>
              <span className="lang-secondary-desc">中文界面显示 · Simplified Chinese</span>
            </div>
            {currentLang === 'zh' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div
            className={`ios-option-item ${currentLang === 'en' ? 'selected' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">English</span>
              <span className="lang-secondary-desc">English user interface</span>
            </div>
            {currentLang === 'en' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Theme / Appearance
  if (subTab === 'theme') {
    return (
      <div className="fade-in">
        <div className="ios-section-header">{t('Appearance & Theme', '外观与主题 (APPEARANCE)')}</div>
        <div className="ios-card">
          <div
            className={`ios-option-item ${currentTheme === 'auto' ? 'selected' : ''}`}
            onClick={() => onThemeChange('auto')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">{t('Follow System', '跟随系统')}</span>
              <span className="lang-secondary-desc">{t('Switch automatically based on OS dark/light mode', '根据系统明暗模式自动无缝切换')}</span>
            </div>
            {currentTheme === 'auto' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div
            className={`ios-option-item ${currentTheme === 'dark' ? 'selected' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">{t('Dark Mode', '深色模式')}</span>
              <span className="lang-secondary-desc">{t('Authentic Apple OLED black and frosted glass', '原生 Apple 纯黑 OLED 与毛玻璃')}</span>
            </div>
            {currentTheme === 'dark' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div
            className={`ios-option-item ${currentTheme === 'light' ? 'selected' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            <div className="lang-text-group">
              <span className="lang-primary-name">{t('Light Mode', '浅色模式')}</span>
              <span className="lang-secondary-desc">{t('Crisp high-contrast Apple frosted light mode', '清爽通透的高对比度 Apple 浅色')}</span>
            </div>
            {currentTheme === 'light' && (
              <svg className="ios-checkmark" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: Access Key
  if (subTab === 'accessKey') {
    return (
      <div className="fade-in">
        <div className="ios-section-header">{t('Access Control Key', '访问控制密钥 (ACCESS_KEY)')}</div>
        <div className="ios-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {t(
              'Protects all RSS feeds from unauthorized scraping via (?code=md5) verification parameter.',
              '开启后，所有订阅路由必须携带 MD5 鉴权摘要参数 (?code=md5)，防止接口被公开盗刷。留空则代表公开访问。'
            )}
          </div>
          <input
            type="text"
            className="ios-input"
            style={{ fontFamily: 'var(--sys-mono)', fontSize: '14px' }}
            value={accessKey}
            onChange={e => setAccessKey(e.target.value)}
            placeholder={t('Leave empty to disable auth (public)', '留空则不开启访问限制 (公开)')}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="ios-btn secondary"
              onClick={handleGenerateRandomKey}
            >
              🎲 {t('Random Key', '生成强随机密钥')}
            </button>
            <button
              type="button"
              className="ios-btn secondary"
              onClick={handleRestartRsshub}
              disabled={restarting}
            >
              {restarting ? t('Restarting...', '重启中...') : t('Restart RSSHub', '重启容器')}
            </button>
            <button
              type="button"
              className="ios-btn primary"
              onClick={handleSaveConfig}
              disabled={saving}
            >
              {saving ? t('Saving...', '保存中...') : t('Save Key', '保存密钥')}
            </button>
          </div>
        </div>

        <div className="ios-section-header">{t('MD5 Verification Code', '全局 MD5 鉴权摘要 (MD5 CODE)')}</div>
        <div className="ios-card">
          <div className="ios-row has-badge">
            <div className="ios-row-title">
              <div className="ios-badge badge-orange">
                <SFSymbol name="key.fill" size={17} />
              </div>
              <span>{t('Global MD5 Verification Code', '全局 MD5 摘要')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value" style={{ fontFamily: 'var(--sys-mono)', fontSize: '12.5px' }}>
                {md5Hash ? (md5Hash.length > 18 ? `${md5Hash.substring(0, 16)}...` : md5Hash) : t('None', '无')}
              </span>
              {md5Hash && (
                <button
                  type="button"
                  className="ios-btn secondary small"
                  onClick={handleCopyMd5}
                >
                  {t('Copy', '复制')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sub-page: SSO / NPM Reverse Proxy
  if (subTab === 'sso') {
    return (
      <div className="fade-in">
        <div className="ios-section-header">{t('SSO & Reverse Proxy', '反代与单点登录 (SSO / NPM)')}</div>
        <div className="ios-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {t(
              'This management portal is decoupled on internal port 3000. For public access, route through Nginx Proxy Manager with Situla Auth forward authentication headers, keeping RSSHub RSS feed endpoints public and fast.',
              '本管理门户运行于内部 3000 端口。推荐在 NPM 反代层挂载 Situla Auth 前置认证，管理控制台享受 SSO 保护的同时，外部 RSS 客户端订阅路由直接直通，兼顾极致安全与高速解析。'
            )}
          </div>
          <div style={{
            background: 'var(--input-bg)',
            padding: '12px 14px',
            borderRadius: '9px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--sys-mono)',
            lineHeight: 1.6,
            wordBreak: 'break-all'
          }}>
            npm: 127.0.0.1:81 ➔ Forward Auth: http://situla-auth:3000/api/verify ➔ upstream: rsshub-admin:3000
          </div>
        </div>
      </div>
    );
  }

  // Root Menu: iOS 18 Inset Grouped selection cards (sys-memorial spec)
  return (
    <div className="fade-in">
      <div className="ios-group-container">
        {/* ==================================================================
         * Section 1: System Preferences (iOS 18 Inset Grouped Cards)
         * ================================================================== */}
        <div id="sec-preferences">
          <div className="ios-section-header">{t('Preferences', '偏好设置 (PREFERENCES)')}</div>
          <div className="ios-card">
            {/* Language Selection Row */}
            <div
              className="ios-row has-badge"
              onClick={() => onSelectSubTab && onSelectSubTab('lang')}
              style={{ cursor: 'pointer' }}
            >
              <div className="ios-row-title">
                <div className="ios-badge badge-teal">
                  <SFSymbol name="globe" size={17} />
                </div>
                <span>{t('Language & Region', '全局语言 (Language)')}</span>
              </div>
              <div className="ios-row-accessory">
                <span className="ios-row-value">{getLangLabel(currentLang)}</span>
                <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </div>

            {/* Theme Selection Row */}
            <div
              className="ios-row has-badge"
              onClick={() => onSelectSubTab && onSelectSubTab('theme')}
              style={{ cursor: 'pointer' }}
            >
              <div className="ios-row-title">
                <div className="ios-badge badge-purple">
                  <SFSymbol name="slider.horizontal.3" size={17} />
                </div>
                <span>{t('Appearance & Theme', '外观与主题 (Appearance)')}</span>
              </div>
              <div className="ios-row-accessory">
                <span className="ios-row-value">{getThemeLabel(currentTheme)}</span>
                <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
         * Section 2: Security & Access Control
         * ================================================================== */}
        <div id="sec-security">
          <div className="ios-section-header">{t('Security & Access', '安全与访问 (SECURITY & ACCESS)')}</div>
          <div className="ios-card">
            {/* ACCESS_KEY Row */}
            <div
              className="ios-row has-badge"
              onClick={() => onSelectSubTab && onSelectSubTab('accessKey')}
              style={{ cursor: 'pointer' }}
            >
              <div className="ios-row-title">
                <div className="ios-badge badge-red">
                  <SFSymbol name="lock.fill" size={17} />
                </div>
                <span>{t('Access Control Key', '访问控制密钥 (ACCESS_KEY)')}</span>
              </div>
              <div className="ios-row-accessory">
                <span className="ios-row-value">
                  {accessKey ? t('Protected', '已启用') : t('Public', '未限制')}
                </span>
                <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </div>

            {/* Reverse Proxy & SSO Protective Layer */}
            <div
              className="ios-row has-badge"
              onClick={() => onSelectSubTab && onSelectSubTab('sso')}
              style={{ cursor: 'pointer' }}
            >
              <div className="ios-row-title">
                <div className="ios-badge badge-blue">
                  <SFSymbol name="network" size={17} />
                </div>
                <span>{t('SSO & Reverse Proxy', '反代与单点登录 (SSO / NPM)')}</span>
              </div>
              <div className="ios-row-accessory">
                <span className="ios-row-value">Situla Auth</span>
                <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
