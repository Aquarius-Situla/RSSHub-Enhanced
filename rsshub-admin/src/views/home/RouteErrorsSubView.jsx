/* ============================================================================
 * RouteErrorsSubView.jsx — AquaKit Route Error Monitor & Diagnostics
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
  AppleButton,
  AppleStatusPill
} from '../../components/AquaKit.jsx';

export function RouteErrorsSubView({ t, showToast }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingPath, setTestingPath] = useState(null);
  const [testResults, setTestResults] = useState({});

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await fetch('api/routes/errors');
      if (res.ok) {
        const data = await res.json();
        setErrors(data.errors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const handleTestErrorRoute = async (routePath) => {
    setTestingPath(routePath);
    try {
      const res = await fetch(`api/routes/test?path=${encodeURIComponent(routePath)}`);
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [routePath]: data }));
      if (data.status === 200) {
        showToast(t('Route recovered: 200 OK!', '路由已恢复正常响应：200 OK！'));
      } else {
        showToast(`${t('Still erroring:', '仍然报错：')} ${data.status}`);
      }
    } catch (e) {
      showToast(t('Test request failed', '测试请求失败'));
    } finally {
      setTestingPath(null);
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--apple-text-primary)' }}>
            {t('Hot Error Routes Monitor', '异常路由故障监控')}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--apple-text-secondary)' }}>
            {t('Live diagnostics from RSSHub debug logs and recent failure events', '基于 RSSHub /debug 热门报错与容器近期异常拦截日志')}
          </span>
        </div>
        <AppleButton
          variant="secondary"
          size="sm"
          onClick={fetchErrors}
          disabled={loading}
        >
          {loading ? t('Scanning...', '扫描中...') : t('Refresh', '刷新检测')}
        </AppleButton>
      </div>

      <AppleGroup header={t('Detected Error Log', '异常路由排查清单 (ACTIVE FAILURES)')}>
        <AppleCard>
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13.5px' }}>
              {t('Analyzing route health telemetry...', '正在分析路由运行日志与健康指标...')}
            </div>
          ) : errors.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: 'var(--apple-text-primary)' }}>
                {t('All Routes Functioning Smoothly', '全站路由运行平稳')}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--apple-text-secondary)' }}>
                {t('No hot error routes or blocking detected on this instance.', '当前实例未捕获到频繁失效或被反爬拦截的异常路由。')}
              </div>
            </div>
          ) : (
            errors.map((item, index) => {
              const testRes = testResults[item.path];
              const isTesting = testingPath === item.path;

              return (
                <div
                  key={index}
                  style={{
                    padding: '14px',
                    borderBottom: index === errors.length - 1 ? 'none' : '0.5px solid var(--apple-divider)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AppleStatusPill status="error">
                        {item.status || 'Error'}
                      </AppleStatusPill>
                      <span style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px', fontWeight: 600, color: 'var(--apple-text-primary)' }}>
                        {item.path}
                      </span>
                      {item.count > 1 && (
                        <span style={{ fontSize: '10.5px', color: 'var(--apple-text-secondary)', background: 'var(--apple-bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.count}次报错
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <AppleButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTestErrorRoute(item.path)}
                        disabled={isTesting}
                      >
                        {isTesting ? t('Testing...', '测试中...') : t('Test Now', '立即重测')}
                      </AppleButton>
                      <a
                        href={`${window.location.origin}${item.path}.debug.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <AppleButton variant="secondary" size="sm">
                          .debug.json ↗
                        </AppleButton>
                      </a>
                    </div>
                  </div>

                  {item.message && (
                    <div style={{
                      fontSize: '11.5px',
                      color: 'var(--apple-text-secondary)',
                      fontFamily: 'var(--apple-font-mono)',
                      background: 'var(--apple-bg-input)',
                      padding: '6px 10px',
                      borderRadius: 'var(--apple-radius-control, 6px)',
                      width: '100%',
                      wordBreak: 'break-all'
                    }}>
                      {item.message}
                    </div>
                  )}

                  {testRes && (
                    <div style={{
                      background: 'var(--apple-bg-input)',
                      border: '0.5px solid var(--apple-divider)',
                      borderRadius: 'var(--apple-radius-control, 6px)',
                      padding: '8px 12px',
                      width: '100%',
                      marginTop: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <AppleStatusPill status={testRes.status === 200 ? 'success' : 'error'}>
                          {testRes.status} {testRes.statusText || ''}
                        </AppleStatusPill>
                        <span style={{ color: 'var(--apple-text-secondary)' }}>
                          {testRes.durationMs ? `${testRes.durationMs}ms` : ''}
                        </span>
                      </div>
                      {testRes.snippet && (
                        <pre style={{ margin: '6px 0 0', fontSize: '11px', maxHeight: '80px', overflowY: 'auto', color: 'var(--apple-text-secondary)' }}>
                          {testRes.snippet}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </AppleCard>
      </AppleGroup>
    </div>
  );
}

export default RouteErrorsSubView;
