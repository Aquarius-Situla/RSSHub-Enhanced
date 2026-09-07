import React, { useState, useEffect } from 'react';
import SFSymbol from '../../components/SFSymbols.jsx';

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
      iconName: 'globe'
    },
    {
      title: t('Traditional Media', '传统媒体与新闻'),
      desc: '联合早报, 财新网, 澎湃新闻, 华尔街日报, BBC, 纽约时报, 路透社',
      badge: 'badge-teal',
      url: 'https://docs.rsshub.app/routes/traditional-media',
      iconName: 'safari.fill'
    },
    {
      title: t('BBS & Communities', '论坛与社区'),
      desc: 'V2EX, Reddit, 百度贴吧, 虎扑, GitHub Trending, 掘金, 吾爱破解',
      badge: 'badge-orange',
      url: 'https://docs.rsshub.app/routes/bbs',
      iconName: 'square.grid.2x2.fill'
    },
    {
      title: t('Universities & Academic', '高校与学术科研'),
      desc: '清华大学 (含本项目挂载自定义路由), 北京大学, 浙江大学, arXiv 论文速递',
      badge: 'badge-purple',
      url: 'https://docs.rsshub.app/routes/university',
      iconName: 'doc.text.fill'
    },
    {
      title: t('Live & Multimedia', '音视频与播客直播'),
      desc: 'YouTube, 哔哩哔哩直播, 斗鱼, 虎牙, 喜马拉雅, 网易云音乐, 小宇宙',
      badge: 'badge-red',
      url: 'https://docs.rsshub.app/routes/live-multimedia',
      iconName: 'play.fill'
    },
    {
      title: t('Anime & Creative', '二次元与设计创意'),
      desc: 'Pixiv, Bangumi 番组计划, 动漫花园, Dribbble, ArtStation, Behance',
      badge: 'badge-indigo',
      url: 'https://docs.rsshub.app/routes/anime',
      iconName: 'slider.horizontal.3'
    },
    {
      title: t('Shopping & Price', '购物优惠与降价'),
      desc: '什么值得买, 京东降价监控, 淘宝优惠, 惠惠购物, 快递物流跟踪',
      badge: 'badge-green',
      url: 'https://docs.rsshub.app/routes/shopping',
      iconName: 'shield.fill'
    },
    {
      title: t('Programming & Tech', '技术极客与编程'),
      desc: 'Hacker News, InfoQ, 掘金技术专题, GitHub Release, Linux 中国',
      badge: 'badge-gray',
      url: 'https://docs.rsshub.app/routes/programming',
      iconName: 'server.rack'
    }
  ];

  // Generate full subscribe URL
  const formatFullUrl = () => {
    const origin = window.location.origin;
    const cleanPath = inputRoute.startsWith('/') ? inputRoute : `/${inputRoute}`;
    let url = `${origin}${cleanPath}`;

    if (accessKeyData.accessKey) {
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
        <div className="settings-card" style={{ padding: '18px' }}>
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
              <button
                type="button"
                className="ios-btn primary"
                onClick={handleTestRoute}
                disabled={testing}
                style={{ whiteSpace: 'nowrap' }}
              >
                {testing ? t('Testing...', '测试中...') : t('Test Route', '在线测试')}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--input-bg)', padding: '10px 14px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--sys-mono)', fontSize: '12.5px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {formatFullUrl()}
            </span>
            <button
              type="button"
              className="ios-btn secondary"
              style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
              onClick={handleCopyUrl}
            >
              {t('Copy', '复制')}
            </button>
          </div>

          {accessKeyData.accessKey && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
                <div style={{ background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '8px', border: '0.5px solid var(--separator-subtle)', fontFamily: 'var(--sys-mono)', fontSize: '11.5px', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
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
                <SFSymbol name={cat.iconName} size={16} />
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
