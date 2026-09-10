import React, { useState, useEffect, useRef } from 'react';
import HomeView from './views/HomeView.jsx';
import ProxyView from './views/ProxyView.jsx';
import DataView from './views/DataView.jsx';
import SettingsView from './views/SettingsView.jsx';
import Toast from './components/Toast.jsx';
import OrientationGuard from './components/OrientationGuard.jsx';
import SFSymbol from './components/SFSymbols.jsx';
import { initDeviceLayout, isMobileLayout, syncStandaloneTabBar } from './utils/device-detect.js';

export function App() {
  // Navigation State: 4 core tabs and drill-down subTab
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setSubTab] = useState(null);

  // Sidebar search filter
  const [navSearch, setNavSearch] = useState('');

  // Multi-terminal responsive detection using device fingerprinting
  const [isMobile, setIsMobile] = useState(() => {
    return isMobileLayout();
  });

  // Animated Red Nav Indicator Refs & Logic
  const topContainerRef = useRef(null);
  const indicatorRef = useRef(null);
  const prevIndicatorTopRef = useRef(null);

  // Active key identifier for desktop sidebar (strictly 4 tabs)
  const currentNavKey = activeTab;

  const moveRedIndicator = (toY, animate = true) => {
    const indicator = indicatorRef.current;
    if (!indicator || typeof toY !== 'number') return;

    const fromY = prevIndicatorTopRef.current;
    prevIndicatorTopRef.current = toY;

    if (!animate || fromY === null || Math.abs(toY - fromY) < 1) {
      indicator.style.top = `${toY}px`;
      indicator.style.height = '16px';
      indicator.style.opacity = '1';
      return;
    }

    indicator.style.opacity = '1';
    const isDown = toY > fromY;

    // Apple Fluid Shorten-Glide-Elongate Physics (exact sys-memorial algorithm)
    const keyframes = isDown ? [
      { top: `${fromY}px`, height: '16px', easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      { top: `${fromY + 12}px`, height: '4px', easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
      { top: `${toY}px`, height: '4px', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { top: `${toY}px`, height: '17.5px', easing: 'ease-out' },
      { top: `${toY}px`, height: '16px' }
    ] : [
      { top: `${fromY}px`, height: '16px', easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      { top: `${fromY}px`, height: '4px', easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
      { top: `${toY + 12}px`, height: '4px', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { top: `${toY - 1.5}px`, height: '17.5px', easing: 'ease-out' },
      { top: `${toY}px`, height: '16px' }
    ];

    const anim = indicator.animate(keyframes, {
      duration: 300,
      fill: 'forwards',
      easing: 'linear'
    });

    anim.onfinish = () => {
      indicator.style.top = `${toY}px`;
      indicator.style.height = '16px';
    };
  };

  const syncIndicatorPosition = (animate = true) => {
    if (!topContainerRef.current) return;
    const activeItem = topContainerRef.current.querySelector(`.desktop-nav-item[data-nav-key="${currentNavKey}"]`);
    if (!activeItem) return;

    let top = 0;
    let curr = activeItem;
    let found = false;
    while (curr && curr !== topContainerRef.current) {
      top += curr.offsetTop;
      curr = curr.offsetParent;
      if (curr === topContainerRef.current) {
        found = true;
        break;
      }
    }
    if (!found) {
      const itemRect = activeItem.getBoundingClientRect();
      const parentRect = topContainerRef.current.getBoundingClientRect();
      top = itemRect.top - parentRect.top;
    }
    const height = activeItem.offsetHeight || 32;
    const targetY = top + (height - 16) / 2;
    moveRedIndicator(targetY, animate);
  };

  useEffect(() => {
    document.body.classList.add('has-desktop-indicator');
    // Initial direct positioning without cross-screen jump
    const timer1 = setTimeout(() => syncIndicatorPosition(false), 20);
    const timer2 = setTimeout(() => syncIndicatorPosition(false), 100);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Animate indicator when nav key changes
  useEffect(() => {
    syncIndicatorPosition(true);
  }, [currentNavKey, navSearch]);

  useEffect(() => {
    initDeviceLayout();
    syncStandaloneTabBar();

    const handleSync = () => {
      initDeviceLayout();
      setIsMobile(isMobileLayout());
      syncStandaloneTabBar();
      syncIndicatorPosition(false);
    };

    window.addEventListener('resize', handleSync, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(handleSync, 100);
    }, { passive: true });
    window.addEventListener('pageshow', handleSync);
    window.addEventListener('load', handleSync);

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
    /* Bridge AquaKit theme classes alongside data-theme attribute */
    root.classList.remove('apple-theme-dark', 'apple-theme-light');
    if (themeConfig === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeConfig);
      root.classList.add(`apple-theme-${themeConfig}`);
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

  // Navigation Handlers & Title Resolvers
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSubTab(null);
  };

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'home': return t('Home', '主页');
      case 'proxy': return t('Proxy', '代理');
      case 'data': return t('Data', '数据');
      case 'settings': return t('Settings', '设置');
      default: return t('Home', '主页');
    }
  };

  const getSubTabTitle = (sub) => {
    switch (sub) {
      case 'overview': return t('System Overview', '运行概览');
      case 'routes': return t('Route Navigator', '路由导航');
      case 'errors': return t('Error Diagnostics', '故障监控');
      case 'nodes': return t('Proxy Nodes', '代理节点池');
      case 'bypass': return t('Bypass Rules', '直连分流规则');
      case 'sync': return 'CookieCloud';
      case 'keys': return t('Platform API Keys', '平台 API 凭据');
      case 'lang': return t('Language & Region', '全局语言');
      case 'theme': return t('Appearance & Theme', '外观与主题');
      case 'accessKey': return t('Access Control Key', '访问控制密钥');
      case 'sso': return t('SSO & Reverse Proxy', '反代与单点登录');
      case 'system': return t('System Info', '系统信息');
      default: return '';
    }
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

  // Filter helper for sidebar search
  const matchesSearch = (str) => {
    if (!navSearch.trim()) return true;
    return str.toLowerCase().includes(navSearch.trim().toLowerCase());
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
        {subTab !== null && (
          <button
            type="button"
            className="nav-back-link"
            onClick={() => setSubTab(null)}
            aria-label={t('Back', '返回')}
          >
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{getTabTitle(activeTab)}</span>
          </button>
        )}
        <h1 className="nav-title">
          {subTab !== null ? getSubTabTitle(subTab) : getTabTitle(activeTab)}
        </h1>
      </header>

      {/* ====================================================================
       * Desktop macOS Translucent Left Sidebar (width 240px)
       * ==================================================================== */}
      <aside className="desktop-sidebar">
        <div className="desktop-sidebar-top" ref={topContainerRef}>
          {/* Animated Red Gliding Indicator (Apple Fluid Physics) */}
          <div
            id="desktop-nav-indicator"
            className="desktop-nav-indicator"
            ref={indicatorRef}
          />

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

          {/* Sidebar Search Box (sys-memorial spec) */}
          <div className="desktop-search-box">
            <div className="desktop-search-input-wrapper">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="desktop-search-input"
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                placeholder={t('Search', '搜索')}
              />
            </div>
          </div>

          {/* Main Navigation: Strictly 4 Core Tabs (sys-memorial spec) */}
          <div className="desktop-nav-group" style={{ marginTop: '6px' }}>
            <div className="desktop-nav-header">{t('Menu', '核心导航')}</div>
            {matchesSearch(t('Home', '主页')) && (
              <button
                type="button"
                data-nav-key="home"
                className={`desktop-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleSelectTab('home')}
              >
                <span className="desktop-nav-icon">
                  <SFSymbol name="house.fill" size={17} />
                </span>
                <span className="desktop-nav-label">{t('Home', '主页')}</span>
              </button>
            )}
            {matchesSearch(t('Proxy', '代理')) && (
              <button
                type="button"
                data-nav-key="proxy"
                className={`desktop-nav-item ${activeTab === 'proxy' ? 'active' : ''}`}
                onClick={() => handleSelectTab('proxy')}
              >
                <span className="desktop-nav-icon">
                  <SFSymbol name="network" size={17} />
                </span>
                <span className="desktop-nav-label">{t('Proxy', '代理')}</span>
              </button>
            )}
            {matchesSearch(t('Data', '数据')) && (
              <button
                type="button"
                data-nav-key="data"
                className={`desktop-nav-item ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => handleSelectTab('data')}
              >
                <span className="desktop-nav-icon">
                  <SFSymbol name="cylinder.split.1x2.fill" size={17} />
                </span>
                <span className="desktop-nav-label">{t('Data', '数据')}</span>
              </button>
            )}
            {matchesSearch(t('Settings', '设置')) && (
              <button
                type="button"
                data-nav-key="settings"
                className={`desktop-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleSelectTab('settings')}
              >
                <span className="desktop-nav-icon">
                  <SFSymbol name="gearshape.fill" size={17} />
                </span>
                <span className="desktop-nav-label">{t('Settings', '设置')}</span>
              </button>
            )}
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
          {/* Desktop Back Button (Apple Native Top Navigation Link) */}
          {subTab !== null && (
            <button
              type="button"
              className="top-back-btn"
              onClick={() => setSubTab(null)}
              aria-label={t('Back', '返回')}
            >
              <svg viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{t('Back to', '返回')} {getTabTitle(activeTab)}</span>
            </button>
          )}

          {activeTab === 'home' && (
            <HomeView
              t={t}
              showToast={showToast}
              subTab={subTab}
              onSelectSubTab={setSubTab}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'proxy' && (
            <ProxyView
              t={t}
              showToast={showToast}
              subTab={subTab}
              onSelectSubTab={setSubTab}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'data' && (
            <DataView
              t={t}
              showToast={showToast}
              subTab={subTab}
              onSelectSubTab={setSubTab}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              t={t}
              showToast={showToast}
              subTab={subTab}
              onSelectSubTab={setSubTab}
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
          onClick={() => handleSelectTab('home')}
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
          onClick={() => handleSelectTab('proxy')}
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
          onClick={() => handleSelectTab('data')}
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
          onClick={() => handleSelectTab('settings')}
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
