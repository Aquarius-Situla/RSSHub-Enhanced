import React, { useState, useEffect, useRef } from 'react';
import SegmentedControl from '../components/SegmentedControl.jsx';

export function ProxyView({ t, showToast, initialSubTab, isMobile }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'nodes');
  const [nodes, setNodes] = useState([]);
  const [bypassText, setBypassText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    Promise.all([
      fetch('api/nodes').then(r => r.json()).then(d => setNodes(d.nodes || [])),
      fetch('api/bypass').then(r => r.json()).then(d => setBypassText(d.content || ''))
    ]).finally(() => setLoading(false));
  }, []);

  const segmentedOptions = [
    { key: 'nodes', label: isMobile ? t('Nodes', '节点') : t('Proxy Nodes', '代理节点') },
    { key: 'bypass', label: isMobile ? t('Bypass', '分流') : t('Bypass Rules', '分流规则') }
  ];

  // Node actions
  const updateNode = (idx, key, val) => {
    const copy = [...nodes];
    copy[idx][key] = val;
    setNodes(copy);
  };

  const addNode = () => {
    setNodes([...nodes, { url: '', auth: '', maxFails: '3', failTimeout: '30s', bypass: false }]);
    setExpandedIdx(nodes.length);
  };

  const removeNode = (idx) => {
    if (window.confirm(t('Delete this proxy node?', '确定要删除该代理节点吗？'))) {
      setNodes(nodes.filter((_, i) => i !== idx));
      if (expandedIdx === idx) setExpandedIdx(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const valid = imported.filter(n => n.url);
        const structured = valid.map(n => ({
          url: n.url.replace('rr://', ''),
          auth: n.auth || '',
          maxFails: n.maxFails || (n.params && n.params.includes('max_fails=') ? n.params.match(/max_fails=(\d+)/)[1] : '3'),
          failTimeout: n.failTimeout || (n.params && n.params.includes('fail_timeout=') ? n.params.match(/fail_timeout=([a-zA-Z0-9]+)/)[1] : '30s'),
          bypass: n.bypass !== undefined ? n.bypass : (n.params && n.params.includes('-bypass=/bypass.txt'))
        }));

        if (window.confirm(t(`Import ${structured.length} nodes?`, `确定导入 ${structured.length} 个节点吗？`))) {
          await fetch('api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes: structured })
          });
          setNodes(structured);
          showToast(t('Nodes imported successfully!', '节点批量导入成功！'));
        }
      } catch (err) {
        showToast(t('Invalid JSON format', '无效的 JSON 配置文件'));
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleApplyRestart = async () => {
    if (!window.confirm(t('Save node settings and restart Gost proxy container?', '是否确认保存节点配置并重启 Gost 代理服务？'))) return;
    setApplying(true);
    try {
      await fetch('api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes })
      });
      await fetch('api/restart', { method: 'POST' });
      showToast(t('Gost proxy updated and restarted successfully!', 'Gost 代理配置已生效并成功重启！'));
    } catch (err) {
      showToast(t('Failed to update and restart Gost', '保存并重启 Gost 代理失败'));
    } finally {
      setApplying(false);
    }
  };

  const handleSaveBypass = async () => {
    try {
      await fetch('api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: bypassText })
      });
      showToast(t('bypass.txt saved successfully!', 'bypass.txt 直连分流规则已保存！'));
    } catch (e) {
      showToast(t('Failed to save bypass.txt', '保存 bypass.txt 失败'));
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t('Network & Proxy Dispatch', '网络与代理调度')}</h1>
        <p className="page-subtitle">{t('Configure round-robin load-balancing proxies and bypass whitelist rules', '配置 Gost 轮询代理节点池与直连域名白名单分流')}</p>
      </div>

      <SegmentedControl
        options={segmentedOptions}
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
      />

      {/* Nodes Tab */}
      {activeSubTab === 'nodes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button className="ios-btn secondary small" onClick={() => fileInputRef.current.click()}>
                📥 {t('Import JSON', '导入 JSON')}
              </button>
              <button className="ios-btn secondary small" onClick={addNode}>
                + {t('Add Node', '添加节点')}
              </button>
            </div>

            <button
              className="ios-btn primary small"
              onClick={handleApplyRestart}
              disabled={applying}
            >
              {applying ? t('Applying...', '应用中...') : `🚀 ${t('Apply & Restart Gost', '保存并重启代理')}`}
            </button>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              {t('Round-Robin Proxy Pool', '轮询代理池')} ({nodes.length} {t('Nodes', '节点')})
            </div>
            <div className="settings-card">
              {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {t('Loading proxy nodes...', '正在加载节点数据...')}
                </div>
              ) : nodes.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {t('No proxy nodes configured. Click "+ Add Node" or import JSON.', '暂无代理节点配置。请点击上方「+ 添加节点」或导入 JSON 文件。')}
                </div>
              ) : (
                nodes.map((node, i) => (
                  <div key={i} style={{ borderBottom: i === nodes.length - 1 ? 'none' : '0.5px solid var(--separator-subtle)' }}>
                    <div className="setting-item">
                      <div className="setting-main">
                        <div className="ios-badge badge-teal">
                          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        </div>
                        <input
                          className="ios-input"
                          style={{ fontFamily: 'var(--sys-mono)', border: 'none', background: 'transparent', padding: '4px 8px', fontSize: '15px' }}
                          value={node.url}
                          onChange={e => updateNode(i, 'url', e.target.value)}
                          placeholder="ip:port"
                        />
                      </div>

                      <div className="setting-accessory">
                        <button
                          type="button"
                          className="icon-btn"
                          title={t('Configure parameters', '高级参数')}
                          style={{ background: 'none', border: 'none', color: expandedIdx === i ? 'var(--blue)' : 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
                          onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title={t('Delete node', '删除节点')}
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px' }}
                          onClick={() => removeNode(i)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Drawer */}
                    <div className={`node-drawer ${expandedIdx === i ? 'open' : ''}`}>
                      <div className="node-drawer-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Auth:', '认证:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '130px', padding: '5px 8px', fontSize: '13px' }}
                            value={node.auth || ''}
                            onChange={e => updateNode(i, 'auth', e.target.value)}
                            placeholder="user:pass"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Max Fails:', '重试阈值:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '60px', padding: '5px 8px', fontSize: '13px', textAlign: 'center' }}
                            value={node.maxFails}
                            onChange={e => updateNode(i, 'maxFails', e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Timeout:', '超时:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '13px', textAlign: 'center' }}
                            value={node.failTimeout}
                            onChange={e => updateNode(i, 'failTimeout', e.target.value)}
                            placeholder="30s"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Bypass Rules:', '绕过规则:')}</span>
                          <label className="ios-switch">
                            <input
                              type="checkbox"
                              checked={!!node.bypass}
                              onChange={e => updateNode(i, 'bypass', e.target.checked)}
                            />
                            <span className="ios-switch-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bypass Tab */}
      {activeSubTab === 'bypass' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="ios-btn secondary small"
                onClick={() => insertBypassPreset('.bilibili.com\n.weibo.com\n.zhihu.com')}
              >
                + {t('Bilibili/Weibo Preset', '常用社媒预设')}
              </button>
              <button
                className="ios-btn secondary small"
                onClick={() => insertBypassPreset('.qq.com\n.baidu.com\n.aliyun.com\n.163.com')}
              >
                + {t('Domestic Cloud Preset', '国内主流云与网关预设')}
              </button>
            </div>

            <button className="ios-btn primary small" onClick={handleSaveBypass}>
              💾 {t('Save bypass.txt', '保存规则')}
            </button>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              bypass.txt ({bypassText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length} {t('Active Rules', '条有效规则')})
            </div>
            <div className="settings-card" style={{ padding: '16px' }}>
              <textarea
                className="ios-textarea"
                rows={12}
                value={bypassText}
                onChange={e => setBypassText(e.target.value)}
                placeholder={t('# Enter IP CIDR or domain rules (one per line)...\n# E.g.:\n127.0.0.1\n.bilibili.com\n.weibo.com', '# 每行输入一个直连域名或 IP 段规则...\n# 例如:\n127.0.0.1\n.bilibili.com\n.weibo.com')}
              />
              <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                💡 {t('Any request matching rules in bypass.txt will connect directly without routing through Gost proxy nodes.', '包含在 bypass.txt 中的域名或 IP 将不经由代理节点，直接发起请求。')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProxyView;
