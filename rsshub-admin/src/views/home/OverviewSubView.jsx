/* ============================================================================
 * OverviewSubView.jsx — AquaKit Health Matrix & DevOps Operations
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React, { useState, useEffect } from 'react';
import SFSymbol from '../../components/SFSymbols.jsx';
import {
  AppleHealthGrid,
  AppleHealthCard,
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleButton,
  AppleStatusPill
} from '../../components/AquaKit.jsx';

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
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* ====================================================================
       * 1. Responsive Apple Health Metrics Grid (1-col mobile, 2-col desktop)
       * ==================================================================== */}
      <div style={{ marginBottom: '20px' }}>
        <AppleHealthGrid>
          <AppleHealthCard
            category={t('Proxy Pool', '代理节点池')}
            categoryColor="cyan"
            icon={<SFSymbol name="network" size={16} />}
            time={t('Round-Robin', '轮询负载')}
            statLabel={t('Active Nodes', '活跃节点')}
            heroNumber={statusData ? String(statusData.nodeCount) : '-'}
            heroUnit={t('Nodes', '个')}
            bars={[
              { height: 16 },
              { height: 26 },
              { height: 22, active: true },
              { height: 32, active: true }
            ]}
            chevron={false}
          />

          <AppleHealthCard
            category={t('Bypass Rules', '直连分流')}
            categoryColor="purple"
            icon={<SFSymbol name="shield.fill" size={16} />}
            time="bypass.txt"
            statLabel={t('Direct Domains', '白名单规则')}
            heroNumber={statusData ? String(statusData.bypassCount) : '-'}
            heroUnit={t('Rules', '条')}
            bars={[
              { height: 14 },
              { height: 20 },
              { height: 26 },
              { height: 32, active: true }
            ]}
            chevron={false}
          />

          <AppleHealthCard
            category="CookieCloud"
            categoryColor="orange"
            icon={<SFSymbol name="cylinder.split.1x2.fill" size={16} />}
            time={statusData && statusData.lastSyncTime ? new Date(statusData.lastSyncTime).toLocaleDateString() : t('Never', '未执行')}
            statLabel={t('Last Decrypted', '最后解密')}
            heroNumber={statusData && statusData.lastSyncTime ? new Date(statusData.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
            heroUnit=""
            bars={[
              { height: 18 },
              { height: 32, active: true },
              { height: 16 },
              { height: 28, active: true }
            ]}
            chevron={false}
          />

          <AppleHealthCard
            category={t('Instance Health', '实例健康度')}
            categoryColor="green"
            icon={<SFSymbol name="heart.fill" size={16} />}
            time={t('All Microservices', '全微服务集群')}
            statLabel={t('System Uptime', '健康评分')}
            heroNumber="100"
            heroUnit="%"
            bars={[
              { height: 24, active: true },
              { height: 28, active: true },
              { height: 32, active: true },
              { height: 32, active: true }
            ]}
            chevron={false}
          />
        </AppleHealthGrid>
      </div>

      {/* ====================================================================
       * 2. Quick Operations Card (AppleGroup & AppleCard)
       * ==================================================================== */}
      <AppleGroup header={t('Quick DevOps Actions', '快捷运维操作 (QUICK ACTIONS)')}>
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

          <AppleRow
            badge={<AppleBadge color="orange" icon={<SFSymbol name="cylinder.split.1x2.fill" size={16} />} />}
            label={t('Force Sync CookieCloud', '强制同步 CookieCloud')}
            sublabel={t('Run decrypt.py and inject cookies to rsshub.env', '执行解密脚本并将 Cookie 写入环境变量')}
            rightContent={
              <AppleButton
                variant="primary"
                size="sm"
                disabled={actionLoading === 'cookie'}
                onClick={handleSyncCookies}
              >
                {actionLoading === 'cookie' ? t('Syncing...', '同步中...') : t('Force Sync', '立即同步')}
              </AppleButton>
            }
          />
        </AppleCard>
      </AppleGroup>

      {/* ====================================================================
       * 3. Microservices Matrix (AppleGroup & AppleStatusPill)
       * ==================================================================== */}
      <AppleGroup header={t('Microservices Matrix', '微服务容器矩阵 (MICROSERVICES MATRIX)')}>
        <AppleCard>
          {statusData && statusData.containers ? (
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
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13px' }}>
              {t('Detecting container statuses...', '正在检测微服务容器状态...')}
            </div>
          )}
        </AppleCard>
      </AppleGroup>
    </div>
  );
}

export default OverviewSubView;
