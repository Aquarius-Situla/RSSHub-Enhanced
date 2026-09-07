import React from 'react';
import SFSymbol from '../components/SFSymbols.jsx';
import OverviewSubView from './home/OverviewSubView.jsx';
import RouteNavSubView from './home/RouteNavSubView.jsx';
import RouteErrorsSubView from './home/RouteErrorsSubView.jsx';

export function HomeView({ t, showToast, subTab, onSelectSubTab }) {
  if (subTab === 'overview') {
    return <OverviewSubView t={t} showToast={showToast} />;
  }
  if (subTab === 'routes') {
    return <RouteNavSubView t={t} showToast={showToast} />;
  }
  if (subTab === 'errors') {
    return <RouteErrorsSubView t={t} showToast={showToast} />;
  }

  return (
    <div className="fade-in">
      <div className="ios-group-container">
        <div className="ios-section-header">
          {t('Dashboard & Diagnostic Hub', '服务监控与导航 (MONITORING & NAVIGATION)')}
        </div>
        <div className="ios-card">
          <div className="ios-row has-badge" onClick={() => onSelectSubTab('overview')}>
            <div className="ios-row-title">
              <div className="ios-badge badge-blue">
                <SFSymbol name="square.grid.2x2.fill" size={17} />
              </div>
              <span>{t('System Overview', '运行概览')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value">{t('100% Health', '微服务健康 100%')}</span>
              <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>

          <div className="ios-row has-badge" onClick={() => onSelectSubTab('routes')}>
            <div className="ios-row-title">
              <div className="ios-badge badge-purple">
                <SFSymbol name="safari.fill" size={17} />
              </div>
              <span>{t('Route Navigator', '路由导航')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value">{t('Directory & Test', '路由检索与测试')}</span>
              <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>

          <div className="ios-row has-badge" onClick={() => onSelectSubTab('errors')}>
            <div className="ios-row-title">
              <div className="ios-badge badge-red">
                <SFSymbol name="exclamationmark.triangle.fill" size={17} />
              </div>
              <span>{t('Error Routes', '故障监控')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value">{t('Live Diagnostics', '异常诊断')}</span>
              <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
