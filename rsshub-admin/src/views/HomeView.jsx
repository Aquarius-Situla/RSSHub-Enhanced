import React, { useState, useEffect } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';
import OverviewSubView from './home/OverviewSubView.jsx';
import RouteNavSubView from './home/RouteNavSubView.jsx';
import RouteErrorsSubView from './home/RouteErrorsSubView.jsx';

export function HomeView({ t, showToast, initialSubTab, isMobile }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'overview');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const segmentedOptions = [
    { key: 'overview', label: isMobile ? t('Overview', '概览') : t('System Overview', '运行概览') },
    { key: 'routes', label: isMobile ? t('Navigator', '导航') : t('Route Navigator', '路由导航') },
    { key: 'errors', label: isMobile ? t('Errors', '异常') : t('Error Routes', '异常路由') }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('RSSHub Home Portal', 'RSSHub 主页综合门户')}</h1>
        <p className="page-subtitle">{t('Unified dashboard for instance health, route directory, and live diagnostics', '集微服务健康看板、官方路由检索与故障诊断于一体的综合门户')}</p>
      </div>

      {/* Segmented Control Switcher */}
      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* Sub-view Content */}
      {activeSubTab === 'overview' && <OverviewSubView t={t} showToast={showToast} />}
      {activeSubTab === 'routes' && <RouteNavSubView t={t} showToast={showToast} />}
      {activeSubTab === 'errors' && <RouteErrorsSubView t={t} showToast={showToast} />}
    </div>
  );
}

export default HomeView;
