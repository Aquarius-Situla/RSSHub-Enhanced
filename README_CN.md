[English](README.md) | [简体中文](README_CN.md)

# RSSHub-Admin 部署与管理面板

一个基于 Node.js 和 React 的 RSSHub 与 Gost 代理可视化管理面板。原生支持 Apple 设计风格（支持移动端/桌面端完美适配），支持双语（简体中文/English）一键切换，实现零门槛维护您的 RSSHub 和 CookieCloud 节点！

## 🌟 特性

- **无感多端适配**：完美复刻 macOS 系统设置的侧边栏与 iOS 移动端平滑滚动体验。
- **Gost 节点可视化管理**：可增删查改 Gost 负载均衡代理节点，支持节点独立认证（Auth）、最大失败次数、超时时间、bypass 直连规则编辑。
- **CookieCloud 一键自动同步**：无缝对接 CookieCloud 账号与 B站 UID，支持一键强制拉取、解密并同步至环境变量。
- **自动检测系统语言**：浏览器指纹自动检测，智能渲染中文或英文。

---

## 🛠️ 部署前置要求

该项目默认部署在 Linux (如 Debian, Ubuntu) 架构下，依赖以下组件：

- Docker & Docker Compose
- Node.js (用于运行 Admin 面板后端)
- Python3 及必要的加密库 (用于 CookieCloud 解密脚本)

### 隐私与安全指南 (必看)
**⚠️ 请勿将任何私密密钥直接硬编码进源代码！**
本项目已全面适配环境变量安全机制。所有的敏感数据（例如 `ACCESS_KEY`, `YOUTUBE_KEY`, `CookieCloud 密码` 等）统一由系统通过 `.env` 或动态挂载处理。请务必将 `.env` 添加进 `.gitignore` 中！

**配置方式：**
首次部署前，请复制根目录下的 `.env.example` 文件并重命名为 `.env`，然后填入您自己的真实密钥：
```bash
cp .env.example .env
```

---

## 🚀 JSON 批量导入代理节点格式

面板中的 **“上传”** 功能支持批量载入您的 Gost 节点池。JSON 文件需符合以下数组对象结构：

```json
[
  {
    "url": "192.168.1.100:8080",
    "auth": "user:password",
    "maxFails": "3",
    "failTimeout": "30s",
    "bypass": false
  },
  {
    "url": "2.57.20.2:6983",
    "auth": "your_password",
    "bypass": true
  }
]
```

### 字段说明：
- `url` **(必填)**: 目标代理服务器的 `IP:Port`。
- `auth` *(可选)*: 节点的验证信息，支持 `用户名:密码` 格式，或直接填写 `密码`。若不需要验证请留空或不写此字段。
- `maxFails` *(可选)*: 失败重试次数，推荐值 `"3"`。
- `failTimeout` *(可选)*: 失败判定超时时间，推荐值 `"30s"`。
- `bypass` *(可选)*: `true` 或 `false`，开启后此节点将使用面板中配置的 `bypass.txt` 直连规则。

---

## 📜 遗留命令备忘录
给予所有用户对 Bilibili 特殊 description 文件的读取权限（644 代表：所有者读写，组用户只读，其他用户只读）：
```bash
chmod 644 /opt/rsshub/rsshub-config/bilibili/description.tsx
```
