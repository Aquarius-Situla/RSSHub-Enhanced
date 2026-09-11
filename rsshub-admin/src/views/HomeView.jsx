/* ============================================================================
 * HomeView.jsx — AquaKit Root Dashboard & Navigation Stack
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React from 'react';
import SFSymbol from '../components/SFSymbols.jsx';
import OverviewSubView from './home/OverviewSubView.jsx';
import RouteNavSubView from './home/RouteNavSubView.jsx';
import RouteErrorsSubView from './home/RouteErrorsSubView.jsx';
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleNavStack
} from '../components/AquaKit.jsx';

export function HomeView({ t, showToast, subTab, onSelectSubTab }) {
  /* Root Inset Grouped card presenting top-level sub-features */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Dashboard & Diagnostic Hub', '服务监控与导航 (MONITORING & NAVIGATION)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="square.grid.2x2.fill" size={17} />} />}
            label={t('System Overview', '运行概览')}
            value={t('100% Health', '微服务健康 100%')}
            chevron={true}
            onClick={() => onSelectSubTab('overview')}
          />

          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="safari.fill" size={17} />} />}
            label={t('Route Navigator', '路由导航')}
            value={t('Directory & Test', '路由检索与测试')}
            chevron={true}
            onClick={() => onSelectSubTab('routes')}
          />

          <AppleRow
            badge={<AppleBadge color="red" icon={<SFSymbol name="exclamationmark.triangle.fill" size={17} />} />}
            label={t('Error Routes', '故障监控')}
            value={t('Live Diagnostics', '异常诊断')}
            chevron={true}
            onClick={() => onSelectSubTab('errors')}
          />
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
        overview: <OverviewSubView t={t} showToast={showToast} />,
        routes: <RouteNavSubView t={t} showToast={showToast} />,
        errors: <RouteErrorsSubView t={t} showToast={showToast} />
      }}
    />
  );
}

export default HomeView;
