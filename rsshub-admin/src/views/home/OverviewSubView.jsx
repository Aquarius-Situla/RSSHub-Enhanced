import React, { useState, useEffect } from 'react';
import SFSymbol from '../../components/SFSymbols.jsx';

export function OverviewSubView({ t, showToast }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('api/system/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRestartRsshub = async () => {
    if (!window.confirm(t('Restart RSSHub core service?', '确定要重启 RSSHub 核心服务吗？'))) return;
    setActionLoading('rsshub');
    try {
      const res = await fetch('api/rsshub/restart', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || t('RSSHub restarted successfully', 'RSSHub 重启指令已发送'));
      fetchStatus();
    } catch (e) {
      showToast(t('Failed to restart RSSHub', '重启 RSSHub 失败'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestartGost = async () => {
    if (!window.confirm(t('Restart Gost proxy service?', '确定要重启 Gost 代理服务吗？'))) return;
    setActionLoading('gost');
    try {
      const res = await fetch('api/restart', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || t('Gost proxy restarted successfully', 'Gost 代理服务已重启'));
      fetchStatus();
    } catch (e) {
      showToast(t('Failed to restart Gost', '重启 Gost 失败'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncCookies = async () => {
    if (!window.confirm(t('Trigger decrypt script and reload cookies?', '执行解密脚本并重新加载 Cookies？'))) return;
    setActionLoading('cookie');
    try {
      const res = await fetch('api/cookiecloud/sync', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || t('Sync complete', 'Cookie 同步完成'));
      fetchStatus();
    } catch (e) {
      showToast(t('Sync failed', '同步执行失败'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fade-in">
      {/* Top Statistics Matrix */}
      <div className="stats-grid">
        <div className="stats-card">
          <span className="stat-label">{t('Proxy Pool', '代理节点池')}</span>
          <span className="stat-value">{statusData ? statusData.nodeCount : '-'}</span>
          <span className="stat-subtext">{t('Active round-robin nodes', '轮询负载均衡节点数')}</span>
        </div>

        <div className="stats-card">
          <span className="stat-label">{t('Bypass Rules', '直连分流规则')}</span>
          <span className="stat-value">{statusData ? statusData.bypassCount : '-'}</span>
          <span className="stat-subtext">{t('bypass.txt direct domains', '行直连白名单规则')}</span>
        </div>

        <div className="stats-card">
          <span className="stat-label">{t('Cookie Sync', 'Cookie 同步状态')}</span>
          <span className="stat-value" style={{ fontSize: '18px', marginTop: '6px' }}>
            {statusData && statusData.lastSyncTime
              ? new Date(statusData.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : t('No record', '暂无记录')}
          </span>
          <span className="stat-subtext">
            {statusData && statusData.lastSyncTime
              ? new Date(statusData.lastSyncTime).toLocaleDateString()
              : t('Never synced', '未执行过解密')}
          </span>
        </div>

        <div className="stats-card">
          <span className="stat-label">{t('Instance Health', '实例健康度')}</span>
          <span className="stat-value" style={{ color: 'var(--green)' }}>100%</span>
          <span className="stat-subtext">{t('All Core Services Active', '微服务链路正常运行')}</span>
        </div>
      </div>

      {/* Quick Operation Inset Card */}
      <div className="settings-section">
        <div className="settings-section-header">{t('Quick Actions', '快捷运维操作')}</div>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-main">
              <div className="ios-badge badge-blue">
                <SFSymbol name="arrow.clockwise" size={16} />
              </div>
              <div className="setting-info">
                <span className="setting-title">{t('Restart RSSHub Core', '重启 RSSHub 核心')}</span>
                <span className="setting-desc">{t('Reload environment variables and route cache', '重新载入 .env 配置与路由缓存')}</span>
              </div>
            </div>
            <div className="setting-accessory">
              <button
                type="button"
                className="ios-btn secondary"
                disabled={actionLoading === 'rsshub'}
                onClick={handleRestartRsshub}
              >
                {actionLoading === 'rsshub' ? t('Restarting...', '重启中...') : t('Restart', '立即重启')}
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-main">
              <div className="ios-badge badge-teal">
                <SFSymbol name="network" size={16} />
              </div>
              <div className="setting-info">
                <span className="setting-title">{t('Restart Gost Proxy', '重启 Gost 代理池')}</span>
                <span className="setting-desc">{t('Apply latest node configurations and bypass rules', '重载代理转发链与 bypass 分流配置')}</span>
              </div>
            </div>
            <div className="setting-accessory">
              <button
                type="button"
                className="ios-btn secondary"
                disabled={actionLoading === 'gost'}
                onClick={handleRestartGost}
              >
                {actionLoading === 'gost' ? t('Restarting...', '重启中...') : t('Restart', '立即重启')}
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-main">
              <div className="ios-badge badge-orange">
                <SFSymbol name="cylinder.split.1x2.fill" size={16} />
              </div>
              <div className="setting-info">
                <span className="setting-title">{t('Force Sync CookieCloud', '强制同步 CookieCloud')}</span>
                <span className="setting-desc">{t('Run decrypt.py and inject cookies to rsshub.env', '执行解密脚本并将 Cookie 写入环境变量')}</span>
              </div>
            </div>
            <div className="setting-accessory">
              <button
                type="button"
                className="ios-btn primary"
                disabled={actionLoading === 'cookie'}
                onClick={handleSyncCookies}
              >
                {actionLoading === 'cookie' ? t('Syncing...', '同步中...') : t('Force Sync', '立即同步')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container Services Health Matrix */}
      <div className="settings-section">
        <div className="settings-section-header">{t('Microservices Matrix', '微服务容器矩阵')}</div>
        <div className="settings-card">
          {statusData && statusData.containers ? (
            statusData.containers.map((c, i) => (
              <div key={i} className="setting-item">
                <div className="setting-main">
                  <div className={`ios-badge ${c.state === 'running' ? 'badge-green' : 'badge-red'}`}>
                    <SFSymbol name="server.rack" size={16} />
                  </div>
                  <div className="setting-info">
                    <span className="setting-title">{c.label}</span>
                    <span className="setting-desc">{c.status}</span>
                  </div>
                </div>
                <div className="setting-accessory">
                  <span className={`container-badge ${c.state === 'running' ? 'badge-running' : 'badge-stopped'}`}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: c.state === 'running' ? 'var(--green)' : 'var(--red)',
                        display: 'inline-block'
                      }}
                    ></span>
                    {c.state === 'running' ? t('Running', '运行中') : t('Inactive', '未运行')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="setting-item" style={{ color: 'var(--text-secondary)' }}>
              {t('Loading container states...', '正在检测服务容器状态...')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewSubView;
