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
import {
  AppleGroup,
  AppleCard,
  AppleRow,
  AppleBadge,
  AppleButton,
  AppleSwitch,
  AppleNavStack
} from '../components/AquaKit.jsx';

export function ProxyView({ t, showToast, subTab, onSelectSubTab }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState('auto');
  const [vpnEnabled, setVpnEnabled] = useState(true);
  const [bypassText, setBypassText] = useState('');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [modalNode, setModalNode] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pings, setPings] = useState({});
  const [savingBypass, setSavingBypass] = useState(false);

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
        fetch('api/nodes').then(r => r.json()),
        fetch('api/bypass').then(r => r.json())
      ]);
      setNodes(nodesRes.nodes || []);
      setSelectedNode(nodesRes.selectedNode || 'auto');
      setVpnEnabled(nodesRes.vpnEnabled !== false);
      setBypassText(bypassRes.content || '');
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

  const insertBypassPreset = (presetText) => {
    const current = bypassText.trim();
    if (current.includes(presetText.trim())) {
      showToast(t('Preset rules already present', '预设规则已存在'));
      return;
    }
    const updated = current ? `${current}\n\n# --- Preset Rules ---\n${presetText}` : presetText;
    setBypassText(updated);
    showToast(t('Preset rules added to editor', '预设规则已追加到编辑器'));
  };

  /* ==========================================================================
   * Root View: Exact 1:1 Apple iOS VPN Layout
   * ========================================================================== */
  const rootView = (
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

      {/* 5. Whitelist & Bypass Rules Entry */}
      <AppleGroup header={t('Direct Whitelist', '直连白名单 (BYPASS)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="indigo" icon={<SFSymbol name="shield.fill" size={17} />} />}
            label={t('Bypass Rules Whitelist', '直连分流规则')}
            sublabel="bypass.txt"
            value={`${bypassText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length} ${t('Rules', '条规则')}`}
            chevron={true}
            onClick={() => onSelectSubTab('bypass')}
          />
        </AppleCard>
      </AppleGroup>

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
    </div>
  );

  /* ==========================================================================
   * Subpage: Direct Routing Whitelist (bypass.txt)
   * ========================================================================== */
  const bypassSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => insertBypassPreset('.bilibili.com\n.bilivideo.com\n.hdslb.com')}
          >
            + Bilibili
          </AppleButton>
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => insertBypassPreset('.weibo.com\n.weibo.cn\n.sinaimg.cn')}
          >
            + 微博
          </AppleButton>
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => insertBypassPreset('127.0.0.1\n10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16')}
          >
            + 局域网/内网
          </AppleButton>
        </div>

        <AppleButton
          variant="primary"
          size="sm"
          onClick={handleSaveBypass}
          disabled={savingBypass}
        >
          {savingBypass ? t('Saving...', '保存中...') : t('Save Rules', '保存规则')}
        </AppleButton>
      </div>

      <AppleGroup header={`bypass.txt (${bypassText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length} ${t('Active Rules', '条有效规则')})`}>
        <AppleCard style={{ padding: '16px' }}>
          <textarea
            className="ios-textarea"
            rows={12}
            value={bypassText}
            onChange={e => setBypassText(e.target.value)}
            placeholder={t('# Enter IP CIDR or domain rules (one per line)...\n# E.g.:\n127.0.0.1\n.bilibili.com\n.weibo.com', '# 每行输入一个直连域名或 IP 段规则...\n# 例如:\n127.0.0.1\n.bilibili.com\n.weibo.com')}
          />
          <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--apple-text-secondary)' }}>
            💡 {t('Any request matching rules in bypass.txt will connect directly without routing through Gost proxy nodes.', '包含在 bypass.txt 中的域名或 IP 将不经由代理节点，直接发起请求。')}
          </div>
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
        bypass: bypassSubpage
      }}
    />
  );
}

export default ProxyView;
