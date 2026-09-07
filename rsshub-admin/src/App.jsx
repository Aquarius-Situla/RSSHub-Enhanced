import React, { useState, useEffect } from 'react';
import HomeView from './views/HomeView.jsx';
import ProxyView from './views/ProxyView.jsx';
import DataView from './views/DataView.jsx';
import SettingsView from './views/SettingsView.jsx';
import Toast from './components/Toast.jsx';
import OrientationGuard from './components/OrientationGuard.jsx';
import SFSymbol from './components/SFSymbols.jsx';
import { initDeviceLayout, isMobileLayout, syncStandaloneTabBar } from './utils/device-detect.js';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState('overview');
  const [proxySubTab, setProxySubTab] = useState('nodes');
  const [dataSubTab, setDataSubTab] = useState('sync');
  const [settingsSubTab, setSettingsSubTab] = useState('security');

  // Multi-terminal responsive detection using device fingerprinting
  const [isMobile, setIsMobile] = useState(() => {
    return isMobileLayout();
  });

  useEffect(() => {
    initDeviceLayout();
    syncStandaloneTabBar();

    const handleSync = () => {
      initDeviceLayout();
      setIsMobile(isMobileLayout());
      syncStandaloneTabBar();
    };

    window.addEventListener('resize', handleSync, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(handleSync, 100);
    }, { passive: true });
    window.addEventListener('pageshow', handleSync);
    window.addEventListener('load', handleSync);

    // Staggered timers for standalone PWA calibration
    setTimeout(syncStandaloneTabBar, 50);
    setTimeout(syncStandaloneTabBar, 150);
    setTimeout(syncStandaloneTabBar, 300);
    setTimeout(syncStandaloneTabBar, 600);

    return () => {
      window.removeEventListener('resize', handleSync);
      window.removeEventListener('pageshow', handleSync);
      window.removeEventListener('load', handleSync);
    };
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

  // Apple Music style compact bottom profile feedback
  const [copiedProfile, setCopiedProfile] = useState(false);
  const handleCopyProfile = () => {
    const serverUrl = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(serverUrl);
    }
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 1500);
  };

  return (
    <div className="app-viewport">
      <Toast toast={toast} />

      {/* Apple-grade Fullscreen Frosted Glass Orientation Guard for Smartphones */}
      <OrientationGuard t={t} />

      {/* ====================================================================
       * Mobile Top Navigation Bar (Authentic Frosted Glass Header)
       * ==================================================================== */}
      <header className="apple-top-nav">
        <h1 className="apple-top-nav-title">
          {activeTab === 'home' && t('Home Portal', '主页')}
          {activeTab === 'proxy' && t('Proxy Network', '代理')}
          {activeTab === 'data' && t('Data Sync', '数据')}
          {activeTab === 'settings' && t('Settings', '设置')}
        </h1>
      </header>

      {/* ====================================================================
       * Desktop macOS Translucent Left Sidebar (width 240px)
       * ==================================================================== */}
      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-top">
          {/* Brand Header */}
          <div className="desktop-sidebar-brand">
            <div className="desktop-sidebar-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
              </svg>
            </div>
            <div className="desktop-sidebar-brand-text">
              <span className="desktop-sidebar-brand-title">RSSHub Enhanced</span>
              <span className="desktop-sidebar-brand-badge">{t('Apple Portal Edition', '控制台全站门户')}</span>
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
                <SFSymbol name="square.grid.2x2.fill" size={17} />
              </span>
              <span className="desktop-nav-label">{t('System Overview', '运行概览')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'home' && homeSubTab === 'routes' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('home', 'routes')}
            >
              <span className="desktop-nav-icon">
                <SFSymbol name="safari.fill" size={17} />
              </span>
              <span className="desktop-nav-label">{t('Route Navigator', '路由导航')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'home' && homeSubTab === 'errors' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('home', 'errors')}
            >
              <span className="desktop-nav-icon">
                <SFSymbol name="exclamationmark.triangle.fill" size={17} />
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
                <SFSymbol name="network" size={17} />
              </span>
              <span className="desktop-nav-label">{t('Proxy Nodes', '代理节点')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'proxy' && proxySubTab === 'bypass' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('proxy', 'bypass')}
            >
              <span className="desktop-nav-icon">
                <SFSymbol name="shield.fill" size={17} />
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
                <SFSymbol name="cylinder.split.1x2.fill" size={17} />
              </span>
              <span className="desktop-nav-label">CookieCloud</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'data' && dataSubTab === 'keys' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('data', 'keys')}
            >
              <span className="desktop-nav-icon">
                <SFSymbol name="key.fill" size={17} />
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
                <SFSymbol name="lock.fill" size={17} />
              </span>
              <span className="desktop-nav-label">{t('Access Control', '安全控制')}</span>
            </button>
            <button
              type="button"
              className={`desktop-nav-item ${activeTab === 'settings' && settingsSubTab === 'preferences' ? 'active' : ''}`}
              onClick={() => handleSelectDesktopNav('settings', 'preferences')}
            >
              <span className="desktop-nav-icon">
                <SFSymbol name="slider.horizontal.3" size={17} />
              </span>
              <span className="desktop-nav-label">{t('Preferences', '偏好设置')}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Apple Music Specification (Compact 24px Profile with 16px Identicon) */}
        <div className="desktop-sidebar-bottom">
          <button
            type="button"
            className="desktop-profile-card"
            onClick={handleCopyProfile}
            title={`${window.location.origin} (Click to copy URL)`}
          >
            <div className="desktop-profile-avatar">
              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" rx="8" fill="#30d158" fillOpacity="0.2" />
                <circle cx="8" cy="8" r="4" fill="#30d158" />
              </svg>
            </div>
            <span className={`desktop-profile-uuid ${copiedProfile ? 'copied' : ''}`}>
              {copiedProfile ? t('✓ Copied URL', '✓ 已复制域名！') : window.location.hostname || 'rsshub.local'}
            </span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
       * Main Content Area (Unified Portal Stage)
       * ==================================================================== */}
      <main className="main-stage">
        <div className="stage-content-wrap">
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
        </div>
      </main>

      {/* ====================================================================
       * Mobile Bottom Tab Bar (Strictly 2-character labels, Apple SF Symbols)
       * ==================================================================== */}
      <nav className="apple-tab-bar" role="navigation" aria-label="移动端主导航">
        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-label={t('Home', '主页')}
        >
          <div className="apple-tab-icon">
            <SFSymbol name="house.fill" size={24} />
          </div>
          <span className="apple-tab-label">{t('Home', '主页')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'proxy' ? 'active' : ''}`}
          onClick={() => setActiveTab('proxy')}
          aria-label={t('Proxy', '代理')}
        >
          <div className="apple-tab-icon">
            <SFSymbol name="network" size={24} />
          </div>
          <span className="apple-tab-label">{t('Proxy', '代理')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
          aria-label={t('Data', '数据')}
        >
          <div className="apple-tab-icon">
            <SFSymbol name="cylinder.split.1x2.fill" size={24} />
          </div>
          <span className="apple-tab-label">{t('Data', '数据')}</span>
        </button>

        <button
          type="button"
          className={`apple-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          aria-label={t('Settings', '设置')}
        >
          <div className="apple-tab-icon">
            <SFSymbol name="gearshape.fill" size={24} />
          </div>
          <span className="apple-tab-label">{t('Settings', '设置')}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
