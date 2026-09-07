import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';
import SFSymbol from '../components/SFSymbols.jsx';

export function SettingsView({
  t,
  showToast,
  initialSubTab,
  isMobile,
  currentLang,
  onLanguageChange,
  currentTheme,
  onThemeChange
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || (isMobile ? 'all' : 'preferences'));
  const [accessKey, setAccessKey] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

  // Accordion expansion states
  const [expanded, setExpanded] = useState({
    lang: false,
    theme: false,
    accessKey: true,
    sso: false
  });

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
      if (initialSubTab === 'security') {
        setExpanded(prev => ({ ...prev, accessKey: true }));
      } else if (initialSubTab === 'preferences') {
        setExpanded(prev => ({ ...prev, lang: true }));
      }
    }
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

  const segmentedOptions = [
    ...(isMobile ? [{ key: 'all', label: t('All', '全部') }] : []),
    { key: 'preferences', label: isMobile ? t('Preferences', '偏好') : t('System Preferences', '偏好设置') },
    { key: 'security', label: isMobile ? t('Security', '安全') : t('Access & Security', '安全控制') },
    { key: 'system', label: isMobile ? t('System', '系统') : t('System Info', '系统信息') }
  ];

  const showPref = activeSubTab === 'all' || activeSubTab === 'preferences';
  const showSec = activeSubTab === 'all' || activeSubTab === 'security';
  const showSys = activeSubTab === 'all' || activeSubTab === 'system';

  return (
    <div className="fade-in">
      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      <div className="ios-group-container">
        {/* ==================================================================
         * Section 1: System Preferences (iOS 18 Inset Grouped Cards)
         * ================================================================== */}
        {showPref && (
          <div id="sec-preferences">
            <div className="ios-section-header">{t('Preferences', '偏好设置 (PREFERENCES)')}</div>
            <div className="ios-card">
              {/* Language Selection Row */}
              <div
                className={`ios-row has-badge ${expanded.lang ? 'expanded' : ''}`}
                onClick={() => toggleExpand('lang')}
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

              {/* Language Accordion */}
              <div className={`ios-accordion-content ${expanded.lang ? 'open' : ''}`}>
                <div className="ios-accordion-inner">
                  <div
                    className={`ios-option-item ${currentLang === 'auto' ? 'selected' : ''}`}
                    onClick={() => onLanguageChange('auto')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">{t('Follow System', '自动')}</span>
                      <span className="lang-secondary-desc">{t('Follow browser language · Auto', '跟随浏览器首选语言')}</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div
                    className={`ios-option-item ${currentLang === 'zh' ? 'selected' : ''}`}
                    onClick={() => onLanguageChange('zh')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">简体中文</span>
                      <span className="lang-secondary-desc">中文界面显示 · Simplified Chinese</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div
                    className={`ios-option-item ${currentLang === 'en' ? 'selected' : ''}`}
                    onClick={() => onLanguageChange('en')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">English</span>
                      <span className="lang-secondary-desc">English user interface</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Theme Selection Row */}
              <div
                className={`ios-row has-badge ${expanded.theme ? 'expanded' : ''}`}
                onClick={() => toggleExpand('theme')}
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

              {/* Theme Accordion */}
              <div className={`ios-accordion-content ${expanded.theme ? 'open' : ''}`}>
                <div className="ios-accordion-inner">
                  <div
                    className={`ios-option-item ${currentTheme === 'auto' ? 'selected' : ''}`}
                    onClick={() => onThemeChange('auto')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">{t('Follow System', '跟随系统')}</span>
                      <span className="lang-secondary-desc">{t('Switch automatically based on OS dark/light mode', '根据系统明暗模式自动无缝切换')}</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div
                    className={`ios-option-item ${currentTheme === 'dark' ? 'selected' : ''}`}
                    onClick={() => onThemeChange('dark')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">{t('Dark Mode', '深色模式')}</span>
                      <span className="lang-secondary-desc">{t('Authentic Apple OLED black and frosted glass', '原生 Apple 纯黑 OLED 与毛玻璃')}</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div
                    className={`ios-option-item ${currentTheme === 'light' ? 'selected' : ''}`}
                    onClick={() => onThemeChange('light')}
                  >
                    <div className="lang-text-group">
                      <span className="lang-primary-name">{t('Light Mode', '浅色模式')}</span>
                      <span className="lang-secondary-desc">{t('Crisp high-contrast Apple frosted light mode', '清爽通透的高对比度 Apple 浅色')}</span>
                    </div>
                    <svg className="ios-checkmark" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
         * Section 2: Security & Access Control
         * ================================================================== */}
        {showSec && (
          <div id="sec-security">
            <div className="ios-section-header">{t('Security & Access', '安全与访问 (SECURITY & ACCESS)')}</div>
            <div className="ios-card">
              {/* ACCESS_KEY Row */}
              <div
                className={`ios-row has-badge ${expanded.accessKey ? 'expanded' : ''}`}
                onClick={() => toggleExpand('accessKey')}
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

              {/* ACCESS_KEY Accordion */}
              <div className={`ios-accordion-content ${expanded.accessKey ? 'open' : ''}`}>
                <div className="ios-accordion-inner">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0 4px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {t('Protects all RSS feeds from unauthorized scraping via (?code=md5) verification parameter.', '开启后，所有订阅路由必须携带 MD5 鉴权摘要参数 (?code=md5)，防止接口被公开盗刷。')}
                    </div>
                    <input
                      type="text"
                      className="ios-input"
                      style={{ fontFamily: 'var(--sys-mono)', fontSize: '13px' }}
                      value={accessKey}
                      onChange={e => setAccessKey(e.target.value)}
                      placeholder={t('Leave empty to disable auth (public)', '留空则不开启访问限制 (公开)')}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className="ios-btn secondary small"
                        onClick={handleGenerateRandomKey}
                      >
                        🎲 {t('Random Key', '生成强随机密钥')}
                      </button>
                      <button
                        type="button"
                        className="ios-btn secondary small"
                        onClick={handleRestartRsshub}
                        disabled={restarting}
                      >
                        {restarting ? t('Restarting...', '重启中...') : t('Restart RSSHub', '重启容器')}
                      </button>
                      <button
                        type="button"
                        className="ios-btn primary small"
                        onClick={handleSaveConfig}
                        disabled={saving}
                      >
                        {saving ? t('Saving...', '保存中...') : t('Save Key', '保存密钥')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MD5 Verification Code Row */}
              <div className="ios-row has-badge">
                <div className="ios-row-title">
                  <div className="ios-badge badge-orange">
                    <SFSymbol name="key.fill" size={17} />
                  </div>
                  <span>{t('Global MD5 Verification Code', '全局 MD5 鉴权摘要')}</span>
                </div>
                <div className="ios-row-accessory">
                  <span className="ios-row-value" style={{ fontFamily: 'var(--sys-mono)', fontSize: '12.5px' }}>
                    {md5Hash ? (md5Hash.length > 14 ? `${md5Hash.substring(0, 12)}...` : md5Hash) : t('None', '无')}
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

              {/* Reverse Proxy & SSO Protective Layer */}
              <div
                className={`ios-row has-badge ${expanded.sso ? 'expanded' : ''}`}
                onClick={() => toggleExpand('sso')}
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

              {/* SSO Accordion */}
              <div className={`ios-accordion-content ${expanded.sso ? 'open' : ''}`}>
                <div className="ios-accordion-inner">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0 4px 0' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {t(
                        'This management portal is decoupled on internal port 3000. For public access, route through Nginx Proxy Manager with Situla Auth forward authentication headers, keeping RSSHub RSS feed endpoints public and fast.',
                        '本管理门户运行于内部 3000 端口。推荐在 NPM 反代层挂载 Situla Auth 前置认证，管理控制台享受 SSO 保护的同时，外部 RSS 客户端订阅路由直接直通，兼顾极致安全与高速解析。'
                      )}
                    </div>
                    <div style={{
                      background: 'var(--input-bg)',
                      padding: '8px 12px',
                      borderRadius: '7px',
                      fontSize: '11.5px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--sys-mono)',
                      wordBreak: 'break-all'
                    }}>
                      npm: 127.0.0.1:81 ➔ Forward Auth: http://situla-auth:3000/api/verify ➔ upstream: rsshub-admin:3000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
         * Section 3: System Information (sys-memorial spec)
         * ================================================================== */}
        {showSys && (
          <div id="sec-system">
            <div className="ios-section-header">{t('System Info', '系统信息 (SYSTEM INFO)')}</div>
            <div className="ios-card">
              <div className="ios-row has-badge">
                <div className="ios-row-title">
                  <div className="ios-badge badge-teal">
                    <SFSymbol name="server.rack" size={17} />
                  </div>
                  <span>{t('Core Engine', '核心系统')}</span>
                </div>
                <div className="ios-row-accessory">
                  <span className="ios-row-value">RSSHub Enhanced</span>
                </div>
              </div>

              <div className="ios-row has-badge">
                <div className="ios-row-title">
                  <div className="ios-badge badge-dark">
                    <SFSymbol name="info.circle.fill" size={17} />
                  </div>
                  <span>{t('Application Version', '应用版本')}</span>
                </div>
                <div className="ios-row-accessory">
                  <span className="ios-row-value">v1.0.0 (PWA)</span>
                </div>
              </div>

              <div className="ios-row has-badge">
                <div className="ios-row-title">
                  <div className="ios-badge badge-indigo">
                    <SFSymbol name="sparkles" size={17} />
                  </div>
                  <span>{t('Design Standard', '设计系统规范')}</span>
                </div>
                <div className="ios-row-accessory">
                  <span className="ios-row-value">Apple HIG (iOS 18 / macOS)</span>
                </div>
              </div>

              <div className="ios-row has-badge">
                <div className="ios-row-title">
                  <div className="ios-badge badge-green">
                    <SFSymbol name="shippingbox.fill" size={17} />
                  </div>
                  <span>{t('Deployment Stack', '容器化微服务环境')}</span>
                </div>
                <div className="ios-row-accessory">
                  <span className="ios-row-value" style={{ color: 'var(--green)', fontWeight: 500 }}>Docker · Healthy</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsView;
