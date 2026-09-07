import React, { useState, useEffect } from 'react';
import SFSymbol from '../../components/SFSymbols.jsx';

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
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
            {t('Hot Error Routes Monitor', '异常路由故障监控')}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t('Live diagnostics from RSSHub debug logs and recent failure events', '基于 RSSHub /debug 热门报错与容器近期异常拦截日志')}
          </span>
        </div>
        <button
          type="button"
          className="ios-btn secondary"
          style={{ padding: '6px 12px', fontSize: '12.5px' }}
          onClick={fetchErrors}
          disabled={loading}
        >
          {loading ? t('Scanning...', '扫描中...') : t('Refresh', '刷新检测')}
        </button>
      </div>

      <div className="settings-section">
        <div className="settings-card">
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              {t('Analyzing route health telemetry...', '正在分析路由运行日志与健康指标...')}
            </div>
          ) : errors.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                {t('All Routes Functioning Smoothly', '全站路由运行平稳')}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {t('No hot error routes or blocking detected on this instance.', '当前实例未捕获到频繁失效或被反爬拦截的异常路由。')}
              </div>
            </div>
          ) : (
            errors.map((item, index) => {
              const testRes = testResults[item.path];
              const isTesting = testingPath === item.path;

              return (
                <div key={index} className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="container-badge badge-stopped" style={{ fontSize: '11px' }}>
                        {item.status || 'Error'}
                      </span>
                      <span style={{ fontFamily: 'var(--sys-mono)', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.path}
                      </span>
                      {item.count > 1 && (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.count}次报错
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="ios-btn secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleTestErrorRoute(item.path)}
                        disabled={isTesting}
                      >
                        {isTesting ? t('Testing...', '测试中...') : t('Test Now', '立即重测')}
                      </button>
                      <a
                        href={`${window.location.origin}${item.path}.debug.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ios-btn secondary"
                        style={{ padding: '4px 8px', fontSize: '12px', textDecoration: 'none' }}
                      >
                        {t('.debug.json ↗', '.debug.json ↗')}
                      </a>
                    </div>
                  </div>

                  {item.message && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontFamily: 'var(--sys-mono)', background: 'var(--input-bg)', padding: '6px 10px', borderRadius: '6px', width: '100%', wordBreak: 'break-all' }}>
                      {item.message}
                    </div>
                  )}

                  {testRes && (
                    <div style={{ background: 'var(--input-bg)', border: '0.5px solid var(--separator-subtle)', borderRadius: '6px', padding: '8px 12px', width: '100%', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span className={`container-badge ${testRes.status === 200 ? 'badge-running' : 'badge-stopped'}`}>
                          {testRes.status} {testRes.statusText || ''}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {testRes.durationMs ? `${testRes.durationMs}ms` : ''}
                        </span>
                      </div>
                      {testRes.snippet && (
                        <pre style={{ margin: '6px 0 0', fontSize: '11px', maxHeight: '80px', overflowY: 'auto', color: 'var(--text-secondary)' }}>
                          {testRes.snippet}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default RouteErrorsSubView;
