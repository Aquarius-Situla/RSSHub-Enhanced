import { useState, useEffect, useRef, createContext, useContext } from 'react';

const LangContext = createContext();

function useLang() {
  const { lang } = useContext(LangContext);
  return (en, zh) => lang === 'zh' ? zh : en;
}

function App() {
  const [activeTab, setActiveTab] = useState('proxies');
  const [lang] = useState(() => {
    return (navigator.language || navigator.userLanguage || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });
  
  const [isReady, setIsReady] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const showSplash = !(isReady && minTimePassed);

  return (
    <LangContext.Provider value={{lang}}>
      <div className={`splash-screen ${showSplash ? '' : 'fade-out'}`}>
        <div className="splash-spinner"></div>
        <div className="splash-text">RSSHub Admin</div>
      </div>
      <div className="app-container">
        <div className="sidebar">
          <h1>{lang === 'zh' ? 'RSSHub 管理' : 'RSSHub Admin'}</h1>
          <div 
            className={`nav-item ${activeTab === 'proxies' ? 'active' : ''}`}
            onClick={() => setActiveTab('proxies')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            {lang === 'zh' ? '代理节点' : 'Proxy Nodes'}
          </div>
          <div 
            className={`nav-item ${activeTab === 'cookiecloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookiecloud')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            CookieCloud
          </div>
          <div 
            className={`nav-item ${activeTab === 'rsshub' ? 'active' : ''}`}
            onClick={() => setActiveTab('rsshub')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            {lang === 'zh' ? 'RSSHub 配置' : 'RSSHub Config'}
          </div>
        </div>
        
        <div className="main-content">
          {activeTab === 'proxies' && <ProxyManager onReady={() => setIsReady(true)} />}
          {activeTab === 'cookiecloud' && <CookieCloudManager />}
          {activeTab === 'rsshub' && <RsshubConfigManager />}
        </div>
      </div>
    </LangContext.Provider>
  );
}

function ProxyManager({ onReady }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bypassText, setBypassText] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('api/nodes').then(r => r.json()).then(d => { setNodes(d.nodes || []); }),
      fetch('api/bypass').then(r => r.json()).then(d => setBypassText(d.content || ''))
    ]).then(() => {
      setLoading(false);
      if (onReady) onReady();
    });
  }, []);

  const t = useLang();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const valid = imported.filter(n => n.url);
        // Map raw params to structured if importing old format
        const structured = valid.map(n => ({
          url: n.url.replace('rr://', ''),
          maxFails: n.maxFails || (n.params && n.params.includes('max_fails=') ? n.params.match(/max_fails=(\d+)/)[1] : '3'),
          failTimeout: n.failTimeout || (n.params && n.params.includes('fail_timeout=') ? n.params.match(/fail_timeout=([a-zA-Z0-9]+)/)[1] : '30s'),
          bypass: n.bypass !== undefined ? n.bypass : (n.params && n.params.includes('-bypass=/bypass.txt'))
        }));
        
        if (window.confirm(t(`Import ${structured.length} nodes?`, `确定导入 ${structured.length} 个节点吗？`))) {
          await fetch('api/nodes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nodes: structured})});
          setNodes(structured);
          alert(t("Nodes updated!", "节点已更新！"));
        }
      } catch (err) { alert(t("Invalid JSON", "无效的 JSON")); }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleRestart = async () => {
    if (!window.confirm(t("Apply changes and restart Gost container?", "是否确认保存配置并重启 Gost 代理服务？"))) return;
    try {
      await fetch('api/nodes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nodes})});
      await fetch('api/restart', { method: 'POST' });
      alert(t("Gost proxy updated and restarted successfully", "Gost 代理配置已生效并成功重启"));
    } catch (err) {
      alert(t("Failed to update and restart Gost", "更新并重启 Gost 失败"));
    }
  };
  
  const saveBypass = async () => {
    await fetch('api/bypass', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({content: bypassText})});
    alert(t("bypass.txt Saved!", "bypass.txt 已保存！"));
  };
  
  const updateNode = (idx, key, val) => {
    const newNodes = [...nodes];
    newNodes[idx][key] = val;
    setNodes(newNodes);
  };
  
  const addNode = () => {
    setNodes([...nodes, { url: '', auth: '', maxFails: '3', failTimeout: '30s', bypass: false }]);
    setExpandedIdx(nodes.length);
  };
  
  const removeNode = (idx) => {
    if (window.confirm(t("Delete this node?", "是否确认删除该代理节点？"))) {
      setNodes(nodes.filter((_, i) => i !== idx));
      if (expandedIdx === idx) setExpandedIdx(null);
    }
  };

  return (
    <div className={`tab-content ${loading ? '' : 'loaded'}`}>
      <div className="page-header">
        <h2 className="page-title">{t("Proxy Nodes", "代理节点")}</h2>
      </div>
      
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
        <input type="file" accept=".json" style={{display: 'none'}} ref={fileInputRef} onChange={handleFileUpload} />
        <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>{t("Upload", "上传")}</button>
        <button className="btn" onClick={handleRestart}>{t("Apply", "应用")}</button>
      </div>

      <div className="settings-group">
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '0.5px solid var(--border-color)'}}>
          <h3 style={{fontSize: '18px', fontWeight: 500}}>{t("Node List", "节点列表")}</h3>
          <button style={{background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '15px'}} onClick={addNode}>{t("+ Add Node", "+ 添加节点")}</button>
        </div>
        
        {nodes.length === 0 ? <div className="settings-row">{t("No nodes found.", "暂无代理节点配置")}</div> : (
          <div>
            {nodes.map((n, i) => (
              <div key={i} style={{ borderBottom: i === nodes.length - 1 ? 'none' : '0.5px solid var(--border-color)' }}>
                {/* Main Row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', justifyContent: 'space-between', background: 'var(--list-bg)' }}>
                  <input 
                    className="settings-input" 
                    style={{flex: 1, textAlign: 'left', background: 'transparent', border: 'none', fontSize: '16px', color: 'var(--text-primary)'}} 
                    value={n.url} 
                    onChange={e => updateNode(i, 'url', e.target.value)} 
                    placeholder="ip:port" 
                  />
                  <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                    <button onClick={() => setExpandedIdx(expandedIdx === i ? null : i)} style={{background: 'transparent', border: 'none', color: expandedIdx === i ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button onClick={() => removeNode(i)} style={{background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Drawer (Expanded Settings) */}
                <div className={`drawer ${expandedIdx === i ? 'open' : ''}`}>
                  <div className="drawer-content">
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t("Auth:", "身份验证:")}</span>
                      <input className="settings-input" style={{width: '120px', textAlign: 'center', background: 'var(--list-bg)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)'}} value={n.auth || ''} onChange={e => updateNode(i, 'auth', e.target.value)} placeholder="user:pass" />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t("Max Fails:", "最大失败次数:")}</span>
                      <input className="settings-input" style={{width: '60px', textAlign: 'center', background: 'var(--list-bg)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)'}} value={n.maxFails} onChange={e => updateNode(i, 'maxFails', e.target.value)} />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t("Timeout (e.g. 30s):", "超时(如30s):")}</span>
                      <input className="settings-input" style={{width: '70px', textAlign: 'center', background: 'var(--list-bg)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)'}} value={n.failTimeout} onChange={e => updateNode(i, 'failTimeout', e.target.value)} placeholder="30s" />
                    </div>
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                      <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{t("Bypass:", "绕过代理:")}</span>
                      <input type="checkbox" checked={n.bypass} onChange={e => updateNode(i, 'bypass', e.target.checked)} style={{width: '18px', height: '18px'}} />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-header" style={{marginTop: '40px'}}>
        <h2 className="page-title" style={{fontSize: '24px'}}>{t("bypass.txt Editor", "直连规则编辑 (bypass.txt)")}</h2>
      </div>
      
      <div className="settings-group" style={{padding: '16px'}}>
        <textarea 
          value={bypassText}
          onChange={e => setBypassText(e.target.value)}
          style={{
            width: '100%', 
            height: '150px', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)', 
            fontFamily: 'monospace',
            marginBottom: '16px',
            background: 'transparent',
            color: 'var(--text-primary)'
          }}
          placeholder={t("# Add bypass rules here...", "# 请在此输入需要直连的域名或 IP 规则...")}
        />
        <button className="btn btn-secondary" onClick={saveBypass}>{t("Save", "保存")}</button>
      </div>
    </div>
  );
}

function CookieCloudManager() {
  const t = useLang();
  const [config, setConfig] = useState({ server: '', uuid: '', password: '', bilibiliUid: '', youtubeKey: '' });
  const [logs, setLogs] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('api/cookiecloud').then(r => r.json()).then(d => { setConfig(d); setLoading(false); });
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = () => {
    fetch('api/cookiecloud/logs').then(r => r.json()).then(d => setLogs(d.logs));
  };

  const saveConfig = async () => {
    await fetch('api/cookiecloud', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(config) });
    alert(t("Saved", "已保存"));
  };

  const handleSync = async () => {
    if (!window.confirm(t("Run decrypt script and restart RSSHub?", "执行解密脚本并重启 RSSHub？"))) return;
    setSyncing(true);
    await fetch('api/cookiecloud/sync', { method: 'POST' });
    setSyncing(false);
    fetchLogs();
  };

  return (
    <div className={`tab-content ${loading ? '' : 'loaded'}`}>
      <div className="page-header">
        <h2 className="page-title">CookieCloud</h2>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-label">{t("Server URL", "服务器地址")}</span>
          <input className="settings-input" value={config.server} onChange={e => setConfig({...config, server: e.target.value})} placeholder="http://..." />
        </div>
        <div className="settings-row">
          <span className="settings-label">UUID</span>
          <input className="settings-input" value={config.uuid} onChange={e => setConfig({...config, uuid: e.target.value})} placeholder="b17ER..." />
        </div>
        <div className="settings-row">
          <span className="settings-label">{t("Password", "密码")}</span>
          <input className="settings-input" type="password" value={config.password} onChange={e => setConfig({...config, password: e.target.value})} placeholder="••••••••" />
        </div>
        <div className="settings-row">
          <span className="settings-label">Bilibili UID</span>
          <input className="settings-input" value={config.bilibiliUid} onChange={e => setConfig({...config, bilibiliUid: e.target.value})} placeholder="12345678" />
        </div>
        <div className="settings-row">
          <span className="settings-label">{t("YouTube API Key", "YouTube API 密钥")}</span>
          <input className="settings-input" value={config.youtubeKey} onChange={e => setConfig({...config, youtubeKey: e.target.value})} placeholder={t("Leave blank to remove...", "留空以移除...")} />
        </div>
      </div>

      <div style={{marginBottom: '30px', display: 'flex', gap: '10px'}}>
        <button className="btn btn-secondary" onClick={saveConfig}>{t("Save", "保存")}</button>
        <button className="btn" onClick={handleSync} disabled={syncing}>{syncing ? t('Syncing...', '同步中...') : t('Force Sync', '强制同步')}</button>
      </div>

      <h3 style={{marginBottom: '10px', fontSize: '18px'}}>{t("Sync Logs", "运行日志")}</h3>
      <div className="log-viewer">
        {logs || t('No logs yet.', '暂无日志记录')}
      </div>
    </div>
  );
}

function RsshubConfigManager() {
  const t = useLang();
  const [accessKey, setAccessKey] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('api/rsshub/config').then(r => r.json()).then(d => {
      setAccessKey(d.accessKey || '');
      setMd5Hash(d.md5 || '');
      setLoading(false);
    });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    const res = await fetch('api/rsshub/config', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ accessKey }) 
    });
    const data = await res.json();
    alert(data.message || data.error);
    // Refresh to get MD5
    fetch('api/rsshub/config').then(r => r.json()).then(d => {
      setAccessKey(d.accessKey || '');
      setMd5Hash(d.md5 || '');
    });
    setSaving(false);
  };

  const handleRestart = async () => {
    if (!window.confirm(t("Restart RSSHub container?", "确定重启 RSSHub 容器吗？"))) return;
    setRestarting(true);
    const res = await fetch('api/rsshub/restart', { method: 'POST' });
    const data = await res.json();
    alert(data.message || data.error);
    setRestarting(false);
  };

  return (
    <div className={`tab-content ${loading ? '' : 'loaded'}`}>
      <div className="page-header">
        <h2 className="page-title">{t("RSSHub Configuration", "RSSHub 配置")}</h2>
      </div>

      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-label">{t("ACCESS_KEY", "访问控制密钥 (ACCESS_KEY)")}</span>
          <input className="settings-input" value={accessKey} onChange={e => setAccessKey(e.target.value)} placeholder={t("Enter key...", "请输入安全密钥...")} style={{width: '300px'}} />
        </div>
        {md5Hash && (
          <div className="settings-row">
            <span className="settings-label" style={{color: 'var(--accent)'}}>{t("MD5 Hash (for ?code=)", "MD5 哈希值 (用于 ?code= 鉴权)")}</span>
            <span className="settings-value" style={{fontFamily: 'monospace', fontSize: '14px', userSelect: 'all'}}>{md5Hash}</span>
          </div>
        )}
      </div>

      <div style={{marginBottom: '30px', display: 'flex', gap: '10px'}}>
        <button className="btn btn-secondary" onClick={saveConfig} disabled={saving}>{saving ? t('Saving...', '保存中...') : t('Save', '保存')}</button>
        <button className="btn" onClick={handleRestart} disabled={restarting}>{restarting ? t('Restarting...', '重启中...') : t('Restart', '重启')}</button>
      </div>
    </div>
  );
}

export default App;
