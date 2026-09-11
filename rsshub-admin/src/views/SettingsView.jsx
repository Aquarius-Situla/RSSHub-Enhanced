/* ============================================================================
 * SettingsView.jsx — AquaKit Authentic 3-Section Settings Architecture
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React from 'react';
import SFSymbol from '../components/SFSymbols.jsx';
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleNavStack
} from '../components/AquaKit.jsx';

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

  /* Root View (Strictly 3 Groups: Preferences, About & Legal, Version) */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* 1. 偏好设置 (PREFERENCES) */}
      <AppleGroup header={t('Preferences', '偏好设置 (PREFERENCES)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="globe" size={17} />} />}
            label={t('Language & Region', '语言与地区 (Language & Region)')}
            value={getLangLabel(currentLang)}
            chevron={true}
            onClick={() => onSelectSubTab('lang')}
          />

          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="slider.horizontal.3" size={17} />} />}
            label={t('Appearance & Theme', '外观与主题 (Appearance)')}
            value={getThemeLabel(currentTheme)}
            chevron={true}
            onClick={() => onSelectSubTab('theme')}
          />
        </AppleCard>
      </AppleGroup>

      {/* 2. 关于与声明 (ABOUT & LEGAL) */}
      <AppleGroup header={t('About & Legal', '关于与声明 (ABOUT & LEGAL)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="info.circle.fill" size={17} />} />}
            label={t('About RSSHub Enhanced', '关于 RSSHub Enhanced')}
            chevron={true}
            onClick={() => onSelectSubTab('about')}
          />

          <AppleRow
            badge={<AppleBadge color="gray" icon={<SFSymbol name="shield.checkerboard" size={17} />} />}
            label={t('Privacy & Disclaimer', '隐私政策与免责声明')}
            chevron={true}
            onClick={() => onSelectSubTab('privacy')}
          />
        </AppleCard>
      </AppleGroup>

      {/* 3. 版本 (VERSION) */}
      <AppleGroup
        header={t('Version', '版本 (VERSION)')}
        footer={t(
          'Built strictly on Apple Human Interface Guidelines standards with AquaKit Web UI framework.',
          '本应用基于 Apple Human Interface Guidelines 设计规范构建，采用 AquaKit 开源 UI 框架。'
        )}
      >
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="indigo" icon={<SFSymbol name="sparkles" size={17} />} />}
            label="AquaKit"
            value="v1.0.0"
          />

          <AppleRow
            badge={<AppleBadge color="green" icon={<SFSymbol name="bolt.fill" size={17} />} />}
            label="RSSHub Enhanced"
            value="v1.0.0 (PWA)"
          />
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Language */
  const langSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Select Display Language', '选择界面语言')}>
        <AppleCard>
          {[
            { key: 'auto', title: t('Follow System Language', '跟随系统语言'), desc: t('Detect browser language automatically', '根据浏览器首选语言自动适配') },
            { key: 'zh', title: '简体中文 (Simplified Chinese)', desc: '中文界面' },
            { key: 'en', title: 'English (United States)', desc: 'English UI interface' }
          ].map(opt => {
            const isSelected = currentLang === opt.key;
            return (
              <AppleRow
                key={opt.key}
                label={opt.title}
                sublabel={opt.desc}
                rightContent={isSelected ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--apple-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
                onClick={() => onLanguageChange(opt.key)}
              />
            );
          })}
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Appearance */
  const themeSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Appearance Modes', '外观模式切换')}>
        <AppleCard>
          {[
            { key: 'auto', title: t('Follow System (Auto)', '跟随系统外观 (推荐)'), desc: t('Sync automatically with OS dark/light mode', '自动跟随 macOS/iOS 系统深浅色外观切换') },
            { key: 'dark', title: t('Dark Mode (Apple HIG)', '深色模式 (Apple Dark Mode)'), desc: t('Pure black OLED background with translucent frosted glass', '纯黑 OLED 背景与毛玻璃高对比度渲染') },
            { key: 'light', title: t('Light Mode', '浅色模式 (Apple Light Mode)'), desc: t('Classic crisp iOS light gray canvas', '高对比度清爽浅灰底色') }
          ].map(opt => {
            const isSelected = currentTheme === opt.key;
            return (
              <AppleRow
                key={opt.key}
                label={opt.title}
                sublabel={opt.desc}
                rightContent={isSelected ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--apple-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
                onClick={() => onThemeChange(opt.key)}
              />
            );
          })}
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: About */
  const aboutSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('About RSSHub Enhanced', '关于本控制台')}>
        <AppleCard style={{ padding: '22px 18px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fa586a 0%, #ff2d55 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 8px 24px rgba(250, 88, 106, 0.35)'
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff">
              <circle cx="6.18" cy="17.82" r="2.18"/>
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--apple-text-primary)' }}>
            RSSHub Enhanced
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '16px' }}>
            {t('Production Portal Edition with AquaKit HIG Architecture', '基于 AquaKit Apple HIG 架构的企业级微服务全站门户')}
          </span>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--apple-text-secondary)', textAlign: 'left', margin: 0 }}>
            {t(
              'RSSHub Enhanced integrates modern proxy balancing, automated CookieCloud decryptions, route diagnostics, and an Apple-grade multi-terminal responsive experience.',
              'RSSHub Enhanced 深度整合了多节点轮询代理池、CookieCloud 自动解密回填、故障路由实时诊断与全终端自适应的原生 Apple HIG 交互体系。'
            )}
          </p>
        </AppleCard>
      </AppleGroup>

      <AppleGroup header={t('Open Source & Upstream', '开源与上游生态')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="orange" icon={<SFSymbol name="globe" size={16} />} />}
            label="RSSHub Upstream"
            sublabel="https://github.com/DIYgod/RSSHub"
            chevron={true}
            href="https://github.com/DIYgod/RSSHub"
          />
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="doc.text.fill" size={16} />} />}
            label={t('Official Documentation', '官方路由文档')}
            sublabel="https://docs.rsshub.app"
            chevron={true}
            href="https://docs.rsshub.app"
          />
          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="sparkles" size={16} />} />}
            label="AquaKit Design System"
            sublabel="Apple Human Interface Guidelines for Web"
            value="v1.0.0"
          />
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Privacy */
  const privacySubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Data Sovereignty & Privacy', '数据主权与隐私保护')}>
        <AppleCard style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--apple-text-primary)' }}>
            {t('Local Sovereignty Statement', '数据完全自主可控')}
          </h4>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--apple-text-secondary)', margin: '0 0 14px 0' }}>
            {t(
              'This RSSHub Enhanced instance operates in your private container cluster. All proxy nodes, CookieCloud encrypted credentials, API keys, and cache entries reside strictly on your server without telemetry.',
              '本 RSSHub Enhanced 实例完全部署运行于您的私有 Docker 容器集群中。所有的代理节点、CookieCloud 加密凭据、API 密钥和路由数据均严格保存在您的私有服务器内，绝不向任何第三方上报遥测数据。'
            )}
          </p>

          <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--apple-text-primary)' }}>
            {t('Disclaimer', '免责声明')}
          </h4>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--apple-text-secondary)', margin: 0 }}>
            {t(
              'Please respect the terms of service and robots.txt of target websites. Users bear full responsibility for route crawling frequency and compliance with local laws.',
              '请严格遵守目标网站的授权条款与 robots 协议。用户需对订阅抓取频次及网络合规性承担全部责任。'
            )}
          </p>
        </AppleCard>
      </AppleGroup>
    </div>
  );

  return (
    <AppleNavStack
      activeSubpage={subTab}
      onBack={() => onSelectSubTab(null)}
      rootView={rootView}
      subpages={{
        lang: langSubpage,
        theme: themeSubpage,
        about: aboutSubpage,
        privacy: privacySubpage
      }}
    />
  );
}

export default SettingsView;\n