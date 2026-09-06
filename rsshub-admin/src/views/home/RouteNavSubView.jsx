import React, { useState, useEffect } from 'react';

export function RouteNavSubView({ t, showToast }) {
  const [accessKeyData, setAccessKeyData] = useState({ accessKey: '', md5: '' });
  const [inputRoute, setInputRoute] = useState('/bilibili/user/video/2267573');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('api/rsshub/config')
      .then(r => r.json())
      .then(d => setAccessKeyData(d))
      .catch(() => {});
  }, []);

  const routeCategories = [
    {
      title: t('Social Media', '社交媒体'),
      desc: 'Bilibili, Twitter/X, 微博, 小红书, 即刻, 知乎, Telegram, Instagram',
      badge: 'badge-blue',
      url: 'https://docs.rsshub.app/routes/social-media',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      )
    },
    {
      title: t('Traditional Media', '传统媒体与新闻'),
      desc: '联合早报, 财新网, 澎湃新闻, 华尔街日报, BBC, 纽约时报, 路透社',
      badge: 'badge-teal',
      url: 'https://docs.rsshub.app/routes/traditional-media',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
      )
    },
    {
      title: t('BBS & Communities', '论坛与社区'),
      desc: 'V2EX, Reddit, 百度贴吧, 虎扑, GitHub Trending, 掘金, 吾爱破解',
      badge: 'badge-orange',
      url: 'https://docs.rsshub.app/routes/bbs',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg>
      )
    },
    {
      title: t('Universities & Academic', '高校与学术科研'),
      desc: '清华大学 (含本项目挂载自定义路由), 北京大学, 浙江大学, arXiv 论文速递',
      badge: 'badge-purple',
      url: 'https://docs.rsshub.app/routes/university',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      )
    },
    {
      title: t('Live & Multimedia', '音视频与播客直播'),
      desc: 'YouTube, 哔哩哔哩直播, 斗鱼, 虎牙, 喜马拉雅, 网易云音乐, 小宇宙',
      badge: 'badge-red',
      url: 'https://docs.rsshub.app/routes/live-multimedia',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
      )
    },
    {
      title: t('Anime & Creative', '二次元与设计创意'),
      desc: 'Pixiv, Bangumi 番组计划, 动漫花园, Dribbble, ArtStation, Behance',
      badge: 'badge-indigo',
      url: 'https://docs.rsshub.app/routes/anime',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
      )
    },
    {
      title: t('Shopping & Price', '购物优惠与降价'),
      desc: '什么值得买, 京东降价监控, 淘宝优惠, 惠惠购物, 快递物流跟踪',
      badge: 'badge-green',
      url: 'https://docs.rsshub.app/routes/shopping',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
      )
    },
    {
      title: t('Programming & Tech', '技术极客与编程'),
      desc: 'Hacker News, InfoQ, 掘金技术专题, GitHub Release, Linux 中国',
      badge: 'badge-gray',
      url: 'https://docs.rsshub.app/routes/programming',
      icon: (
        <svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
      )
    }
  ];

  // Generate full subscribe URL
  const formatFullUrl = () => {
    const origin = window.location.origin;
    const cleanPath = inputRoute.startsWith('/') ? inputRoute : `/${inputRoute}`;
    let url = `${origin}${cleanPath}`;

    if (accessKeyData.accessKey) {
      // Calculate MD5 for path + accessKey
      // For instant frontend preview, we use the md5 endpoint or display query param
      const sep = cleanPath.includes('?') ? '&' : '?';
      url += `${sep}code=${accessKeyData.md5}`;
    }
    return url;
  };

  const handleCopyUrl = () => {
    const url = formatFullUrl();
    navigator.clipboard.writeText(url);
    showToast(t('Feed link copied to clipboard!', '订阅链接已复制到剪贴板！'));
  };

  const handleTestRoute = async () => {
    if (!inputRoute.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const cleanPath = inputRoute.startsWith('/') ? inputRoute : `/${inputRoute}`;
      const res = await fetch(`api/routes/test?path=${encodeURIComponent(cleanPath)}`);
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({
        status: 500,
        statusText: 'Network Error',
        error: e.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Route URL Builder & Tester */}
      <div className="settings-section">
        <div className="settings-section-header">{t('Feed Link Generator & Tester', '订阅链接生成与在线测试')}</div>
        <div className="settings-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Route Path (e.g. /bilibili/user/video/2267573)', '路由路径 (例如 /bilibili/user/video/2267573)')}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--sys-mono)', fontSize: '14px' }}
                value={inputRoute}
                onChange={e => setInputRoute(e.target.value)}
                placeholder="/bilibili/user/video/..."
              />
              <button className="ios-btn primary" onClick={handleTestRoute} disabled={testing} style={{ whiteSpace: 'nowrap' }}>
                {testing ? t('Testing...', '测试中...') : t('Test Route', '在线测试')}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--input-bg)', padding: '12px 14px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--sys-mono)', fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {formatFullUrl()}
            </span>
            <button className="ios-btn secondary small" onClick={handleCopyUrl} style={{ flexShrink: 0 }}>
              {t('Copy', '复制')}
            </button>
          </div>

          {accessKeyData.accessKey && (
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              🔒 {t('Auto-signed with ACCESS_KEY MD5 code parameter.', '已根据当前 ACCESS_KEY 自动附加 MD5 鉴权校验码。')}
            </div>
          )}

          {/* Test Result Display */}
          {testResult && (
            <div style={{ marginTop: '16px', borderTop: '0.5px solid var(--separator-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={`container-badge ${testResult.status === 200 ? 'badge-running' : 'badge-stopped'}`}>
                  {testResult.status} {testResult.statusText || ''}
                </span>
                {testResult.durationMs && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ⏱️ {testResult.durationMs}ms
                  </span>
                )}
                {testResult.contentType && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--sys-mono)' }}>
                    📄 {testResult.contentType}
                  </span>
                )}
              </div>

              {testResult.snippet && (
                <div style={{ background: 'var(--card-bg-elevated)', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid var(--separator-subtle)', fontFamily: 'var(--sys-mono)', fontSize: '11.5px', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                  {testResult.snippet}
                </div>
              )}

              {testResult.error && (
                <div style={{ color: 'var(--red)', fontSize: '13px' }}>
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official Documentation Categories Grid */}
      <div className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '14px', paddingRight: '14px' }}>
          <div className="settings-section-header" style={{ margin: 0, padding: 0 }}>
            {t('Official Route Documentation (docs.rsshub.app)', '官方路由文档矩阵 (docs.rsshub.app)')}
          </div>
          <a
            href="https://docs.rsshub.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12.5px', color: 'var(--blue)', fontWeight: 500 }}
          >
            {t('Open Full Docs ↗', '打开完整文档 ↗')}
          </a>
        </div>

        <div className="category-grid">
          {routeCategories.map((cat, i) => (
            <a
              key={i}
              href={cat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="category-card"
            >
              <div className={`ios-badge ${cat.badge}`}>
                {cat.icon}
              </div>
              <div className="category-card-content">
                <div className="category-card-title">
                  <span>{cat.title}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>↗</span>
                </div>
                <div className="category-card-desc">{cat.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RouteNavSubView;
