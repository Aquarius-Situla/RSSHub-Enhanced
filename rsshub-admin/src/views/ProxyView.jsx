/* ============================================================================
 * ProxyView.jsx — AquaKit iOS VPN Style Proxy Management & Routing Rules
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

import React, { useState, useEffect, useRef } from 'react';
import SFSymbol from '../components/SFSymbols.jsx';
import telemetryCache from '../utils/telemetryCache.js';
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleButton,
  AppleSwitch,
  AppleSegmentedControl,
  AppleNavStack
} from '../components/AquaKit.jsx';

export function ProxyView({t, showToast, subTab, onSelectSubTab, onBack}) {
  const cachedNodes = telemetryCache.get('proxyNodes');
  const cachedBypass = telemetryCache.get('bypassText');

  const [nodes, setNodes] = useState(cachedNodes?.nodes || []);
  const [selectedNode, setSelectedNode] = useState(cachedNodes?.selectedNode || 'auto');
  const [vpnEnabled, setVpnEnabled] = useState(cachedNodes?.vpnEnabled !== false);
  const [bypassText, setBypassText] = useState(cachedBypass || '');
  const [loading, setLoading] = useState(!cachedNodes);
  const [switching, setSwitching] = useState(false);
  const [modalNode, setModalNode] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pings, setPings] = useState({});
  const [savingBypass, setSavingBypass] = useState(false);

  /* Apple Inset Grouped Bypass Subpage States */
  const [bypassViewMode, setBypassViewMode] = useState('rules');
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');

  /* Add Node Form State */
  const [newNodeUrl, setNewNodeUrl] = useState('');
  const [newNodeAuth, setNewNodeAuth] = useState('');
  const [newNodeMaxFails, setNewNodeMaxFails] = useState('3');
  const [newNodeFailTimeout, setNewNodeFailTimeout] = useState('30s');
  const [newNodeBypass, setNewNodeBypass] = useState(false);

  const fileInputRef = useRef(null);

  /* Load Initial State */
  const loadData = async () => {
    try {
      const [nodesRes, bypassRes] = await Promise.all([
        fetch('api/nodes').then(r => r.json()).catch(() => null),
        fetch('api/bypass').then(r => r.json()).catch(() => null)
      ]);
      if (nodesRes) {
        telemetryCache.set('proxyNodes', nodesRes);
        setNodes(nodesRes.nodes || []);
        setSelectedNode(nodesRes.selectedNode || 'auto');
        setVpnEnabled(nodesRes.vpnEnabled !== false);
      }
      if (bypassRes && bypassRes.content !== undefined) {
        telemetryCache.set('bypassText', bypassRes.content);
        setBypassText(bypassRes.content);
      }
    } catch (e) {
      console.error('Failed to load proxy data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* Toggle VPN State */
  const handleToggleVpn = async (enabled) => {
    setSwitching(true);
    try {
      const res = await fetch('api/nodes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (data.success) {
        setVpnEnabled(data.vpnEnabled);
        showToast(data.vpnEnabled ? t('Proxy connected', '代理服务已连接') : t('Proxy disconnected', '代理服务已断开'));
      }
    } catch (err) {
      showToast(t('Failed to toggle proxy state', '切换代理状态失败'));
    } finally {
      setSwitching(false);
    }
  };

  /* Select Node (Auto or Specific URL) */
  const handleSelectNode = async (targetUrl) => {
    if (targetUrl === selectedNode) return;
    setSwitching(true);
    try {
      const res = await fetch('api/nodes/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedNode: targetUrl })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedNode(data.selectedNode);
        if (data.selectedNode === 'auto') {
          showToast(t('Switched to Auto routing mode', '已切换至「自动」轮询模式'));
        } else {
          showToast(t('Selected node: ', '已选择节点: ') + targetUrl.split('@').pop());
        }
      }
    } catch (err) {
      showToast(t('Failed to switch proxy node', '切换节点失败'));
    } finally {
      setSwitching(false);
    }
  };

  /* Ping Node Latency */
  const handlePingNode = async (url) => {
    setPings(prev => ({ ...prev, [url]: { testing: true } }));
    try {
      const res = await fetch('api/nodes/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.success) {
        setPings(prev => ({ ...prev, [url]: { testing: false, latency: data.latency } }));
      } else {
        setPings(prev => ({ ...prev, [url]: { testing: false, error: data.error || 'Timeout' } }));
      }
    } catch (err) {
      setPings(prev => ({ ...prev, [url]: { testing: false, error: 'Fail' } }));
    }
  };

  /* Save Edited Node from Modal */
  const handleSaveModalNode = async () => {
    if (!modalNode) return;
    const updated = [...nodes];
    updated[modalNode.idx] = {
      url: modalNode.url,
      auth: modalNode.auth || '',
      maxFails: modalNode.maxFails || '3',
      failTimeout: modalNode.failTimeout || '30s',
      bypass: Boolean(modalNode.bypass)
    };

    try {
      const res = await fetch('api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updated, selectedNode, vpnEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setNodes(updated);
        showToast(t('Node updated successfully!', '节点配置已更新！'));
        setModalNode(null);
      }
    } catch (err) {
      showToast(t('Failed to save node', '保存节点配置失败'));
    }
  };

  /* Delete Node from Modal */
  const handleDeleteModalNode = async () => {
    if (!modalNode) return;
    if (!window.confirm(t('Delete this proxy node?', '确定要删除该代理节点吗？'))) return;

    const filtered = nodes.filter((_, i) => i !== modalNode.idx);
    let nextSelected = selectedNode;
    if (selectedNode === modalNode.url) {
      nextSelected = 'auto';
    }

    try {
      const res = await fetch('api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: filtered, selectedNode: nextSelected, vpnEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setNodes(filtered);
        setSelectedNode(nextSelected);
        showToast(t('Node deleted', '节点已删除'));
        setModalNode(null);
      }
    } catch (err) {
      showToast(t('Failed to delete node', '删除节点失败'));
    }
  };

  /* Add Node from Add Modal */
  const handleAddNewNode = async () => {
    if (!newNodeUrl.trim()) {
      showToast(t('Please enter node address (ip:port)', '请输入节点地址 (ip:port)'));
      return;
    }

    const newNode = {
      url: newNodeUrl.trim().replace(/^rr:\/\//, ''),
      auth: newNodeAuth.trim(),
      maxFails: newNodeMaxFails || '3',
      failTimeout: newNodeFailTimeout || '30s',
      bypass: Boolean(newNodeBypass)
    };

    const updated = [...nodes, newNode];

    try {
      const res = await fetch('api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updated, selectedNode, vpnEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setNodes(updated);
        showToast(t('Node added successfully!', '新代理节点添加成功！'));
        setIsAddModalOpen(false);
        setNewNodeUrl('');
        setNewNodeAuth('');
      }
    } catch (err) {
      showToast(t('Failed to add node', '添加节点失败'));
    }
  };

  /* Batch Import JSON */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const valid = imported.filter(n => n.url);
        const structured = valid.map(n => ({
          url: n.url.replace(/^rr:\/\//, ''),
          auth: n.auth || '',
          maxFails: n.maxFails || (n.params && n.params.includes('max_fails=') ? n.params.match(/max_fails=(\d+)/)[1] : '3'),
          failTimeout: n.failTimeout || (n.params && n.params.includes('fail_timeout=') ? n.params.match(/fail_timeout=([a-zA-Z0-9]+)/)[1] : '30s'),
          bypass: n.bypass !== undefined ? n.bypass : (n.params && n.params.includes('-bypass=/bypass.txt'))
        }));

        if (window.confirm(t(`Import ${structured.length} nodes?`, `确定导入 ${structured.length} 个节点吗？`))) {
          const merged = [...nodes, ...structured];
          await fetch('api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes: merged, selectedNode, vpnEnabled })
          });
          setNodes(merged);
          showToast(t('Nodes imported successfully!', '节点批量导入成功！'));
          setIsAddModalOpen(false);
        }
      } catch (err) {
        showToast(t('Invalid JSON format', '无效的 JSON 配置文件'));
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  /* Save Bypass.txt */
  const handleSaveBypass = async () => {
    setSavingBypass(true);
    try {
      await fetch('api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: bypassText })
      });
      showToast(t('bypass.txt saved successfully!', 'bypass.txt 直连分流规则已保存！'));
    } catch (e) {
      showToast(t('Failed to save bypass.txt', '保存 bypass.txt 失败'));
    } finally {
      setSavingBypass(false);
    }
  };

  const handleTogglePresetGroup = async (preset) => {
    const existing = bypassText.split('\n').map(l => l.trim()).filter(Boolean);
    const allPresent = preset.rules.every(r => existing.includes(r));

    let updated;
    if (allPresent) {
      /* Remove all preset rules from bypass */
      updated = existing.filter(l => !preset.rules.includes(l)).join('\n');
      showToast(`${t('Removed preset:', '已移除预设:')} ${preset.title}`);
    } else {
      /* Append missing preset rules */
      const missing = preset.rules.filter(r => !existing.includes(r));
      updated = existing.length ? `${existing.join('\n')}\n${missing.join('\n')}` : missing.join('\n');
      showToast(`${t('Added preset:', '已启用预设:')} ${preset.title}`);
    }
    setBypassText(updated);
    try {
      await fetch('api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRule = async (ruleToDelete) => {
    const lines = bypassText.split('\n');
    const updated = lines.filter(line => line.trim() !== ruleToDelete.trim()).join('\n');
    setBypassText(updated);
    try {
      await fetch('api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated })
      });
      showToast(`${t('Removed rule:', '已移除规则:')} ${ruleToDelete}`);
    } catch (err) {
      showToast(t('Failed to delete rule', '移除规则失败'));
    }
  };

  const handleAddRuleSubmit = async () => {
    if (!newRuleInput.trim()) return;
    const linesToAdd = newRuleInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    const existing = bypassText.trim();
    const toAppend = linesToAdd.join('\n');
    const updated = existing ? `${existing}\n${toAppend}` : toAppend;

    setBypassText(updated);
    setNewRuleInput('');
    setIsAddRuleModalOpen(false);

    try {
      await fetch('api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updated })
      });
      showToast(t(`Added ${linesToAdd.length} rules successfully!`, `成功添加 ${linesToAdd.length} 条分流规则！`));
    } catch (err) {
      showToast(t('Failed to save rules', '保存分流规则失败'));
    }
  };

  /* ==========================================================================
   * Root View: Clean Top-Level Inset Grouped Menu Cards
   * ========================================================================== */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Network & Proxy Routing', '网络与分流 (NETWORK & PROXY)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="teal" icon={<SFSymbol name="network" size={17} />} />}
            label={t('Proxy Nodes Pool', '代理节点池')}
            sublabel={vpnEnabled ? (selectedNode === 'auto' ? t('Auto Mode', '自动轮询模式') : selectedNode.split('@').pop().split(':')[0]) : t('Disabled', '未连接')}
            value={`${nodes.length} ${t('Nodes', '个节点')}`}
            chevron={true}
            onClick={() => onSelectSubTab('nodes')}
          />

          <AppleRow
            badge={<AppleBadge color="indigo" icon={<SFSymbol name="shield.fill" size={17} />} />}
            label={t('Bypass Rules', '直连分流规则')}
            sublabel="bypass.txt"
            value={`${bypassText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length} ${t('Rules', '条规则')}`}
            chevron={true}
            onClick={() => onSelectSubTab('bypass')}
          />
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* ==========================================================================
   * Subpage: Nodes Pool (1:1 Apple iOS VPN Layout)
   * ========================================================================== */
  const nodesSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* 1. VPN Status Card */}
      <AppleGroup>
        <AppleCard>
          <div className="apple-row" style={{ minHeight: '50px' }}>
            <div className="apple-row-left">
              <span className="apple-row-label" style={{ fontSize: '16px', fontWeight: 500 }}>
                {t('VPN Status', 'VPN 状态')}
              </span>
            </div>
            <div className="apple-row-right">
              <span
                className="apple-row-value"
                style={{
                  color: vpnEnabled ? '#34c759' : 'var(--apple-text-secondary)',
                  marginRight: '6px',
                  fontWeight: 500
                }}
              >
                {vpnEnabled ? t('Connected', '已连接') : t('Not Connected', '未连接')}
              </span>
              <AppleSwitch
                checked={vpnEnabled}
                onChange={handleToggleVpn}
                disabled={switching}
              />
            </div>
          </div>
        </AppleCard>
      </AppleGroup>

      {/* 2. Device VPN Node List */}
      <AppleGroup header={t('Device VPN', '设备 VPN')}>
        <AppleCard>
          {/* Top Item: Auto (自动) */}
          <div
            className="apple-row"
            style={{ cursor: 'pointer', minHeight: '52px' }}
            onClick={() => handleSelectNode('auto')}
          >
            <div className="apple-row-left">
              {selectedNode === 'auto' ? (
                <span className="apple-vpn-check">
                  <SFSymbol name="checkmark" size={17} />
                </span>
              ) : (
                <span className="apple-vpn-check-placeholder" />
              )}
              <div className="apple-row-title-wrap">
                <span
                  className="apple-row-label"
                  style={{
                    fontSize: '15.5px',
                    fontWeight: selectedNode === 'auto' ? 600 : 400
                  }}
                >
                  {t('Auto', '自动')}
                </span>
                <span className="apple-row-sublabel">
                  {t('Optimal node / Round-robin load balancing', '最优节点 / 轮询负载均衡')} ({nodes.length} {t('nodes', '个节点')})
                </span>
              </div>
            </div>
            <div className="apple-row-right">
              <button
                type="button"
                className="apple-vpn-info-btn"
                title={t('Auto routing info', '自动模式说明')}
                onClick={(e) => {
                  e.stopPropagation();
                  showToast(t('Auto mode load balances traffic across all healthy nodes and automatically fails over.', '自动模式将流量在所有健康节点间轮询分发，并在节点异常时自动故障转移。'));
                }}
              >
                <SFSymbol name="info.circle" size={22} />
              </button>
            </div>
          </div>

          {/* Concrete Proxy Nodes */}
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '14px' }}>
              {t('Loading proxy nodes...', '正在加载节点数据...')}
            </div>
          ) : nodes.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13.5px' }}>
              {t('No proxy nodes configured. Tap "Add VPN Configuration..." below.', '暂无代理节点。请点击下方「添加 VPN 配置...」。')}
            </div>
          ) : (
            nodes.map((node, i) => {
              const isSelected = selectedNode === node.url;
              const pingData = pings[node.url];
              const displayHost = node.url.split('@').pop();

              return (
                <div
                  key={node.url || i}
                  className="apple-row"
                  style={{ cursor: 'pointer', minHeight: '52px' }}
                  onClick={() => handleSelectNode(node.url)}
                >
                  <div className="apple-row-left">
                    {isSelected ? (
                      <span className="apple-vpn-check">
                        <SFSymbol name="checkmark" size={17} />
                      </span>
                    ) : (
                      <span className="apple-vpn-check-placeholder" />
                    )}
                    <div className="apple-row-title-wrap">
                      <span
                        className="apple-row-label"
                        style={{
                          fontSize: '15.5px',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {displayHost.split(':')[0]}
                      </span>
                      <span className="apple-row-sublabel">
                        {node.auth ? `${node.auth.split(':')[0]} • ` : ''}
                        {`端口 ${displayHost.split(':')[1] || '8888'}`}
                        {node.bypass ? ' • 直连分流' : ''}
                        {pingData && pingData.latency !== undefined ? (
                          <span style={{ marginLeft: '6px', color: pingData.latency < 200 ? '#34c759' : pingData.latency < 500 ? '#ff9500' : '#ff3b30' }}>
                            • {pingData.latency}ms
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="apple-row-right">
                    <button
                      type="button"
                      className="apple-vpn-info-btn"
                      title={t('Node configuration and info', '节点配置与详情')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalNode({ ...node, idx: i });
                      }}
                    >
                      <SFSymbol name="info.circle" size={22} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </AppleCard>
      </AppleGroup>

      {/* 3. Action Row: Add VPN Configuration */}
      <AppleGroup>
        <AppleCard>
          <div
            className="apple-vpn-action-row"
            onClick={() => setIsAddModalOpen(true)}
          >
            {t('Add VPN Configuration...', '添加 VPN 配置...')}
          </div>
        </AppleCard>
      </AppleGroup>

      {/* 4. Apple iOS Caption Footer */}
      <div className="apple-vpn-footer">
        {t(
          'VPN can be used to control the routing of certain network traffic. Selecting "Auto" will load balance across available nodes and automatically fail over.',
          'VPN 可设置用于控制某些网络流量的路由。选择「自动」将根据可用性轮询负载并自动故障转移。'
        )}
      </div>
    </div>
  );

  /* ==========================================================================
   * Subpage: Direct Routing Whitelist (bypass.txt) — Apple HIG Redesign
   * ========================================================================== */
  const activeBypassRules = bypassText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  const PRESETS = [
    {
      id: 'media',
      title: t('Domestic Media Streaming', '国内主流音视频与媒体'),
      desc: 'Bilibili, 微博, 优酷, 爱奇艺, 腾讯视频',
      icon: 'play.tv.fill',
      badge: 'blue',
      rules: ['.bilibili.com', '.bilivideo.com', '.hdslb.com', '.weibo.com', '.weibo.cn', '.sinaimg.cn', '.youku.com', '.iqiyi.com']
    },
    {
      id: 'lan',
      title: t('LAN & Private IP Subnets', '局域网与私有 IP (RFC 1918)'),
      desc: '127.0.0.1, localhost, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16',
      icon: 'house.fill',
      badge: 'green',
      rules: ['127.0.0.1', 'localhost', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
    },
    {
      id: 'dev',
      title: t('Developer Public Mirrors', '开发者与公共镜像加速'),
      desc: 'GitHub 静态资源, npm 镜像, jsDelivr CDN',
      icon: 'network',
      badge: 'purple',
      rules: ['.github.com', '.githubusercontent.com', '.npmjs.org', '.jsdelivr.net']
    }
  ];

  const bypassSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      {/* 1. Top Segmented Control (Apple HIG 2-segment switcher) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <AppleSegmentedControl
          value={bypassViewMode}
          onChange={setBypassViewMode}
          options={[
            { label: t('Rule List', '结构化规则'), value: 'rules' },
            { label: t('Raw bypass.txt', '原始文件 (bypass.txt)'), value: 'raw' }
          ]}
        />
      </div>

      {bypassViewMode === 'rules' ? (
        <>
          {/* Section 1: Preset Whitelist Packs */}
          <AppleGroup header={t('Preset Whitelist Packs', '常用快捷分流包 (PRESET PACKS)')}>
            <AppleCard>
              {PRESETS.map((p, idx) => {
                const existing = bypassText.split('\n').map(l => l.trim()).filter(Boolean);
                const isEnabled = p.rules.every(r => existing.includes(r));
                const isPartial = !isEnabled && p.rules.some(r => existing.includes(r));

                return (
                  <AppleRow
                    key={p.id || idx}
                    badge={<AppleBadge color={p.badge} icon={<SFSymbol name={p.icon} size={16} />} />}
                    label={p.title}
                    sublabel={p.desc}
                    rightContent={
                      <AppleButton
                        variant={isEnabled ? 'tinted' : 'secondary'}
                        size="sm"
                        onClick={() => handleTogglePresetGroup(p)}
                      >
                        {isEnabled ? t('✓ Enabled', '✓ 已启用') : isPartial ? t('+ Add All', '+ 补全') : t('+ Add', '+ 启用')}
                      </AppleButton>
                    }
                  />
                );
              })}
            </AppleCard>
          </AppleGroup>

          {/* Section 2: Active Direct Rules List */}
          <AppleGroup header={`${t('Active Bypass Rules', '已生效直连规则')} (${activeBypassRules.length} ${t('Rules', '条')})`}>
            <AppleCard>
              {activeBypassRules.length === 0 ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--apple-text-secondary)', fontSize: '13.5px' }}>
                  {t('No direct rules configured. Tap "Add Bypass Rule..." below.', '暂无分流规则。请点击下方「添加分流规则...」添加。')}
                </div>
              ) : (
                activeBypassRules.map((rule, idx) => {
                  const isIp = /^(\d{1,3}\.){3}\d{1,3}/.test(rule) || rule.includes('/') || rule === 'localhost';
                  return (
                    <AppleRow
                      key={rule || idx}
                      badge={<AppleBadge color={isIp ? 'orange' : 'indigo'} icon={<SFSymbol name={isIp ? 'network' : 'shield.fill'} size={15} />} />}
                      label={rule}
                      sublabel={isIp ? t('CIDR IP / Local Subnet • Direct', 'CIDR IP 网段 · 直连透传') : t('Domain Suffix • Direct', '域名后缀匹配 · 直连透传 (绕过代理)')}
                      rightContent={
                        <AppleButton
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRule(rule)}
                          title={t('Delete Rule', '移除此规则')}
                        >
                          {t('Delete', '删除')}
                        </AppleButton>
                      }
                    />
                  );
                })
              )}
              {/* Bottom Action Row: Add Bypass Rule */}
              <div
                className="apple-vpn-action-row"
                style={{ borderTop: activeBypassRules.length > 0 ? '0.5px solid var(--apple-divider)' : 'none' }}
                onClick={() => setIsAddRuleModalOpen(true)}
              >
                + {t('Add Bypass Rule...', '添加分流规则...')}
              </div>
            </AppleCard>
          </AppleGroup>
        </>
      ) : (
        /* Section: Raw bypass.txt Monospace Editor */
        <AppleGroup header={`bypass.txt (${activeBypassRules.length} ${t('Active Rules', '条有效规则')})`}>
          <AppleCard style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--apple-text-secondary)' }}>
                {t('One rule per line (domains starting with dot match all subdomains)', '每行一条规则，点号开头的域名匹配其全部子域名')}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AppleButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(bypassText);
                    showToast(t('Copied bypass.txt to clipboard!', '已复制 bypass.txt 到剪贴板！'));
                  }}
                >
                  {t('Copy', '复制')}
                </AppleButton>
                <AppleButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveBypass}
                  disabled={savingBypass}
                >
                  {savingBypass ? t('Saving...', '保存中...') : t('Save Rules', '保存规则')}
                </AppleButton>
              </div>
            </div>

            <textarea
              className="ios-textarea"
              rows={14}
              style={{
                fontFamily: 'var(--apple-font-mono)',
                fontSize: '13px',
                lineHeight: '1.6',
                background: 'var(--apple-bg-input)',
                borderRadius: '8px',
                padding: '12px',
                border: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
              value={bypassText}
              onChange={e => setBypassText(e.target.value)}
              placeholder={t('# Enter IP CIDR or domain rules (one per line)...\n127.0.0.1\n.bilibili.com\n.weibo.com', '# 每行输入一个直连域名或 IP 段规则...\n127.0.0.1\n.bilibili.com\n.weibo.com')}
            />
          </AppleCard>
        </AppleGroup>
      )}

      {/* 4. Apple HIG Caption Footer */}
      <div className="apple-vpn-footer" style={{ padding: '8px 16px 24px 16px' }}>
        {t(
          'Bypass rules control direct network routing. Matching domains or IP ranges will bypass the Gost proxy and connect directly.',
          '分流规则用于控制某些特定网络流量的路由。命中上述白名单的域名或 IP 段在发起网络请求时将自动绕过 Gost 代理，由本地网络直连访问。'
        )}
      </div>
    </div>
  );

  return (
    <>
      <AppleNavStack
        activeSubpage={subTab}
        onBack={onBack || (() => onSelectSubTab(null))}
        rootView={rootView}
        subpages={{
          nodes: nodesSubpage,
          bypass: bypassSubpage
        }}
      />

      {/* Hidden File Input for Batch Import */}
      <input
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* ======================================================================
       * Modal Sheet: Node Details & Editing
       * ====================================================================== */}
      {modalNode && (
        <div className="apple-modal-overlay" onClick={() => setModalNode(null)}>
          <div className="apple-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="apple-modal-header">
              <h3 className="apple-modal-title">{t('Node Configuration', '代理节点配置')}</h3>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setModalNode(null)}
              >
                ✕
              </button>
            </div>

            <div className="apple-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                  {t('Node Address (ip:port)', '节点地址 (ip:port)')}
                </label>
                <input
                  type="text"
                  className="ios-input"
                  style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px' }}
                  value={modalNode.url}
                  onChange={e => setModalNode({ ...modalNode, url: e.target.value })}
                  placeholder="1.2.3.4:8080"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                  {t('Auth Credentials (user:password, optional)', '鉴权凭证 (账号:密码，可选)')}
                </label>
                <input
                  type="text"
                  className="ios-input"
                  style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px' }}
                  value={modalNode.auth || ''}
                  onChange={e => setModalNode({ ...modalNode, auth: e.target.value })}
                  placeholder="username:password"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                    max_fails
                  </label>
                  <input
                    type="number"
                    className="ios-input"
                    style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px' }}
                    value={modalNode.maxFails || '3'}
                    onChange={e => setModalNode({ ...modalNode, maxFails: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                    fail_timeout
                  </label>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px' }}
                    value={modalNode.failTimeout || '30s'}
                    onChange={e => setModalNode({ ...modalNode, failTimeout: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--apple-text-primary)', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  checked={Boolean(modalNode.bypass)}
                  onChange={e => setModalNode({ ...modalNode, bypass: e.target.checked })}
                />
                {t('Mount bypass.txt direct whitelist to this node', '为此节点挂载 bypass.txt 直连分流')}
              </label>

              {/* Latency Test Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--apple-bg-card)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--apple-text-primary)' }}>
                  {t('Network Latency Test', '网络延迟测速')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {pings[modalNode.url] && pings[modalNode.url].latency !== undefined ? (
                    <span style={{ fontSize: '13px', fontWeight: 600, color: pings[modalNode.url].latency < 200 ? '#34c759' : '#ff9500' }}>
                      {pings[modalNode.url].latency} ms
                    </span>
                  ) : pings[modalNode.url] && pings[modalNode.url].error ? (
                    <span style={{ fontSize: '12px', color: '#ff3b30' }}>
                      {pings[modalNode.url].error}
                    </span>
                  ) : null}
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    disabled={pings[modalNode.url] && pings[modalNode.url].testing}
                    onClick={() => handlePingNode(modalNode.url)}
                  >
                    {pings[modalNode.url] && pings[modalNode.url].testing ? t('Testing...', '测速中...') : t('Ping', '测试延迟')}
                  </AppleButton>
                </div>
              </div>
            </div>

            <div className="apple-modal-footer">
              <AppleButton
                variant="destructive"
                size="sm"
                onClick={handleDeleteModalNode}
              >
                {t('Delete Node', '删除节点')}
              </AppleButton>
              <AppleButton
                variant="primary"
                size="sm"
                onClick={handleSaveModalNode}
              >
                {t('Save', '保存')}
              </AppleButton>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
       * Modal Sheet: Add VPN Configuration
       * ====================================================================== */}
      {isAddModalOpen && (
        <div className="apple-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="apple-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="apple-modal-header">
              <h3 className="apple-modal-title">{t('Add VPN Configuration', '添加 VPN 配置')}</h3>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="apple-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                  {t('Server (ip:port)', '服务器 (ip:port)')} *
                </label>
                <input
                  type="text"
                  className="ios-input"
                  style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px' }}
                  value={newNodeUrl}
                  onChange={e => setNewNodeUrl(e.target.value)}
                  placeholder="e.g. 142.111.48.253:7030"
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                  {t('Auth Credentials (username:password, optional)', '鉴权凭证 (账号:密码，可选)')}
                </label>
                <input
                  type="text"
                  className="ios-input"
                  style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13.5px' }}
                  value={newNodeAuth}
                  onChange={e => setNewNodeAuth(e.target.value)}
                  placeholder="username:password"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                    max_fails
                  </label>
                  <input
                    type="number"
                    className="ios-input"
                    style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px' }}
                    value={newNodeMaxFails}
                    onChange={e => setNewNodeMaxFails(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                    fail_timeout
                  </label>
                  <input
                    type="text"
                    className="ios-input"
                    style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px' }}
                    value={newNodeFailTimeout}
                    onChange={e => setNewNodeFailTimeout(e.target.value)}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--apple-text-primary)', marginBottom: '18px' }}>
                <input
                  type="checkbox"
                  checked={newNodeBypass}
                  onChange={e => setNewNodeBypass(e.target.checked)}
                />
                {t('Mount bypass.txt direct whitelist to this node', '为此节点挂载 bypass.txt 直连分流')}
              </label>

              <div style={{ paddingTop: '10px', borderTop: '0.5px solid var(--apple-divider)' }}>
                <AppleButton
                  variant="secondary"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => fileInputRef.current.click()}
                >
                  {t('Batch Import JSON File...', '批量导入 JSON 配置文件...')}
                </AppleButton>
              </div>
            </div>

            <div className="apple-modal-footer">
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                {t('Cancel', '取消')}
              </AppleButton>
              <AppleButton
                variant="primary"
                size="sm"
                onClick={handleAddNewNode}
              >
                {t('Add Node', '添加节点')}
              </AppleButton>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
       * Modal Sheet: Add Bypass Rule
       * ====================================================================== */}
      {isAddRuleModalOpen && (
        <div className="apple-modal-overlay" onClick={() => setIsAddRuleModalOpen(false)}>
          <div className="apple-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="apple-modal-header">
              <h3 className="apple-modal-title">{t('Add Bypass Rule', '添加直连分流规则')}</h3>
              <button
                type="button"
                className="apple-modal-close-btn"
                onClick={() => setIsAddRuleModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="apple-modal-body">
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '5px' }}>
                  {t('Domain or IP CIDR (Support multi-line paste)', '域名或 IP 网段 (支持批量粘贴多行)')}
                </label>
                <textarea
                  className="ios-textarea"
                  rows={6}
                  style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                  value={newRuleInput}
                  onChange={e => setNewRuleInput(e.target.value)}
                  placeholder={t('.example.com\n192.168.1.0/24', '.example.com\n192.168.1.0/24')}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--apple-text-secondary)', lineHeight: '1.4' }}>
                  {t('Tips: Starting with a dot (e.g. .bilibili.com) will match all subdomains.', '提示：以点号开头的域名（例如 .bilibili.com）将自动匹配其全部二级与三级子域名。')}
                </div>
              </div>
            </div>

            <div className="apple-modal-footer">
              <AppleButton
                variant="secondary"
                size="sm"
                onClick={() => setIsAddRuleModalOpen(false)}
              >
                {t('Cancel', '取消')}
              </AppleButton>
              <AppleButton
                variant="primary"
                size="sm"
                onClick={handleAddRuleSubmit}
                disabled={!newRuleInput.trim()}
              >
                {t('Add & Apply', '添加并生效')}
              </AppleButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProxyView;