/* ============================================================================
 * RouteNavSubView.jsx — AquaKit Route Directory & Live Test Hub
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React, { useState, useEffect } from 'react';
import SFSymbol from '../../components/SFSymbols.jsx';
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleButton
} from '../../components/AquaKit.jsx';

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
      badge: 'blue',
      url: 'https://docs.rsshub.app/routes/social-media',
      iconName: 'globe'
    },
    {
      title: t('Traditional Media', '传统媒体与新闻'),
      desc: '联合早报, 财新网, 澎湃新闻, 华尔街日报, BBC, 纽约时报, 路透社',
      badge: 'teal',
      url: 'https://docs.rsshub.app/routes/traditional-media',
      iconName: 'safari.fill'
    },
    {
      title: t('BBS & Communities', '论坛与社区'),
      desc: 'V2EX, Reddit, 百度贴吧, 虎扑, GitHub Trending, 掘金, 吾爱破解',
      badge: 'orange',
      url: 'https://docs.rsshub.app/routes/bbs',
      iconName: 'square.grid.2x2.fill'
    },
    {
      title: t('Universities & Academic', '高校与学术科研'),
      desc: '清华大学 (含自定义挂载路由), 北京大学, 浙江大学, arXiv 论文速递',
      badge: 'purple',
      url: 'https://docs.rsshub.app/routes/university',
      iconName: 'doc.text.fill'
    },
    {
      title: t('Live & Multimedia', '音视频与播客直播'),
      desc: 'YouTube, 哔哩哔哩直播, 斗鱼, 虎牙, 喜马拉雅, 网易云音乐, 小宇宙',
      badge: 'red',
      url: 'https://docs.rsshub.app/routes/live-multimedia',
      iconName: 'play.fill'
    },
    {
      title: t('Anime & Creative', '二次元与设计创意'),
      desc: 'Pixiv, Bangumi 番组计划, 动漫花园, Dribbble, ArtStation, Behance',
      badge: 'indigo',
      url: 'https://docs.rsshub.app/routes/anime',
      iconName: 'slider.horizontal.3'
    },
    {
      title: t('Shopping & Price', '购物优惠与降价'),
      desc: '什么值得买, 京东降价监控, 淘宝优惠, 惠惠购物, 快递物流跟踪',
      badge: 'green',
      url: 'https://docs.rsshub.app/routes/shopping',
      iconName: 'shield.fill'
    },
    {
      title: t('Programming & Tech', '技术极客与编程'),
      desc: 'Hacker News, InfoQ, 掘金技术专题, GitHub Release, Linux 中国',
      badge: 'gray',
      url: 'https://docs.rsshub.app/routes/programming',
      iconName: 'server.rack'
    }
  ];

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
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* Feed URL Generator & Tester */}
      <AppleGroup header={t('Feed Link Generator & Tester', '订阅链接生成与在线测试 (GENERATOR & TESTER)')}>
        <AppleCard style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '6px' }}>
              {t('Route Path (e.g. /bilibili/user/video/2267573)', '路由路径 (例如 /bilibili/user/video/2267573)')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="ios-input"
                style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px', flex: 1 }}
                value={inputRoute}
                onChange={e => setInputRoute(e.target.value)}
                placeholder="/bilibili/user/video/..."
              />
              <AppleButton
                variant="primary"
                size="md"
                onClick={handleTestRoute}
                disabled={testing}
              >
                {testing ? t('Testing...', '测试中...') : t('Test Route', '在线测试')}
              </AppleButton>
            </div>
          </div>

          <div style={{
            background: 'var(--apple-bg-input)',
            padding: '12px 14px',
            borderRadius: 'var(--apple-radius-control, 8px)',
            marginBottom: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-text-secondary)' }}>
                {t('Generated Subscription URL', '已生成的订阅链接')}
              </span>
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={handleCopyUrl}
                style={{ flexShrink: 0 }}
              >
                <SFSymbol name="doc.on.doc" size={13} style={{ marginRight: '4px' }} />
                {t('Copy', '复制')}
              </AppleButton>
            </div>
            <div style={{
              fontFamily: 'var(--apple-font-mono)',
              fontSize: '12.5px',
              color: 'var(--apple-text-primary)',
              wordBreak: 'break-all',
              lineHeight: '1.45'
            }}>
              {formatFullUrl()}
            </div>
          </div>

          {accessKeyData.accessKey && (
            <div style={{ fontSize: '12px', color: 'var(--apple-text-tertiary)' }}>
              🔒 {t('Auto-signed with ACCESS_KEY MD5 code parameter.', '已根据当前 ACCESS_KEY 自动附加 MD5 鉴权校验码。')}
            </div>
          )}

          {/* Test Result Display */}
          {testResult && (
            <div style={{ marginTop: '14px', borderTop: '0.5px solid var(--apple-divider)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className={`container-badge ${testResult.status === 200 ? 'badge-running' : 'badge-stopped'}`}>
                  {testResult.status} {testResult.statusText || ''}
                </span>
                {testResult.durationMs && (
                  <span style={{ fontSize: '12px', color: 'var(--apple-text-secondary)' }}>
                    ⏱️ {testResult.durationMs}ms
                  </span>
                )}
                {testResult.contentType && (
                  <span style={{ fontSize: '12px', color: 'var(--apple-text-secondary)', fontFamily: 'var(--apple-font-mono)' }}>
                    📄 {testResult.contentType}
                  </span>
                )}
              </div>

              {testResult.snippet && (
                <div style={{
                  background: 'var(--apple-bg-input)',
                  padding: '10px 12px',
                  borderRadius: 'var(--apple-radius-control, 8px)',
                  border: '0.5px solid var(--apple-divider)',
                  fontFamily: 'var(--apple-font-mono)',
                  fontSize: '11.5px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--apple-text-secondary)'
                }}>
                  {testResult.snippet}
                </div>
              )}

              {testResult.error && (
                <div style={{ color: 'var(--apple-red)', fontSize: '13px' }}>
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </AppleCard>
      </AppleGroup>

      {/* Route Documentation Directory */}
      <AppleGroup header={t('Official Route Categories', '官方路由文档分类索引 (CATEGORIES)')}>
        <AppleCard>
          {routeCategories.map((cat, i) => (
            <AppleRow
              key={i}
              badge={<AppleBadge color={cat.badge} icon={<SFSymbol name={cat.iconName} size={16} />} />}
              label={cat.title}
              sublabel={cat.desc}
              chevron={true}
              href={cat.url}
            />
          ))}
        </AppleCard>
      </AppleGroup>
    </div>
  );
}

export default RouteNavSubView;
