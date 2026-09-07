import React, { useState, useEffect, useRef } from 'react';
import SFSymbol from '../components/SFSymbols.jsx';

export function ProxyView({ t, showToast, subTab, onSelectSubTab }) {
  const [nodes, setNodes] = useState([]);
  const [bypassText, setBypassText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('api/nodes').then(r => r.json()).then(d => setNodes(d.nodes || [])),
      fetch('api/bypass').then(r => r.json()).then(d => setBypassText(d.content || ''))
    ]).finally(() => setLoading(false));
  }, []);

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

  if (subTab === 'nodes') {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="ios-btn secondary"
                onClick={() => fileInputRef.current.click()}
              >
                {t('Import JSON', '导入 JSON')}
              </button>
              <button
                type="button"
                className="ios-btn secondary"
                onClick={addNode}
              >
                + {t('Add Node', '添加节点')}
              </button>
            </div>

            <button
              type="button"
              className="ios-btn primary"
              onClick={handleApplyRestart}
              disabled={applying}
            >
              {applying ? t('Applying...', '应用中...') : t('Save & Restart', '保存并重启代理')}
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
                          <SFSymbol name="network" size={16} />
                        </div>
                        <input
                          className="ios-input"
                          style={{ fontFamily: 'var(--sys-mono)', border: 'none', background: 'transparent', padding: '4px 8px', fontSize: '14.5px' }}
                          value={node.url}
                          onChange={e => updateNode(i, 'url', e.target.value)}
                          placeholder="ip:port"
                        />
                      </div>

                      <div className="setting-accessory">
                        <button
                          type="button"
                          className="ios-btn secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        >
                          {expandedIdx === i ? t('Close', '收起') : t('Config', '参数')}
                        </button>
                        <button
                          type="button"
                          className="ios-btn danger"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => removeNode(i)}
                        >
                          {t('Delete', '删除')}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Drawer */}
                    <div className={`node-drawer ${expandedIdx === i ? 'open' : ''}`}>
                      <div className="node-drawer-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{t('Auth:', '认证:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '130px', padding: '5px 8px', fontSize: '12.5px' }}
                            value={node.auth || ''}
                            onChange={e => updateNode(i, 'auth', e.target.value)}
                            placeholder="user:pass"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{t('Max Fails:', '重试阈值:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '60px', padding: '5px 8px', fontSize: '12.5px', textAlign: 'center' }}
                            value={node.maxFails}
                            onChange={e => updateNode(i, 'maxFails', e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{t('Timeout:', '超时:')}</span>
                          <input
                            className="ios-input"
                            style={{ width: '70px', padding: '5px 8px', fontSize: '12.5px', textAlign: 'center' }}
                            value={node.failTimeout}
                            onChange={e => updateNode(i, 'failTimeout', e.target.value)}
                            placeholder="30s"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{t('Bypass Rules:', '绕过规则:')}</span>
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
      </div>
    );
  }

  if (subTab === 'bypass') {
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ios-btn secondary"
              onClick={() => insertBypassPreset('.bilibili.com\n.weibo.com\n.zhihu.com')}
            >
              + {t('Social Media Preset', '常用社媒预设')}
            </button>
            <button
              type="button"
              className="ios-btn secondary"
              onClick={() => insertBypassPreset('.qq.com\n.baidu.com\n.aliyun.com\n.163.com')}
            >
              + {t('Cloud & Gateway Preset', '国内主流云预设')}
            </button>
          </div>

          <button
            type="button"
            className="ios-btn primary"
            onClick={handleSaveBypass}
          >
            {t('Save Rules', '保存分流规则')}
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
    );
  }

  return (
    <div className="fade-in">
      <div className="ios-group-container">
        <div className="ios-section-header">
          {t('Network & Proxy Routing', '网络与分流 (NETWORK & PROXY)')}
        </div>
        <div className="ios-card">
          <div className="ios-row has-badge" onClick={() => onSelectSubTab('nodes')}>
            <div className="ios-row-title">
              <div className="ios-badge badge-teal">
                <SFSymbol name="network" size={17} />
              </div>
              <span>{t('Proxy Nodes Pool', '代理节点池')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value">{nodes.length} {t('Nodes', '个节点')}</span>
              <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>

          <div className="ios-row has-badge" onClick={() => onSelectSubTab('bypass')}>
            <div className="ios-row-title">
              <div className="ios-badge badge-indigo">
                <SFSymbol name="shield.fill" size={17} />
              </div>
              <span>{t('Bypass Rules', '直连分流规则')}</span>
            </div>
            <div className="ios-row-accessory">
              <span className="ios-row-value">bypass.txt</span>
              <svg className="ios-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProxyView;
