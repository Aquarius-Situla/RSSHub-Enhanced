import React, { useState, useEffect } from 'react';
import HomeView from './views/HomeView.jsx';
import ProxyView from './views/ProxyView.jsx';
import DataView from './views/DataView.jsx';
import SettingsView from './views/SettingsView.jsx';
import Toast from './components/Toast.jsx';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState('overview');
  const [proxySubTab, setProxySubTab] = useState('nodes');
  const [dataSubTab, setDataSubTab] = useState('sync');
  const [settingsSubTab, setSettingsSubTab] = useState('security');

  // Multi-terminal responsive detection
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Language & Internationalization
  const [langConfig, setLangConfig] = useState(() => {
    return localStorage.getItem('rsshub_lang') || 'auto';
  });

  const getEffectiveLang = () => {
    if (langConfig === 'zh') return 'zh';
    if (langConfig === 'en') return 'en';
    const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return browser.startsWith('zh') ? 'zh' : 'en';
  };

  const effectiveLang = getEffectiveLang();
  const t = (en, zh) => (effectiveLang === 'zh' ? zh : en);

  const handleLanguageChange = (newLang) => {
    setLangConfig(newLang);
    localStorage.setItem('rsshub_lang', newLang);
    showToast(newLang === 'zh' ? '已切换至简体中文' : newLang === 'en' ? 'Switched to English' : '已设置为跟随系统语言');
  };

  // Theme Management (Auto / Dark / Light)
  const [themeConfig, setThemeConfig] = useState(() => {
    return localStorage.getItem('rsshub_theme') || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeConfig === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeConfig);
    }
  }, [themeConfig]);

  const handleThemeChange = (newTheme) => {
    setThemeConfig(newTheme);
    localStorage.setItem('rsshub_theme', newTheme);
    showToast(t(`Theme set to ${newTheme}`, `主题外观已更新为：${newTheme === 'dark' ? '深色模式' : newTheme === 'light' ? '浅色模式' : '跟随系统'}`));
  };

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '' });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2800);
  };

  // Desktop Navigation Select Handler
  const handleSelectDesktopNav = (tab, subTab) => {
    setActiveTab(tab);
    if (tab === 'home' && subTab) setHomeSubTab(subTab);
    if (tab === 'proxy' && subTab) setProxySubTab(subTab);
    if (tab === 'data' && subTab) setDataSubTab(subTab);
    if (tab === 'settings' && subTab) setSettingsSubTab(subTab);
  };

  return (
    <div className="app-viewport">
      <Toast toast={toast} />

      {/* ====================================================================
       * Mobile Top Navigation Bar (Authentic Frosted Glass)
       * ==================================================================== */}
      <header className="apple-top-nav">
        <h1 className="apple-top-nav-title">
          {activeTab === 'home' && t('Home Portal', '实例主页')}
          {activeTab === 'proxy' && t('Proxy Network', '网络代理')}
          {activeTab === 'data' && t('Data Sync', '数据同步')}
          {activeTab === 'settings' && t('Settings', '系统设置')}
        </h1>
      </header>

      {/* ====================================================================
       * Desktop macOS Translucent Left Sidebar (width 240px)
       * ==================================================================== */}
      <aside className="desktop-sidebar">
        <div>
          {/* Brand Header */}
          <div className="desktop-sidebar-brand">
            <div className="desktop-sidebar-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
              </svg>
            </div>
            <div className="desktop-sidebar-brand-text">
              <span className="desktop-sidebar-brand-title">RSSHub Enhanced</span>
              <span className="desktop-sidebar-brand-badge">{t('Apple Edition', '全站门户控制台')}</span>
            </div>
          </div>

          {/* Section 1: Home Portal */}
          <div className="desktop-nav-group">
            <div className="desktop-nav-header">{t('Portal Hub', '主页中心')}</div>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'home' && homeSubTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('home', 'overview')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('System Overview', '运行概览')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'home' && homeSubTab === 'routes' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('home', 'routes')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Route Navigator', '路由导航')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'home' && homeSubTab === 'errors' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('home', 'errors')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Error Routes', '异常路由')}</span>
            </button>
          </div>

          {/* Section 2: Network & Proxy */}
          <div className="desktop-nav-group">
            <div className="desktop-nav-header">{t('Network & Proxy', '网络代理')}</div>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'proxy' && proxySubTab === 'nodes' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('proxy', 'nodes')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Proxy Nodes', '代理节点')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'proxy' && proxySubTab === 'bypass' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('proxy', 'bypass')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Bypass Rules', '分流规则')}</span>
            </button>
          </div>

          {/* Section 3: Data & Sync */}
          <div className="desktop-nav-group">
            <div className="desktop-nav-header">{t('Data & Credentials', '数据同步')}</div>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'data' && dataSubTab === 'sync' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('data', 'sync')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
              </span>
              <span className="desktop-nav-label">CookieCloud</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'data' && dataSubTab === 'keys' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('data', 'keys')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Platform API Keys', '平台凭据')}</span>
            </button>
          </div>

          {/* Section 4: System & Preferences */}
          <div className="desktop-nav-group">
            <div className="desktop-nav-header">{t('System & Security', '系统管理')}</div>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'settings' && settingsSubTab === 'security' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('settings', 'security')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Access Control', '安全控制')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'settings' && settingsSubTab === 'preferences' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('settings', 'preferences')}
            >
              <span className="desktop-nav-icon">
                <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              </span>
              <span className="desktop-nav-label">{t('Preferences', '偏好设置')}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Status Indicator */}
        <div className="desktop-sidebar-bottom">
          <div className="sidebar-status-card">
            <span className="status-pulse"></span>
            <span>{t('RSSHub Online', '服务正常运行')}</span>
          </div>
        </div>
      </aside>

      {/* ====================================================================
       * Main Content Area (Unified Portal Stage)
       * ==================================================================== */}
      <main className="main-stage">
        {activeTab === 'home' && (
          <HomeView
            t={t}
            showToast={showToast}
            initialSubTab={homeSubTab}
            isMobile={isMobile}
          />
        )}
        {activeTab === 'proxy' && (
          <ProxyView
            t={t}
            showToast={showToast}
            initialSubTab={proxySubTab}
            isMobile={isMobile}
          />
        )}
        {activeTab === 'data' && (
          <DataView
            t={t}
            showToast={showToast}
            initialSubTab={dataSubTab}
            isMobile={isMobile}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            t={t}
            showToast={showToast}
            initialSubTab={settingsSubTab}
            isMobile={isMobile}
            currentLang={langConfig}
            onLanguageChange={handleLanguageChange}
            currentTheme={themeConfig}
            onThemeChange={handleThemeChange}
          />
        )}
      </main>

      {/* ====================================================================
       * Mobile Bottom Tab Bar (Strictly 2-character labels for 4 tabs)
       * ==================================================================== */}
      <nav className="apple-tab-bar" role="navigation" aria-label="移动端主导航">
        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <div className="apple-tab-icon">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span className="apple-tab-label">{t('Home', '主页')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'proxy' ? 'active' : ''}`}
          onClick={() => setActiveTab('proxy')}
        >
          <div className="apple-tab-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </div>
          <span className="apple-tab-label">{t('Proxy', '代理')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <div className="apple-tab-icon">
            <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
          </div>
          <span className="apple-tab-label">{t('Data', '数据')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="apple-tab-icon">
            <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
          </div>
          <span className="apple-tab-label">{t('Settings', '设置')}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
