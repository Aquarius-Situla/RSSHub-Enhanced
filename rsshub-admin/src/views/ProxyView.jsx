/* ============================================================================
 * ProxyView.jsx — AquaKit Proxy Management & Routing Rules
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
  AppleNavStack
} from '../components/AquaKit.jsx';

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

  /* Root View (2 Inset Grouped items) */
  const rootView = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <AppleGroup header={t('Network & Proxy Routing', '网络与分流 (NETWORK & PROXY)')}>
        <AppleCard>
          <AppleRow
            badge={<AppleBadge color="teal" icon={<SFSymbol name="network" size={17} />} />}
            label={t('Proxy Nodes Pool', '代理节点池')}
            value={`${nodes.length} ${t('Nodes', '个节点')}`}
            chevron={true}
            onClick={() => onSelectSubTab('nodes')}
          />

          <AppleRow
            badge={<AppleBadge color="indigo" icon={<SFSymbol name="shield.fill" size={17} />} />}
            label={t('Bypass Rules', '直连分流规则')}
            value="bypass.txt"
            chevron={true}
            onClick={() => onSelectSubTab('bypass')}
          />
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Nodes Pool */
  const nodesSubpage = (
    <div className="fade-in" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current.click()}
          >
            {t('Import JSON', '导入 JSON')}
          </AppleButton>
          <AppleButton
            variant="secondary"
            size="sm"
            onClick={addNode}
          >
            + {t('Add Node', '添加节点')}
          </AppleButton>
        </div>

        <AppleButton
          variant="primary"
          size="sm"
          onClick={handleApplyRestart}
          disabled={applying}
        >
          {applying ? t('Applying...', '应用中...') : t('Save & Restart', '保存并重启代理')}
        </AppleButton>
      </div>

      <AppleGroup header={`${t('Round-Robin Proxy Pool', '轮询代理池')} (${nodes.length} ${t('Nodes', '节点')})`}>
        <AppleCard>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
              {t('Loading proxy nodes...', '正在加载节点数据...')}
            </div>
          ) : nodes.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
              {t('No proxy nodes configured. Click "+ Add Node" or import JSON.', '暂无代理节点配置。请点击上方「+ 添加节点」或导入 JSON 文件。')}
            </div>
          ) : (
            nodes.map((node, i) => (
              <div key={i} style={{ borderBottom: i === nodes.length - 1 ? 'none' : '0.5px solid var(--apple-divider)' }}>
                <AppleRow
                  badge={<AppleBadge color="teal" icon={<SFSymbol name="network" size={16} />} />}
                  label={
                    <input
                      className="ios-input"
                      style={{ fontFamily: 'var(--apple-font-mono)', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '14px', width: '100%' }}
                      value={node.url}
                      onChange={e => updateNode(i, 'url', e.target.value)}
                      placeholder="ip:port"
                    />
                  }
                  rightContent={
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <AppleButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      >
                        {expandedIdx === i ? t('Close', '收起') : t('Config', '参数')}
                      </AppleButton>
                      <AppleButton
                        variant="destructive"
                        size="sm"
                        onClick={() => removeNode(i)}
                      >
                        {t('Delete', '删除')}
                      </AppleButton>
                    </div>
                  }
                />

                {expandedIdx === i && (
                  <div style={{ background: 'var(--apple-bg-input)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '4px' }}>
                          {t('Auth (user:pwd)', '鉴权信息 (账号:密码)')}
                        </label>
                        <input
                          type="text"
                          className="ios-input"
                          style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '12.5px' }}
                          value={node.auth || ''}
                          onChange={e => updateNode(i, 'auth', e.target.value)}
                          placeholder="user:pass"
                        />
                      </div>
                      <div style={{ width: '80px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '4px' }}>
                          max_fails
                        </label>
                        <input
                          type="number"
                          className="ios-input"
                          style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '12.5px' }}
                          value={node.maxFails || '3'}
                          onChange={e => updateNode(i, 'maxFails', e.target.value)}
                        />
                      </div>
                      <div style={{ width: '90px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '4px' }}>
                          fail_timeout
                        </label>
                        <input
                          type="text"
                          className="ios-input"
                          style={{ fontFamily: 'var(--apple-font-mono)', fontSize: '12.5px' }}
                          value={node.failTimeout || '30s'}
                          onChange={e => updateNode(i, 'failTimeout', e.target.value)}
                        />
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--apple-text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(node.bypass)}
                        onChange={e => updateNode(i, 'bypass', e.target.checked)}
                      />
                      {t('Apply bypass.txt direct routing rules to this node', '为此节点挂载 bypass.txt 直连分流')}
                    </label>
                  </div>
                )}
              </div>
            ))
          )}
        </AppleCard>
      </AppleGroup>
    </div>
  );

  /* Subpage: Bypass Rules */
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
        >
          {t('Save Rules', '保存规则')}
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
        nodes: nodesSubpage,
        bypass: bypassSubpage
      }}
    />
  );
}

export default ProxyView;
