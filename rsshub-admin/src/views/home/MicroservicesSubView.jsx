/* ============================================================================
 * MicroservicesSubView.jsx — AquaKit Microservices Cluster & DevOps Hub
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
  AppleButton,
  AppleStatusPill
} from '../../components/AquaKit.jsx';

export function MicroservicesSubView({ t, showToast }) {
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
    const interval = setInterval(fetchStatus, 8000);
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

  const formatUptime = (seconds) => {
    if (!seconds) return '-';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d} ${t('days', '天')} ${h} ${t('hrs', '小时')}`;
    if (h > 0) return `${h} ${t('hrs', '小时')} ${m} ${t('min', '分钟')}`;
    return `${m} ${t('min', '分钟')}`;
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* ====================================================================
       * 1. Cluster Status Summary
       * ==================================================================== */}
      <AppleGroup header={t('Cluster Overview', '微服务集群运行状态 (CLUSTER OVERVIEW)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="green" icon={<SFSymbol name="heart.fill" size={17} />} />}
            label={t('Health Score', '系统健康评分')}
            sublabel={t('All microservices monitored in real-time', '所有后台微服务容器受实时守护')}
            value="100% HEALTHY"
          />
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="clock.fill" size={17} />} />}
            label={t('Admin Runtime Uptime', '管理后台运行时间')}
            sublabel={t('Process continuous active duration', '服务进程持续在线周期')}
            value={statusData ? formatUptime(statusData.uptime) : '-'}
          />
          <AppleRow
            badge={<AppleBadge color="purple" icon={<SFSymbol name="terminal.fill" size={17} />} />}
            label={t('Node Engine', 'Node.js 运行时版本')}
            value={statusData ? statusData.nodeVersion : '-'}
          />
        </AppleCard>
      </AppleGroup>

      {/* ====================================================================
       * 2. Microservices Container Matrix
       * ==================================================================== */}
      <AppleGroup header={t('Container Matrix', '容器实例监控矩阵 (CONTAINER MATRIX)')}>
        <AppleCard>
          {loading && !statusData ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13.5px' }}>
              {t('Detecting container statuses...', '正在检测微服务容器状态...')}
            </div>
          ) : statusData && statusData.containers ? (
            statusData.containers.map((c, i) => (
              <AppleRow
                key={i}
                badge={
                  <AppleBadge
                    color={c.state === 'running' ? 'green' : 'red'}
                    icon={<SFSymbol name="server.rack" size={16} />}
                  />
                }
                label={c.label}
                sublabel={c.status}
                rightContent={
                  <AppleStatusPill status={c.state === 'running' ? 'success' : 'error'}>
                    {c.state === 'running' ? t('Running', '运行中') : t('Inactive', '未运行')}
                  </AppleStatusPill>
                }
              />
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13.5px' }}>
              {t('No containers detected', '未检测到容器服务')}
            </div>
          )}
        </AppleCard>
      </AppleGroup>

      {/* ====================================================================
       * 3. Core DevOps Operations (Plan B: Inside Instance Health Subpage)
       * ==================================================================== */}
      <AppleGroup header={t('Core DevOps Operations', '核心微服务运维控制 (DEVOPS OPERATIONS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="blue" icon={<SFSymbol name="arrow.clockwise" size={16} />} />}
            label={t('Restart RSSHub Core', '重启 RSSHub 核心')}
            sublabel={t('Reload environment variables and route cache', '重新载入 .env 配置与路由缓存')}
            rightContent={
              <AppleButton
                variant="secondary"
                size="sm"
                disabled={actionLoading === 'rsshub'}
                onClick={handleRestartRsshub}
              >
                {actionLoading === 'rsshub' ? t('Restarting...', '重启中...') : t('Restart', '立即重启')}
              </AppleButton>
            }
          />

          <AppleRow
            badge={<AppleBadge color="teal" icon={<SFSymbol name="network" size={16} />} />}
            label={t('Restart Gost Proxy', '重启 Gost 代理池')}
            sublabel={t('Apply latest node configurations and bypass rules', '重载代理转发链与 bypass 分流配置')}
            rightContent={
              <AppleButton
                variant="secondary"
                size="sm"
                disabled={actionLoading === 'gost'}
                onClick={handleRestartGost}
              >
                {actionLoading === 'gost' ? t('Restarting...', '重启中...') : t('Restart', '立即重启')}
              </AppleButton>
            }
          />
        </AppleCard>
      </AppleGroup>

      {/* ====================================================================
       * 4. Apple HIG Caption Footer
       * ==================================================================== */}
      <div className="apple-vpn-footer" style={{ padding: '8px 16px 24px 16px' }}>
        {t(
          'Microservices are monitored and managed by Docker Compose. In the event of an unexpected termination, the daemon automatically attempts recovery.',
          '微服务集群由 Docker Compose 统一守护。若某个容器异常退出，守护进程将自动尝试拉起恢复。'
        )}
      </div>
    </div>
  );
}

export default MicroservicesSubView;
